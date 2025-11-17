import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { styled } from '../stitches.config';
import {
  LayoutDashboard,
  Receipt,
  Users as UsersIcon,
  TrendingUp,
  Settings,
  Search,
  Download,
  ChevronDown,
  LogOut,
  Shield,
} from 'lucide-react';
import API from '../services/api';
import { useAdmin } from '../contexts/AdminContext';
import NotificationDropdown from '../components/NotificationDropdown';

const PageContainer = styled('div', {
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: 'var(--bg-secondary)',
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
  background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)',
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

const SearchBar = styled('div', {
  position: 'relative',
  width: '400px',
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

const UserAvatar = styled('a', {
  width: '40px',
  height: '40px',
  borderRadius: '$full',
  backgroundColor: 'var(--bg-secondary)',
  overflow: 'hidden',
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'block',
  transition: 'all 0.2s ease',
  border: '2px solid transparent',

  '&:hover': {
    borderColor: 'var(--primary-color)',
    transform: 'scale(1.05)',
    boxShadow: '0 0 20px rgba(13, 127, 242, 0.3)',
  },

  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

const AdminTierBadge = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$2 $4',
  backgroundColor: 'rgba(168, 85, 247, 0.1)',
  border: '2px solid #a855f7',
  borderRadius: '$full',
  color: '#a855f7',
  fontSize: '$sm',
  fontWeight: '$semibold',
  boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)',
});

const LogoutButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$2 $3',
  backgroundColor: 'transparent',
  border: '2px solid #ef4444',
  borderRadius: '$base',
  color: '#ef4444',
  fontSize: '$sm',
  fontWeight: '$medium',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '#ef4444',
    color: 'white',
  },
});

const ContentArea = styled('div', {
  padding: '$8',
  flex: 1,
  backgroundColor: 'var(--bg-secondary)',
});

const StatsGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
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
  color: 'var(--text-primary)',
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
        color: '#059669',
      },
      down: {
        color: '#dc2626',
      },
    },
  },
});

const DashboardGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr',
  gap: '$6',
  marginBottom: '$8',
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
});

const SectionTitle = styled('h2', {
  fontSize: '$lg',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
});

const FilterButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$2 $4',
  backgroundColor: 'var(--primary-color)',
  border: 'none',
  borderRadius: '$base',
  fontSize: '$sm',
  color: 'white',
  cursor: 'pointer',
  fontWeight: '$medium',

  '&:hover': {
    backgroundColor: 'var(--primary-hover)',
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

  '&:hover': {
    backgroundColor: 'var(--bg-secondary)',
  },
});

const ChartContainer = styled('div', {
  padding: '$6',
  height: '350px',
  backgroundColor: '#0f172a',
  borderRadius: '$base',
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: '$2',
  position: 'relative',
  overflow: 'hidden',
});

const ChartBar = styled('div', {
  flex: 1,
  backgroundColor: '#1e40af',
  borderRadius: '$sm $sm 0 0',
  position: 'relative',
  transition: 'all 0.3s ease',

  '&:hover': {
    backgroundColor: '#3b82f6',
  },
});

const ChartLine = styled('svg', {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
});

const PieChartContainer = styled('div', {
  padding: '$6',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '$6',
});

const PieChartBase = styled('div', {
  width: '200px',
  height: '200px',
  borderRadius: '50%',
  position: 'relative',

  '&::after': {
    content: '',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100px',
    height: '100px',
    backgroundColor: 'var(--card-bg)',
    borderRadius: '50%',
  },
});

const PieChart: React.FC<{ data: { item_suggestions: number; project_collab: number; content_gen: number; analytics: number } }> = ({ data }) => {
  // Convert percentages to degrees
  const itemSuggestionsDeg = (data.item_suggestions / 100) * 360;
  const projectCollabDeg = (data.project_collab / 100) * 360;
  const contentGenDeg = (data.content_gen / 100) * 360;

  // Calculate cumulative angles
  const angle1 = itemSuggestionsDeg;
  const angle2 = angle1 + projectCollabDeg;
  const angle3 = angle2 + contentGenDeg;

  return (
    <PieChartBase
      style={{
        background: `conic-gradient(
          #0ea5e9 0deg ${angle1}deg,
          #1e40af ${angle1}deg ${angle2}deg,
          #7dd3fc ${angle2}deg ${angle3}deg,
          #6366f1 ${angle3}deg 360deg
        )`
      }}
    />
  );
};

const Legend = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$3',
  width: '100%',
});

const LegendItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
});

const LegendColor = styled('div', {
  width: '12px',
  height: '12px',
  borderRadius: '$sm',
});

const LegendText = styled('span', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
  flex: 1,
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

const StatusBadge = styled('span', {
  padding: '$1 $3',
  borderRadius: '$full',
  fontSize: '$xs',
  fontWeight: '$medium',

  variants: {
    status: {
      completed: {
        backgroundColor: '#d1fae5',
        color: '#065f46',
      },
      pending: {
        backgroundColor: '#fef3c7',
        color: '#92400e',
      },
      failed: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
      },
    },
  },
});

