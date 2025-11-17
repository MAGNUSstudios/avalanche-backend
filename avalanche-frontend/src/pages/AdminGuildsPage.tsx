import React from 'react';
import { styled } from '../stitches.config';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Users as UsersIcon,
  TrendingUp,
  Settings,
  Search,
  Plus,
  LogOut,
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
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-around',
  gap: '$4',
});

const ChartBar = styled('div', {
  flex: 1,
  maxWidth: '60px',
  background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
  borderRadius: '$base $base 0 0',
  position: 'relative',
  transition: 'all 0.3s ease',

  '&:hover': {
    opacity: 0.8,
  },
});

const BarLabel = styled('div', {
  fontSize: '$xs',
  color: 'var(--text-secondary)',
  textAlign: 'center',
  marginTop: '$2',
});

const TrendingTopics = styled('div', {
  padding: '$6',
  display: 'flex',
  flexDirection: 'column',
  gap: '$4',
});

const TopicItem = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '$3',
  borderRadius: '$base',
  backgroundColor: 'var(--bg-secondary)',
});

const TopicTag = styled('div', {
  fontSize: '$sm',
  fontWeight: '$medium',
  color: 'var(--text-primary)',
});

const TopicBadge = styled('span', {
  padding: '$1 $3',
  borderRadius: '$full',
  fontSize: '$xs',
  fontWeight: '$medium',
  backgroundColor: '#dbeafe',
  color: '#1e40af',
});

