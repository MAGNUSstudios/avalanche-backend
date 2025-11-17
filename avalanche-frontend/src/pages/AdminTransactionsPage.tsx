import React, { useState } from 'react';
import { styled } from '../stitches.config';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Users as UsersIcon,
  TrendingUp,
  Settings,
  Download,
  LogOut,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
  borderRadius: '$base',
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
  fontSize: '$base',
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
  color: 'var(--text-secondary)',
  textDecoration: 'none',
  fontSize: '$sm',
  transition: 'all 0.2s ease',
  cursor: 'pointer',

  '&:hover': {
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
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
  cursor: 'pointer',
  transition: 'opacity 0.2s ease',

  '&:hover': {
    opacity: 0.8,
  },

  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
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
});

const Section = styled('section', {
  backgroundColor: 'var(--card-bg)',
  borderRadius: '$lg',
  border: '1px solid var(--border-color)',
  overflow: 'hidden',
  marginBottom: '$6',
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

const HeaderActions = styled('div', {
  display: 'flex',
  gap: '$3',
  alignItems: 'center',
});

const FilterButton = styled('button', {
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

const GenerateButton = styled('button', {
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

const StatsGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '$6',
  padding: '$6',
});

const StatCard = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
});

const StatLabel = styled('div', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
});

const StatValue = styled('div', {
  fontSize: '$3xl',
  fontWeight: '$bold',
  color: 'var(--primary-color)',
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

const ContentGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr',
  gap: '$6',
});

const ChartContainer = styled('div', {
  padding: '$6',
  height: '350px',
  backgroundColor: 'var(--bg-secondary)',
  borderRadius: '$base',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-secondary)',
  fontSize: '$sm',
});

const TabContainer = styled('div', {
  display: 'flex',
  gap: '$2',
  padding: '$4 $6 0',
  borderBottom: '1px solid var(--border-color)',
});

const Tab = styled('button', {
  padding: '$2 $4',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '$base',
  fontSize: '$sm',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  fontWeight: '$medium',

  variants: {
    active: {
      true: {
        backgroundColor: 'var(--primary-color)',
        color: 'white',
      },
    },
  },
});

const TopSellingList = styled('div', {
  padding: '$6',
  display: 'flex',
  flexDirection: 'column',
  gap: '$4',
});

const ProductItem = styled('div', {
  display: 'flex',
  gap: '$3',
  alignItems: 'center',
});

const ProductImage = styled('div', {
  width: '48px',
  height: '48px',
  borderRadius: '$base',
  backgroundColor: 'var(--bg-secondary)',
  flexShrink: 0,
});

const ProductInfo = styled('div', {
  flex: 1,
});

const ProductName = styled('div', {
  fontSize: '$sm',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
  marginBottom: '$1',
});

const ProductUnits = styled('div', {
  fontSize: '$xs',
  color: 'var(--text-secondary)',
});

