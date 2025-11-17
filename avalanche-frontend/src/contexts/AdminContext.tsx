import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import API from '../services/api';

interface AdminData {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  role: string;
  ai_tier: string;
  plan_selected: boolean;
  created_at: string;
}

interface AdminContextType {
  adminData: AdminData | null;
  loading: boolean;
  error: string | null;
  refreshAdminData: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('AdminContext: Fetching admin data...');

      const data = await API.auth.getAdminMe();
      console.log('AdminContext: Admin data received:', data);
      setAdminData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch admin data';
      setError(errorMessage);
      console.error('AdminContext: Failed to fetch admin data:', err);
    } finally {
      console.log('AdminContext: Setting loading to false');
      setLoading(false);
    }
  };

  const refreshAdminData = async () => {
    await fetchAdminData();
  };

  useEffect(() => {
    console.log('AdminContext: Component mounted, starting fetch');
    fetchAdminData();
  }, []);

  // Always render children, even while loading
  // Individual pages can check loading state if needed
  return (
    <AdminContext.Provider value={{ adminData, loading, error, refreshAdminData }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
