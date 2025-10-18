import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Decode HTML entities in text
const decodeHTMLEntities = (text) => {
  if (!text) return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

// Color mapping for badges (Tailwind needs full class names)
const getBadgeClasses = (color) => {
  const colorMap = {
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    violet: 'bg-violet-100 text-violet-800 border-violet-200',
    cyan: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    sky: 'bg-sky-100 text-sky-800 border-sky-200',
    lime: 'bg-lime-100 text-lime-800 border-lime-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
  };
  return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const getStrengthClasses = (color) => {
  const strengthMap = {
    purple: 'bg-purple-50 text-purple-900 border-purple-300',
    green: 'bg-green-50 text-green-900 border-green-300',
    blue: 'bg-blue-50 text-blue-900 border-blue-300',
    amber: 'bg-amber-50 text-amber-900 border-amber-300',
    indigo: 'bg-indigo-50 text-indigo-900 border-indigo-300',
    slate: 'bg-slate-50 text-slate-900 border-slate-300',
    gray: 'bg-gray-50 text-gray-900 border-gray-300',
  };
  return strengthMap[color] || 'bg-gray-50 text-gray-900 border-gray-300';
};

export const SourceCard = ({ source, index, isExpanded, onToggle }) => {
  return (
    <div className="bg-gray-50 rounded p-3 text-sm">
      <div className="flex items-start gap-2">
        <span className="font-bold text-indigo-600 flex-shrink-0">[{index + 1}]</span>
        <div className="flex-1 min-w-0">
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline break-words"
          >
            {source.title}
          </a>

          {/* Quality Tags */}
          {source.qualityTags && source.qualityTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2 mb-1">
              {source.qualityTags.map((tag, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getBadgeClasses(tag.color)}`}
                  title={tag.label}
                >
                  {tag.icon} {tag.label}
                </span>
              ))}
            </div>
          )}

          {/* Evidence Strength Badge */}
          {source.evidenceStrength && (
            <div className="mb-2">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getStrengthClasses(source.evidenceStrength.color)}`}
                title={source.evidenceStrength.description}
              >
                🔬 Evidence Strength: {source.evidenceStrength.strength}
              </span>
            </div>
          )}

          {/* Metadata Badges */}
          {(source.studyType || source.isRecent || source.source || source.hasFullText || source.fullTextAvailable || source.citationCount) && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {source.source && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  source.source === 'Europe PMC' ? 'bg-sky-100 text-sky-800' :
                  source.source === 'OpenAlex' ? 'bg-orange-100 text-orange-800' :
                  source.source === 'ClinicalTrials.gov' ? 'bg-indigo-100 text-indigo-800' :
                  'bg-teal-100 text-teal-800'
                }`}>
                  {source.source}
                </span>
              )}
              {/* Citation Count Badge */}
              {source.citationCount > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
                  📊 {source.citationCount.toLocaleString()} citations
                </span>
              )}
              {/* Full Text PDF Badge (Unpaywall) */}
              {(source.fullTextAvailable || source.hasFullText) && (
                <a
                  href={source.fullTextPdfUrl || source.fullTextUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-lime-100 text-lime-800 border border-lime-200 hover:bg-lime-200 transition-colors"
                  title={source.openAccessType || 'Full text available'}
                >
                  📄 Free PDF
                </a>
              )}
              {/* Open Access Badge */}
              {source.isOpenAccess && !source.fullTextPdfUrl && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  🔓 Open Access
                </span>
              )}
              {source.studyType && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  source.studyType === 'Meta-Analysis' || source.studyType === 'Systematic Review'
                    ? 'bg-purple-100 text-purple-800'
                    : source.studyType === 'RCT'
                    ? 'bg-green-100 text-green-800'
                    : source.studyType === 'Clinical Trial'
                    ? 'bg-blue-100 text-blue-800'
                    : source.studyType === 'Review'
                    ? 'bg-indigo-100 text-indigo-800'
                    : source.studyType === 'Guideline'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {source.studyType}
                </span>
              )}
              {source.isRecent && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                  New Research
                </span>
              )}
              {source.publicationYear && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                  {source.publicationYear}
                </span>
              )}
            </div>
          )}

          <p className="text-gray-600 text-xs mt-2">
            {source.authors} • {source.journal}
          </p>
          <p className="text-gray-500 text-xs mt-1">PMID: {source.pmid}</p>

          {/* Expandable Abstract Section */}
          {source.abstract && (
            <div className="mt-3">
              {isExpanded && (
                <div className="bg-white rounded border border-gray-200 p-3 mb-2">
                  <h4 className="font-semibold text-gray-900 text-xs mb-2">Abstract</h4>
                  <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-wrap">
                    {decodeHTMLEntities(source.abstract)}
                  </p>
                  {source.allAuthors && source.allAuthors !== source.authors && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 text-xs mb-1">All Authors</h4>
                      <p className="text-gray-600 text-xs">{source.allAuthors}</p>
                    </div>
                  )}

                  {/* Clinical Trial Specific Info */}
                  {source.type === 'clinical-trial' && (source.status || source.phase || source.enrollment || source.conditions || source.interventions) && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                      <h4 className="font-semibold text-gray-900 text-xs mb-2">🔬 Trial Information</h4>

                      {source.nctId && (
                        <div>
                          <span className="text-gray-500 text-xs font-medium">NCT ID: </span>
                          <span className="text-gray-700 text-xs font-mono">{source.nctId}</span>
                        </div>
                      )}

                      {source.status && (
                        <div>
                          <span className="text-gray-500 text-xs font-medium">Status: </span>
                          <span className={`text-xs font-medium ${
                            source.status === 'COMPLETED' ? 'text-green-700' :
                            source.status === 'RECRUITING' ? 'text-blue-700' :
                            'text-gray-700'
                          }`}>{source.status}</span>
                        </div>
                      )}

                      {source.phase && (
                        <div>
                          <span className="text-gray-500 text-xs font-medium">Phase: </span>
                          <span className="text-gray-700 text-xs">{source.phase}</span>
                        </div>
                      )}

                      {source.enrollment > 0 && (
                        <div>
                          <span className="text-gray-500 text-xs font-medium">Enrollment: </span>
                          <span className="text-gray-700 text-xs">{source.enrollment.toLocaleString()} participants</span>
                        </div>
                      )}

                      {source.conditions && source.conditions.length > 0 && (
                        <div>
                          <span className="text-gray-500 text-xs font-medium">Conditions: </span>
                          <span className="text-gray-700 text-xs">{source.conditions.slice(0, 3).join(', ')}</span>
                        </div>
                      )}

                      {source.interventions && source.interventions.length > 0 && (
                        <div>
                          <span className="text-gray-500 text-xs font-medium">Interventions: </span>
                          <span className="text-gray-700 text-xs">{source.interventions.slice(0, 3).join(', ')}</span>
                        </div>
                      )}

                      {source.leadSponsor && (
                        <div>
                          <span className="text-gray-500 text-xs font-medium">Sponsor: </span>
                          <span className="text-gray-700 text-xs">{source.leadSponsor}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* OpenAlex Specific Info */}
                  {source.concepts && source.concepts.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 text-xs mb-2">🏷️ Concepts</h4>
                      <div className="flex flex-wrap gap-1">
                        {source.concepts.slice(0, 5).map((concept, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Enrichment Data Section */}
                  {(source.publisher || source.funding || source.orcids || source.license || source.openAccessType) && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                      <h4 className="font-semibold text-gray-900 text-xs mb-2">📊 Additional Information</h4>

                      {source.publisher && (
                        <div>
                          <span className="text-gray-500 text-xs font-medium">Publisher: </span>
                          <span className="text-gray-700 text-xs">{source.publisher}</span>
                        </div>
                      )}

                      {source.funding && (
                        <div>
                          <span className="text-gray-500 text-xs font-medium">Funding: </span>
                          <span className="text-gray-700 text-xs">{source.funding}</span>
                        </div>
                      )}

                      {source.orcids && source.orcids.length > 0 && (
                        <div>
                          <span className="text-gray-500 text-xs font-medium">ORCID IDs: </span>
                          <span className="text-gray-700 text-xs">
                            {source.orcids.map((orcid, idx) => (
                              <a
                                key={idx}
                                href={orcid}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-800 hover:underline mr-2"
                              >
                                {orcid.replace('https://orcid.org/', '')}
                              </a>
                            ))}
                          </span>
                        </div>
                      )}

                      {source.license && (
                        <div>
                          <span className="text-gray-500 text-xs font-medium">License: </span>
                          <span className="text-gray-700 text-xs">{source.license}</span>
                        </div>
                      )}

                      {source.openAccessType && (
                        <div>
                          <span className="text-gray-500 text-xs font-medium">Access Type: </span>
                          <span className="text-gray-700 text-xs">{source.openAccessType}</span>
                        </div>
                      )}

                      {source.allOALocations && source.allOALocations.length > 0 && (
                        <div>
                          <span className="text-gray-500 text-xs font-medium">Alternative Sources: </span>
                          <div className="mt-1 space-y-1">
                            {source.allOALocations.slice(0, 3).map((location, idx) => (
                              <div key={idx} className="text-xs">
                                <a
                                  href={location.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-800 hover:underline"
                                >
                                  {location.hostType === 'publisher' ? '📘 Publisher' : '🗄️ Repository'}
                                  {location.version && ` (${location.version})`}
                                  {location.pdfUrl && ' - PDF'}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {source.doi && (
                    <div className="mt-2">
                      <p className="text-gray-500 text-xs">DOI: {source.doi}</p>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={onToggle}
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-medium transition-colors"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show more details
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
