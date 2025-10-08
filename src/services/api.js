import { API_BASE_URL } from '../constants/config';

/**
 * Check if the backend server is healthy
 * @returns {Promise<boolean>} True if backend is connected
 */
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (err) {
    console.error('Backend health check failed:', err);
    return false;
  }
};

/**
 * Search PubMed for medical articles
 * @param {string} query - Search query
 * @param {Object} filters - Search filters (dateRange, studyType)
 * @returns {Promise<Array>} Array of article objects
 */
export const searchPubMed = async (query, filters) => {
  try {
    // Create a clean copy of filters to avoid circular reference issues
    const cleanFilters = {
      dateRange: filters.dateRange,
      studyType: filters.studyType
    };

    const response = await fetch(`${API_BASE_URL}/search-pubmed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, filters: cleanFilters })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || `Backend error: ${response.status}`);
      error.response = { data: errorData, status: response.status };
      throw error;
    }

    const data = await response.json();
    return data.articles || [];
  } catch (err) {
    console.error('PubMed search error:', err);
    throw err;
  }
};

/**
 * Search Europe PMC for medical articles
 * @param {string} query - Search query
 * @param {Object} filters - Search filters (dateRange, studyType)
 * @returns {Promise<Array>} Array of article objects
 */
export const searchEuropePMC = async (query, filters) => {
  try {
    const cleanFilters = {
      dateRange: filters.dateRange,
      studyType: filters.studyType
    };

    const response = await fetch(`${API_BASE_URL}/search-europepmc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, filters: cleanFilters })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || `Backend error: ${response.status}`);
      error.response = { data: errorData, status: response.status };
      throw error;
    }

    const data = await response.json();
    return data.articles || [];
  } catch (err) {
    console.error('Europe PMC search error:', err);
    throw err;
  }
};

/**
 * Calculate relevance score for an article based on query
 * @param {Object} article - Article object
 * @param {string} query - User's search query
 * @returns {number} Relevance score (0-100)
 */
const calculateRelevanceScore = (article, query) => {
  const queryLower = query.toLowerCase();
  const titleLower = article.title.toLowerCase();
  const abstractLower = (article.abstract || '').toLowerCase();

  let score = 0;

  // Medical terms often include numbers and short words (type 2, hiv, copd, etc.)
  // We'll use a smarter approach: keep medical terms and filter only stop words
  const stopWords = new Set(['what', 'are', 'the', 'latest', 'for', 'in', 'of', 'and', 'or', 'a', 'an', 'is', 'on', 'with', 'to', 'from', 'how', 'when', 'where', 'which', 'who', 'can', 'does', 'should', 'would', 'could', 'about', 'after', 'before', 'between']);

  // Extract terms, keeping medical terms (3+ chars, has letters, not stop words)
  const queryTerms = queryLower
    .split(/\s+/)
    .filter(word => word.length >= 3 && /[a-z]/.test(word) && !stopWords.has(word));

  // Also check for important multi-word medical phrases (e.g., "type 2 diabetes")
  const medicalPhrases = [];
  const words = queryLower.split(/\s+/);
  for (let i = 0; i < words.length - 1; i++) {
    // Look for number patterns (type 2, hiv-1, etc.)
    if (/\d/.test(words[i]) || /\d/.test(words[i + 1])) {
      medicalPhrases.push(`${words[i]} ${words[i + 1]}`);
    }
  }

  // Score based on query terms in title (very important)
  queryTerms.forEach(term => {
    if (titleLower.includes(term)) {
      score += 40; // High weight for title matches
    }
  });

  // Score based on query terms in abstract (important)
  queryTerms.forEach(term => {
    if (abstractLower.includes(term)) {
      score += 10; // Moderate weight for abstract matches
    }
  });

  // Bonus if multiple terms appear in title
  const titleTermCount = queryTerms.filter(term => titleLower.includes(term)).length;
  if (titleTermCount >= 2) {
    score += 30; // Bonus for multiple term matches in title
  }

  // Bonus for medical phrase matches in title (e.g., "type 2 diabetes")
  medicalPhrases.forEach(phrase => {
    if (titleLower.includes(phrase)) {
      score += 60; // Very high bonus for medical phrase matches
    }
  });

  // Bonus for medical phrase matches in abstract
  medicalPhrases.forEach(phrase => {
    if (abstractLower.includes(phrase)) {
      score += 20; // Good bonus for medical phrase in abstract
    }
  });

  // Bonus for exact phrase match in title
  if (queryTerms.length >= 2) {
    const keyPhrase = queryTerms.slice(0, 3).join(' ');
    if (titleLower.includes(keyPhrase)) {
      score += 50; // High bonus for phrase match
    }
  }

  // Give base score if article has an abstract (sign of quality)
  if (article.abstract && article.abstract.length > 100) {
    score += 5; // Small bonus for having substantial abstract
  }

  return Math.min(100, score);
};

