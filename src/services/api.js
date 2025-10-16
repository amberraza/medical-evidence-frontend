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
 * List of high-impact medical journals
 */
const HIGH_IMPACT_JOURNALS = new Set([
  'new england journal of medicine',
  'nejm',
  'lancet',
  'jama',
  'british medical journal',
  'bmj',
  'nature medicine',
  'nature',
  'science',
  'cell',
  'plos medicine',
  'annals of internal medicine',
  'circulation',
  'journal of clinical oncology',
  'american journal of respiratory and critical care medicine',
  'diabetes care',
  'neurology',
  'gastroenterology',
  'gut',
  'kidney international',
  'hepatology',
  'chest',
  'journal of the american college of cardiology',
  'european heart journal',
  'cochrane database of systematic reviews'
]);

/**
 * Calculate evidence strength based on study type
 * @param {Object} article - Article object
 * @returns {Object} Evidence strength info
 */
const calculateEvidenceStrength = (article) => {
  const studyType = article.studyType;

  // Evidence pyramid (highest to lowest)
  const strengthMap = {
    'Meta-Analysis': { level: 1, strength: 'Very High', color: 'purple', description: 'Systematic analysis of multiple studies' },
    'Systematic Review': { level: 1, strength: 'Very High', color: 'purple', description: 'Comprehensive review of all evidence' },
    'RCT': { level: 2, strength: 'High', color: 'green', description: 'Randomized controlled trial' },
    'Clinical Trial': { level: 3, strength: 'Moderate-High', color: 'blue', description: 'Controlled clinical study' },
    'Guideline': { level: 2, strength: 'High', color: 'amber', description: 'Expert clinical recommendations' },
    'Review': { level: 3, strength: 'Moderate', color: 'indigo', description: 'Literature review' },
    'Case Report': { level: 5, strength: 'Low', color: 'gray', description: 'Individual case study' },
    'Observational Study': { level: 4, strength: 'Moderate-Low', color: 'slate', description: 'Observational research' },
    'Research Article': { level: 4, strength: 'Moderate', color: 'slate', description: 'Original research' }
  };

  return strengthMap[studyType] || { level: 5, strength: 'Moderate', color: 'gray', description: 'Research study' };
};

/**
 * Calculate quality tags for an article
 * @param {Object} article - Article object
 * @param {string} query - User's search query
 * @returns {Array} Array of quality tag objects
 */
const calculateQualityTags = (article, query) => {
  const tags = [];

  // High relevance tag (based on relevance score)
  if (article.relevanceScore >= 80) {
    tags.push({ label: 'Highly Relevant', color: 'emerald', icon: '⭐' });
  }

  // Leading journal tag
  const journalLower = (article.journal || '').toLowerCase();
  if (HIGH_IMPACT_JOURNALS.has(journalLower)) {
    tags.push({ label: 'Leading Journal', color: 'violet', icon: '🏆' });
  }

  // New research tag (already exists but we'll enhance it)
  if (article.isRecent) {
    tags.push({ label: 'New Research', color: 'cyan', icon: '🆕' });
  }

  // Recent research (within 2 years but not brand new)
  const currentYear = new Date().getFullYear();
  if (article.publicationYear >= currentYear - 2 && !article.isRecent) {
    tags.push({ label: 'Recent', color: 'sky', icon: '📅' });
  }

  // Full text available
  if (article.hasFullText) {
    tags.push({ label: 'Full Text', color: 'lime', icon: '📄' });
  }

  // High citation potential (well-established studies)
  const yearsOld = currentYear - article.publicationYear;
  if (yearsOld >= 3 && yearsOld <= 10 && ['Meta-Analysis', 'Systematic Review', 'RCT'].includes(article.studyType)) {
    tags.push({ label: 'Well-Established', color: 'amber', icon: '📚' });
  }

  return tags;
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

    // Calculate relevance scores and quality indicators for each article
    deduplicated.forEach(article => {
      article.relevanceScore = calculateRelevanceScore(article, query);
      article.evidenceStrength = calculateEvidenceStrength(article);
      article.qualityTags = calculateQualityTags(article, query);
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

/**
 * Perform deep research with multi-stage analysis
 * @param {string} query - Research question
 * @param {Object} filters - Search filters
 * @returns {Promise<Object>} Deep research results
 */
export const performDeepResearch = async (query, filters = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/deep-research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        filters
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || `Deep research failed: ${response.status}`);
      error.response = { data: errorData, status: response.status };
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Deep research error:', err);
    throw err;
  }
};

/**
 * Analyze uploaded document
 * @param {File} file - Document file (PDF or TXT)
 * @returns {Promise<Object>} Analysis results
 */
export const analyzeDocument = async (file) => {
  try {
    const formData = new FormData();
    formData.append('document', file);

    const response = await fetch(`${API_BASE_URL}/analyze-document`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || `Document analysis failed: ${response.status}`);
      error.response = { data: errorData, status: response.status };
      throw error;
    }

    return await response.json();
  } catch (err) {
    console.error('Document analysis error:', err);
    throw err;
  }
};

/**
 * Find similar papers to uploaded document
 * @param {File} file - Document file (PDF or TXT)
 * @returns {Promise<Object>} Similar papers
 */
export const findSimilarPapers = async (file) => {
  try {
    const formData = new FormData();
    formData.append('document', file);

    const response = await fetch(`${API_BASE_URL}/find-similar`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || `Failed to find similar papers: ${response.status}`);
      error.response = { data: errorData, status: response.status };
      throw error;
    }

    return await response.json();
  } catch (err) {
    console.error('Find similar papers error:', err);
    throw err;
  }
};

/**
 * Get comprehensive drug information
 * @param {string} drugName - Name of the drug
 * @returns {Promise<Object>} Drug information object
 */
export const getDrugInfo = async (drugName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/drug-info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drugName })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || `Failed to fetch drug information: ${response.status}`);
      error.response = { data: errorData, status: response.status };
      throw error;
    }

    return await response.json();
  } catch (err) {
    console.error('Drug info error:', err);
    throw err;
  }
};

/**
 * Search for clinical practice guidelines
 * @param {string} query - Search query
 * @param {string} organization - Organization filter
 * @returns {Promise<Object>} Guidelines search results
 */
export const searchGuidelines = async (query, organization = 'all') => {
  try {
    const response = await fetch(`${API_BASE_URL}/search-guidelines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, organization })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || `Failed to search guidelines: ${response.status}`);
      error.response = { data: errorData, status: response.status };
      throw error;
    }

    return await response.json();
  } catch (err) {
    console.error('Guidelines search error:', err);
    throw err;
  }
};
