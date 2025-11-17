import React, { useState } from 'react';
import { styled } from '../stitches.config';
import Layout from '../components/layout/Layout';
import Sidebar from '../components/layout/Sidebar';
import Card from '../components/common/Card';
import { Search, Wallet, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const DashboardContainer = styled('div', {
  display: 'flex',
  backgroundColor: 'var(--bg-secondary)',
  minHeight: 'calc(100vh - 73px)',
});

const MainContent = styled('main', {
  flex: 1,
  padding: '$6',
});

const SearchBarContainer = styled('div', {
  marginBottom: '$8',
  position: 'relative',
  maxWidth: '100%',
});

const SearchInput = styled('input', {
  width: '100%',
  padding: '$3 $4 $3 $10',
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '$base',
  fontSize: '$base',
  color: 'var(--text-primary)',

  '&::placeholder': {
    color: 'var(--text-secondary)',
  },

  '&:focus': {
    outline: 'none',
    borderColor: 'var(--primary-color)',
    boxShadow: '0 0 0 3px rgba(0, 112, 243, 0.1)',
  },
});

const SearchIcon = styled('div', {
  position: 'absolute',
  left: '$4',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--text-secondary)',
  display: 'flex',
  alignItems: 'center',
});

const TopSection = styled('div', {
  marginBottom: '$8',
});

const WelcomeTitle = styled('h1', {
  fontSize: '$3xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  marginBottom: '$6',
});

const ContentGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '$6',
  '@xl': {
    gridTemplateColumns: '2fr 1fr',
  },
});

const LeftColumn = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$6',
});

const RightColumn = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$6',
});

const Section = styled('section', {});

const SectionTitle = styled('h2', {
  fontSize: '$2xl',
  fontWeight: '$bold',
  marginBottom: '$4',
  color: 'var(--text-primary)',
});

const GuildsGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '$4',
  '@md': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  '@xl': {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
});

const GuildCard = styled(Card, {
  overflow: 'hidden',
  cursor: 'pointer',
});

const GuildImage = styled('div', {
  width: '100%',
  height: '120px',
  backgroundColor: '$gray800',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  variants: {
    theme: {
      quantum: {
        background: 'linear-gradient(135deg, #1a2332 0%, #2d4a5e 100%)',
      },
      data: {
        background: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)',
      },
      code: {
        background: 'linear-gradient(135deg, #5b247a 0%, #1bcedf 100%)',
      },
    },
  },
});

const GuildInfo = styled('div', {
  padding: '$4',
});

const GuildName = styled('h3', {
  fontSize: '$lg',
  fontWeight: '$semibold',
  marginBottom: '$2',
  color: 'var(--text-primary)',
});

const GuildMembers = styled('div', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
  marginBottom: '$3',
});

const GuildProject = styled('div', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
  marginBottom: '$2',
});

const ProgressBar = styled('div', {
  width: '100%',
  height: '6px',
  backgroundColor: '$gray200',
  borderRadius: '$full',
  overflow: 'hidden',
});

const ProgressFill = styled('div', {
  height: '100%',
  backgroundColor: '$primary500',
  borderRadius: '$full',
  transition: 'width 0.3s',
  variants: {
    color: {
      primary: { backgroundColor: '$primary500' },
      purple: { backgroundColor: '#7c3aed' },
      blue: { backgroundColor: '#3b82f6' },
    },
  },
});

const TasksList = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$3',
});

const TaskItem = styled('div', {
  display: 'flex',
  gap: '$4',
  padding: '$4',
  backgroundColor: 'var(--card-bg)',
  borderRadius: '$base',
  border: '1px solid var(--border-color)',
});

const TaskIndicator = styled('div', {
  width: '4px',
  borderRadius: '$full',
  flexShrink: 0,
  variants: {
    priority: {
      high: { backgroundColor: '#ef4444' },
      medium: { backgroundColor: '#f59e0b' },
      low: { backgroundColor: '#10b981' },
    },
  },
});

const TaskContent = styled('div', {
  flex: 1,
});

const TaskTitle = styled('div', {
  fontSize: '$base',
  fontWeight: '$semibold',
  marginBottom: '$1',
  color: 'var(--text-primary)',
});