/**
 * Search multiple sources and aggregate results
 * @param {string} query - Search query
 * @param {Object} filters - Search filters (dateRange, studyType)
 * @param {Array<string>} sources - Array of sources to search ['pubmed', 'europepmc']
 * @returns {Promise<Array>} Aggregated and deduplicated array of articles
 */
export const searchMultipleSources = async (query, filters, sources = ['pubmed', 'europepmc']) => {
  try {
    // Execute searches in parallel
    const searchPromises = [];

    if (sources.includes('pubmed')) {
      searchPromises.push(
        searchPubMed(query, filters).catch(err => {
          console.warn('PubMed search failed:', err);
          return [];
        })
      );
    }

    if (sources.includes('europepmc')) {
      searchPromises.push(
        searchEuropePMC(query, filters).catch(err => {
          console.warn('Europe PMC search failed:', err);
          return [];
        })
      );
    }

    const results = await Promise.all(searchPromises);

    // Flatten results
    let allArticles = results.flat();

    // Deduplicate by PMID or DOI
    const seen = new Set();
    const deduplicated = allArticles.filter(article => {
      // Create unique key based on PMID (preferred) or DOI or title
      const key = article.pmid || article.doi || article.title.toLowerCase().trim();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });

    // Calculate relevance scores for each article
    deduplicated.forEach(article => {
      article.relevanceScore = calculateRelevanceScore(article, query);
    });

    // Filter out only very low-relevance articles (score < 15)
    // Lower threshold to avoid filtering out too many results
    const relevantArticles = deduplicated.filter(article => article.relevanceScore >= 15);

    console.log(`Articles before filtering: ${deduplicated.length}, after filtering: ${relevantArticles.length}`);

    // Sort by combined score: relevance + study type + recency
    const sorted = relevantArticles.sort((a, b) => {
      // Study type score
      const typeScore = (article) => {
        if (article.studyType === 'Meta-Analysis') return 40;
        if (article.studyType === 'Systematic Review') return 35;
        if (article.studyType === 'RCT') return 30;
        if (article.studyType === 'Clinical Trial') return 25;
        if (article.studyType === 'Review') return 20;
        return 15;
      };

      // Recency score
      const recencyScore = (article) => {
        if (article.isRecent) return 10;
        if (article.publicationYear >= new Date().getFullYear() - 3) return 5;
        return 0;
      };

      // Weighted total score: relevance (most important) + type + recency
      const scoreA = a.relevanceScore + typeScore(a) + recencyScore(a);
      const scoreB = b.relevanceScore + typeScore(b) + recencyScore(b);

      return scoreB - scoreA;
    });

    // Debug logging
    console.log(`Query: "${query}"`);
    console.log(`Total articles found: ${allArticles.length}`);
    console.log(`After deduplication: ${deduplicated.length}`);
    console.log(`After relevance filter (≥15): ${relevantArticles.length}`);
    console.log('\nTop 5 articles by relevance:');
    sorted.slice(0, 5).forEach((a, i) => {
      console.log(`${i + 1}. [Score: ${a.relevanceScore}] ${a.title.substring(0, 80)}...`);
    });

    return sorted.slice(0, 20);
  } catch (err) {
    console.error('Multi-source search error:', err);
    throw err;
  }
};

/**
 * Generate AI response using Claude
 * @param {string} userQuery - User's question
 * @param {Array} articles - Medical articles from multiple sources
 * @param {Array} conversationHistory - Previous conversation messages
 * @returns {Promise<Object>} Response object with answer and followUpQuestions
 */
export const generateResponse = async (userQuery, articles, conversationHistory) => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: userQuery,
        articles: articles,
        conversationHistory: conversationHistory
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || `Backend error: ${response.status}`);
      error.response = { data: errorData, status: response.status };
      throw error;
    }

    const data = await response.json();
    return data; // Return full data object with response and followUpQuestions
  } catch (err) {
    console.error('Response generation error:', err);
    throw err;
  }
};
