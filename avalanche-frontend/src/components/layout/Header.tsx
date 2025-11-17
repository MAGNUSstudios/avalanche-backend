import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { styled } from '../../stitches.config';
import { Bell, Sparkles, Moon, Sun, Shield, ShoppingCart, Crown, Zap, X, LayoutDashboard, Users } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { AIChatContext } from '../../context/AIChatContext';
import { useCart } from '../../context/CartContext';
import API from '../../services/api';

const HeaderContainer = styled('header', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$4 $6',
  backgroundColor: 'var(--card-bg)',
  borderBottom: '1px solid var(--border-color)',
  position: 'sticky',
  top: 0,
  zIndex: 50,
});

const Logo = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  fontSize: '$xl',
  fontWeight: '$semibold',
  color: '$primary500',
  textDecoration: 'none',
});

const Nav = styled('nav', {
  display: 'none',
  gap: '$6',
  '@md': {
    display: 'flex',
  },
});

const NavLink = styled(Link, {
  fontSize: '$base',
  fontWeight: '$medium',
  color: 'var(--text-primary)',
  textDecoration: 'none',
  transition: 'color 0.2s',
  '&:hover': {
    color: 'var(--primary-color)',
  },
});

const Actions = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$4',
});

const IconButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  borderRadius: '$full',
  border: 'none',
  backgroundColor: 'transparent',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  position: 'relative',
  '&:hover': {
    backgroundColor: 'var(--bg-tertiary)',
  },
});

const CartIconWrapper = styled(Link, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  borderRadius: '$full',
  backgroundColor: 'transparent',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  position: 'relative',
  textDecoration: 'none',
  '&:hover': {
    backgroundColor: 'var(--bg-tertiary)',
  },
});

const CartBadge = styled('span', {
  position: 'absolute',
  top: '4px',
  right: '4px',
  backgroundColor: '#ff6b00',
  color: 'white',
  borderRadius: '$full',
  minWidth: '18px',
  height: '18px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '11px',
  fontWeight: '$bold',
  padding: '0 4px',
  border: '2px solid var(--card-bg)',
});

const AuthButton = styled('button', {
  padding: '10px 24px',
  borderRadius: '$lg',
  fontSize: '$base',
  fontWeight: '$semibold',
  cursor: 'pointer',
  transition: 'all 0.2s',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  variants: {
    variant: {
      primary: {
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        border: 'none',
        '&:hover': {
          backgroundColor: 'var(--primary-hover)',
        },
      },
      outline: {
        backgroundColor: 'transparent',
        color: 'var(--text-primary)',
        border: '2px solid var(--border-color)',
        '&:hover': {
          backgroundColor: 'var(--bg-tertiary)',
          borderColor: 'var(--border-color)',
        },
      },
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

const ProfileAvatar = styled(Link, {
  width: '40px',
  height: '40px',
  borderRadius: '$full',
  overflow: 'hidden',
  backgroundColor: 'var(--primary-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontWeight: '$semibold',
  fontSize: '$base',
  cursor: 'pointer',
  transition: 'all 0.2s',
  border: '2px solid transparent',
  textDecoration: 'none',

  '&:hover': {
    borderColor: 'var(--primary-color)',
    transform: 'scale(1.05)',
  },

  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

const PlanBadge = styled('button', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '8px 16px',
  borderRadius: '$full',
  fontSize: '$sm',
  fontWeight: '$semibold',
  cursor: 'pointer',
  border: 'none',
  transition: 'all 0.2s',
  position: 'relative',

  variants: {
    plan: {
      free: {
        backgroundColor: 'var(--bg-tertiary)',
        color: 'var(--text-secondary)',
        '&:hover': {
          backgroundColor: 'var(--bg-secondary)',
        },
      },
      pro: {
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        color: 'white',
        '&:hover': {
          transform: 'scale(1.05)',
        },
      },
      business: {
        background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
        color: 'white',
        '&:hover': {
          transform: 'scale(1.05)',
        },
      },
      admin: {
        background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
        color: 'white',
        boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: '0 0 25px rgba(168, 85, 247, 0.4)',
        },
      },
    },
  },
  defaultVariants: {
    plan: 'free',
  },
});

const PlanModal = styled('div', {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '$4',
});

const PlanModalContent = styled('div', {
  backgroundColor: 'var(--card-bg)',
  borderRadius: '$lg',
  padding: '$8',
  maxWidth: '500px',
  width: '100%',
  maxHeight: '80vh',
  overflowY: 'auto',
  position: 'relative',
});

const ModalHeader = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '$6',
});

const ModalTitle = styled('h2', {
  fontSize: '$2xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
});

const CloseButton = styled('button', {
  width: '32px',
  height: '32px',
  borderRadius: '$full',
  border: 'none',
  backgroundColor: 'var(--bg-tertiary)',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: 'var(--bg-secondary)',
  },
});

const CurrentPlanSection = styled('div', {
  padding: '$6',
  backgroundColor: 'var(--bg-secondary)',
  borderRadius: '$lg',
  marginBottom: '$6',
});

const CurrentPlanLabel = styled('div', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
  marginBottom: '$2',
});

