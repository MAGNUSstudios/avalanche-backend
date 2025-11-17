import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { styled } from '../stitches.config';
import { ArrowLeft } from 'lucide-react';
import API from '../services/api';
import Header from '../components/layout/Header';

const PageContainer = styled('div', {
  minHeight: '100vh',
  backgroundColor: 'var(--bg-primary)',
  paddingTop: '73px',
});

const Container = styled('div', {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '$8',
});

const BackButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$2 $4',
  backgroundColor: 'transparent',
  border: '1px solid var(--border-color)',
  borderRadius: '$base',
  color: 'var(--text-primary)',
  fontSize: '$sm',
  fontWeight: '$medium',
  cursor: 'pointer',
  marginBottom: '$6',
  transition: 'all 0.2s',

  '&:hover': {
    backgroundColor: 'var(--bg-secondary)',
    borderColor: 'var(--primary-color)',
  },
});

const ProfileHeader = styled('div', {
  backgroundColor: 'var(--card-bg)',
  borderRadius: '$lg',
  padding: '$8',
  marginBottom: '$6',
  border: '1px solid var(--border-color)',
});

const HeaderContent = styled('div', {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '$6',
});

const UserSection = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$6',
});

const Avatar = styled('div', {
  width: '120px',
  height: '120px',
  borderRadius: '$full',
  overflow: 'hidden',
  backgroundColor: 'var(--primary-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '48px',
  fontWeight: '$bold',
  flexShrink: 0,

  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

const UserInfo = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
});

const UserName = styled('h1', {
  fontSize: '$2xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  marginBottom: '$1',
});

const UserHandle = styled('div', {
  fontSize: '$base',
  color: 'var(--text-secondary)',
});

const StatsRow = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const FundsSection = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$1',
});

const FundsLabel = styled('div', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
});

const FundsAmount = styled('div', {
  fontSize: '$3xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
});

const AddFundsButton = styled('button', {
  padding: '$3 $6',
  borderRadius: '$base',
  fontSize: '$base',
  fontWeight: '$semibold',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s',

  '&:hover': {
    backgroundColor: 'var(--primary-hover)',
  },
});

const TabsContainer = styled('div', {
  backgroundColor: 'var(--card-bg)',
  borderRadius: '$lg',
  border: '1px solid var(--border-color)',
  overflow: 'hidden',
});

const TabsList = styled('div', {
  display: 'flex',
  borderBottom: '1px solid var(--border-color)',
  padding: '0 $6',
});

const Tab = styled('button', {
  padding: '$4 0',
  marginRight: '$8',
  backgroundColor: 'transparent',
  border: 'none',
  fontSize: '$base',
  fontWeight: '$medium',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  transition: 'all 0.2s',
  borderBottom: '2px solid transparent',
  position: 'relative',

  '&:hover': {
    color: 'var(--text-primary)',
  },

  variants: {
    active: {
      true: {
        color: 'var(--primary-color)',
        borderBottomColor: 'var(--primary-color)',
      },
    },
  },
});

const TabContent = styled('div', {
  padding: '$6',
});

const SubTabs = styled('div', {
  display: 'flex',
  gap: '$4',
  marginBottom: '$6',
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '$4',
});

const SubTab = styled('button', {
  padding: '$2 0',
  backgroundColor: 'transparent',
  border: 'none',
  fontSize: '$sm',
  fontWeight: '$medium',
  cursor: 'pointer',
  transition: 'all 0.2s',
  position: 'relative',

  variants: {
    active: {
      true: {
        color: 'var(--primary-color)',
        '&::after': {
          content: '',
          position: 'absolute',
          bottom: '-17px',
          left: 0,
          right: 0,
          height: '2px',
          backgroundColor: 'var(--primary-color)',
        },
      },
      false: {
        color: 'var(--text-secondary)',
      },
    },
  },
});

const ItemsGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '$6',
});

const ItemCard = styled('div', {
  backgroundColor: 'var(--bg-secondary)',
  borderRadius: '$lg',
  overflow: 'hidden',
  border: '1px solid var(--border-color)',
  transition: 'all 0.2s',
  cursor: 'pointer',

  '&:hover': {
    transform: 'translateY(-4px)',
    borderColor: 'var(--primary-color)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
  },
});