const TaskMeta = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$4',
  fontSize: '$sm',
  color: 'var(--text-secondary)',
});

const TaskAssignees = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
});

const Avatar = styled('div', {
  width: '24px',
  height: '24px',
  borderRadius: '$full',
  backgroundColor: 'var(--border-color)',
  border: '2px solid var(--card-bg)',
});

const TrendingSection = styled(Card, {
  padding: '$5',
});

const TrendingTitle = styled('h3', {
  fontSize: '$lg',
  fontWeight: '$bold',
  marginBottom: '$4',
  color: 'var(--text-primary)',
});

const TrendingList = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$3',
});

const TrendingItem = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const Hashtag = styled('div', {
  fontSize: '$base',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
});

const PostCount = styled('div', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
});

const StatsSection = styled(Card, {
  padding: '$5',
});

const StatsGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '$4',
});

const StatItem = styled('div', {
  textAlign: 'center',
});

const StatValue = styled('div', {
  fontSize: '$3xl',
  fontWeight: '$bold',
  color: 'var(--primary-color)',
  marginBottom: '$1',
});

const StatLabel = styled('div', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
});

const ConnectionsSection = styled(Card, {
  padding: '$5',
});

const ConnectionsList = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$3',
});

const ConnectionItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  padding: '$2',
});

const ConnectionAvatar = styled('div', {
  width: '40px',
  height: '40px',
  borderRadius: '$full',
  backgroundColor: 'var(--primary-color)',
  flexShrink: 0,
});

const ConnectionInfo = styled('div', {
  flex: 1,
});

const ConnectionName = styled('div', {
  fontSize: '$sm',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
});

const ConnectionRole = styled('div', {
  fontSize: '$xs',
  color: 'var(--text-secondary)',
});

const ConnectButton = styled('button', {
  padding: '$2 $4',
  borderRadius: '$base',
  border: '1px solid var(--primary-color)',
  backgroundColor: 'var(--card-bg)',
  color: 'var(--primary-color)',
  fontSize: '$xs',
  fontWeight: '$medium',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: 'var(--primary-color)',
    color: 'white',
  },
});

const WalletOverviewCard = styled('div', {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '$xl',
  padding: '$6',
  marginBottom: '$8',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)',

  '&::before': {
    content: '',
    position: 'absolute',
    top: '-50%',
    right: '-10%',
    width: '300px',
    height: '300px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
  },
});

const WalletHeader = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '$4',
  position: 'relative',
  zIndex: 1,
});

const WalletTitle = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  fontSize: '$lg',
  fontWeight: '$semibold',
});

const WalletViewButton = styled('button', {
  padding: '$2 $4',
  borderRadius: '$base',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  color: 'white',
  fontSize: '$sm',
  fontWeight: '$medium',
  cursor: 'pointer',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  gap: '$2',

  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});

const WalletContent = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '$6',
  position: 'relative',
  zIndex: 1,

  '@media (max-width: 768px)': {
    gridTemplateColumns: '1fr',
    gap: '$4',
  },
});

const WalletBalance = styled('div', {});

const BalanceLabel = styled('p', {
  fontSize: '$sm',
  opacity: 0.9,
  marginBottom: '$1',
});

const BalanceAmount = styled('h2', {
  fontSize: '$4xl',
  fontWeight: '$bold',
});

const WalletStats = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '$4',
});

