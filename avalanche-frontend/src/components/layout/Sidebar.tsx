import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { styled } from '../../stitches.config';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  FolderKanban,
  MessageSquare,
  Settings,
  Wallet,
  Shield,
} from 'lucide-react';

const SidebarContainer = styled('aside', {
  width: '260px',
  height: 'calc(100vh - 73px)',
  backgroundColor: 'var(--card-bg)',
  borderRight: '1px solid var(--border-color)',
  padding: '$6 0',
  position: 'sticky',
  top: '73px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
});

const SidebarNav = styled('nav', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
  padding: '0 $4',
  flex: 1,
});

const NavItem = styled(Link, {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  padding: '$3 $4',
  borderRadius: '$base',
  fontSize: '$sm',
  fontWeight: '$medium',
  color: 'var(--text-secondary)',
  textDecoration: 'none',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--primary-color)',
  },
  variants: {
    active: {
      true: {
        backgroundColor: 'var(--bg-tertiary)',
        color: 'var(--primary-color)',
      },
    },
  },
});

const UserProfile = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  padding: '$4',
  margin: '$6 $4 0',
  borderRadius: '$base',
  backgroundColor: 'var(--bg-tertiary)',
  marginTop: 'auto',
});

const Avatar = styled('div', {
  width: '40px',
  height: '40px',
  borderRadius: '$full',
  backgroundColor: 'var(--primary-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '$sm',
  fontWeight: '$semibold',
  overflow: 'hidden',
});

const AvatarImage = styled('img', {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const UserInfo = styled('div', {
  flex: 1,
});

const UserName = styled('div', {
  fontSize: '$sm',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
});

const UserRole = styled('div', {
  fontSize: '$xs',
  color: 'var(--text-secondary)',
});

interface SidebarProps {
  user?: {
    name: string;
    email?: string;
    role?: string;
    avatar?: string;
  };
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const location = useLocation();

  // Admin users should go to admin dashboard, regular users to user dashboard
  const dashboardPath = user?.role === 'admin' ? '/admin' : '/dashboard';

  const navItems = [
    { path: dashboardPath, label: 'Dashboard', icon: LayoutDashboard },
    { path: '/guilds', label: 'Guilds', icon: Users },
    { path: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { path: '/projects', label: 'Projects', icon: FolderKanban },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
    { path: '/escrow', label: 'Escrow', icon: Shield },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <SidebarContainer>
      <SidebarNav>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavItem key={item.path} to={item.path} active={isActive}>
              <Icon size={20} />
              {item.label}
            </NavItem>
          );
        })}


      </SidebarNav>

      {user && (
        <UserProfile>
          <Avatar>
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name} />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </Avatar>
          <UserInfo>
            <UserName>{user.name}</UserName>
            <UserRole>{user.role || user.email || 'Member'}</UserRole>
          </UserInfo>
        </UserProfile>
      )}


    </SidebarContainer>
  );
};

export default Sidebar;
