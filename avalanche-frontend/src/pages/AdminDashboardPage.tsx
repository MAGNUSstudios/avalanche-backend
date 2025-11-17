
import React, { useEffect } from 'react';
import { styled } from '../stitches.config';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Users as UsersIcon,
  TrendingUp,
  Settings,
  Search,
  Download,
  Ban,
  Unlock,
  ChevronDown,
  Calendar,
  LogOut,
} from 'lucide-react';
import API from '../services/api';
import AdminAuthGuard from '../components/auth/AdminAuthGuard';
import AdminLayout from '../components/layout/AdminLayout';
import NotificationDropdown from '../components/NotificationDropdown';

const PageContainer = styled('div', {
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: 'var(--bg-primary)',
});

const Sidebar = styled('aside', {
  width: '240px',
  backgroundColor: 'var(--card-bg)',
  borderRight: '1px solid var(--border-color)',
  padding: '$6',
  display: 'flex',
  flexDirection: 'column',
  gap: '$6',
});

const Logo = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  marginBottom: '$4',
});

const LogoImage = styled('div', {
  width: '32px',
  height: '32px',
  borderRadius: '$full',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '$sm',
  fontWeight: '$bold',
});

const LogoText = styled('div', {
  display: 'flex',
  flexDirection: 'column',
});

const LogoTitle = styled('span', {
  fontSize: '$lg',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
});

const LogoSubtitle = styled('span', {
  fontSize: '$xs',
  color: 'var(--text-secondary)',
});

const Nav = styled('nav', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
});

const NavItem = styled('a', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  padding: '$3 $4',
  borderRadius: '$base',
  color: 'var(--text-primary)',
  textDecoration: 'none',
  fontSize: '$sm',
  transition: 'all 0.2s ease',
  cursor: 'pointer',

  '&:hover': {
    backgroundColor: 'var(--bg-tertiary)',
  },

  variants: {
    active: {
      true: {
        backgroundColor: 'var(--primary-color)',
        color: 'white',

        '&:hover': {
          backgroundColor: 'var(--primary-hover)',
        },
      },
    },
  },
});

const MainContent = styled('main', {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
});

const TopBar = styled('header', {
  backgroundColor: 'var(--card-bg)',
  borderBottom: '1px solid var(--border-color)',
  padding: '$4 $8',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const PageTitle = styled('h1', {
  fontSize: '$2xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
});

const TopBarActions = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$4',
});

const UserAvatar = styled('div', {
  width: '40px',
  height: '40px',
  borderRadius: '$full',
  backgroundColor: 'var(--bg-secondary)',
  overflow: 'hidden',

  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

const ContentArea = styled('div', {
  padding: '$8',
  flex: 1,
});

const StatsGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '$6',
  marginBottom: '$8',
});

const StatCard = styled('div', {
  backgroundColor: 'var(--card-bg)',
  borderRadius: '$lg',
  padding: '$6',
  border: '1px solid var(--border-color)',
});

const StatTitle = styled('div', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
  marginBottom: '$2',
});

const StatValue = styled('div', {
  fontSize: '$3xl',
  fontWeight: '$bold',
  color: 'var(--primary-color)',
  marginBottom: '$2',
});

const StatChange = styled('div', {
  fontSize: '$xs',
  display: 'flex',
  alignItems: 'center',
  gap: '$1',

  variants: {
    trend: {
      up: {
        color: '$green600',
      },
      down: {
        color: '$red600',
      },
      neutral: {
        color: '$gray600',
      },
    },
  },
});

const Section = styled('section', {
  backgroundColor: 'var(--card-bg)',
  borderRadius: '$lg',
  border: '1px solid var(--border-color)',
  overflow: 'hidden',
});

const SectionHeader = styled('div', {
  padding: '$6',
  borderBottom: '1px solid var(--border-color)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '$4',
  flexWrap: 'wrap',
});

const SectionTitle = styled('h2', {
  fontSize: '$lg',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
});

const SearchBar = styled('div', {
  position: 'relative',
  flex: 1,
  maxWidth: '400px',
});

const SearchInput = styled('input', {
  width: '100%',
  padding: '$2 $3 $2 $10',
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '$base',
  fontSize: '$sm',
  color: 'var(--text-primary)',

  '&::placeholder': {
    color: 'var(--text-secondary)',
  },

  '&:focus': {
    outline: 'none',
    borderColor: 'var(--primary-color)',
  },
});

