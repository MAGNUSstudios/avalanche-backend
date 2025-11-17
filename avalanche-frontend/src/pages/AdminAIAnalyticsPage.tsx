import React from 'react';
import { styled } from '../stitches.config';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Users as UsersIcon,
  TrendingUp,
  Settings,
  MessageSquare,
  Bot,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

const StatLabel = styled('div', {
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

const TabContainer = styled('div', {
  display: 'flex',
  gap: '$2',
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

const ChartContainer = styled('div', {
  padding: '$6',
  height: '350px',
});

const ViewDetailsButton = styled('button', {
  padding: '$2 $4',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '$base',
  fontSize: '$sm',
  color: 'var(--primary-color)',
  cursor: 'pointer',
  fontWeight: '$medium',

  '&:hover': {
    backgroundColor: 'var(--bg-secondary)',
  },
});

const ModelList = styled('div', {
  padding: '$6',
  display: 'flex',
  flexDirection: 'column',
  gap: '$4',
});

const ModelItem = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '$4',
  borderRadius: '$base',
  backgroundColor: 'var(--bg-secondary)',
});

const ModelInfo = styled('div', {
  flex: 1,
});

const ModelName = styled('div', {
  fontSize: '$sm',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
  marginBottom: '$1',
});

const ModelStatus = styled('div', {
  fontSize: '$xs',
  display: 'flex',
  alignItems: 'center',
  gap: '$2',

  variants: {
    status: {
      online: {
        color: '#059669',
      },
      degraded: {
        color: '#d97706',
      },
      offline: {
        color: '#dc2626',
      },
    },
  },
});

const ModelScore = styled('div', {
  fontSize: '$lg',
  fontWeight: '$bold',

  variants: {
    status: {
      good: {
        color: '#059669',
      },
      warning: {
        color: '#d97706',
      },
      error: {
        color: '#dc2626',
      },
    },
  },
});

const InteractionList = styled('div', {
  padding: '$6',
  display: 'flex',
  flexDirection: 'column',
  gap: '$4',
});

const InteractionItem = styled('div', {
  display: 'flex',
  gap: '$3',
  padding: '$4',
  borderRadius: '$base',
  backgroundColor: 'var(--bg-secondary)',
});

const InteractionIcon = styled('div', {
  width: '40px',
  height: '40px',
  borderRadius: '$base',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,

  variants: {
    type: {
      assistant: {
        backgroundColor: '#dbeafe',
        color: '#1e40af',
      },
      recommendation: {
        backgroundColor: '#fce7f3',
        color: '#9f1239',
      },
      verification: {
        backgroundColor: '#d1fae5',
        color: '#065f46',
      },
    },
  },
});

const InteractionContent = styled('div', {
  flex: 1,
});

const InteractionText = styled('p', {
  fontSize: '$sm',
  color: 'var(--text-primary)',
  marginBottom: '$1',

  strong: {
    fontWeight: '$semibold',
  },
});

const InteractionTime = styled('span', {
  fontSize: '$xs',
  color: 'var(--text-secondary)',
});

const ViewAllButton = styled('button', {
  width: '100%',
  padding: '$3',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '$base',
  fontSize: '$sm',
  color: 'var(--primary-color)',
  cursor: 'pointer',
  fontWeight: '$medium',

  '&:hover': {
    backgroundColor: 'var(--bg-secondary)',
  },
});

interface ModelData {
  name: string;
  score: string;
  status: 'online' | 'offline' | 'degraded';
  status_text: string;
}

interface InteractionData {
  type: 'assistant' | 'recommendation' | 'verification';
  text: string;
  time: string;
}

interface AIStats {
  total_queries: number;
  queries_change: string;
  recommendation_ctr: string;
  ctr_change: string;
  assistant_usage: number;
  usage_change: string;
  feature_adoption: string;
  adoption_change: string;
}

const AdminAIAnalyticsPage: React.FC = () => {
  // Use admin context for avatar
  const { adminData } = useAdmin();
  const adminAvatar = adminData?.avatar_url || 'https://i.pravatar.cc/150?img=12';

  const [models, setModels] = React.useState<ModelData[]>([]);
  const [interactions, setInteractions] = React.useState<InteractionData[]>([]);
  const [stats, setStats] = React.useState<AIStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [timePeriod, setTimePeriod] = React.useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [queryVolumeData, setQueryVolumeData] = React.useState<Array<{ time: string; queries: number }>>([]);
  const [recommendationData, setRecommendationData] = React.useState<Array<{ day: string; rate: number }>>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch AI stats
        const aiStats = await API.admin.getAIStats();
        setStats(aiStats);

        // Fetch AI model performance
        const modelsData = await API.admin.getAIModelPerformance();
        setModels(modelsData || []);

        // Fetch recent AI interactions
        const interactionsData = await API.admin.getRecentAIInteractions(3);
        setInteractions(interactionsData || []);

        // Fetch chart data
        const volumeData = await API.admin.getAIQueryVolume(timePeriod);
        setQueryVolumeData(volumeData || []);

        const effectivenessData = await API.admin.getRecommendationEffectiveness();
        setRecommendationData(effectivenessData || []);

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch AI analytics data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [timePeriod]);

  const handleLogout = () => {
    API.auth.logout();
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'assistant':
        return <Bot size={20} />;
      case 'recommendation':
        return <Sparkles size={20} />;
      case 'verification':
        return <CheckCircle size={20} />;
      default:
        return <Bot size={20} />;
    }
  };

  if (loading && models.length === 0) {
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
          <NavItem as={Link} to="/admin/transactions">
            <Receipt size={18} />
            Transactions
          </NavItem>
          <NavItem as={Link} to="/admin/guilds">
            <UsersIcon size={18} />
            Guilds
          </NavItem>
          <NavItem active as={Link} to="/admin/ai-analytics">
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
          <PageTitle>AI Analytics</PageTitle>
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
          <StatsGrid>
            <StatCard>
              <StatLabel>Total AI Queries (24h)</StatLabel>
              <StatValue>{stats?.total_queries?.toLocaleString() || '0'}</StatValue>
              <StatChange trend={stats?.queries_change?.startsWith('+') ? 'up' : 'down'}>
                {stats?.queries_change || '+0%'} vs yesterday
              </StatChange>
            </StatCard>
            <StatCard>
              <StatLabel>Recommendation CTR</StatLabel>
              <StatValue>{stats?.recommendation_ctr || '0%'}</StatValue>
              <StatChange trend="up">{stats?.ctr_change || '+0%'} this week</StatChange>
            </StatCard>
            <StatCard>
              <StatLabel>AI Assistant Usage</StatLabel>
              <StatValue>{stats?.assistant_usage?.toLocaleString() || '0'}</StatValue>
              <StatChange trend="up">{stats?.usage_change || '+0%'} today</StatChange>
            </StatCard>
            <StatCard>
              <StatLabel>AI Feature Adoption</StatLabel>
              <StatValue>{stats?.feature_adoption || '0%'}</StatValue>
              <StatChange trend="up">{stats?.adoption_change || '+0%'} new users</StatChange>
            </StatCard>
          </StatsGrid>

          <ContentGrid>
            <Section>
              <SectionHeader>
                <SectionTitle>AI Query Volume</SectionTitle>
                <TabContainer>
                  <Tab active={timePeriod === 'daily'} onClick={() => setTimePeriod('daily')}>
                    Daily
                  </Tab>
                  <Tab active={timePeriod === 'weekly'} onClick={() => setTimePeriod('weekly')}>
                    Weekly
                  </Tab>
                  <Tab active={timePeriod === 'monthly'} onClick={() => setTimePeriod('monthly')}>
                    Monthly
                  </Tab>
                </TabContainer>
              </SectionHeader>
              <ChartContainer>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={queryVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis
                      dataKey="time"
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
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="queries"
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
                <SectionTitle>Recommendation Effectiveness</SectionTitle>
                <ViewDetailsButton>View Details</ViewDetailsButton>
              </SectionHeader>
              <ChartContainer>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={recommendationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis
                      dataKey="day"
                      stroke="var(--text-secondary)"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis
                      stroke="var(--text-secondary)"
                      style={{ fontSize: '12px' }}
                      label={{ value: 'CTR %', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar
                      dataKey="rate"
                      fill="var(--primary-color)"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Section>
          </ContentGrid>

          <Section>
            <SectionHeader>
              <SectionTitle>AI Model Performance</SectionTitle>
            </SectionHeader>
            <ModelList>
              {models.map((model, index) => (
                <ModelItem key={index}>
                  <ModelInfo>
                    <ModelName>{model.name}</ModelName>
                    <ModelStatus status={model.status}>
                      {model.status === 'online' && <CheckCircle size={14} />}
                      {model.status === 'degraded' && <AlertCircle size={14} />}
                      {model.status === 'offline' && <XCircle size={14} />}
                      {model.status_text}
                    </ModelStatus>
                  </ModelInfo>
                  <ModelScore status={
                    model.status === 'online' ? 'good' : 
                    model.status === 'degraded' ? 'warning' : 'error'
                  }>
                    {model.score}
                  </ModelScore>
                </ModelItem>
              ))}
            </ModelList>
          </Section>

          <Section>
            <SectionHeader>
              <SectionTitle>Recent AI Interactions</SectionTitle>
            </SectionHeader>
            <InteractionList>
              {interactions.map((interaction, index) => (
                <InteractionItem key={index}>
                  <InteractionIcon type={interaction.type}>
                    {getInteractionIcon(interaction.type)}
                  </InteractionIcon>
                  <InteractionContent>
                    <InteractionText dangerouslySetInnerHTML={{ __html: interaction.text }} />
                    <InteractionTime>{interaction.time}</InteractionTime>
                  </InteractionContent>
                </InteractionItem>
              ))}
            </InteractionList>
            <ViewAllButton>View Full AI Log</ViewAllButton>
          </Section>
        </ContentArea>
      </MainContent>
    </PageContainer>
  );
};

export default AdminAIAnalyticsPage;
