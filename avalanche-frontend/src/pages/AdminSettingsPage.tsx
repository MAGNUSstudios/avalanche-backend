import React from 'react';
import { Link } from 'react-router-dom';
import { styled } from '../stitches.config';
import {
  LayoutDashboard,
  Receipt,
  Users as UsersIcon,
  TrendingUp,
  Settings,
  LogOut,
  Camera,
  Lock,
  Eye,
  EyeOff,
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
  maxWidth: '900px',
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
});

const SectionTitle = styled('h2', {
  fontSize: '$lg',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
  marginBottom: '$1',
});

const SectionDescription = styled('p', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
});

const SectionContent = styled('div', {
  padding: '$6',
  display: 'flex',
  flexDirection: 'column',
  gap: '$6',
});

const FormRow = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '$6',

  variants: {
    single: {
      true: {
        gridTemplateColumns: '1fr',
      },
    },
  },
});

const FormGroup = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
});

const Label = styled('label', {
  fontSize: '$sm',
  fontWeight: '$medium',
  color: 'var(--text-primary)',
});

const Input = styled('input', {
  padding: '$4',
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '$base',
  fontSize: '$base',
  color: 'var(--text-primary)',
  minHeight: '48px',

  '&:focus': {
    outline: 'none',
    borderColor: 'var(--primary-color)',
    backgroundColor: 'var(--card-bg)',
  },

  '&::placeholder': {
    color: 'var(--text-secondary)',
  },
});

const ProfilePictureSection = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$6',
  padding: '$6',
  borderRadius: '$base',
  backgroundColor: 'var(--bg-secondary)',
});

const ProfilePictureContainer = styled('div', {
  position: 'relative',
});

const ProfilePicture = styled('div', {
  width: '100px',
  height: '100px',
  borderRadius: '$full',
  backgroundColor: 'var(--bg-tertiary)',
  overflow: 'hidden',
  border: '3px solid var(--border-color)',

  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

const UploadButton = styled('label', {
  position: 'absolute',
  bottom: 0,
  right: 0,
  width: '36px',
  height: '36px',
  borderRadius: '$full',
  backgroundColor: 'var(--primary-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  border: '3px solid var(--card-bg)',
  color: 'white',
  transition: 'all 0.2s',

  '&:hover': {
    backgroundColor: 'var(--primary-hover)',
    transform: 'scale(1.1)',
  },

  input: {
    display: 'none',
  },
});

const ProfileInfo = styled('div', {
  flex: 1,
});

const ProfileName = styled('h3', {
  fontSize: '$xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  marginBottom: '$1',
});

const ProfileEmail = styled('p', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
  marginBottom: '$3',
});

const UploadHint = styled('p', {
  fontSize: '$xs',
  color: 'var(--text-secondary)',
});

const PasswordInputWrapper = styled('div', {
  position: 'relative',
  width: '100%',

  'input': {
    paddingRight: '$10', // Make room for the toggle button
  },
});

const PasswordToggleButton = styled('button', {
  position: 'absolute',
  right: '$3',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  padding: '$2',
  display: 'flex',
  alignItems: 'center',
  transition: 'color 0.2s ease',

  '&:hover': {
    color: 'var(--text-primary)',
  },

  '&:focus': {
    outline: 'none',
    color: 'var(--primary-color)',
  },
});

const ActionButton = styled('button', {
  padding: '$3 $4',
  backgroundColor: 'var(--primary-color)',
  border: 'none',
  borderRadius: '$base',
  fontSize: '$sm',
  color: 'white',
  cursor: 'pointer',
  fontWeight: '$medium',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$2',

  '&:hover': {
    backgroundColor: 'var(--primary-hover)',
  },

  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },

  variants: {
    variant: {
      danger: {
        backgroundColor: '#ef4444',
        '&:hover': {
          backgroundColor: '#dc2626',
        },
      },
      secondary: {
        backgroundColor: 'transparent',
        border: '1px solid var(--border-color)',
        color: 'var(--text-primary)',
        '&:hover': {
          backgroundColor: 'var(--bg-secondary)',
        },
      },
    },
    fullWidth: {
      true: {
        width: '100%',
      },
    },
  },
});

