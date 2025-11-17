import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

/**
 * AdminAuthGuard - Protects admin routes
 * Checks if user is authenticated and has admin role
 * Redirects to login if not authenticated
 */
const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('avalanche_token');
      const cachedUser = localStorage.getItem('avalanche_user');

      // If no token, redirect to login
      if (!token) {
        console.log('[AdminAuthGuard] No token found, redirecting to login');
        navigate('/admin/login', { replace: true });
        setIsLoading(false);
        return;
      }

      // If we have cached user data, use it immediately and verify in background
      if (cachedUser) {
        try {
          const user = JSON.parse(cachedUser);
          if (user.role === 'admin') {
            console.log('[AdminAuthGuard] Admin user found in cache, allowing access');
            setIsAuthenticated(true);
            setIsLoading(false);
            // Don't verify with API - just trust the cache
            return;
          } else {
            console.log('[AdminAuthGuard] Cached user is not admin');
            localStorage.removeItem('avalanche_token');
            localStorage.removeItem('avalanche_user');
            alert('Access denied. Admin credentials required.');
            navigate('/', { replace: true });
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.error('[AdminAuthGuard] Invalid cached user data');
        }
      }

      // Only verify with API if no valid cache exists
      try {
        console.log('[AdminAuthGuard] No cache, verifying with API...');
        const user = await API.auth.getMe();

        if (user.role === 'admin') {
          console.log('[AdminAuthGuard] API confirmed admin access');
          localStorage.setItem('avalanche_user', JSON.stringify(user));
          setIsAuthenticated(true);
        } else {
          console.log('[AdminAuthGuard] API says user is not admin');
          localStorage.removeItem('avalanche_token');
          localStorage.removeItem('avalanche_user');
          alert('Access denied. Admin credentials required.');
          navigate('/', { replace: true });
        }
      } catch (apiError) {
        console.error('[AdminAuthGuard] API error:', apiError);
        // If API fails but we have a token, don't immediately kick them out
        // They might have network issues
        console.log('[AdminAuthGuard] API failed, redirecting to login');
        navigate('/admin/login', { replace: true });
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []); // Only run once on mount

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
          <div>Verifying admin access...</div>
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
    return null;
  }

  return <>{children}</>;
};

export default AdminAuthGuard;
