 const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity
const TOKEN_REFRESH_INTERVAL = 25 * 60 * 1000; // Refresh token every 25 minutes (before 30min expiry)
const TOKEN_EXPIRY_CHECK_INTERVAL = 60 * 1000; // Check every minute

let lastActivityTime = Date.now();
let inactivityTimer: number | null = null;
let refreshTimer: number | null = null;
let isActive = true;

// Track user activity events
const activityEvents = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
];

// Update last activity time
const updateActivity = () => {
  lastActivityTime = Date.now();
  isActive = true;
  console.log('TokenManager: User activity detected');
};

// Check if user is still active
const checkInactivity = () => {
  const inactiveTime = Date.now() - lastActivityTime;

  if (inactiveTime >= INACTIVITY_TIMEOUT) {
    console.log('TokenManager: User inactive for 30 minutes, marking as inactive');
    isActive = false;
  }
};

// Refresh the access token
const refreshToken = async (isAdmin: boolean = false) => {
  try {
    console.log(`TokenManager: Attempting to refresh ${isAdmin ? 'admin' : 'user'} token...`);

    // Check if user has been inactive
    const inactiveTime = Date.now() - lastActivityTime;

    if (inactiveTime >= INACTIVITY_TIMEOUT) {
      console.log('TokenManager: User inactive, logging out instead of refreshing');
      handleLogout();
      return;
    }

    // Call the appropriate refresh endpoint
    const endpoint = isAdmin ? '/auth/admin/refresh' : '/auth/refresh';
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('avalanche_token')}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('avalanche_token', data.access_token);
      console.log('TokenManager: Token refreshed successfully');
    } else if (response.status === 401) {
      // Only log out on 401 (unauthorized) - token is actually invalid
      console.log('TokenManager: Token is invalid (401), logging out');
      handleLogout();
    } else {
      // For other errors (500, network issues, etc), don't log out
      // Just log the error and try again next time
      console.warn(`TokenManager: Token refresh failed with status ${response.status}, will retry later`);
    }
  } catch (error) {
    console.error('TokenManager: Error refreshing token (network issue?), will retry later:', error);
    // Don't log out on network errors - just retry later
  }
};

// Handle logout
const handleLogout = () => {
  console.log('TokenManager: Logging out user');
  localStorage.removeItem('avalanche_token');

  // Determine if this is an admin route
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  // Redirect to appropriate login page
  if (isAdminRoute) {
    window.location.href = '/admin/login';
  } else {
    window.location.href = '/login';
  }
};

// Start monitoring user activity and token refresh
export const startTokenManager = () => {
  const token = localStorage.getItem('avalanche_token');
  if (!token) {
    console.log('TokenManager: No token found, not starting');
    return;
  }

  // If already running, don't start again
  if (refreshTimer) {
    console.log('TokenManager: Already running, skipping start');
    return;
  }

  // Determine if this is an admin session
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  console.log(`TokenManager: Starting for ${isAdminRoute ? 'admin' : 'user'} session`);

  // Reset activity time
  lastActivityTime = Date.now();
  isActive = true;

  // Add activity listeners
  activityEvents.forEach(event => {
    window.addEventListener(event, updateActivity, { passive: true });
  });

  // Check inactivity every minute
  inactivityTimer = window.setInterval(() => {
    checkInactivity();
  }, TOKEN_EXPIRY_CHECK_INTERVAL);

  // Refresh token periodically for active users
  refreshTimer = window.setInterval(() => {
    refreshToken(isAdminRoute);
  }, TOKEN_REFRESH_INTERVAL);

  // Also refresh token immediately if it's close to expiry
  // (tokens expire after 30 minutes, so refresh after 25 minutes of login)
  setTimeout(() => {
    refreshToken(isAdminRoute);
  }, TOKEN_REFRESH_INTERVAL);
};

// Stop monitoring
export const stopTokenManager = () => {
  console.log('TokenManager: Stopping');

  // Remove activity listeners
  activityEvents.forEach(event => {
    window.removeEventListener(event, updateActivity);
  });

  // Clear timers
  if (inactivityTimer) {
    window.clearInterval(inactivityTimer);
    inactivityTimer = null;
  }

  if (refreshTimer) {
    window.clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

// Get current activity status
export const isUserActive = () => {
  const inactiveTime = Date.now() - lastActivityTime;
  return inactiveTime < INACTIVITY_TIMEOUT;
};

// Enhanced session management - check if user becomes active again
export const checkAndRefreshIfActive = async (isAdmin: boolean = false) => {
  const inactiveTime = Date.now() - lastActivityTime;

  // If user was inactive but now shows activity, refresh token
  if (inactiveTime < INACTIVITY_TIMEOUT && !isActive) {
    console.log('TokenManager: User became active again, refreshing token');
    isActive = true;
    await refreshToken(isAdmin);
  }
};
