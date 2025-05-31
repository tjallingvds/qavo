import { useState, useEffect, useCallback } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  token?: string;
  user?: any;
  error?: string;
}

interface AuthService {
  gmail: AuthState;
  slack: AuthState;
}

const API_BASE_URL = 'http://localhost:3001/api';

// Helper functions for localStorage persistence
const getStoredAuthState = (): AuthService => {
  try {
    const stored = localStorage.getItem('authState');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to parse stored auth state:', error);
  }
  
  return {
    gmail: { isAuthenticated: false },
    slack: { isAuthenticated: false }
  };
};

const storeAuthState = (state: AuthService) => {
  try {
    localStorage.setItem('authState', JSON.stringify(state));
  } catch (error) {
    console.error('Failed to store auth state:', error);
  }
};

export function useAuth() {
  const [authState, setAuthState] = useState<AuthService>(getStoredAuthState);

  // Update localStorage whenever authState changes
  useEffect(() => {
    storeAuthState(authState);
  }, [authState]);

  // Check for OAuth callback parameters on mount and test stored authentication
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get('auth_success');
    const authError = urlParams.get('auth_error');
    const user = urlParams.get('user');

    if (authSuccess) {
      if (authSuccess === 'gmail') {
        setAuthState(prev => ({
          ...prev,
          gmail: { 
            isAuthenticated: true,
            token: 'gmail-authenticated' // In a real app, you'd get this from the callback
          }
        }));
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (authSuccess === 'slack' && user) {
        try {
          const userData = JSON.parse(decodeURIComponent(user));
          setAuthState(prev => ({
            ...prev,
            slack: { 
              isAuthenticated: true,
              user: userData,
              token: userData.access_token || 'slack-authenticated'
            }
          }));
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {
          console.error('Failed to parse user data:', e);
        }
      }
    }

    if (authError) {
      console.error('OAuth Error:', authError);
      setAuthState(prev => ({
        ...prev,
        gmail: { ...prev.gmail, error: authError, isAuthenticated: false },
        slack: { ...prev.slack, error: authError, isAuthenticated: false }
      }));
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Test stored authentication on mount (only if no OAuth callback)
    if (!authSuccess && !authError) {
      // Test Gmail connection if we think we're authenticated
      if (authState.gmail.isAuthenticated) {
        testGmailConnection();
      }
      
      // Test Slack connection if we think we're authenticated  
      if (authState.slack.isAuthenticated && authState.slack.token) {
        testSlackConnection(authState.slack.token);
      }
    }
  }, []); // Empty dependency array to run only on mount

  const authenticateGmail = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/gmail/url`);
      const data = await response.json();
      
      if (data.success && data.data.authUrl) {
        window.location.href = data.data.authUrl;
      } else {
        throw new Error('Failed to get Gmail auth URL');
      }
    } catch (error) {
      console.error('Gmail authentication error:', error);
      setAuthState(prev => ({
        ...prev,
        gmail: { ...prev.gmail, error: error instanceof Error ? error.message : 'Authentication failed' }
      }));
    }
  }, []);

  const authenticateSlack = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/slack/url`);
      const data = await response.json();
      
      if (data.success && data.data.authUrl) {
        window.location.href = data.data.authUrl;
      } else {
        throw new Error('Failed to get Slack auth URL');
      }
    } catch (error) {
      console.error('Slack authentication error:', error);
      setAuthState(prev => ({
        ...prev,
        slack: { ...prev.slack, error: error instanceof Error ? error.message : 'Authentication failed' }
      }));
    }
  }, []);

  const testGmailConnection = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/test/gmail`);
      const data = await response.json();
      
      const isConnected = data.data?.connected || false;
      
      setAuthState(prev => ({
        ...prev,
        gmail: {
          ...prev.gmail,
          isAuthenticated: isConnected,
          error: isConnected ? undefined : 'Connection test failed'
        }
      }));
      
      return isConnected;
    } catch (error) {
      console.error('Gmail connection test failed:', error);
      setAuthState(prev => ({
        ...prev,
        gmail: {
          ...prev.gmail,
          isAuthenticated: false,
          error: 'Connection test failed'
        }
      }));
      return false;
    }
  }, []);

  const testSlackConnection = useCallback(async (token?: string) => {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/auth/test/slack`, {
        headers
      });
      const data = await response.json();
      
      const isConnected = data.data?.connected || false;
      
      setAuthState(prev => ({
        ...prev,
        slack: {
          ...prev.slack,
          isAuthenticated: isConnected,
          error: isConnected ? undefined : 'Connection test failed'
        }
      }));
      
      return isConnected;
    } catch (error) {
      console.error('Slack connection test failed:', error);
      setAuthState(prev => ({
        ...prev,
        slack: {
          ...prev.slack,
          isAuthenticated: false,
          error: 'Connection test failed'
        }
      }));
      return false;
    }
  }, []);

  const logout = useCallback((service: 'gmail' | 'slack') => {
    setAuthState(prev => ({
      ...prev,
      [service]: { isAuthenticated: false }
    }));
  }, []);

  return {
    authState,
    authenticateGmail,
    authenticateSlack,
    testGmailConnection,
    testSlackConnection,
    logout
  };
} 