const SearchIcon = styled(Search, {
  position: 'absolute',
  left: '$3',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--text-secondary)',
  width: '16px',
  height: '16px',
});

const FilterButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$2 $4',
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '$base',
  fontSize: '$sm',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  whiteSpace: 'nowrap',

  '&:hover': {
    backgroundColor: 'var(--bg-tertiary)',
  },
});

const ExportButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$2 $4',
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '$base',
  fontSize: '$sm',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  whiteSpace: 'nowrap',

  '&:hover': {
    backgroundColor: 'var(--bg-secondary)',
  },
});

const Table = styled('table', {
  width: '100%',
  borderCollapse: 'collapse',
});

const Th = styled('th', {
  padding: '$4 $6',
  textAlign: 'left',
  fontSize: '$xs',
  fontWeight: '$semibold',
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  borderBottom: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-secondary)',
});

const Td = styled('td', {
  padding: '$4 $6',
  borderBottom: '1px solid var(--border-color)',
  fontSize: '$sm',
  color: 'var(--text-primary)',
});

const UserCell = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
});

const UserInfo = styled('div', {
  display: 'flex',
  flexDirection: 'column',
});

const UserName = styled('span', {
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
});

const UserEmail = styled('span', {
  fontSize: '$xs',
  color: 'var(--text-secondary)',
});

const StatusBadge = styled('span', {
  padding: '$1 $3',
  borderRadius: '$full',
  fontSize: '$xs',
  fontWeight: '$medium',

  variants: {
    status: {
      active: {
        backgroundColor: '#d1fae5',
        color: '#065f46',
      },
      inactive: {
        backgroundColor: '#fef3c7',
        color: '#92400e',
      },
      banned: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
      },
    },
  },
});

const ActionButton = styled('button', {
  padding: '$1',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-secondary)',

  '&:hover': {
    color: 'var(--primary-color)',
  },
});

const Pagination = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '$4 $6',
  borderTop: '1px solid var(--border-color)',
});

const PaginationInfo = styled('span', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
});

const PaginationButtons = styled('div', {
  display: 'flex',
  gap: '$2',
});

const PageButton = styled('button', {
  padding: '$2 $3',
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '$base',
  fontSize: '$sm',
  cursor: 'pointer',
  color: 'var(--text-primary)',

  '&:hover:not(:disabled)': {
    backgroundColor: 'var(--bg-secondary)',
  },

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  variants: {
    active: {
      true: {
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        borderColor: 'var(--primary-color)',
      },
    },
  },
});

const ActivitySection = styled('div', {
  marginTop: '$8',
});

const ActivityList = styled('div', {
  padding: '$6',
  display: 'flex',
  flexDirection: 'column',
  gap: '$4',
});

const ActivityItem = styled('div', {
  display: 'flex',
  gap: '$4',
  padding: '$4',
  backgroundColor: 'var(--bg-secondary)',
  borderRadius: '$base',
  border: '1px solid var(--border-color)',
});

const ActivityIcon = styled('div', {
  width: '40px',
  height: '40px',
  borderRadius: '$base',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,

  variants: {
    type: {
      user: {
        backgroundColor: '#dbeafe',
        color: '#1e40af',
      },
      ban: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
      },
      sale: {
        backgroundColor: '#d1fae5',
        color: '#065f46',
      },
      ai: {
        backgroundColor: '#e0e7ff',
        color: '#4338ca',
      },
    },
  },
});

const ActivityContent = styled('div', {
  flex: 1,
});

const ActivityText = styled('p', {
  fontSize: '$sm',
  color: 'var(--text-primary)',
  marginBottom: '$1',

  strong: {
    fontWeight: '$semibold',
  },
});

const ActivityTime = styled('span', {
  fontSize: '$xs',
  color: 'var(--text-secondary)',
});

interface UserData {
  id: number;
  username: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  country: string;
  guilds: number;
  status: 'active' | 'inactive';
  joined: string;
}

interface ActivityData {
  type: 'user' | 'ban' | 'sale' | 'ai';
  icon: string;
  text: string;
  time: string;
}

interface StatsData {
  total_users: number;
  active_users: number;
  new_users_30d: number;
  growth_rate: string;
}