const AdminSettingsPage: React.FC = () => {
  // Use admin context for profile data
  const { adminData, refreshAdminData } = useAdmin();

  // Admin profile state
  const [adminProfile, setAdminProfile] = React.useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    avatar_url: ''
  });
  const [profilePicture, setProfilePicture] = React.useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = React.useState('');
  const [savingProfile, setSavingProfile] = React.useState(false);

  // Password change state
  const [passwordData, setPasswordData] = React.useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [changingPassword, setChangingPassword] = React.useState(false);

  // Update profile state when admin context data changes
  React.useEffect(() => {
    if (adminData) {
      setAdminProfile({
        email: adminData.email || '',
        username: adminData.username || '',
        first_name: adminData.first_name || '',
        last_name: adminData.last_name || '',
        avatar_url: adminData.avatar_url || ''
      });
      setProfilePicturePreview(adminData.avatar_url || 'https://i.pravatar.cc/150?img=12');
    }
  }, [adminData]);

  const handleLogout = () => {
    API.auth.logout();
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setSavingProfile(true);

      // Update admin profile
      await API.auth.updateAdminProfile(adminProfile);

      // Upload profile picture if changed
      if (profilePicture) {
        const formData = new FormData();
        formData.append('file', profilePicture);
        await API.auth.uploadAdminAvatar(formData);
      }

      // Refresh admin data in context
      await refreshAdminData();

      alert('Profile updated successfully!');
      setSavingProfile(false);
      setProfilePicture(null); // Clear the file input
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert(`Failed to update profile: ${error instanceof Error ? error.message : 'Please try again.'}`);
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    // Validation: Check if all fields are filled
    if (!passwordData.current_password) {
      alert('Please enter your current password');
      return;
    }

    if (!passwordData.new_password) {
      alert('Please enter a new password');
      return;
    }

    if (!passwordData.confirm_password) {
      alert('Please confirm your new password');
      return;
    }

    // Validation: Check password length
    if (passwordData.new_password.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }

    // Validation: Check if passwords match
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('New password and confirm password do not match!');
      return;
    }

    // Validation: Check if new password is different from current
    if (passwordData.current_password === passwordData.new_password) {
      alert('New password must be different from current password');
      return;
    }

    try {
      setChangingPassword(true);
      await API.auth.changeAdminPassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });

      alert('Password changed successfully! Please use your new password the next time you log in.');

      // Clear all password fields
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });

      // Reset password visibility toggles
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      setChangingPassword(false);
    } catch (error) {
      console.error('Failed to change password:', error);

      // More specific error messages
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      if (errorMessage.includes('Current password is incorrect') || errorMessage.includes('incorrect')) {
        alert('Current password is incorrect. Please try again.');
      } else if (errorMessage.includes('8 characters')) {
        alert('Password must be at least 8 characters long!');
      } else {
        alert(`Failed to change password: ${errorMessage}`);
      }

      setChangingPassword(false);
    }
  };

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
          <NavItem as={Link} to="/admin/ai-analytics">
            <TrendingUp size={18} />
            AI Analytics
          </NavItem>
          <NavItem as={Link} to="/admin/users">
            <UsersIcon size={18} />
            Users
          </NavItem>
          <NavItem active as={Link} to="/admin/settings">
            <Settings size={18} />
            Settings
          </NavItem>
        </Nav>
      </Sidebar>

      <MainContent>
        <TopBar>
          <PageTitle>Admin Settings</PageTitle>
          <TopBarActions>
            <NotificationDropdown />
            <UserAvatar>
              <img src={profilePicturePreview} alt="Admin" />
            </UserAvatar>
            <LogoutButton onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </LogoutButton>
          </TopBarActions>
        </TopBar>

        <ContentArea>
          {/* Admin Profile Section */}
          <Section>
            <SectionHeader>
              <SectionTitle>Admin Profile</SectionTitle>
              <SectionDescription>Manage your admin account information and credentials.</SectionDescription>
            </SectionHeader>
            <SectionContent>
              <ProfilePictureSection>
                <ProfilePictureContainer>
                  <ProfilePicture>
                    <img src={profilePicturePreview || 'https://i.pravatar.cc/150?img=12'} alt="Admin Profile" />
                  </ProfilePicture>
                  <UploadButton>
                    <Camera size={18} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                    />
                  </UploadButton>
                </ProfilePictureContainer>
                <ProfileInfo>
                  <ProfileName>{adminProfile.first_name} {adminProfile.last_name}</ProfileName>
                  <ProfileEmail>{adminProfile.email}</ProfileEmail>
                  <UploadHint>Click the camera icon to upload a new profile picture (JPG, PNG, max 5MB)</UploadHint>
                </ProfileInfo>
              </ProfilePictureSection>

              <FormRow>
                <FormGroup>
                  <Label>First Name</Label>
                  <Input
                    type="text"
                    value={adminProfile.first_name}
                    onChange={(e) => setAdminProfile({ ...adminProfile, first_name: e.target.value })}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Last Name</Label>
                  <Input
                    type="text"
                    value={adminProfile.last_name}
                    onChange={(e) => setAdminProfile({ ...adminProfile, last_name: e.target.value })}
                  />
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Label>Username</Label>
                  <Input
                    type="text"
                    value={adminProfile.username}
                    onChange={(e) => setAdminProfile({ ...adminProfile, username: e.target.value })}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={adminProfile.email}
                    onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                  />
                </FormGroup>
              </FormRow>

              <FormRow single>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <ActionButton variant="secondary" onClick={() => window.location.reload()}>
                    Cancel
                  </ActionButton>
                  <ActionButton onClick={handleProfileUpdate} disabled={savingProfile}>
                    {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </ActionButton>
                </div>
              </FormRow>
            </SectionContent>
          </Section>

          {/* Change Password Section */}
          <Section>
            <SectionHeader>
              <SectionTitle>Change Password</SectionTitle>
              <SectionDescription>Update your admin account password for security.</SectionDescription>
            </SectionHeader>
            <SectionContent>
              <FormRow single>
                <FormGroup>
                  <Label>Current Password</Label>
                  <PasswordInputWrapper>
                    <Input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                      placeholder="Enter current password"
                    />
                    <PasswordToggleButton
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </PasswordToggleButton>
                  </PasswordInputWrapper>
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Label>New Password</Label>
                  <PasswordInputWrapper>
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      placeholder="Enter new password (min 8 characters)"
                    />
                    <PasswordToggleButton
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </PasswordToggleButton>
                  </PasswordInputWrapper>
                </FormGroup>
                <FormGroup>
                  <Label>Confirm New Password</Label>
                  <PasswordInputWrapper>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      placeholder="Confirm new password"
                    />
                    <PasswordToggleButton
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </PasswordToggleButton>
                  </PasswordInputWrapper>
                </FormGroup>
              </FormRow>

              <FormRow single>
                <ActionButton fullWidth onClick={handlePasswordChange} disabled={changingPassword}>
                  <Lock size={18} />
                  {changingPassword ? 'Changing Password...' : 'Change Password'}
                </ActionButton>
              </FormRow>
            </SectionContent>
          </Section>
        </ContentArea>
      </MainContent>
    </PageContainer>
  );
};

export default AdminSettingsPage;
