/**
 * Avalanche API Service
 * Centralized API calls to backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WALLET_API_BASE_URL = import.meta.env.VITE_WALLET_API_URL || 'http://localhost:8001'; // Assuming new wallet backend runs on port 8001

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('avalanche_token');
};

// Helper function to make authenticated requests
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let baseUrl = API_BASE_URL;
  // Note: /wallet routes are handled by the main backend (port 8000)
  // Only specific new wallet backend routes go to WALLET_API_BASE_URL
  if (url.startsWith('/stripe/create-connect-account') || url.startsWith('/stripe/reauth')) {
    baseUrl = WALLET_API_BASE_URL;
  }

  try {
    console.log(`API Request: ${options.method || 'GET'} ${baseUrl}${url}`);

    const response = await fetch(`${baseUrl}${url}`, {
      ...options,
      headers,
    });

    console.log(`API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      // Handle 401 Unauthorized - but only logout if token is truly invalid
      if (response.status === 401) {
        console.warn('Received 401 Unauthorized response');

        // Don't immediately logout - let the frontend token manager handle session expiry
        // Just throw the error and let components handle it
        const error = await response.json().catch(() => ({ detail: 'Unauthorized' }));
        throw new Error(error.detail || 'Unauthorized - please check your permissions');
      }

      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`API Error for ${options.method || 'GET'} ${url}:`, error);
    throw error;
  }
};

// ===== AUTH APIS =====
export const authAPI = {
  signup: async (data: {
    email: string;
    first_name: string;
    last_name: string;
    country: string;
    password: string;
  }) => {
    return fetchWithAuth('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (data: { email: string; password: string }) => {
    return fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  adminLogin: async (data: { email: string; password: string }) => {
    return fetchWithAuth('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAdminMe: async () => {
    return fetchWithAuth('/auth/admin/me');
  },

  getMe: async () => {
    return fetchWithAuth('/auth/me');
  },

  getUserById: async (userId: number) => {
    return fetchWithAuth(`/users/${userId}`);
  },

  logout: () => {
    localStorage.removeItem('avalanche_token');
    window.location.href = '/';
  },

  googleOAuth: async (idToken: string) => {
    return fetchWithAuth('/auth/oauth/google', {
      method: 'POST',
      body: JSON.stringify({ token: idToken }),
    });
  },

  githubOAuth: async (code: string) => {
    return fetchWithAuth('/auth/oauth/github', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  updateProfile: async (data: Partial<{
    username: string;
    first_name: string;
    last_name: string;
    country: string;
    avatar_url: string;
    bio: string;
  }>) => {
    return fetchWithAuth('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  uploadAvatar: async (file: File) => {
    const token = localStorage.getItem('avalanche_token');
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        localStorage.removeItem('avalanche_token');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Admin-specific methods
  updateAdminProfile: async (data: Partial<{
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string;
  }>) => {
    return fetchWithAuth('/auth/admin/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  uploadAdminAvatar: async (formData: FormData) => {
    const token = localStorage.getItem('avalanche_token');
    const response = await fetch(`${API_BASE_URL}/auth/admin/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      // Handle 401 Unauthorized - redirect to admin login
      if (response.status === 401) {
        localStorage.removeItem('avalanche_token');
        window.location.href = '/admin/login';
        throw new Error('Session expired. Please login again.');
      }

      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  changeAdminPassword: async (data: {
    current_password: string;
    new_password: string;
  }) => {
    return fetchWithAuth('/auth/admin/password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ===== GUILDS APIS =====
export const guildsAPI = {
  getAll: async (params?: {
    skip?: number;
    limit?: number;
    search?: string;
    category?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);

    return fetchWithAuth(`/guilds?${queryParams.toString()}`);
  },

  getById: async (id: number) => {
    return fetchWithAuth(`/guilds/${id}`);
  },

  create: async (data: {
    name: string;
    description?: string;
    category?: string;
    is_private?: boolean;
  }) => {
    return fetchWithAuth('/guilds', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<{
    name: string;
    description: string;
    category: string;
    avatar_url: string;
    banner_url: string;
    is_private: boolean;
  }>) => {
    return fetchWithAuth(`/guilds/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  join: async (id: number) => {
    return fetchWithAuth(`/guilds/${id}/join`, {
      method: 'POST',
    });
  },

  getMyGuilds: async () => {
    return fetchWithAuth('/guilds/my/memberships');
  },
};

// ===== PROJECTS APIS =====
export const projectsAPI = {
  getAll: async (params?: {
    skip?: number;
    limit?: number;
    status?: string;
    guild_id?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.guild_id !== undefined) queryParams.append('guild_id', params.guild_id.toString());

    return fetchWithAuth(`/projects?${queryParams.toString()}`);
  },

  getById: async (id: number) => {
    return fetchWithAuth(`/projects/${id}`);
  },

  create: async (data: {
    title: string;
    description?: string;
    budget?: number;
    deadline?: string;
    guild_id?: number;
  }) => {
    return fetchWithAuth('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMyProjects: async () => {
    return fetchWithAuth('/projects/my/all');
  },

  // Project Escrow Workflow
  applyToProject: async (projectId: number) => {
    return fetchWithAuth('/projects/escrow/apply', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId }),
    });
  },

  // Place funds in escrow (after AI detects agreement)
  placeInEscrow: async (data: {
    project_id: number;
    amount: number;
    freelancer_id: number;
  }) => {
    return fetchWithAuth('/projects/escrow/place', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Submit completed work
  submitWork: async (projectId: number, formData: FormData) => {
    const token = localStorage.getItem('avalanche_token');
    const response = await fetch(`${API_BASE_URL}/projects/escrow/${projectId}/submit-work`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData, // FormData for file uploads
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Approve submitted work (releases escrow)
  approveWork: async (projectId: number) => {
    return fetchWithAuth(`/projects/escrow/${projectId}/approve-work`, {
      method: 'POST',
    });
  },

  // Get project escrow status
  getEscrowStatus: async (projectId: number) => {
    return fetchWithAuth(`/projects/escrow/${projectId}/escrow-status`);
  },
};

// ===== PRODUCTS APIS =====
export const productsAPI = {
  getAll: async (params?: {
    skip?: number;
    limit?: number;
    search?: string;
    category?: string;
    min_price?: number;
    max_price?: number;
    seller_id?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.min_price !== undefined) queryParams.append('min_price', params.min_price.toString());
    if (params?.max_price !== undefined) queryParams.append('max_price', params.max_price.toString());
    if (params?.seller_id !== undefined) queryParams.append('seller_id', params.seller_id.toString());

    return fetchWithAuth(`/products?${queryParams.toString()}`);
  },

  getById: async (id: number) => {
    return fetchWithAuth(`/products/${id}`);
  },

  create: async (data: {
    name: string;
    description?: string;
    price: number;
    category?: string;
    stock?: number;
    image_url?: string;
  }) => {
    return fetchWithAuth('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: FormData) => {
    const token = localStorage.getItem('avalanche_token');
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: data, // FormData for file upload
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

// ===== MARKETPLACE APIS =====
export const marketplaceAPI = {
  getCategories: async () => {
    return fetchWithAuth('/marketplace/categories');
  },

  getFeaturedProducts: async (limit = 10) => {
    return fetchWithAuth(`/marketplace/featured?limit=${limit}`);
  },

  getProductsByCategory: async (category: string, params?: {
    skip?: number;
    limit?: number;
    search?: string;
    min_price?: number;
    max_price?: number;
  }) => {
    const queryParams = new URLSearchParams();
    queryParams.append('category', category);
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.min_price !== undefined) queryParams.append('min_price', params.min_price.toString());
    if (params?.max_price !== undefined) queryParams.append('max_price', params.max_price.toString());

    return fetchWithAuth(`/marketplace/category?${queryParams.toString()}`);
  },
};

// ===== MESSAGES APIS =====
export const messagesAPI = {
  send: async (data: { content: string; recipient_id: number }) => {
    return fetchWithAuth('/messages/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getConversations: async () => {
    return fetchWithAuth('/messages/conversations');
  },

  getConversationMessages: async (userId: number, skip = 0, limit = 50) => {
    return fetchWithAuth(`/messages/conversation/${userId}?skip=${skip}&limit=${limit}`);
  },

  markAsRead: async (messageId: number) => {
    return fetchWithAuth(`/messages/${messageId}/read`, {
      method: 'PATCH',
    });
  },

  getAll: async (user_id?: number) => {
    const queryParams = user_id ? `?user_id=${user_id}` : '';
    return fetchWithAuth(`/messages${queryParams}`);
  },
};

// ===== GUILD CHATS APIS =====
export const guildChatsAPI = {
  getAll: async () => {
    return fetchWithAuth('/guild-chats/');
  },

  getMessages: async (guildId: number, skip = 0, limit = 50) => {
    return fetchWithAuth(`/guild-chats/${guildId}/messages?skip=${skip}&limit=${limit}`);
  },

  send: async (guildId: number, content: string) => {
    return fetchWithAuth(`/guild-chats/${guildId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  deleteMessage: async (messageId: number) => {
    return fetchWithAuth(`/guild-chats/messages/${messageId}`, {
      method: 'DELETE',
    });
  },
};



// ===== ESCROW APIS =====
export const escrowAPI = {
  create: async (data: {
    order_id: number;
    amount: number;
    auto_release_days?: number;
    requires_buyer_approval?: boolean;
    requires_delivery_confirmation?: boolean;
  }) => {
    return fetchWithAuth('/escrow', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAll: async () => {
    return fetchWithAuth('/escrow');
  },

  getById: async (id: number) => {
    return fetchWithAuth(`/escrow/${id}`);
  },

  performAction: async (id: number, action: string, reason?: string) => {
    return fetchWithAuth(`/escrow/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    });
  },

  approve: async (id: number) => {
    return fetchWithAuth(`/escrow/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action: 'approve' }),
    });
  },

  confirmDelivery: async (id: number) => {
    return fetchWithAuth(`/escrow/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action: 'confirm_delivery' }),
    });
  },

  release: async (id: number) => {
    return fetchWithAuth(`/escrow/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action: 'release' }),
    });
  },

  refund: async (id: number, reason?: string) => {
    return fetchWithAuth(`/escrow/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action: 'refund', reason }),
    });
  },

  dispute: async (id: number, reason: string) => {
    return fetchWithAuth(`/escrow/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action: 'dispute', reason }),
    });
  },
};

// ===== PAYMENT APIS =====
export const paymentsAPI = {
  initialize: async (data: {
    order_id: number;
    payment_method: string;
    payment_provider: string;
  }) => {
    return fetchWithAuth('/payments/initialize', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  verify: async (data: {
    provider_reference: string;
    payment_provider: string;
  }) => {
    return fetchWithAuth('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAll: async () => {
    return fetchWithAuth('/payments');
  },
};

// ===== AI APIS =====
export const aiAPI = {
  // Chat with AI Assistant
  chat: async (data: {
    message: string;
    conversation_history?: Array<{ role: string; content: string }>;
  }) => {
    return fetchWithAuth('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Analyze user query intent
  analyzeQuery: async (data: {
    message: string;
  }) => {
    return fetchWithAuth('/ai/analyze-query', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get quick answer for common questions
  quickAnswer: async (question: string) => {
    return fetchWithAuth(`/ai/quick-answer?question=${encodeURIComponent(question)}`);
  },

  // Semantic search for projects
  searchProjects: async (query: string, limit = 10, scoreThreshold = 0.7) => {
    const params = new URLSearchParams({
      query,
      limit: limit.toString(),
      score_threshold: scoreThreshold.toString(),
    });
    return fetchWithAuth(`/search/projects?${params.toString()}`);
  },

  // Semantic search for products
  searchProducts: async (query: string, limit = 10, scoreThreshold = 0.7) => {
    const params = new URLSearchParams({
      query,
      limit: limit.toString(),
      score_threshold: scoreThreshold.toString(),
    });
    return fetchWithAuth(`/search/products?${params.toString()}`);
  },

  // Semantic search for guilds
  searchGuilds: async (query: string, limit = 10, scoreThreshold = 0.7) => {
    const params = new URLSearchParams({
      query,
      limit: limit.toString(),
      score_threshold: scoreThreshold.toString(),
    });
    return fetchWithAuth(`/search/guilds?${params.toString()}`);
  },

  // Get personalized project recommendations
  getProjectRecommendations: async (limit = 10) => {
    return fetchWithAuth(`/recommendations/projects?limit=${limit}`);
  },

  // Get personalized guild recommendations
  getGuildRecommendations: async (limit = 5) => {
    return fetchWithAuth(`/recommendations/guilds?limit=${limit}`);
  },

  // Get similar projects
  getSimilarProjects: async (projectId: number, limit = 5) => {
    return fetchWithAuth(`/projects/${projectId}/similar?limit=${limit}`);
  },

  // Get recommended products for a project
  getRecommendedProducts: async (projectId: number, limit = 5) => {
    return fetchWithAuth(`/projects/${projectId}/recommended-products?limit=${limit}`);
  },

  // Get trending projects (personalized if logged in)
  getTrendingProjects: async (limit = 10) => {
    return fetchWithAuth(`/trending/projects?limit=${limit}`);
  },

  // AI Subscription Management
  subscription: {
    // Get all available tiers
    getTiers: async () => {
      return fetchWithAuth('/ai/subscription/tiers');
    },

    // Get current subscription status
    getStatus: async () => {
      return fetchWithAuth('/ai/subscription/status');
    },

    // Select plan (after signup)
    selectPlan: async (tier: string) => {
      return fetchWithAuth(`/ai/subscription/select-plan/${tier}`, {
        method: 'POST',
      });
    },

    // Confirm plan after Stripe payment
    confirmPlan: async (tier: string) => {
      return fetchWithAuth(`/ai/subscription/confirm-plan?tier=${tier}`, {
        method: 'POST',
      });
    },

    // Upgrade existing subscription
    upgrade: async (tier: string) => {
      return fetchWithAuth('/ai/subscription/upgrade', {
        method: 'POST',
        body: JSON.stringify({ tier }),
      });
    },

    // Cancel subscription
    cancel: async () => {
      return fetchWithAuth('/ai/subscription/cancel', {
        method: 'POST',
      });
    },
  },
};

// ===== NOTIFICATIONS API =====
export const notificationsAPI = {
  // Admin notifications
  getAdminNotifications: async (params?: {
    limit?: number;
    offset?: number;
    unread_only?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());
    if (params?.unread_only !== undefined) queryParams.append('unread_only', params.unread_only.toString());

    return fetchWithAuth(`/notifications/admin/list?${queryParams.toString()}`);
  },

  getAdminUnreadCount: async () => {
    return fetchWithAuth('/notifications/admin/unread-count');
  },

  markAdminNotificationRead: async (notificationId: number) => {
    return fetchWithAuth(`/notifications/admin/${notificationId}/read`, {
      method: 'POST',
    });
  },

  markAllAdminRead: async () => {
    return fetchWithAuth('/notifications/admin/mark-all-read', {
      method: 'POST',
    });
  },
};

// ===== ADMIN APIS =====
export const adminAPI = {
  // Dashboard Overview
  getOverviewStats: async () => {
    return fetchWithAuth('/admin/stats/overview');
  },

  getRecentTransactions: async (limit = 10) => {
    return fetchWithAuth(`/admin/transactions/recent?limit=${limit}`);
  },

  getActivityFeed: async (limit = 10) => {
    return fetchWithAuth(`/admin/activity/feed?limit=${limit}`);
  },

  // Transaction Analytics
  getTransactionStats: async () => {
    return fetchWithAuth('/admin/transactions/stats');
  },

  getTopProducts: async (limit = 4) => {
    return fetchWithAuth(`/admin/transactions/top-products?limit=${limit}`);
  },

  getRevenueChartData: async (period = 'week') => {
    return fetchWithAuth(`/admin/analytics/revenue-chart?period=${period}`);
  },

  getVolumeChartData: async (period = 'week') => {
    return fetchWithAuth(`/admin/analytics/volume-chart?period=${period}`);
  },

  // Guild Analytics
  getGuildStats: async () => {
    return fetchWithAuth('/admin/guilds/stats');
  },

  getGuildActivity: async (period = 'weekly') => {
    return fetchWithAuth(`/admin/guilds/activity?period=${period}`);
  },

  getGuildWeeklyActivity: async () => {
    return fetchWithAuth('/admin/guilds/activity/weekly');
  },

  getTrendingTopics: async (limit = 5) => {
    return fetchWithAuth(`/admin/guilds/trending-topics?limit=${limit}`);
  },

  getGuildsOverview: async (limit = 4) => {
    return fetchWithAuth(`/admin/guilds/overview?limit=${limit}`);
  },

  // AI Analytics
  getAIStats: async () => {
    return fetchWithAuth('/admin/ai/stats');
  },

  getAIModelPerformance: async () => {
    return fetchWithAuth('/admin/ai/models/performance');
  },

  getRecentAIInteractions: async (limit = 3) => {
    return fetchWithAuth(`/admin/ai/interactions/recent?limit=${limit}`);
  },

  getAIUsageBreakdown: async () => {
    return fetchWithAuth('/admin/ai/usage-breakdown');
  },

  getAIQueryVolume: async (period: 'daily' | 'weekly' | 'monthly' = 'daily') => {
    return fetchWithAuth(`/admin/ai/query-volume?period=${period}`);
  },

  getRecommendationEffectiveness: async () => {
    return fetchWithAuth('/admin/ai/recommendation-effectiveness');
  },

  // User Management
  getUsersList: async (params?: {
    skip?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);

    return fetchWithAuth(`/admin/users/list?${queryParams.toString()}`);
  },

  getUserStats: async () => {
    return fetchWithAuth('/admin/users/stats');
  },

  toggleUserStatus: async (userId: number) => {
    return fetchWithAuth(`/admin/users/${userId}/toggle-status`, {
      method: 'PATCH',
    });
  },

  deleteUser: async (userId: number) => {
    return fetchWithAuth(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // Settings
  getPlatformSettings: async () => {
    return fetchWithAuth('/admin/settings/platform');
  },

  updatePlatformSettings: async (settings: Record<string, unknown>) => {
    return fetchWithAuth('/admin/settings/platform', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  getUserRoles: async () => {
    return fetchWithAuth('/admin/settings/roles');
  },

  getUserGrowthData: async () => {
    return fetchWithAuth('/admin/analytics/user-growth');
  },

  // Global Search
  globalSearch: async (query: string) => {
    return fetchWithAuth(`/admin/search?q=${encodeURIComponent(query)}`);
  },
};

// ===== SETTINGS APIS =====
export const settingsAPI = {
  changePassword: async (data: {
    current_password: string;
    new_password: string;
  }) => {
    return fetchWithAuth('/settings/password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  changeEmail: async (data: {
    new_email: string;
    password: string;
  }) => {
    return fetchWithAuth('/settings/email', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getNotificationSettings: async () => {
    return fetchWithAuth('/settings/notifications');
  },

  updateNotificationSettings: async (settings: {
    account_activity: boolean;
    security_alerts: boolean;
    new_bids: boolean;
    item_sold: boolean;
  }) => {
    return fetchWithAuth('/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  getPrivacySettings: async () => {
    return fetchWithAuth('/settings/privacy');
  },

  updatePrivacySettings: async (settings: {
    share_anonymized_data: boolean;
    contribute_to_ai: boolean;
    personalized_recommendations: boolean;
  }) => {
    return fetchWithAuth('/settings/privacy', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  exportData: async () => {
    return fetchWithAuth('/settings/export-data');
  },

  clearHistory: async () => {
    return fetchWithAuth('/settings/clear-history', {
      method: 'POST',
    });
  },

  deleteAccount: async (data: {
    password: string;
    confirmation: string;
  }) => {
    return fetchWithAuth('/settings/account', {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  },

  getLanguage: async () => {
    return fetchWithAuth('/settings/language');
  },

  updateLanguage: async (language: string) => {
    return fetchWithAuth(`/settings/language?language=${language}`, {
      method: 'PUT',
    });
  },
};

// ===== NEW WALLET BACKEND APIS =====
export const walletBackendAPI = {
  register: async (data: { email: string; password: string }) => {
    return fetchWithAuth('/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  login: async (data: { email: string; password: string }) => {
    return fetchWithAuth('/users/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getMe: async () => {
    return fetchWithAuth('/users/me');
  },
  createConnectAccount: async () => {
    return fetchWithAuth('/stripe/create-connect-account', {
      method: 'POST',
    });
  },
  reauthConnectAccount: async () => {
    return fetchWithAuth('/stripe/reauth');
  },
  deposit: async (amount: number) => {
    return fetchWithAuth('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },
  withdraw: async (amount: number) => {
    return fetchWithAuth('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },
  getBalance: async () => {
    return fetchWithAuth('/wallet/balance');
  },
  getTransactions: async () => {
    return fetchWithAuth('/wallet/transactions');
  },
};

// Export a default API object
const API = {
  auth: authAPI,
  guilds: guildsAPI,
  projects: projectsAPI,
  products: productsAPI,
  marketplace: marketplaceAPI,
  messages: messagesAPI,
  guildChats: guildChatsAPI,
  escrow: escrowAPI,
  payments: paymentsAPI,
  ai: aiAPI,
  admin: adminAPI,
  settings: settingsAPI,
  notifications: notificationsAPI,
  wallet: { // This is the old wallet API, keeping it for now
    getWallet: async () => {
      return fetchWithAuth('/wallet/');
    },
    getTransactions: async () => {
      return fetchWithAuth('/wallet/transactions');
    },
    requestWithdrawal: async (data: {
      amount: number;
      payout_method: string;
      payout_details: object;
    }) => {
      return fetchWithAuth('/wallet/withdraw', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    getWithdrawalRequests: async () => {
      return fetchWithAuth('/wallet/withdrawal-requests');
    },
  },
  newWallet: walletBackendAPI, // New wallet API
  stripeConnect: {
    createAccount: async () => {
      return fetchWithAuth('/stripe-connect/create-account', {
        method: 'POST',
      });
    },
    getAccountStatus: async () => {
      return fetchWithAuth('/stripe-connect/account-status');
    },
    processWithdrawal: async (withdrawalId: number) => {
      return fetchWithAuth(`/stripe-connect/process-withdrawal/${withdrawalId}`, {
        method: 'POST',
      });
    },
    getDashboardLink: async () => {
      return fetchWithAuth('/stripe-connect/dashboard-link', {
        method: 'POST',
      });
    },
  },
  // Simple payout system (alternative to Stripe Connect)
  simplePayout: {
    setupBankAccount: async (bankDetails: {
      bank_name: string;
      account_number: string;
      account_holder_name: string;
      routing_number?: string;
    }) => {
      return fetchWithAuth('/simple-payout/setup-bank-account', {
        method: 'POST',
        body: JSON.stringify(bankDetails),
      });
    },
    getBankAccountStatus: async () => {
      return fetchWithAuth('/simple-payout/bank-account-status');
    },
    processWithdrawal: async (withdrawalId: number) => {
      return fetchWithAuth(`/simple-payout/process-simple-withdrawal/${withdrawalId}`, {
        method: 'POST',
      });
    },
    getWithdrawalHistory: async () => {
      return fetchWithAuth('/simple-payout/withdrawal-history');
    },
  },
  // Stripe Automatic Payout (Production-ready with real bank transfers)
  stripePayout: {
    addBankAccount: async (bankDetails: {
      bank_name: string;
      account_number: string;
      account_holder_name: string;
      country: string;  // Country code (e.g., 'NG', 'US', 'GB')
      routing_number?: string;  // Optional - not required for Nigerian accounts
    }) => {
      return fetchWithAuth('/stripe-payout/add-bank-account', {
        method: 'POST',
        body: JSON.stringify(bankDetails),
      });
    },
    getBankAccountStatus: async () => {
      return fetchWithAuth('/stripe-payout/bank-account-status');
    },
    processAutomaticPayout: async (withdrawalId: number) => {
      return fetchWithAuth(`/stripe-payout/process-automatic-payout/${withdrawalId}`, {
        method: 'POST',
      });
    },
    getPayoutStatus: async (payoutId: string) => {
      return fetchWithAuth(`/stripe-payout/payout-status/${payoutId}`);
    },
  },

  // Paystack Payout (African Banks)
  paystackPayout: {
    addAfricanBankAccount: async (bankDetails: {
      bank_name: string;
      account_number: string;
      account_holder_name: string;
      country: string;  // Country code (e.g., 'NG', 'GH', 'KE', 'ZA')
    }) => {
      return fetchWithAuth('/paystack-payout/add-african-bank-account', {
        method: 'POST',
        body: JSON.stringify(bankDetails),
      });
    },
    processPaystackPayout: async (withdrawalId: number) => {
      return fetchWithAuth(`/paystack-payout/process-paystack-payout/${withdrawalId}`, {
        method: 'POST',
      });
    },
    getBankList: async (countryCode: string) => {
      return fetchWithAuth(`/paystack-payout/bank-list/${countryCode}`);
    },
    getTransferStatus: async (transferCode: string) => {
      return fetchWithAuth(`/paystack-payout/transfer-status/${transferCode}`);
    },
  },
};

export default API;
