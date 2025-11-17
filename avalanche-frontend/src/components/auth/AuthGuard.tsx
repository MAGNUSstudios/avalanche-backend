import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard - Protects routes that require authentication.
 * Checks if a user is authenticated.
 * Redirects to the login page if not authenticated.
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('avalanche_token');

      if (!token) {
        console.log('[AuthGuard] No token found, redirecting to login');
        navigate('/login', { replace: true });
        setIsLoading(false);
        return;
      }

      // Check for cached user data to provide a faster experience
      const cachedUser = localStorage.getItem('avalanche_user');
      if (cachedUser) {
        try {
          // Assuming if the user data is in cache, they are authenticated
          console.log('[AuthGuard] User found in cache, allowing access');
          setIsAuthenticated(true);
          setIsLoading(false);
          // Optionally, you could still verify the token with the API in the background
          return;
        } catch (e) {
          console.error('[AuthGuard] Error parsing cached user data', e);
          // If cache is invalid, proceed to API verification
        }
      }

      // If no valid cache, verify the token with the API
      try {
        console.log('[AuthGuard] No cache, verifying token with API...');
        await API.auth.getMe(); // This call just verifies the token is valid
        setIsAuthenticated(true);
      } catch (apiError) {
        console.error('[AuthGuard] API token verification failed:', apiError);
        // If the token is invalid, clear it and redirect to login
        localStorage.removeItem('avalanche_token');
        localStorage.removeItem('avalanche_user');
        navigate('/login', { replace: true });
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid var(--border-color)',
            borderTopColor: 'var(--primary-color)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <div>Verifying authentication...</div>
        </div>
        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (!isAuthenticated) {
    // While redirecting, it's best to render nothing to avoid a flash of content
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