const AdminDashboardPage: React.FC = () => {
  const [users, setUsers] = React.useState<UserData[]>([]);
  const [activities, setActivities] = React.useState<ActivityData[]>([]);
  const [stats, setStats] = React.useState<StatsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [activitySearch, setActivitySearch] = React.useState('');
  const [activityFilter, setActivityFilter] = React.useState<'all' | 'user' | 'ban' | 'sale' | 'ai'>('all');
  const [showFilterMenu, setShowFilterMenu] = React.useState(false);
  const [userSearch, setUserSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'inactive'>('all');
  const [showStatusMenu, setShowStatusMenu] = React.useState(false);
  const [selectedUsers, setSelectedUsers] = React.useState<number[]>([]);
  const [sortBy, setSortBy] = React.useState<'name' | 'email' | 'date' | 'country'>('date');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<{ start: string; end: string } | null>(null);
  const usersPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user stats
        const userStats = await API.admin.getUserStats();
        setStats(userStats);

        // Fetch users list
        const skip = (currentPage - 1) * usersPerPage;
        const usersData = await API.admin.getUsersList({ skip, limit: usersPerPage });
        setUsers(usersData.users || []);
        setTotalUsers(usersData.total || 0);

        // Fetch activity feed
        const activityData = await API.admin.getActivityFeed(4);
        setActivities(activityData?.activities || []);
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  const handleToggleUserStatus = async (userId: number) => {
    try {
      await API.admin.toggleUserStatus(userId);
      // Refresh users list
      const skip = (currentPage - 1) * usersPerPage;
      const usersData = await API.admin.getUsersList({ skip, limit: usersPerPage });
      setUsers(usersData.users || []);
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const handleExportUsers = () => {
    // Convert users to CSV
    const headers = ['Name', 'Email', 'Country', 'Join Date', 'Status'];
    const csvContent = [
      headers.join(','),
      ...users.map(user => [
        user.name,
        user.email,
        user.country || 'N/A',
        user.joined,
        user.status
      ].join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUsers.length === 0) return;

    const confirmMsg = `Are you sure you want to ${action} ${selectedUsers.length} user(s)?`;
    if (!confirm(confirmMsg)) return;

    try {
      for (const userId of selectedUsers) {
        if (action === 'activate' || action === 'deactivate') {
          await API.admin.toggleUserStatus(userId);
        }
        // Add delete logic when backend supports it
      }

      // Refresh users list
      const skip = (currentPage - 1) * usersPerPage;
      const usersData = await API.admin.getUsersList({ skip, limit: usersPerPage });
      setUsers(usersData.users || []);
      setSelectedUsers([]);
    } catch (error) {
      console.error(`Failed to ${action} users:`, error);
    }
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const filteredUsers = users.filter(user => {
    // Apply status filter
    if (statusFilter !== 'all' && user.status !== statusFilter) return false;
    // Apply search filter
    if (userSearch) {
      const searchLower = userSearch.toLowerCase();
      return user.name.toLowerCase().includes(searchLower) ||
             user.email.toLowerCase().includes(searchLower);
    }
    return true;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case 'name':
        compareValue = a.name.localeCompare(b.name);
        break;
      case 'email':
        compareValue = a.email.localeCompare(b.email);
        break;
      case 'country':
        compareValue = (a.country || '').localeCompare(b.country || '');
        break;
      case 'date':
        compareValue = new Date(a.joined).getTime() - new Date(b.joined).getTime();
        break;
    }

    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  const totalPages = Math.ceil(totalUsers / usersPerPage);

  if (loading && users.length === 0) {
    return (
      <AdminAuthGuard>
        <AdminLayout currentPage="users" pageTitle="User Management">
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
        </AdminLayout>
      </AdminAuthGuard>
    );
  }

  return (
    <AdminAuthGuard>
      <AdminLayout currentPage="users" pageTitle="User Management">
          <StatsGrid>
            <StatCard>
              <StatTitle>Total Users</StatTitle>
              <StatValue>{stats?.total_users?.toLocaleString() || '0'}</StatValue>
              <StatChange trend="up">
                {stats?.growth_rate || '+0%'} growth
              </StatChange>
            </StatCard>
            <StatCard>
              <StatTitle>Active Users</StatTitle>
              <StatValue>{stats?.active_users?.toLocaleString() || '0'}</StatValue>
              <StatChange trend="up">
                Currently active
              </StatChange>
            </StatCard>
            <StatCard>
              <StatTitle>New Signups (30d)</StatTitle>
              <StatValue>{stats?.new_users_30d?.toLocaleString() || '0'}</StatValue>
              <StatChange trend="up">
                Last 30 days
              </StatChange>
            </StatCard>
            <StatCard>
              <StatTitle>Inactive Users</StatTitle>
              <StatValue>{((stats?.total_users || 0) - (stats?.active_users || 0)).toLocaleString()}</StatValue>
              <StatChange trend="neutral">
                ⚠️ Review status
              </StatChange>
            </StatCard>
          </StatsGrid>

          <Section>
            <SectionHeader>
              <SearchBar>
                <SearchIcon />
                <SearchInput
                  placeholder="Search by name, email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </SearchBar>
              <div style={{ position: 'relative' }}>
                <FilterButton onClick={() => setShowStatusMenu(!showStatusMenu)}>
                  Filter by Status
                  <ChevronDown size={16} />
                </FilterButton>
                {showStatusMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '0.5rem',
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    zIndex: 10,
                    minWidth: '180px',
                  }}>
                    {['all', 'active', 'inactive'].map((filter) => (
                      <div
                        key={filter}
                        style={{
                          padding: '0.75rem 1rem',
                          cursor: 'pointer',
                          color: statusFilter === filter ? 'var(--primary-color)' : 'var(--text-primary)',
                          fontWeight: statusFilter === filter ? 600 : 400,
                          fontSize: '0.875rem',
                        }}
                        onClick={() => {
                          setStatusFilter(filter as typeof statusFilter);
                          setShowStatusMenu(false);
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <ExportButton onClick={handleExportUsers}>
                <Download size={16} />
                Export User Data
              </ExportButton>
            </SectionHeader>

            {selectedUsers.length > 0 && (
              <div style={{
                padding: '1rem 1.5rem',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-color)',
              }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  {selectedUsers.length} user(s) selected
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleBulkAction('activate')}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      borderRadius: '4px',
                      color: 'white',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                  >
                    <Unlock size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkAction('deactivate')}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      borderRadius: '4px',
                      color: 'white',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                  >
                    <Ban size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Deactivate
                  </button>
                  <button
                    onClick={() => setSelectedUsers([])}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      borderRadius: '4px',
                      color: 'white',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            <Table>
              <thead>
                <tr>
                  <Th style={{ width: '50px' }}>
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === sortedUsers.length && sortedUsers.length > 0}
                      onChange={handleSelectAll}
                      style={{ cursor: 'pointer' }}
                    />
                  </Th>
                  <Th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                    USER {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </Th>
                  <Th onClick={() => handleSort('country')} style={{ cursor: 'pointer' }}>
                    COUNTRY {sortBy === 'country' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </Th>
                  <Th onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>
                    JOIN DATE {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </Th>
                  <Th>STATUS</Th>
                  <Th>ACTIONS</Th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user) => (
                  <tr key={user.id}>
                    <Td>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </Td>
                    <Td>
                      <UserCell>
                        <UserAvatar>
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.name}
                              onError={(e) => {
                                // Fallback to initial if image fails to load
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextSibling) {
                                  (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div style={{
                            display: user.avatar_url ? 'none' : 'flex',
                            width: '100%',
                            height: '100%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600'
                          }}>
                            {user.username ? user.username.charAt(0).toUpperCase() : user.name.charAt(0).toUpperCase()}
                          </div>
                        </UserAvatar>
                        <UserInfo>
                          <UserName>{user.name}</UserName>
                          <UserEmail>{user.email}</UserEmail>
                        </UserInfo>
                      </UserCell>
                    </Td>
                    <Td>{user.country || 'N/A'}</Td>
                    <Td>{user.joined}</Td>
                    <Td>
                      <StatusBadge status={user.status}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </StatusBadge>
                    </Td>
                    <Td>
                      <ActionButton onClick={() => handleToggleUserStatus(user.id)}>
                        {user.status === 'inactive' ? (
                          <Unlock size={18} />
                        ) : (
                          <Ban size={18} />
                        )}
                      </ActionButton>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Pagination>
              <PaginationInfo>
                Showing {sortedUsers.length > 0 ? 1 : 0} to {sortedUsers.length} of {sortedUsers.length} users
                {(userSearch || statusFilter !== 'all') && ` (filtered from ${totalUsers.toLocaleString()} total)`}
              </PaginationInfo>
              <PaginationButtons>
                <PageButton 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </PageButton>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <PageButton 
                      key={page}
                      active={currentPage === page}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PageButton>
                  );
                })}
                <PageButton 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </PageButton>
              </PaginationButtons>
            </Pagination>
          </Section>

          <ActivitySection>
            <Section>
              <SectionHeader>
                <SectionTitle>User Activity Log</SectionTitle>
                <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                  <SearchBar style={{ maxWidth: '300px' }}>
                    <SearchIcon />
                    <SearchInput
                      placeholder="Search logs..."
                      value={activitySearch}
                      onChange={(e) => setActivitySearch(e.target.value)}
                    />
                  </SearchBar>
                  <div style={{ position: 'relative' }}>
                    <FilterButton onClick={() => setShowFilterMenu(!showFilterMenu)}>
                      Filter by Action
                      <ChevronDown size={16} />
                    </FilterButton>
                    {showFilterMenu && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        marginTop: '0.5rem',
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        zIndex: 10,
                        minWidth: '200px',
                      }}>
                        {['all', 'user', 'ban', 'sale', 'ai'].map((filter) => (
                          <div
                            key={filter}
                            style={{
                              padding: '0.75rem 1rem',
                              cursor: 'pointer',
                              color: activityFilter === filter ? 'var(--primary-color)' : 'var(--text-primary)',
                              fontWeight: activityFilter === filter ? 600 : 400,
                              fontSize: '0.875rem',
                            }}
                            onClick={() => {
                              setActivityFilter(filter as typeof activityFilter);
                              setShowFilterMenu(false);
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <FilterButton onClick={() => setShowDatePicker(!showDatePicker)}>
                      <Calendar size={16} />
                      {dateRange ? `${dateRange.start} - ${dateRange.end}` : 'Select date range'}
                    </FilterButton>
                    {showDatePicker && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '0.5rem',
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '1rem',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000,
                        minWidth: '300px',
                      }}>
                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '0.5rem',
                          }}>
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={dateRange?.start || ''}
                            onChange={(e) => setDateRange({ start: e.target.value, end: dateRange?.end || '' })}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              backgroundColor: 'var(--bg-primary)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '4px',
                              color: 'var(--text-primary)',
                              fontSize: '0.875rem',
                            }}
                          />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '0.5rem',
                          }}>
                            End Date
                          </label>
                          <input
                            type="date"
                            value={dateRange?.end || ''}
                            onChange={(e) => setDateRange({ start: dateRange?.start || '', end: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              backgroundColor: 'var(--bg-primary)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '4px',
                              color: 'var(--text-primary)',
                              fontSize: '0.875rem',
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => {
                              setDateRange(null);
                              setShowDatePicker(false);
                            }}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: 'transparent',
                              border: '1px solid var(--border-color)',
                              borderRadius: '4px',
                              color: 'var(--text-secondary)',
                              fontSize: '0.875rem',
                              cursor: 'pointer',
                            }}
                          >
                            Clear
                          </button>
                          <button
                            onClick={() => setShowDatePicker(false)}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: 'var(--primary-color)',
                              border: 'none',
                              borderRadius: '4px',
                              color: 'white',
                              fontSize: '0.875rem',
                              cursor: 'pointer',
                            }}
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </SectionHeader>

              <ActivityList>
                {activities
                  .filter(activity => {
                    // Apply filter
                    if (activityFilter !== 'all' && activity.type !== activityFilter) return false;
                    // Apply search
                    if (activitySearch && !activity.text.toLowerCase().includes(activitySearch.toLowerCase())) return false;
                    // Apply date range (Note: current activity data doesn't include parseable dates)
                    // This is a placeholder for when activity data includes full timestamps
                    if (dateRange && dateRange.start && dateRange.end) {
                      // Would filter by date here when we have proper timestamp data
                      // For now, we just keep all activities
                    }
                    return true;
                  })
                  .map((activity, index) => (
                    <ActivityItem key={index}>
                      <ActivityIcon type={activity.type}>
                        {activity.type === 'user' && <UsersIcon size={20} />}
                        {activity.type === 'ban' && <Ban size={20} />}
                        {activity.type === 'sale' && <Receipt size={20} />}
                        {activity.type === 'ai' && <TrendingUp size={20} />}
                      </ActivityIcon>
                      <ActivityContent>
                        <ActivityText dangerouslySetInnerHTML={{ __html: activity.text }} />
                        <ActivityTime>{activity.time}</ActivityTime>
                      </ActivityContent>
                    </ActivityItem>
                  ))}
              </ActivityList>
            </Section>
          </ActivitySection>
      </AdminLayout>
    </AdminAuthGuard>
  );
};

export default AdminDashboardPage;
