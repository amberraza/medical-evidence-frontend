import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, FileText, Download, Loader2, CheckCircle, Copy, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import * as api from '../../services/api';

export const VisitNotes = ({ darkMode = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [generatedNote, setGeneratedNote] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [browserSupport, setBrowserSupport] = useState(true);
  const recognitionRef = useRef(null);

  // Check for Web Speech API support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setBrowserSupport(false);
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setTranscription(prev => prev + finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);

      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      if (isRecording) {
        // Restart if we're still supposed to be recording
        try {
          recognition.start();
        } catch (err) {
          console.error('Failed to restart recognition:', err);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);

  const handleTranscriptionChange = (e) => {
    setTranscription(e.target.value);
  };

  const handleGenerateNote = async () => {
    if (!transcription.trim()) {
      setError('Please enter or record a visit transcription first');
      return;
    }

    setGenerating(true);
    setError(null);
    setSuccessMessage('');
    setGeneratedNote(null);

    try {
      const result = await api.generateVisitNote(transcription);
      setGeneratedNote(result);
      setSuccessMessage('Visit note generated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to generate visit note');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyNote = () => {
    if (generatedNote?.note) {
      navigator.clipboard.writeText(generatedNote.note);
      setSuccessMessage('Note copied to clipboard!');
      setTimeout(() => setSuccessMessage(''), 2000);
    }
  };

  const handleDownloadNote = () => {
    if (generatedNote?.note) {
      const blob = new Blob([generatedNote.note], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `visit-note-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccessMessage('Note downloaded!');
      setTimeout(() => setSuccessMessage(''), 2000);
    }
  };

  const handleClearAll = () => {
    setTranscription('');
    setGeneratedNote(null);
    setError(null);
    setSuccessMessage('');
  };

  const toggleRecording = () => {
    if (!browserSupport) {
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (!recognitionRef.current) {
      setError('Speech recognition is not initialized');
      return;
    }

    if (isRecording) {
      // Stop recording
      recognitionRef.current.stop();
      setIsRecording(false);
      setSuccessMessage('Recording stopped');
      setTimeout(() => setSuccessMessage(''), 2000);
    } else {
      // Start recording
      setError(null);
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        setSuccessMessage('Recording started - speak clearly');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setError('Failed to start recording. Please check microphone permissions.');
      }
    }
  };

  return (
    <div className={`rounded-lg shadow-md p-4 sm:p-6 mb-4 ${darkMode ? 'bg-transparent' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-teal-600" />
          <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Visit Notes Transcription</h3>
        </div>
      </div>

      <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Record or type a clinical visit conversation and generate structured SOAP notes automatically.
      </p>

      {/* Success Message */}
      {successMessage && (
        <div className={`border rounded-lg p-4 mb-4 flex items-start gap-3 ${
          darkMode
            ? 'bg-green-900/30 border-green-700'
            : 'bg-green-50 border-green-200'
        }`}>
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-800'}`}>{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className={`border rounded-lg p-4 mb-4 ${
          darkMode
            ? 'bg-red-900/30 border-red-700'
            : 'bg-red-50 border-red-200'
        }`}>
          <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-800'}`}>{error}</p>
        </div>
      )}

      {/* Recording / Input Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Visit Transcription
          </label>
          <button
            onClick={toggleRecording}
            disabled={!browserSupport}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : browserSupport
                  ? 'bg-teal-100 hover:bg-teal-200 text-teal-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title={!browserSupport ? 'Speech recognition not supported in this browser' : ''}
          >
            {isRecording ? (
              <>
                <MicOff className="w-4 h-4" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Start Recording
              </>
            )}
          </button>
        </div>

        <textarea
          value={transcription}
          onChange={handleTranscriptionChange}
          placeholder="Type or record the patient visit conversation here...&#10;&#10;Example:&#10;Doctor: Good morning, how are you feeling today?&#10;Patient: I've been having chest pain for the past two days.&#10;Doctor: Can you describe the pain? Is it sharp or dull?&#10;Patient: It's a sharp pain that comes and goes, especially when I take deep breaths..."
          className={`w-full h-64 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-vertical ${
            darkMode
              ? 'bg-[#1a1a1a] border-gray-600 text-gray-100 placeholder-gray-500'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
          }`}
          disabled={generating}
        />

        <div className="flex gap-3 mt-3">
          <button
            onClick={handleGenerateNote}
            disabled={generating || !transcription.trim()}
            className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Note...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Generate SOAP Note
              </>
            )}
          </button>
          <button
            onClick={handleClearAll}
            disabled={generating}
            className={`px-6 py-3 border rounded-lg font-medium transition-colors ${
              darkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Clear
          </button>
        </div>

        {browserSupport ? (
          <div className={`mt-3 p-3 border rounded-lg ${
            darkMode
              ? 'bg-yellow-900/30 border-yellow-700'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className={`text-xs ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                <strong>Privacy Notice:</strong> Browser speech recognition uses cloud services (Google) to process audio.
                For HIPAA compliance and sensitive medical data, consider using typed transcription or a dedicated medical transcription service.
              </p>
            </div>
          </div>
        ) : (
          <div className={`mt-3 p-3 border rounded-lg ${
            darkMode
              ? 'bg-blue-900/30 border-blue-700'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <p className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
              <strong>Browser Not Supported:</strong> Speech recognition requires Chrome or Edge browser.
              You can still type or paste transcriptions manually.
            </p>
          </div>
        )}
      </div>

      {/* Generated Note Display */}
      {generatedNote && (
        <div className={`border-t pt-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <h4 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Generated SOAP Note</h4>
            <div className="flex gap-2">
              <button
                onClick={handleCopyNote}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  darkMode
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
              <button
                onClick={handleDownloadNote}
                className="flex items-center gap-2 px-4 py-2 bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-lg transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>

          <div className={`rounded-lg p-6 border ${
            darkMode
              ? 'bg-[#1a1a1a] border-gray-700'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className={`text-xl font-bold mt-4 mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`} {...props} />,
                  h2: ({node, ...props}) => <h2 className={`text-lg font-bold mt-4 mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`} {...props} />,
                  h3: ({node, ...props}) => <h3 className={`text-base font-semibold mt-3 mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`} {...props} />,
                  p: ({node, ...props}) => <p className={`mb-2 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-800'}`} {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc ml-6 mb-2 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal ml-6 mb-2 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className={darkMode ? 'text-gray-300' : 'text-gray-800'} {...props} />,
                  strong: ({node, ...props}) => <strong className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`} {...props} />,
                }}
              >
                {generatedNote.note}
              </ReactMarkdown>
            </div>
          </div>

          {/* Metadata */}
          {generatedNote.metadata && (
            <div className={`mt-4 p-4 border rounded-lg ${
              darkMode
                ? 'bg-blue-900/30 border-blue-700'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                <strong>Generated:</strong> {new Date(generatedNote.metadata.generatedAt).toLocaleString()}
              </p>
              {generatedNote.metadata.wordCount && (
                <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  <strong>Word Count:</strong> {generatedNote.metadata.wordCount}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className={`mt-6 p-4 border rounded-lg ${
        darkMode
          ? 'bg-teal-900/30 border-teal-700'
          : 'bg-teal-50 border-teal-200'
      }`}>
        <p className={`text-sm ${darkMode ? 'text-teal-300' : 'text-teal-800'}`}>
          <strong>SOAP Format:</strong> This tool generates structured clinical notes following the SOAP format:
          <span className="font-semibold"> Subjective</span> (patient's perspective),
          <span className="font-semibold"> Objective</span> (clinical findings),
          <span className="font-semibold"> Assessment</span> (diagnosis), and
          <span className="font-semibold"> Plan</span> (treatment plan).
        </p>
      </div>
    </div>
  );
};