const ItemImage = styled('div', {
  width: '100%',
  height: '200px',
  backgroundColor: 'var(--bg-tertiary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',

  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

const ItemInfo = styled('div', {
  padding: '$4',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
});

const ItemName = styled('div', {
  fontSize: '$base',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
  marginBottom: '$2',
});

const ItemPrice = styled('div', {
  fontSize: '$lg',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
});

const EmptyState = styled('div', {
  textAlign: 'center',
  padding: '$12',
  color: 'var(--text-secondary)',
  fontSize: '$base',
});

interface UserProfileData {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  country?: string;
  created_at: string;
}

interface UserItem {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  status?: string;
}

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'items' | 'badges' | 'history'>('items');
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [userProducts, setUserProducts] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('avalanche_token');
    setIsAuthenticated(!!token);

    const loadUserProfile = async () => {
      if (!userId) {
        setError('User ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch the specific user's profile by ID
        const userData = await API.auth.getUserById(parseInt(userId));
        setUser(userData);

        // Load products sold by this user
        const productsData = await API.products.getAll({
          seller_id: parseInt(userId),
          limit: 100
        });
        console.log('User products:', productsData);
        setUserProducts(Array.isArray(productsData) ? productsData : []);
      } catch (err) {
        console.error('Failed to load user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [userId]);

  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.username || `${user.first_name} ${user.last_name}`.trim() || 'User';
  };

  const getUserInitial = () => {
    if (!user) return 'U';
    if (user.username) return user.username.charAt(0).toUpperCase();
    if (user.first_name) return user.first_name.charAt(0).toUpperCase();
    return 'U';
  };

  if (loading) {
    return (
      <>
        <Header isAuthenticated={isAuthenticated} />
        <PageContainer>
          <Container>
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
              Loading profile...
            </div>
          </Container>
        </PageContainer>
      </>
    );
  }

  if (error || !user) {
    return (
      <>
        <Header isAuthenticated={isAuthenticated} />
        <PageContainer>
          <Container>
            <div style={{ textAlign: 'center', padding: '60px', color: '#ef4444' }}>
              {error || 'User not found'}
            </div>
          </Container>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <Header isAuthenticated={isAuthenticated} />
      <PageContainer>
        <Container>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </BackButton>

        <ProfileHeader>
          <HeaderContent>
            <UserSection>
              <Avatar>
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={getUserDisplayName()} />
                ) : (
                  getUserInitial()
                )}
              </Avatar>
              <UserInfo>
                <UserName>{getUserDisplayName()}</UserName>
                <UserHandle>@{user.username || 'user'}</UserHandle>
              </UserInfo>
            </UserSection>
          </HeaderContent>

          <StatsRow>
            <FundsSection>
              <FundsLabel>Products for Sale</FundsLabel>
              <FundsAmount>{userProducts.length}</FundsAmount>
            </FundsSection>
          </StatsRow>
        </ProfileHeader>

        <TabsContainer>
          <TabsList>
            <Tab active={activeTab === 'items'} onClick={() => setActiveTab('items')}>
              Products for Sale
            </Tab>
            <Tab active={activeTab === 'badges'} onClick={() => setActiveTab('badges')}>
              Badges
            </Tab>
            <Tab active={activeTab === 'history'} onClick={() => setActiveTab('history')}>
              Task History
            </Tab>
          </TabsList>

          <TabContent>
            {activeTab === 'items' && (
              <ItemsGrid>
                {userProducts.length > 0 ? (
                  userProducts.map((item) => (
                    <ItemCard
                      key={item.id}
                      onClick={() => navigate(`/marketplace/product/${item.id}`)}
                    >
                      <ItemImage>
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} />
                        ) : (
                          <div style={{ color: 'var(--text-secondary)' }}>No Image</div>
                        )}
                      </ItemImage>
                      <ItemInfo>
                        <ItemName>{item.name}</ItemName>
                        <ItemPrice>${item.price.toFixed(2)}</ItemPrice>
                      </ItemInfo>
                    </ItemCard>
                  ))
                ) : (
                  <EmptyState>No products listed for sale yet</EmptyState>
                )}
              </ItemsGrid>
            )}

            {activeTab === 'badges' && (
              <EmptyState>No badges earned yet</EmptyState>
            )}

            {activeTab === 'history' && (
              <EmptyState>No task history available</EmptyState>
            )}
          </TabContent>
        </TabsContainer>
      </Container>
    </PageContainer>
    </>
  );
};

export default UserProfilePage;
