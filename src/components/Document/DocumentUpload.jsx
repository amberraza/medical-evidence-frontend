import React, { useState } from 'react';
import { Upload, FileText, X, Loader2, Search, Sparkles } from 'lucide-react';

export const DocumentUpload = ({ onAnalyze, onFindSimilar, darkMode = false }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [findingSimilar, setFindingSimilar] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (uploadedFile) => {
    // Validate file type
    const validTypes = ['application/pdf', 'text/plain'];
    if (!validTypes.includes(uploadedFile.type)) {
      alert('Please upload a PDF or TXT file');
      return;
    }

    // Validate file size (max 10MB)
    if (uploadedFile.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setFile(uploadedFile);
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    try {
      await onAnalyze(file);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFindSimilar = async () => {
    if (!file) return;
    setFindingSimilar(true);
    try {
      await onFindSimilar(file);
    } finally {
      setFindingSimilar(false);
    }
  };

  return (
    <div className={`rounded-lg shadow-md p-4 sm:p-6 mb-4 ${darkMode ? 'bg-transparent' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Upload className="w-6 h-6 text-indigo-600" />
          <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Document Analysis</h3>
        </div>
      </div>

      <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Upload a medical research paper (PDF or TXT) to analyze its content or find similar papers.
      </p>

      {!file ? (
        <form
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className="relative"
        >
          <input
            ref={(input) => input}
            type="file"
            id="file-upload"
            accept=".pdf,.txt"
            onChange={handleChange}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              dragActive
                ? darkMode
                  ? 'border-indigo-400 bg-indigo-900/30'
                  : 'border-indigo-500 bg-indigo-50'
                : darkMode
                  ? 'border-gray-600 hover:border-indigo-400 hover:bg-gray-800/50'
                  : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
            }`}
          >
            <Upload className="w-12 h-12 text-gray-400 mb-3" />
            <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Click to upload or drag and drop
            </p>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              PDF or TXT files (max 10MB)
            </p>
          </label>
        </form>
      ) : (
        <div className="space-y-4">
          {/* File info */}
          <div className={`flex items-center justify-between p-4 rounded-lg ${darkMode ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-indigo-600" />
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{file.name}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="text-red-500 hover:text-red-700 transition-colors"
              disabled={analyzing || findingSimilar}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAnalyze}
              disabled={analyzing || findingSimilar}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze Document
                </>
              )}
            </button>
            <button
              onClick={handleFindSimilar}
              disabled={analyzing || findingSimilar}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {findingSimilar ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Find Similar Papers
                </>
              )}
            </button>
          </div>

          <p className={`text-xs text-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Analysis may take 30-60 seconds depending on document length
          </p>
        </div>
      )}
    </div>
  );
};
