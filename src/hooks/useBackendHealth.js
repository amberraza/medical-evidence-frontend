import { useState, useEffect } from 'react';
import * as api from '../services/api';

/**
 * Custom hook for checking backend health status
 * Automatically checks health on mount
 */
export const useBackendHealth = () => {
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    const checkHealth = async () => {
      const isHealthy = await api.checkBackendHealth();
      setBackendStatus(isHealthy ? 'connected' : 'error');
    };
    checkHealth();
  }, []);

  return backendStatus;
};
