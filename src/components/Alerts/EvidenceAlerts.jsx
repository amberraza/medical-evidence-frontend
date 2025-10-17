import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Search, Mail, Calendar, CheckCircle, Loader2 } from 'lucide-react';
import * as api from '../../services/api';

export const EvidenceAlerts = ({ darkMode = false }) => {
  const [alerts, setAlerts] = useState([]);
  const [newAlertTopic, setNewAlertTopic] = useState('');
  const [newAlertEmail, setNewAlertEmail] = useState('');
  const [frequency, setFrequency] = useState('weekly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Load alerts from localStorage on mount
  useEffect(() => {
    const savedAlerts = localStorage.getItem('evidenceAlerts');
    if (savedAlerts) {
      try {
        setAlerts(JSON.parse(savedAlerts));
      } catch (err) {
        console.error('Failed to load alerts:', err);
      }
    }
  }, []);

  // Save alerts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('evidenceAlerts', JSON.stringify(alerts));
  }, [alerts]);

  const handleAddAlert = async (e) => {
    e.preventDefault();
    if (!newAlertTopic.trim() || !newAlertEmail.trim()) return;

    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newAlertEmail)) {
        throw new Error('Please enter a valid email address');
      }

      // Create new alert
      const newAlert = {
        id: Date.now().toString(),
        topic: newAlertTopic.trim(),
        email: newAlertEmail.trim(),
        frequency,
        createdAt: new Date().toISOString(),
        active: true,
        lastChecked: null
      };

      // Call backend to register the alert
      await api.createEvidenceAlert(newAlert);

      setAlerts(prev => [...prev, newAlert]);
      setNewAlertTopic('');
      setNewAlertEmail('');
      setSuccessMessage('Alert created successfully! You will receive notifications when new evidence is published.');

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      await api.deleteEvidenceAlert(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      setSuccessMessage('Alert deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to delete alert');
    }
  };

  const handleToggleAlert = async (alertId) => {
    try {
      const alert = alerts.find(a => a.id === alertId);
      const updatedAlert = { ...alert, active: !alert.active };

      await api.updateEvidenceAlert(updatedAlert);

      setAlerts(prev => prev.map(a =>
        a.id === alertId ? updatedAlert : a
      ));
    } catch (err) {
      setError('Failed to update alert');
    }
  };

  const handleCheckNow = async (alertId) => {
    try {
      setLoading(true);
      const alert = alerts.find(a => a.id === alertId);

      const results = await api.checkEvidenceAlert(alertId);

      // Update last checked time
      setAlerts(prev => prev.map(a =>
        a.id === alertId ? { ...a, lastChecked: new Date().toISOString() } : a
      ));

      if (results.newArticles && results.newArticles.length > 0) {
        setSuccessMessage(`Found ${results.newArticles.length} new article(s) for "${alert.topic}"`);
      } else {
        setSuccessMessage(`No new articles found for "${alert.topic}"`);
      }

      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError('Failed to check for new evidence');
    } finally {
      setLoading(false);
    }
  };

  const AlertCard = ({ alert }) => (
    <div className={`border rounded-lg p-4 ${
      alert.active
        ? darkMode
          ? 'border-blue-700 bg-blue-900/30'
          : 'border-blue-200 bg-blue-50'
        : darkMode
          ? 'border-gray-700 bg-[#1a1a1a]'
          : 'border-gray-200 bg-gray-50'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Search className={`w-5 h-5 ${alert.active ? 'text-blue-600' : 'text-gray-400'}`} />
            <h4 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{alert.topic}</h4>
          </div>
          <div className={`text-sm space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{alert.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Frequency: {alert.frequency}</span>
            </div>
            {alert.lastChecked && (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Last checked: {new Date(alert.lastChecked).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleToggleAlert(alert.id)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              alert.active
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
            }`}
          >
            {alert.active ? 'Active' : 'Paused'}
          </button>
          <button
            onClick={() => handleDeleteAlert(alert.id)}
            className={`p-2 text-red-600 rounded transition-colors ${
              darkMode ? 'hover:bg-red-900/30' : 'hover:bg-red-100'
            }`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <button
        onClick={() => handleCheckNow(alert.id)}
        disabled={loading}
        className={`w-full mt-2 px-4 py-2 border rounded transition-colors text-sm font-medium disabled:opacity-50 ${
          darkMode
            ? 'bg-transparent border-blue-600 text-blue-400 hover:bg-blue-900/30'
            : 'bg-white border-blue-300 text-blue-700 hover:bg-blue-50'
        }`}
      >
        Check for New Evidence Now
      </button>
    </div>
  );

  return (
    <div className={`rounded-lg shadow-md p-4 sm:p-6 mb-4 ${darkMode ? 'bg-transparent' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-yellow-600" />
          <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Evidence Alerts</h3>
        </div>
      </div>

      <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Stay updated with the latest research. Create alerts for specific topics and receive notifications when new evidence is published.
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

      {/* Create New Alert Form */}
      <form onSubmit={handleAddAlert} className={`mb-6 p-4 rounded-lg border ${
        darkMode
          ? 'bg-[#1a1a1a] border-gray-700'
          : 'bg-gray-50 border-gray-200'
      }`}>
        <h4 className={`font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          <Plus className="w-5 h-5" />
          Create New Alert
        </h4>

        <div className="space-y-3">
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Research Topic
            </label>
            <input
              type="text"
              value={newAlertTopic}
              onChange={(e) => setNewAlertTopic(e.target.value)}
              placeholder="e.g., COVID-19 treatments, Alzheimer's disease, diabetes management"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                darkMode
                  ? 'bg-[#1a1a1a] border-gray-600 text-gray-100 placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
              disabled={loading}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Email Address
            </label>
            <input
              type="email"
              value={newAlertEmail}
              onChange={(e) => setNewAlertEmail(e.target.value)}
              placeholder="your.email@example.com"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                darkMode
                  ? 'bg-[#1a1a1a] border-gray-600 text-gray-100 placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
              disabled={loading}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Alert Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                darkMode
                  ? 'bg-[#1a1a1a] border-gray-600 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              disabled={loading}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !newAlertTopic.trim() || !newAlertEmail.trim()}
            className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Create Alert
              </>
            )}
          </button>
        </div>
      </form>

      {/* Active Alerts List */}
      {alerts.length > 0 ? (
        <div>
          <h4 className={`font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Your Alerts ({alerts.length})
          </h4>
          <div className="space-y-3">
            {alerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      ) : (
        <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <Bell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No alerts created yet</p>
          <p className="text-xs mt-2">Create your first alert to stay updated with new research</p>
        </div>
      )}

      {/* Info Box */}
      <div className={`mt-6 p-4 border rounded-lg ${
        darkMode
          ? 'bg-blue-900/30 border-blue-700'
          : 'bg-blue-50 border-blue-200'
      }`}>
        <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
          <strong>How it works:</strong> We'll search PubMed and other medical databases for new publications matching your topics and send you email notifications based on your chosen frequency.
        </p>
      </div>
    </div>
  );
};
