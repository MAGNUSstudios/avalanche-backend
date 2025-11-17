import React, { useState, useEffect } from 'react';
import { styled } from '../../stitches.config';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Users as UsersIcon,
  TrendingUp,
  Settings,
  LogOut,
} from 'lucide-react';
import API from '../../services/api';
import NotificationDropdown from '../NotificationDropdown';

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
  flex: 1,
});

const NavItem = styled(Link, {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  padding: '$3 $4',
  borderRadius: '$base',
  color: 'var(--text-secondary)',
  textDecoration: 'none',
  transition: 'all 0.2s',
  fontSize: '$sm',
  fontWeight: '$medium',

  '&:hover': {
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
  },

  variants: {
    active: {
      true: {
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        color: 'var(--primary-color)',
        fontWeight: '$semibold',
      },
    },
  },
});

const MainContent = styled('div', {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

const TopBar = styled('div', {
  padding: '$6',
  backgroundColor: 'var(--card-bg)',
  borderBottom: '1px solid var(--border-color)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const PageTitle = styled('h1', {
  fontSize: '$2xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  margin: 0,
});

const TopBarActions = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$4',
});

const UserAvatar = styled('div', {
  width: '36px',
  height: '36px',
  borderRadius: '$full',
  overflow: 'hidden',
  cursor: 'pointer',
  border: '2px solid var(--border-color)',

  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

const LogoutButtonHeader = styled('button', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$2 $4',
  borderRadius: '$base',
  color: '#ef4444',
  backgroundColor: 'transparent',
  border: '1px solid #ef4444',
  fontSize: '$sm',
  fontWeight: '$medium',
  cursor: 'pointer',
  transition: 'all 0.2s',

  '&:hover': {
    backgroundColor: '#ef4444',
    color: 'white',
  },
});

const ContentArea = styled('div', {
  flex: 1,
  padding: '$6',
  overflowY: 'auto',
  backgroundColor: 'var(--bg-primary)',
});

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: 'dashboard' | 'transactions' | 'guilds' | 'ai-analytics' | 'users' | 'settings';
  pageTitle: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentPage, pageTitle }) => {
  const [user, setUser] = useState<{ avatar_url?: string; username?: string; first_name?: string } | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await API.auth.getMe();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    API.auth.logout();
  };

  const getUserInitial = () => {
    if (user?.username) return user.username.charAt(0).toUpperCase();
    if (user?.first_name) return user.first_name.charAt(0).toUpperCase();
    return 'A';
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
          <NavItem to="/admin/dashboard" active={currentPage === 'dashboard'}>
            <LayoutDashboard size={18} />
            Dashboard
          </NavItem>
          <NavItem to="/admin/transactions" active={currentPage === 'transactions'}>
            <Receipt size={18} />
            Transactions
          </NavItem>
          <NavItem to="/admin/guilds" active={currentPage === 'guilds'}>
            <UsersIcon size={18} />
            Guilds
          </NavItem>
          <NavItem to="/admin/ai-analytics" active={currentPage === 'ai-analytics'}>
            <TrendingUp size={18} />
            AI Analytics
          </NavItem>
          <NavItem to="/admin/users" active={currentPage === 'users'}>
            <UsersIcon size={18} />
            Users
          </NavItem>
          <NavItem to="/admin/settings" active={currentPage === 'settings'}>
            <Settings size={18} />
            Settings
          </NavItem>
        </Nav>
      </Sidebar>

      <MainContent>
        <TopBar>
          <PageTitle>{pageTitle}</PageTitle>
          <TopBarActions>
            <NotificationDropdown />
            <UserAvatar>
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Admin"
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: '600'
                }}>
                  {getUserInitial()}
                </div>
              )}
            </UserAvatar>
            <LogoutButtonHeader onClick={handleLogout}>
              <LogOut size={18} />
              Logout
            </LogoutButtonHeader>
          </TopBarActions>
        </TopBar>

        <ContentArea>
          {children}
        </ContentArea>
      </MainContent>
    </PageContainer>
  );
};

export default AdminLayout;
