import React, { useState } from 'react';
import { Pill, Search, Loader2, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';
import * as api from '../../services/api';

export const DrugInfo = ({ darkMode = false }) => {
  const [drugName, setDrugName] = useState('');
  const [searching, setSearching] = useState(false);
  const [drugInfo, setDrugInfo] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!drugName.trim()) return;

    setSearching(true);
    setError(null);
    setDrugInfo(null);

    try {
      const data = await api.getDrugInfo(drugName.trim());
      setDrugInfo(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch drug information');
    } finally {
      setSearching(false);
    }
  };

  const renderSection = (title, content, icon) => {
    if (!content || (Array.isArray(content) && content.length === 0)) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{title}</h3>
        </div>
        {Array.isArray(content) ? (
          <ul className="list-disc ml-6 space-y-2">
            {content.map((item, idx) => (
              <li key={idx} className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{content}</p>
        )}
      </div>
    );
  };

  return (
    <div className={`rounded-lg shadow-md p-4 sm:p-6 mb-4 ${darkMode ? 'bg-transparent' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Pill className="w-6 h-6 text-green-600" />
          <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Drug Information</h3>
        </div>
      </div>

      <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Search for comprehensive drug information including indications, dosing, side effects, and interactions.
      </p>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={drugName}
              onChange={(e) => setDrugName(e.target.value)}
              placeholder="Enter drug name (e.g., Metformin, Lisinopril)"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                darkMode
                  ? 'bg-[#1a1a1a] border-gray-600 text-gray-100 placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
              disabled={searching}
            />
          </div>
          <button
            type="submit"
            disabled={searching || !drugName.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {searching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className={`border rounded-lg p-4 mb-4 flex items-start gap-3 ${
          darkMode
            ? 'bg-red-900/30 border-red-700'
            : 'bg-red-50 border-red-200'
        }`}>
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className={`font-medium ${darkMode ? 'text-red-400' : 'text-red-800'}`}>Error</p>
            <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
          </div>
        </div>
      )}

      {/* Drug Information Display */}
      {drugInfo && (
        <div className={`border-t pt-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {/* Drug Name Header */}
          <div className="mb-6">
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{drugInfo.drugName}</h2>
            {drugInfo.genericName && (
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Generic: {drugInfo.genericName}</p>
            )}
            {drugInfo.brandNames && drugInfo.brandNames.length > 0 && (
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Brand Names: {drugInfo.brandNames.join(', ')}</p>
            )}
          </div>

          {/* Overview */}
          {renderSection('Overview', drugInfo.overview, <Info className="w-5 h-5 text-blue-600" />)}

          {/* Indications */}
          {renderSection('Indications', drugInfo.indications, <CheckCircle className="w-5 h-5 text-green-600" />)}

          {/* Dosing */}
          {renderSection('Dosing', drugInfo.dosing, <Pill className="w-5 h-5 text-purple-600" />)}

          {/* Side Effects */}
          {renderSection('Common Side Effects', drugInfo.sideEffects, <AlertCircle className="w-5 h-5 text-orange-600" />)}

          {/* Serious Side Effects */}
          {renderSection('Serious Side Effects', drugInfo.seriousSideEffects, <XCircle className="w-5 h-5 text-red-600" />)}

          {/* Contraindications */}
          {renderSection('Contraindications', drugInfo.contraindications, <XCircle className="w-5 h-5 text-red-600" />)}

          {/* Drug Interactions */}
          {renderSection('Drug Interactions', drugInfo.interactions, <AlertCircle className="w-5 h-5 text-yellow-600" />)}

          {/* Monitoring */}
          {renderSection('Monitoring Parameters', drugInfo.monitoring, <Info className="w-5 h-5 text-blue-600" />)}

          {/* Disclaimer */}
          <div className={`mt-6 p-4 border rounded-lg ${
            darkMode
              ? 'bg-yellow-900/30 border-yellow-700'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
              <strong>Disclaimer:</strong> This information is for educational purposes only and should not replace professional medical advice.
              Always consult with a healthcare provider before starting, stopping, or changing medication.
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!drugInfo && !searching && !error && (
        <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <Pill className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>Enter a drug name to view detailed information</p>
        </div>
      )}
    </div>
  );
};