const TopicMentions = styled('span', {
  fontSize: '$xs',
  color: 'var(--text-secondary)',
  marginLeft: '$2',
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

const SearchBar = styled('div', {
  position: 'relative',
  flex: 1,
  maxWidth: '300px',
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
  color: '#9ca3af',
  width: '16px',
  height: '16px',
});

const CreateButton = styled(Link, {
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
  textDecoration: 'none',

  '&:hover': {
    backgroundColor: 'var(--primary-hover)',
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

const ProgressBar = styled('div', {
  width: '100%',
  height: '8px',
  backgroundColor: 'var(--border-color)',
  borderRadius: '$full',
  overflow: 'hidden',
});

const ProgressFill = styled('div', {
  height: '100%',
  backgroundColor: 'var(--primary-color)',
  borderRadius: '$full',
  transition: 'width 0.3s ease',
});

const ViewButton = styled('button', {
  padding: '$1 $3',
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

interface GuildData {
  name: string;
  members: number;
  activity: number;
  category?: string;
}

interface ActivityData {
  day: string;
  value: number;
  height?: string;
}

interface TopicData {
  tag: string;
  badge?: string | null;
  mentions: string;
}

interface GuildStats {
  total_guilds: number;
  guilds_change: string;
  new_members: number;
  members_change: string;
  active_guilds: number;
  active_change: string;
  avg_daily_messages: number;
  messages_change: string;
}

const AdminGuildsPage: React.FC = () => {
  // Use admin context for avatar
  const { adminData } = useAdmin();
  const adminAvatar = adminData?.avatar_url || 'https://i.pravatar.cc/150?img=12';

  const [guilds, setGuilds] = React.useState<GuildData[]>([]);
  const [activityData, setActivityData] = React.useState<ActivityData[]>([]);
  const [topics, setTopics] = React.useState<TopicData[]>([]);
  const [stats, setStats] = React.useState<GuildStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activityPeriod, setActivityPeriod] = React.useState<'weekly' | 'monthly' | 'alltime'>('weekly');

  // Refetch activity data when period changes
  React.useEffect(() => {
    const fetchActivity = async () => {
      try {
        const activityResponse = await API.admin.getGuildActivity(activityPeriod);
        setActivityData(activityResponse || []);
      } catch (error) {
        console.error('Failed to fetch activity data:', error);
      }
    };
    fetchActivity();
  }, [activityPeriod]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch guild stats
        const guildStats = await API.admin.getGuildStats();
        setStats(guildStats);

        // Fetch guilds overview
        const guildsData = await API.admin.getGuildsOverview(4);
        setGuilds(guildsData || []);

        // Fetch trending topics
        const topicsData = await API.admin.getTrendingTopics(5);
        setTopics(topicsData || []);
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch guild data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    API.auth.logout();
  };

  if (loading && guilds.length === 0) {
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
          <NavItem active as={Link} to="/admin/guilds">
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
          <PageTitle>Guild Analytics</PageTitle>
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
              <StatLabel>Total Guilds</StatLabel>
              <StatValue>{stats?.total_guilds?.toLocaleString() || '0'}</StatValue>
              <StatChange trend="up">{stats?.guilds_change || '+0%'} growth</StatChange>
            </StatCard>
            <StatCard>
              <StatLabel>New Members (30d)</StatLabel>
              <StatValue>{stats?.new_members?.toLocaleString() || '0'}</StatValue>
              <StatChange trend="up">{stats?.members_change || '+0%'} vs last month</StatChange>
            </StatCard>
            <StatCard>
              <StatLabel>Active Guilds (24h)</StatLabel>
              <StatValue>{stats?.active_guilds?.toLocaleString() || '0'}</StatValue>
              <StatChange trend="up">{stats?.active_change || '+0%'}</StatChange>
            </StatCard>
            <StatCard>
              <StatLabel>Avg. Daily Messages</StatLabel>
              <StatValue>{stats?.avg_daily_messages?.toLocaleString() || '0'}</StatValue>
              <StatChange trend={stats?.messages_change?.startsWith('+') ? 'up' : 'down'}>
                {stats?.messages_change || '+0%'} vs yesterday
              </StatChange>
            </StatCard>
          </StatsGrid>

          <ContentGrid>
            <Section>
              <SectionHeader>
                <SectionTitle>Guild Activity</SectionTitle>
                <TabContainer>
                  <Tab
                    active={activityPeriod === 'weekly'}
                    onClick={() => setActivityPeriod('weekly')}
                  >
                    Weekly
                  </Tab>
                  <Tab
                    active={activityPeriod === 'monthly'}
                    onClick={() => setActivityPeriod('monthly')}
                  >
                    Monthly
                  </Tab>
                  <Tab
                    active={activityPeriod === 'alltime'}
                    onClick={() => setActivityPeriod('alltime')}
                  >
                    All Time
                  </Tab>
                </TabContainer>
              </SectionHeader>
              <ChartContainer>
                {activityData.map((item, index) => (
                  <div key={index} style={{ textAlign: 'center', flex: 1 }}>
                    <ChartBar style={{ height: `${(item.percentage || 0) * 3}px` }} />
                    <BarLabel>{item.day}</BarLabel>
                  </div>
                ))}
              </ChartContainer>
            </Section>

            <Section>
              <SectionHeader>
                <SectionTitle>Trending Topics</SectionTitle>
              </SectionHeader>
              <TrendingTopics>
                {topics.map((topic, index) => (
                  <TopicItem key={index}>
                    <TopicTag>{topic.tag}</TopicTag>
                    {topic.badge ? (
                      <TopicBadge>{topic.badge}</TopicBadge>
                    ) : (
                      <TopicMentions>{topic.mentions}</TopicMentions>
                    )}
                  </TopicItem>
                ))}
                <ViewAllButton>View All Topics</ViewAllButton>
              </TrendingTopics>
            </Section>
          </ContentGrid>

          <Section>
            <SectionHeader>
              <SectionTitle>Guilds Overview</SectionTitle>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <SearchBar>
                  <SearchIcon />
                  <SearchInput placeholder="Search guilds..." />
                </SearchBar>
                <CreateButton to="/guilds/create">
                  <Plus size={16} />
                  Create Guild
                </CreateButton>
              </div>
            </SectionHeader>
            <Table>
              <thead>
                <tr>
                  <Th>GUILD NAME</Th>
                  <Th>MEMBERS</Th>
                  <Th>ACTIVITY LEVEL</Th>
                  <Th>ACTIONS</Th>
                </tr>
              </thead>
              <tbody>
                {guilds.map((guild, index) => (
                  <tr key={index}>
                    <Td>{guild.name}</Td>
                    <Td>{guild.members.toLocaleString()}</Td>
                    <Td>
                      <ProgressBar>
                        <ProgressFill style={{ width: `${guild.activity}%` }} />
                      </ProgressBar>
                    </Td>
                    <Td>
                      <ViewButton>View</ViewButton>
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

export default AdminGuildsPage;