const ProductPrice = styled('div', {
  fontSize: '$base',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
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

interface TransactionData {
  id: string;
  user: string;
  date: string;
  amount: string;
  status: 'completed' | 'pending' | 'failed';
  product?: string;
}

interface TopProductData {
  name: string;
  units: string;
  price: string;
}

interface TransactionStats {
  total_revenue: string;
  revenue_change: string;
  transaction_volume: number;
  volume_change: string;
  average_order_value: string;
  avg_change: string;
}

const AdminTransactionsPage: React.FC = () => {
  // Use admin context for avatar
  const { adminData } = useAdmin();
  const adminAvatar = adminData?.avatar_url || 'https://i.pravatar.cc/150?img=12';

  const [activeTab, setActiveTab] = useState<'revenue' | 'volume'>('revenue');
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductData[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month'>('week');

  const fetchChartData = async () => {
    try {
      const endpoint = activeTab === 'revenue'
        ? API.admin.getRevenueChartData
        : API.admin.getVolumeChartData;

      const data = await endpoint(chartPeriod);

      // Transform data to format expected by recharts
      const formattedData = data.labels.map((label: string, index: number) => ({
        name: label,
        value: data.data[index]
      }));

      setChartData(formattedData);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    }
  };

  React.useEffect(() => {
    fetchChartData();
  }, [activeTab, chartPeriod]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch transaction stats
        const transactionStats = await API.admin.getTransactionStats();
        setStats(transactionStats);

        // Fetch recent transactions
        const transactionsData = await API.admin.getRecentTransactions(10);
        setTransactions(transactionsData?.transactions || []);

        // Fetch top products
        const topProductsData = await API.admin.getTopProducts(4);
        setTopProducts(topProductsData || []);

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch transaction data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    API.auth.logout();
  };

  if (loading && transactions.length === 0) {
    return (
      <PageContainer>
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Sidebar>
        <Logo>
          <LogoImage>▲</LogoImage>
          <LogoText>
            <LogoTitle>Avalanche</LogoTitle>
            <LogoSubtitle>Admin Panel</LogoSubtitle>
          </LogoText>
        </Logo>

        <Nav>
          <NavItem as={Link} to="/admin/dashboard">
            <LayoutDashboard size={18} />
            Dashboard
          </NavItem>
          <NavItem active as={Link} to="/admin/transactions">
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
          <PageTitle>Transactions Analytics</PageTitle>
          <TopBarActions>
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
          <Section>
            <SectionHeader>
              <SectionTitle>Transaction Overview</SectionTitle>
              <HeaderActions>
                <select
                  value={chartPeriod}
                  onChange={(e) => setChartPeriod(e.target.value as 'day' | 'week' | 'month')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="day">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
                <GenerateButton onClick={() => alert('Report generation feature coming soon!')}>
                  <Download size={16} />
                  Generate Report
                </GenerateButton>
              </HeaderActions>
            </SectionHeader>

            <StatsGrid>
              <StatCard>
                <StatLabel>Total Revenue</StatLabel>
                <StatValue>{stats?.total_revenue || '$0.00'}</StatValue>
                <StatChange trend="up">{stats?.revenue_change || '+0%'} vs. previous 30 days</StatChange>
              </StatCard>
              <StatCard>
                <StatLabel>Transaction Volume</StatLabel>
                <StatValue>{stats?.transaction_volume?.toLocaleString() || '0'}</StatValue>
                <StatChange trend="up">{stats?.volume_change || '+0%'} vs. previous 30 days</StatChange>
              </StatCard>
              <StatCard>
                <StatLabel>Average Order Value</StatLabel>
                <StatValue>{stats?.average_order_value || '$0.00'}</StatValue>
                <StatChange trend={stats?.avg_change?.startsWith('+') ? 'up' : 'down'}>
                  {stats?.avg_change || '+0%'} vs. previous 30 days
                </StatChange>
              </StatCard>
            </StatsGrid>
          </Section>

          <ContentGrid>
            <Section>
              <TabContainer>
                <Tab active={activeTab === 'revenue'} onClick={() => setActiveTab('revenue')}>
                  Revenue
                </Tab>
                <Tab active={activeTab === 'volume'} onClick={() => setActiveTab('volume')}>
                  Volume
                </Tab>
              </TabContainer>
              <SectionHeader style={{ borderTop: 'none' }}>
                <SectionTitle>Revenue & Volume</SectionTitle>
              </SectionHeader>
              <ChartContainer>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis
                      dataKey="name"
                      stroke="var(--text-secondary)"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis
                      stroke="var(--text-secondary)"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="var(--primary-color)"
                      strokeWidth={2}
                      dot={{ fill: 'var(--primary-color)', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Section>

            <Section>
              <SectionHeader>
                <SectionTitle>Top Selling Items</SectionTitle>
              </SectionHeader>
              <TopSellingList>
                {topProducts.map((product, index) => (
                  <ProductItem key={index}>
                    <ProductImage />
                    <ProductInfo>
                      <ProductName>{product.name}</ProductName>
                      <ProductUnits>{product.units}</ProductUnits>
                    </ProductInfo>
                    <ProductPrice>{product.price}</ProductPrice>
                  </ProductItem>
                ))}
              </TopSellingList>
            </Section>
          </ContentGrid>

          <Section>
            <SectionHeader>
              <SectionTitle>Recent Transactions</SectionTitle>
            </SectionHeader>
            <Table>
              <thead>
                <tr>
                  <Th>TRANSACTION ID</Th>
                  <Th>USER</Th>
                  <Th>DATE</Th>
                  <Th>AMOUNT</Th>
                  <Th>STATUS</Th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <Td>{transaction.id}</Td>
                    <Td>{transaction.user}</Td>
                    <Td>{transaction.date}</Td>
                    <Td>{transaction.amount}</Td>
                    <Td>
                      <StatusBadge status={transaction.status}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </StatusBadge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Section>
        </ContentArea>
      </MainContent>
    </PageContainer>
  );
};

export default AdminTransactionsPage;