const ActivityFeed = styled('div', {
  padding: '$6',
  display: 'flex',
  flexDirection: 'column',
  gap: '$4',
});

const ActivityItem = styled('div', {
  display: 'flex',
  gap: '$3',
  alignItems: 'start',
});

const ActivityIcon = styled('div', {
  width: '32px',
  height: '32px',
  borderRadius: '$base',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  fontSize: '$lg',
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

const AdminOverviewPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<number[]>([]);
  const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [aiUsage, setAiUsage] = useState<{
    item_suggestions: number;
    project_collab: number;
    content_gen: number;
    analytics: number;
  }>({ item_suggestions: 25, project_collab: 35, content_gen: 20, analytics: 20 });

  // Use admin context for avatar - no need to fetch again!
  const { adminData } = useAdmin();
  const adminAvatar = adminData?.avatar_url || 'https://i.pravatar.cc/150?img=12';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch overview stats
        const overviewStats = await API.admin.getOverviewStats();
        setStats(overviewStats);

        // Fetch recent transactions
        const transactionsData = await API.admin.getRecentTransactions(4);
        setTransactions(transactionsData.transactions || []);

        // Fetch activity feed
        const activityData = await API.admin.getActivityFeed(4);
        setActivities(activityData.activities || []);

        // Fetch revenue chart data
        const revenueData = await API.admin.getRevenueChartData(chartPeriod);
        setChartData(revenueData.data || []);

        // Fetch AI usage breakdown
        const aiData = await API.admin.getAIUsageBreakdown();
        setAiUsage(aiData);

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
        setLoading(false);
        // Use fallback data on error
        setStats({
          total_transactions: 1234567,
          total_guilds: 1802,
          active_users: 12500,
          ai_queries: 98210,
          transaction_change: 2.6,
          guild_change: 5.1,
          user_change: -0.8,
          ai_change: 12
        });
        // Fallback chart data
        setChartData([5, 10, 8, 15, 12, 18, 16, 22, 20, 28, 25, 32, 30, 38, 35, 42, 40, 48, 45, 52]);
      }
    };

    fetchData();
  }, [chartPeriod]);

  const handleLogout = () => {
    API.auth.logout();
  };

  return (
    <PageContainer>
      <Sidebar>
        <Logo>
          <LogoImage>A</LogoImage>
          <LogoText>
            <LogoTitle>Avalanche</LogoTitle>
            <LogoSubtitle>Admin Panel</LogoSubtitle>
          </LogoText>
        </Logo>

        <Nav>
          <NavItem active as={Link} to="/admin/dashboard">
            <LayoutDashboard size={18} />
            Dashboard
          </NavItem>
          <NavItem as={Link} to="/admin/transactions">
            <Receipt size={18} />
            Transactions
          </NavItem>
          <NavItem as={Link} to="/admin/guilds">
            <UsersIcon size={18} />
            Guilds
          </NavItem>
          <NavItem as={Link} to="/admin/ai-analytics">
            <TrendingUp size={18} />
            AI Analytics
          </NavItem>
          <NavItem as={Link} to="/admin/users">
            <UsersIcon size={18} />
            Users
          </NavItem>
          <NavItem as={Link} to="/admin/settings">
            <Settings size={18} />
            Settings
          </NavItem>
        </Nav>
      </Sidebar>

      <MainContent>
        <TopBar>
          <PageTitle>Admin Dashboard</PageTitle>
          <TopBarActions>
            <SearchBar>
              <SearchIcon />
              <SearchInput placeholder="Search for transactions, users, guilds..." />
            </SearchBar>
            <AdminTierBadge>
              <Shield size={16} />
              Admin
            </AdminTierBadge>
            <NotificationDropdown />
            <UserAvatar as={Link} to="/admin/settings" aria-label="Admin Profile Settings">
              <img src={adminAvatar} alt="Admin" />
            </UserAvatar>
            <LogoutButton onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </LogoutButton>
          </TopBarActions>
        </TopBar>

        <ContentArea>
          <StatsGrid>
            <StatCard>
              <StatTitle>Total Transactions</StatTitle>
              <StatValue>{stats?.total_transactions_value || '$0'}</StatValue>
              <StatChange trend="up">{stats?.transaction_change || '+0%'}</StatChange>
            </StatCard>
            <StatCard>
              <StatTitle>Guild Growth</StatTitle>
              <StatValue>{stats?.total_guilds?.toLocaleString() || '0'}</StatValue>
              <StatChange trend="up">{stats?.guild_change || '+0%'}</StatChange>
            </StatCard>
            <StatCard>
              <StatTitle>Active Users</StatTitle>
              <StatValue>{stats?.active_users?.toLocaleString() || '0'}</StatValue>
              <StatChange trend={stats?.users_change?.startsWith('+') ? 'up' : 'down'}>
                {stats?.users_change || '+0%'}
              </StatChange>
            </StatCard>
            <StatCard>
              <StatTitle>AI Queries</StatTitle>
              <StatValue>{stats?.ai_queries?.toLocaleString() || '0'}</StatValue>
              <StatChange trend="up">{stats?.ai_change || '+0%'}</StatChange>
            </StatCard>
          </StatsGrid>

          <DashboardGrid>
            <Section>
              <SectionHeader>
                <SectionTitle>Transaction Analytics</SectionTitle>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <FilterButton onClick={() => {
                    // Toggle between periods
                    if (chartPeriod === 'week') setChartPeriod('month');
                    else if (chartPeriod === 'month') setChartPeriod('day');
                    else setChartPeriod('week');
                  }}>
                    {chartPeriod === 'day' ? 'Last 24 Hours' : chartPeriod === 'week' ? 'Last 7 Days' : 'Last 30 Days'}
                    <ChevronDown size={16} />
                  </FilterButton>
                  <ExportButton>
                    <Download size={16} />
                    Export
                  </ExportButton>
                </div>
              </SectionHeader>
              <ChartContainer>
                {chartData.map((value, index) => {
                  // Calculate dynamic height based on max value in dataset
                  const maxValue = Math.max(...chartData, 1); // Avoid division by zero
                  const heightPercent = (value / maxValue) * 100;
                  return <ChartBar key={index} style={{ height: `${heightPercent}%` }} />;
                })}
                <ChartLine viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polyline
                    points={chartData.map((val, i) => {
                      const maxValue = Math.max(...chartData, 1);
                      return `${(i / Math.max(chartData.length - 1, 1)) * 100},${100 - (val / maxValue) * 100}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                  {chartData.map((val, i) => {
                    const maxValue = Math.max(...chartData, 1);
                    return (
                      <circle
                        key={i}
                        cx={`${(i / Math.max(chartData.length - 1, 1)) * 100}`}
                        cy={`${100 - (val / maxValue) * 100}`}
                        r="1.5"
                        fill="#60a5fa"
                      />
                    );
                  })}
                </ChartLine>
              </ChartContainer>
            </Section>

            <Section>
              <SectionHeader>
                <SectionTitle>AI Usage Breakdown</SectionTitle>
              </SectionHeader>
              <PieChartContainer>
                <PieChart data={aiUsage} />
                <Legend>
                  <LegendItem>
                    <LegendColor style={{ backgroundColor: '#0ea5e9' }} />
                    <LegendText>Item Suggestions ({aiUsage.item_suggestions}%)</LegendText>
                  </LegendItem>
                  <LegendItem>
                    <LegendColor style={{ backgroundColor: '#1e40af' }} />
                    <LegendText>Project Collab ({aiUsage.project_collab}%)</LegendText>
                  </LegendItem>
                  <LegendItem>
                    <LegendColor style={{ backgroundColor: '#7dd3fc' }} />
                    <LegendText>Content Gen ({aiUsage.content_gen}%)</LegendText>
                  </LegendItem>
                  <LegendItem>
                    <LegendColor style={{ backgroundColor: '#6366f1' }} />
                    <LegendText>Analytics ({aiUsage.analytics}%)</LegendText>
                  </LegendItem>
                </Legend>
              </PieChartContainer>
            </Section>
          </DashboardGrid>

          <DashboardGrid>
            <Section>
              <SectionHeader>
                <SectionTitle>Recent Transactions</SectionTitle>
              </SectionHeader>
              <Table>
                <thead>
                  <tr>
                    <Th>TRANSACTION ID</Th>
                    <Th>USER</Th>
                    <Th>AMOUNT</Th>
                    <Th>STATUS</Th>
                    <Th>DATE</Th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <Td>{transaction.id}</Td>
                      <Td>{transaction.user}</Td>
                      <Td>{transaction.amount}</Td>
                      <Td>
                        <StatusBadge status={transaction.status}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </StatusBadge>
                      </Td>
                      <Td>{transaction.date}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Section>

            <Section>
              <SectionHeader>
                <SectionTitle>Activity Feed</SectionTitle>
              </SectionHeader>
              <ActivityFeed>
                {activities.map((activity, index) => (
                  <ActivityItem key={index}>
                    <ActivityIcon>{activity.icon}</ActivityIcon>
                    <ActivityContent>
                      <ActivityText>{activity.text}</ActivityText>
                      <ActivityTime>{activity.time}</ActivityTime>
                    </ActivityContent>
                  </ActivityItem>
                ))}
              </ActivityFeed>
            </Section>
          </DashboardGrid>
        </ContentArea>
      </MainContent>
    </PageContainer>
  );
};

export default AdminOverviewPage;