const CurrentPlanName = styled('div', {
  fontSize: '$3xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
});

const PlanOption = styled('div', {
  padding: '$4',
  border: '2px solid var(--border-color)',
  borderRadius: '$lg',
  marginBottom: '$3',
  transition: 'all 0.2s',
});

const PlanOptionHeader = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '$2',
});

const PlanOptionName = styled('div', {
  fontSize: '$lg',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
});

const PlanOptionPrice = styled('div', {
  fontSize: '$xl',
  fontWeight: '$bold',
  color: 'var(--primary-color)',
});

const PlanOptionDescription = styled('div', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
  lineHeight: '1.6',
});

const ActionButton = styled('button', {
  width: '100%',
  padding: '$3',
  borderRadius: '$lg',
  fontSize: '$base',
  fontWeight: '$semibold',
  cursor: 'pointer',
  border: 'none',
  transition: 'all 0.2s',
  marginTop: '$4',

  variants: {
    variant: {
      primary: {
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        '&:hover': {
          backgroundColor: 'var(--primary-hover)',
        },
      },
      danger: {
        backgroundColor: '#dc2626',
        color: 'white',
        '&:hover': {
          backgroundColor: '#991b1b',
        },
      },
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

const AvalancheIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 19h20L12 2zm0 4l7 13H5l7-13z" />
  </svg>
);

interface HeaderProps {
  isAuthenticated?: boolean;
  showCreateButton?: boolean;
  createButtonText?: string;
  createButtonHref?: string;
}

const Header: React.FC<HeaderProps> = ({
  isAuthenticated = false,
  showCreateButton = false,
  createButtonText = 'Create',
  createButtonHref = '#'
}) => {
  const { theme, toggleTheme } = useTheme();
  const { setIsAIChatOpen } = useContext(AIChatContext);
  const { itemCount } = useCart();
  const [user, setUser] = useState<{ username?: string; first_name?: string; last_name?: string; avatar_url?: string; plan?: string; role?: string } | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const loadUser = async () => {
        try {
          const userData = await API.auth.getMe();
          setUser(userData);
        } catch (error) {
          console.error('Failed to load user:', error);
        }
      };
      loadUser();
    }
  }, [isAuthenticated]);

  const handleCreateClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isAuthenticated) {
      e.preventDefault();
      // Redirect to login with return URL
      window.location.href = `/login?redirect=${encodeURIComponent(createButtonHref)}`;
    }
    // If authenticated, allow the Link to handle navigation normally
  };

  const handleLogout = () => {
    // Clear all auth-related data from localStorage
    localStorage.removeItem('avalanche_token');
    localStorage.removeItem('avalanche_user');

    // Clear any cached guild data that might persist
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('guilds_cache_')) {
        sessionStorage.removeItem(key);
      }
    });

    // Clear user state immediately
    setUser(null);

    // Force a full page reload to clear all state
    window.location.href = '/';
  };

  const handleAIChatClick = () => {
    setIsAIChatOpen(true);
  };

  const getUserInitial = () => {
    if (user?.username) return user.username.charAt(0).toUpperCase();
    if (user?.first_name) return user.first_name.charAt(0).toUpperCase();
    return 'U';
  };

  const getPlanIcon = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'pro':
        return <Zap size={16} />;
      case 'business':
        return <Crown size={16} />;
      case 'admin':
        return <Shield size={16} />;
      default:
        return null;
    }
  };

  const getPlanVariant = (plan: string): 'free' | 'pro' | 'business' | 'admin' => {
    const planLower = plan?.toLowerCase();
    if (planLower === 'pro') return 'pro';
    if (planLower === 'business') return 'business';
    if (planLower === 'admin') return 'admin';
    return 'free';
  };

  const handleUpgradePlan = async (newPlan: string) => {
    try {
      // This assumes you have an API service method like `API.ai.subscription.selectPlan`
      // which handles the actual fetch call, headers, and base URL.
      const data = await API.ai.subscription.selectPlan(newPlan);

      if (data.redirect_to_dashboard) {
        // Free tier or downgrade - just refresh to update state
        window.location.reload();
      } else if (data.checkout_url) {
        // Paid tier - redirect to Stripe
        window.location.href = data.checkout_url;
      } else {
        // Handle cases where neither is present, though the backend should always provide one.
        window.location.reload();
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      // It's better to show a more user-friendly error message, maybe a toast notification
      alert((error as Error).message || 'Failed to update plan. Please try again.');
    }
  };

  const handleDeletePlan = async () => {
    if (!window.confirm('Are you sure you want to downgrade to the Free plan? This will remove all premium features.')) {
      return;
    }
    try {
      // Re-use the same centralized API call
      await handleUpgradePlan('free');
      setShowPlanModal(false);
    } catch (error) {
      console.error('Error downgrading plan:', error);
      alert((error as Error).message || 'Failed to downgrade plan. Please try again.');
    }
  };

  // Determine where logo should link based on authentication and role
  const logoLink = isAuthenticated && user?.role === 'admin' ? '/admin' : (isAuthenticated ? '/dashboard' : '/');

  return (
    <HeaderContainer>
      <Logo as={Link} to={logoLink}>
        <AvalancheIcon />
        Avalanche
      </Logo>

      <Nav>
        <NavLink to="/marketplace">Marketplace</NavLink>
        <NavLink to="/guilds">Guilds</NavLink>
        <NavLink to="/projects">Projects</NavLink>
        <NavLink to="/about">About</NavLink>
      </Nav>

      <Actions>
        {showCreateButton && (
          <AuthButton 
            variant="primary" 
            as={Link} 
            to={createButtonHref}
            onClick={handleCreateClick}
          >
            {createButtonText}
          </AuthButton>
        )}

        {/* Shopping Cart - visible to everyone */}
        <CartIconWrapper to="/cart" aria-label="Shopping Cart">
          <ShoppingCart size={20} />
          {itemCount > 0 && <CartBadge>{itemCount}</CartBadge>}
        </CartIconWrapper>

        {isAuthenticated ? (
          <>
            {/* AI Chat Assistant - available to all users (admin has full access, others have token limitations) */}
            {user && (
              <IconButton aria-label="AI Chat Assistant" onClick={handleAIChatClick}>
                <Sparkles size={20} />
              </IconButton>
            )}

            {/* Admin-specific controls */}
            {user && user.role === 'admin' && (
              <IconButton
                as={Link}
                to={window.location.pathname.startsWith('/admin') ? '/dashboard' : '/admin'}
                aria-label={window.location.pathname.startsWith('/admin') ? 'Switch to User View' : 'Switch to Admin View'}
                title={window.location.pathname.startsWith('/admin') ? 'Switch to User View' : 'Switch to Admin View'}
                style={{
                  backgroundColor: window.location.pathname.startsWith('/admin') ? 'var(--primary-color)' : 'transparent',
                  color: window.location.pathname.startsWith('/admin') ? 'white' : 'var(--text-primary)'
                }}
              >
                {window.location.pathname.startsWith('/admin') ? <Users size={20} /> : <LayoutDashboard size={20} />}
              </IconButton>
            )}

            {/* Plan Badge Button - for all users */}
            {user && (
              <PlanBadge
                plan={getPlanVariant(user.role === 'admin' ? 'admin' : user.plan || 'free')}
                onClick={() => setShowPlanModal(true)}
                aria-label="Manage Plan"
              >
                {getPlanIcon(user.role === 'admin' ? 'admin' : user.plan || 'free')}
                {user.role === 'admin' ? 'Admin' : (user.plan || 'Free').toUpperCase()}
              </PlanBadge>
            )}

            <IconButton aria-label="Notifications">
              <Bell size={20} />
            </IconButton>
            <ProfileAvatar to="/settings" aria-label="User Profile">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" />
              ) : (
                getUserInitial()
              )}
            </ProfileAvatar>
          </>
        ) : (
          <>
            <IconButton aria-label="Admin Login" as={Link} to="/admin/login">
              <Shield size={20} />
            </IconButton>
            <AuthButton variant="outline" as={Link} to="/login">
              Login
            </AuthButton>
            <AuthButton variant="primary" as={Link} to="/signup">
              Sign Up
            </AuthButton>
          </>
        )}

        <IconButton aria-label="Toggle theme" onClick={toggleTheme}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </IconButton>
      </Actions>

      {/* Plan Management Modal */}
      {showPlanModal && user && (
        <PlanModal onClick={() => setShowPlanModal(false)}>
          <PlanModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Manage Your Plan</ModalTitle>
              <CloseButton onClick={() => setShowPlanModal(false)}>
                <X size={18} />
              </CloseButton>
            </ModalHeader>

            <CurrentPlanSection>
              <CurrentPlanLabel>Current Plan</CurrentPlanLabel>
              <CurrentPlanName>
                {getPlanIcon(user.role === 'admin' ? 'admin' : user.plan || 'free')}
                {user.role === 'admin' ? 'Admin' : (user.plan || 'Free')}
              </CurrentPlanName>
            </CurrentPlanSection>

            {user.role !== 'admin' && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-primary)' }}>
                    {user.plan === 'free' || !user.plan ? 'Upgrade Your Plan' : 'Change Your Plan'}
                  </h3>

                  {/* Free Tier User - Show Upgrade to Pro and Business */}
                  {(user.plan === 'free' || !user.plan) && (
                    <>
                      <PlanOption>
                        <PlanOptionHeader>
                          <PlanOptionName>
                            <Zap size={18} />
                            Professional
                          </PlanOptionName>
                          <PlanOptionPrice>$19.99/mo</PlanOptionPrice>
                        </PlanOptionHeader>
                        <PlanOptionDescription>
                          1,000 AI messages/month (500K tokens), 50 product listings, 10 guilds, 20 projects, 2-hour session memory, 8K tokens per session, Advanced analytics & insights, Bulk upload, advanced search, Fast response time
                        </PlanOptionDescription>
                        <ActionButton
                          variant="primary"
                          onClick={() => handleUpgradePlan('pro')}
                          style={{ marginTop: '12px' }}
                        >
                          Upgrade to Professional
                        </ActionButton>
                      </PlanOption>

                      <PlanOption>
                        <PlanOptionHeader>
                          <PlanOptionName>
                            <Crown size={18} />
                            Business
                          </PlanOptionName>
                          <PlanOptionPrice>$49.99/mo</PlanOptionPrice>
                        </PlanOptionHeader>
                        <PlanOptionDescription>
                          5,000 AI messages/month (2M tokens), Unlimited listings, guilds & projects, 8-hour session memory, 16K tokens per session, AI sales optimization, API access & custom training, Team members (10 users), White-label options, Instant response time
                        </PlanOptionDescription>
                        <ActionButton
                          variant="primary"
                          onClick={() => handleUpgradePlan('business')}
                          style={{ marginTop: '12px' }}
                        >
                          Upgrade to Business
                        </ActionButton>
                      </PlanOption>
                    </>
                  )}

                  {/* Pro Tier User - Show Upgrade to Business and Downgrade to Free */}
                  {user.plan === 'pro' && (
                    <>
                      <PlanOption>
                        <PlanOptionHeader>
                          <PlanOptionName>
                            <Crown size={18} />
                            Business
                          </PlanOptionName>
                          <PlanOptionPrice>$49.99/mo</PlanOptionPrice>
                        </PlanOptionHeader>
                        <PlanOptionDescription>
                          5,000 AI messages/month (2M tokens), Unlimited listings, guilds & projects, 8-hour session memory, 16K tokens per session, AI sales optimization, API access & custom training, Team members (10 users), White-label options, Instant response time
                        </PlanOptionDescription>
                        <ActionButton
                          variant="primary"
                          onClick={() => handleUpgradePlan('business')}
                          style={{ marginTop: '12px' }}
                        >
                          Upgrade to Business
                        </ActionButton>
                      </PlanOption>

                      <PlanOption>
                        <PlanOptionHeader>
                          <PlanOptionName>Free</PlanOptionName>
                          <PlanOptionPrice>$0</PlanOptionPrice>
                        </PlanOptionHeader>
                        <PlanOptionDescription>
                          Basic features for getting started
                        </PlanOptionDescription>
                        <ActionButton
                          variant="danger"
                          onClick={() => handleUpgradePlan('free')}
                          style={{ marginTop: '12px' }}
                        >
                          Downgrade to Free
                        </ActionButton>
                      </PlanOption>
                    </>
                  )}

                  {/* Business Tier User - Show Downgrade to Pro and Free */}
                  {user.plan === 'business' && (
                    <>
                      <PlanOption>
                        <PlanOptionHeader>
                          <PlanOptionName>
                            <Zap size={18} />
                            Pro
                          </PlanOptionName>
                          <PlanOptionPrice>$29/mo</PlanOptionPrice>
                        </PlanOptionHeader>
                        <PlanOptionDescription>
                          Advanced features for professionals and growing teams
                        </PlanOptionDescription>
                        <ActionButton
                          variant="danger"
                          onClick={() => handleUpgradePlan('pro')}
                          style={{ marginTop: '12px' }}
                        >
                          Downgrade to Pro
                        </ActionButton>
                      </PlanOption>

                      <PlanOption>
                        <PlanOptionHeader>
                          <PlanOptionName>Free</PlanOptionName>
                          <PlanOptionPrice>$0</PlanOptionPrice>
                        </PlanOptionHeader>
                        <PlanOptionDescription>
                          Basic features for getting started
                        </PlanOptionDescription>
                        <ActionButton
                          variant="danger"
                          onClick={() => handleUpgradePlan('free')}
                          style={{ marginTop: '12px' }}
                        >
                          Downgrade to Free
                        </ActionButton>
                      </PlanOption>
                    </>
                  )}
                </div>
              </>
            )}

            {user.role === 'admin' && (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '16px' }}>
                <p>As an admin, you have access to all features.</p>
              </div>
            )}
          </PlanModalContent>
        </PlanModal>
      )}
    </HeaderContainer>
  );
};

export default Header;