const StatBox = styled('div', {});

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<{ first_name: string; last_name: string; email: string; id: number; avatar_url?: string } | null>(null);
  const [guilds, setGuilds] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [topGuilds, setTopGuilds] = useState<any[]>([]);
  const [suggestedConnections, setSuggestedConnections] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeUsers: 0,
    newProjects: 0,
    totalGuilds: 0,
    itemsSold: 0,
  });
  const [wallet, setWallet] = useState<{ balance: number } | null>(null);
  const [walletTransactions, setWalletTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [topGuildsLoading, setTopGuildsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState(true);
  const API_BASE_URL = 'http://localhost:8000';

  // Load user from localStorage and check plan selection
  React.useEffect(() => {
    const checkUserAndPlan = async () => {
      const storedUser = localStorage.getItem('avalanche_user');
      const token = localStorage.getItem('avalanche_token');

      if (!token) {
        // No token, redirect to login
        window.location.href = '/login';
        return;
      }

      // Fetch fresh user data from backend
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();

          // Check if user needs to select a plan (but not admins)
          if (!userData.plan_selected && userData.role !== 'admin') {
            // Redirect to plan selection
            window.location.href = '/select-plan';
            return;
          }

          // Update user data
          setUser(userData);
          localStorage.setItem('avalanche_user', JSON.stringify(userData));
        } else {
          // Invalid token, redirect to login
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Failed to verify user:', error);
      }

      // Fallback: use stored user if API fails
      if (storedUser && !user) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Failed to parse user data:', error);
        }
      }
    };

    checkUserAndPlan();
  }, []);

  // Fetch user's guilds
  React.useEffect(() => {
    const fetchUserGuilds = async () => {
      const token = localStorage.getItem('avalanche_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/guilds`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const allGuilds = await response.json();
          
          // Filter to only show guilds the user is a member of
          const userGuildsPromises = allGuilds.map(async (guild: any) => {
            const membersResponse = await fetch(`${API_BASE_URL}/guilds/${guild.id}/members`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (membersResponse.ok) {
              const membersData = await membersResponse.json();
              const storedUser = localStorage.getItem('avalanche_user');
              if (storedUser) {
                const currentUser = JSON.parse(storedUser);
                const isMember = membersData.members.some((m: any) => m.id === currentUser.id) || 
                                guild.owner_id === currentUser.id;
                if (isMember) {
                  return guild;
                }
              }
            }
            return null;
          });

          const userGuilds = (await Promise.all(userGuildsPromises)).filter(Boolean);
          setGuilds(userGuilds);
        }
      } catch (error) {
        console.error('Error fetching guilds:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserGuilds();
  }, []);

  // Fetch user's active projects
  React.useEffect(() => {
    const fetchUserProjects = async () => {
      const token = localStorage.getItem('avalanche_token');
      const storedUser = localStorage.getItem('avalanche_user');

      if (!token || !storedUser) {
        setProjectsLoading(false);
        return;
      }

      try {
        const currentUser = JSON.parse(storedUser);
        const response = await fetch(`${API_BASE_URL}/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const allProjects = await response.json();

          // Filter to show only projects where user is involved (owner or participant)
          // and project is active (not completed)
          const userActiveProjects = allProjects.filter((project: any) => {
            const isOwner = project.owner_id === currentUser.id;
            const isParticipant = project.participants?.some((p: any) => p.id === currentUser.id);
            const isActive = project.status !== 'completed' && project.status !== 'cancelled';
            return (isOwner || isParticipant) && isActive;
          });

          setProjects(userActiveProjects);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchUserProjects();
  }, []);

  // Fetch top guilds by activity score
  React.useEffect(() => {
    const fetchTopGuilds = async () => {
      const token = localStorage.getItem('avalanche_token');

      if (!token) {
        setTopGuildsLoading(false);
        return;
      }

      try {
        // Fetch guilds and projects in parallel
        const [guildsResponse, projectsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/guilds`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/projects`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (guildsResponse.ok && projectsResponse.ok) {
          const allGuilds = await guildsResponse.json();
          const allProjects = await projectsResponse.json();

          // Calculate activity score for each guild
          const guildsWithActivity = await Promise.all(
            allGuilds.map(async (guild: any) => {
              let activityScore = 0;

              // Member count contributes to activity (weight: 1 point per member)
              activityScore += guild.member_count || 0;

              // Count guild projects (weight: 10 points per project)
              const guildProjects = allProjects.filter((p: any) => p.guild_id === guild.id);
              activityScore += guildProjects.length * 10;

              // Count active projects (not completed/cancelled) (weight: 5 bonus points)
              const activeProjects = guildProjects.filter(
                (p: any) => p.status !== 'completed' && p.status !== 'cancelled'
              );
              activityScore += activeProjects.length * 5;

              // Try to fetch recent messages for this guild (weight: 2 points per recent message)
              try {
                const messagesResponse = await fetch(`${API_BASE_URL}/guilds/${guild.id}/messages`, {
                  headers: { Authorization: `Bearer ${token}` },
                });

                if (messagesResponse.ok) {
                  const messages = await messagesResponse.json();
                  const sevenDaysAgo = new Date();
                  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                  const recentMessages = messages.filter((msg: any) => {
                    const createdAt = new Date(msg.created_at);
                    return createdAt >= sevenDaysAgo;
                  });

                  activityScore += recentMessages.length * 2;
                }
              } catch {
                // If messages endpoint doesn't exist or fails, continue without it
                console.log(`Could not fetch messages for guild ${guild.id}`);
              }

              return {
                ...guild,
                activityScore,
              };
            })
          );

          // Sort by activity score in descending order and take top 3
          const topActiveGuilds = guildsWithActivity
            .sort((a, b) => b.activityScore - a.activityScore)
            .slice(0, 3);

          setTopGuilds(topActiveGuilds);
        }
      } catch (error) {
        console.error('Error fetching top guilds:', error);
      } finally {
        setTopGuildsLoading(false);
      }
    };

    fetchTopGuilds();
  }, []);

  // Fetch platform statistics
  React.useEffect(() => {
    const fetchPlatformStats = async () => {
      const token = localStorage.getItem('avalanche_token');

      if (!token) {
        setStatsLoading(false);
        return;
      }

      try {
        // Fetch all necessary data in parallel
        const [usersResponse, projectsResponse, guildsResponse, productsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/projects`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/guilds`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/marketplace/products`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        let activeUsers = 0;
        let newProjects = 0;
        let totalGuilds = 0;
        let itemsSold = 0;

        // Count active users
        if (usersResponse.ok) {
          const users = await usersResponse.json();
          activeUsers = users.length;
        }

        // Count new projects (created in the last 30 days) and total projects
        if (projectsResponse.ok) {
          const allProjects = await projectsResponse.json();
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          newProjects = allProjects.filter((project: any) => {
            const createdAt = new Date(project.created_at);
            return createdAt >= thirtyDaysAgo;
          }).length;
        }

        // Count total guilds
        if (guildsResponse.ok) {
          const allGuilds = await guildsResponse.json();
          totalGuilds = allGuilds.length;
        }

        // Count items sold (products with orders)
        if (productsResponse.ok) {
          const products = await productsResponse.json();
          itemsSold = products.filter((product: any) => product.status === 'sold').length;
        }

        setStats({
          activeUsers,
          newProjects,
          totalGuilds,
          itemsSold,
        });
      } catch (error) {
        console.error('Error fetching platform stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchPlatformStats();
  }, []);

  // Fetch suggested connections from same guilds
  React.useEffect(() => {
    const fetchSuggestedConnections = async () => {
      const token = localStorage.getItem('avalanche_token');
      const storedUser = localStorage.getItem('avalanche_user');

      if (!token || !storedUser) {
        setConnectionsLoading(false);
        return;
      }

      try {
        const currentUser = JSON.parse(storedUser);

        // First, get all guilds the user is a member of
        const guildsResponse = await fetch(`${API_BASE_URL}/guilds`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!guildsResponse.ok) {
          setConnectionsLoading(false);
          return;
        }

        const allGuilds = await guildsResponse.json();

        // Get members from all user's guilds
        const guildMembersPromises = allGuilds.map(async (guild: any) => {
          try {
            const membersResponse = await fetch(`${API_BASE_URL}/guilds/${guild.id}/members`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (membersResponse.ok) {
              const membersData = await membersResponse.json();
              const isMember = membersData.members.some((m: any) => m.id === currentUser.id) ||
                              guild.owner_id === currentUser.id;

              if (isMember) {
                // Return members from this guild (excluding current user)
                return membersData.members
                  .filter((member: any) => member.id !== currentUser.id)
                  .map((member: any) => ({
                    ...member,
                    guildName: guild.name,
                    guildId: guild.id,
                  }));
              }
            }
          } catch {
            console.log(`Could not fetch members for guild ${guild.id}`);
          }
          return [];
        });

        const allMembersArrays = await Promise.all(guildMembersPromises);
        const allMembers = allMembersArrays.flat();

        // Remove duplicates (users in multiple guilds) and take up to 5 suggestions
        const uniqueMembers = Array.from(
          new Map(allMembers.map((member: any) => [member.id, member])).values()
        ).slice(0, 5);

        setSuggestedConnections(uniqueMembers);
      } catch (error) {
        console.error('Error fetching suggested connections:', error);
      } finally {
        setConnectionsLoading(false);
      }
    };

    fetchSuggestedConnections();
  }, []);

  // Helper function to determine priority based on due date
  const getPriority = (dueDate: string | null): 'high' | 'medium' | 'low' => {
    if (!dueDate) return 'low';

    const due = new Date(dueDate);
    const now = new Date();
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 7) return 'high';
    if (daysUntilDue < 14) return 'medium';
    return 'low';
  };

  // Format date for display
  const formatDueDate = (dateString: string | null): string => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Layout isAuthenticated={true} showFooter={false}>
      <DashboardContainer>
        <Sidebar user={user ? {
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          avatar: user.avatar_url
        } : {
          name: 'Guest User',
          email: 'guest@example.com'
        }} />
        <MainContent>
          <SearchBarContainer>
            <SearchIcon>
              <Search size={24} />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search for guilds, projects, or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBarContainer>

          <TopSection>
            <WelcomeTitle>My Guilds</WelcomeTitle>
            {loading ? (
              <div style={{ color: 'var(--text-secondary)', padding: '24px', textAlign: 'center' }}>
                Loading guilds...
              </div>
            ) : guilds.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', padding: '24px', textAlign: 'center' }}>
                You haven't joined any guilds yet. Explore guilds to get started!
              </div>
            ) : (
              <GuildsGrid>
                {guilds.map((guild) => (
                  <GuildCard 
                    key={guild.id}
                    onClick={() => window.location.href = `/guilds/${guild.id}`}
                  >
                    <GuildImage 
                      style={{
                        backgroundImage: guild.avatar_url 
                          ? `url(${guild.avatar_url})` 
                          : 'linear-gradient(135deg, #1a2332 0%, #2d4a5e 100%)',
                      }}
                    />
                    <GuildInfo>
                      <GuildName>{guild.name}</GuildName>
                      <GuildMembers>{guild.member_count} Member{guild.member_count !== 1 ? 's' : ''}</GuildMembers>
                      <GuildProject>{guild.category || 'General'}</GuildProject>
                      <ProgressBar>
                        <ProgressFill
                          color="primary"
                          style={{ width: `${Math.floor(Math.random() * 70) + 15}%` }}
                        />
                      </ProgressBar>
                    </GuildInfo>
                  </GuildCard>
                ))}
              </GuildsGrid>
            )}
          </TopSection>

          <ContentGrid>
            <LeftColumn>
              <Section>
                <SectionTitle>Ongoing Projects</SectionTitle>
                {projectsLoading ? (
                  <div style={{ color: 'var(--text-secondary)', padding: '24px', textAlign: 'center' }}>
                    Loading active projects...
                  </div>
                ) : projects.length === 0 ? (
                  <div style={{ color: 'var(--text-secondary)', padding: '24px', textAlign: 'center' }}>
                    You don't have any active projects yet. Create or join a project to get started!
                  </div>
                ) : (
                  <TasksList>
                    {projects.map((project) => (
                      <TaskItem
                        key={project.id}
                        onClick={() => window.location.href = `/projects/${project.id}`}
                        style={{ cursor: 'pointer' }}
                      >
                        <TaskIndicator priority={getPriority(project.deadline)} />
                        <TaskContent>
                          <TaskTitle>{project.title}</TaskTitle>
                          <TaskMeta>
                            <span>
                              {project.guild_name ? `For ${project.guild_name}` : 'Independent Project'}
                              {project.deadline && ` - Due ${formatDueDate(project.deadline)}`}
                            </span>
                            {project.participants && project.participants.length > 0 && (
                              <TaskAssignees>
                                {project.participants.slice(0, 2).map((_: unknown, index: number) => (
                                  <Avatar key={index} />
                                ))}
                                {project.participants.length > 2 && (
                                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    +{project.participants.length - 2}
                                  </span>
                                )}
                              </TaskAssignees>
                            )}
                            {project.status === 'in_progress' && (
                              <span style={{
                                fontSize: '12px',
                                color: 'var(--primary-color)',
                                fontWeight: '500'
                              }}>
                                In Progress
                              </span>
                            )}
                          </TaskMeta>
                        </TaskContent>
                      </TaskItem>
                    ))}
                  </TasksList>
                )}
              </Section>
            </LeftColumn>

            <RightColumn>
              <TrendingSection>
                <TrendingTitle>Top Guilds</TrendingTitle>
                {topGuildsLoading ? (
                  <div style={{ color: 'var(--text-secondary)', padding: '12px', textAlign: 'center' }}>
                    Loading...
                  </div>
                ) : topGuilds.length === 0 ? (
                  <div style={{ color: 'var(--text-secondary)', padding: '12px', textAlign: 'center' }}>
                    No guilds found
                  </div>
                ) : (
                  <TrendingList>
                    {topGuilds.map((guild) => (
                      <TrendingItem
                        key={guild.id}
                        onClick={() => window.location.href = `/guilds/${guild.id}`}
                        style={{ cursor: 'pointer' }}
                      >
                        <Hashtag>#{guild.category || 'General'}</Hashtag>
                        <PostCount>{guild.member_count} member{guild.member_count !== 1 ? 's' : ''}</PostCount>
                      </TrendingItem>
                    ))}
                  </TrendingList>
                )}
              </TrendingSection>

              <StatsSection>
                <TrendingTitle>Platform Stats</TrendingTitle>
                {statsLoading ? (
                  <div style={{ color: 'var(--text-secondary)', padding: '24px', textAlign: 'center' }}>
                    Loading stats...
                  </div>
                ) : (
                  <StatsGrid>
                    <StatItem>
                      <StatValue>{stats.activeUsers.toLocaleString()}</StatValue>
                      <StatLabel>Active Users</StatLabel>
                    </StatItem>
                    <StatItem>
                      <StatValue>{stats.newProjects.toLocaleString()}</StatValue>
                      <StatLabel>New Projects</StatLabel>
                    </StatItem>
                    <StatItem>
                      <StatValue>{stats.totalGuilds.toLocaleString()}</StatValue>
                      <StatLabel>Guilds</StatLabel>
                    </StatItem>
                    <StatItem>
                      <StatValue>{stats.itemsSold.toLocaleString()}</StatValue>
                      <StatLabel>Items Sold</StatLabel>
                    </StatItem>
                  </StatsGrid>
                )}
              </StatsSection>

              <ConnectionsSection>
                <TrendingTitle>Suggested Connections</TrendingTitle>
                {connectionsLoading ? (
                  <div style={{ color: 'var(--text-secondary)', padding: '24px', textAlign: 'center' }}>
                    Loading...
                  </div>
                ) : suggestedConnections.length === 0 ? (
                  <div style={{ color: 'var(--text-secondary)', padding: '24px', textAlign: 'center' }}>
                    No connections found. Join a guild to connect with others!
                  </div>
                ) : (
                  <ConnectionsList>
                    {suggestedConnections.map((connection) => (
                      <ConnectionItem key={connection.id}>
                        <ConnectionAvatar />
                        <ConnectionInfo>
                          <ConnectionName>
                            {connection.first_name} {connection.last_name}
                          </ConnectionName>
                          <ConnectionRole>
                            {connection.guildName ? `Member of ${connection.guildName}` : 'Guild Member'}
                          </ConnectionRole>
                        </ConnectionInfo>
                        <ConnectButton onClick={() => window.location.href = `/user/${connection.id}`}>
                          View
                        </ConnectButton>
                      </ConnectionItem>
                    ))}
                  </ConnectionsList>
                )}
              </ConnectionsSection>
            </RightColumn>
          </ContentGrid>
        </MainContent>
      </DashboardContainer>
    </Layout>
  );
};

export default DashboardPage;
