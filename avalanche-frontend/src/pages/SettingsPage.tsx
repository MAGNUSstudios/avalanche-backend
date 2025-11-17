import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '../stitches.config';
import Layout from '../components/layout/Layout';
import Sidebar from '../components/layout/Sidebar';
import { User, Lock, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import API from '../services/api';

const PageContainer = styled('div', {
  display: 'flex',
  backgroundColor: 'var(--bg-secondary)',
  minHeight: 'calc(100vh - 73px)',
});

const MainContent = styled('main', {
  flex: 1,
  padding: '$8',
  maxWidth: '1200px',
});

const Header = styled('div', {
  marginBottom: '$8',
});

const Title = styled('h1', {
  fontSize: '$3xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  marginBottom: '$2',
});

const Subtitle = styled('p', {
  fontSize: '$base',
  color: 'var(--text-secondary)',
});

const ContentGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: '240px 1fr',
  gap: '$6',

  '@media (max-width: 968px)': {
    gridTemplateColumns: '1fr',
  },
});

const SettingsSidebar = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
});

const SidebarItem = styled('button', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  padding: '$3 $4',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '$base',
  fontSize: '$sm',
  fontWeight: '$medium',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  transition: 'all 0.2s',
  textAlign: 'left',

  '&:hover': {
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
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

const ContentArea = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$6',
});

const Section = styled('div', {
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '$lg',
  padding: '$6',
});

const SectionHeader = styled('div', {
  marginBottom: '$6',
});

const SectionTitle = styled('h2', {
  fontSize: '$xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  marginBottom: '$2',
});

const SectionDescription = styled('p', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
});

const ProfilePictureSection = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$6',
  paddingBottom: '$6',
  borderBottom: '1px solid var(--border-color)',
  marginBottom: '$6',
});

const Avatar = styled('div', {
  width: '80px',
  height: '80px',
  borderRadius: '$full',
  backgroundColor: 'var(--primary-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '$2xl',
  fontWeight: '$bold',
  overflow: 'hidden',
});

const AvatarImage = styled('img', {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const AvatarInfo = styled('div', {
  flex: 1,
});

const AvatarTitle = styled('h3', {
  fontSize: '$base',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
  marginBottom: '$1',
});

const AvatarSubtitle = styled('p', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
});

const UploadButton = styled('button', {
  padding: '$3 $5',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  border: 'none',
  borderRadius: '$base',
  fontSize: '$sm',
  fontWeight: '$semibold',
  cursor: 'pointer',
  transition: 'all 0.2s',

  '&:hover': {
    backgroundColor: 'var(--primary-hover)',
  },
});

const FormGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '$4',

  '@media (max-width: 640px)': {
    gridTemplateColumns: '1fr',
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
  padding: '$3 $4',
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '$base',
  fontSize: '$sm',
  color: 'var(--text-primary)',
  transition: 'all 0.2s',

  '&:focus': {
    outline: 'none',
    borderColor: 'var(--primary-color)',
  },

  '&::placeholder': {
    color: 'var(--text-secondary)',
  },
});

const SaveButton = styled('button', {
  padding: '$3 $6',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  border: 'none',
  borderRadius: '$base',
  fontSize: '$sm',
  fontWeight: '$semibold',
  cursor: 'pointer',
  transition: 'all 0.2s',
  marginTop: '$4',
  alignSelf: 'flex-end',

  '&:hover': {
    backgroundColor: 'var(--primary-hover)',
  },
});

const PreferenceItem = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '$4',
  marginBottom: '$4',
  borderBottom: '1px solid var(--border-color)',

  '&:last-child': {
    borderBottom: 'none',
    paddingBottom: 0,
    marginBottom: 0,
  },
});

const PreferenceInfo = styled('div', {});

const PreferenceTitle = styled('h4', {
  fontSize: '$sm',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
  marginBottom: '$1',
});

const PreferenceDescription = styled('p', {
  fontSize: '$xs',
  color: 'var(--text-secondary)',
});

const Toggle = styled('button', {
  width: '48px',
  height: '28px',
  backgroundColor: 'var(--border-color)',
  borderRadius: '$full',
  border: 'none',
  cursor: 'pointer',
  position: 'relative',
  transition: 'all 0.3s',

  '&::after': {
    content: '',
    position: 'absolute',
    width: '20px',
    height: '20px',
    backgroundColor: 'white',
    borderRadius: '$full',
    top: '4px',
    left: '4px',
    transition: 'all 0.3s',
  },

  variants: {
    active: {
      true: {
        backgroundColor: 'var(--primary-color)',

        '&::after': {
          left: '24px',
        },
      },
    },
  },
});

const Select = styled('select', {
  padding: '$3 $4',
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '$base',
  fontSize: '$sm',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  minWidth: '200px',

  '&:focus': {
    outline: 'none',
    borderColor: 'var(--primary-color)',
  },
});

interface User {
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || 'en');

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Notification states
  const [accountActivity, setAccountActivity] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [newBids, setNewBids] = useState(true);
  const [itemSold, setItemSold] = useState(false);

  // Privacy states
  const [shareAnonymizedData, setShareAnonymizedData] = useState(true);
  const [contributeToAI, setContributeToAI] = useState(false);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('avalanche_token');
    const storedUser = localStorage.getItem('avalanche_user');

    if (!token) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }

    setIsAuthenticated(true);

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setDisplayName(`${parsedUser.first_name} ${parsedUser.last_name}`);
        setUsername(parsedUser.email.split('@')[0]); // Generate username from email
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }, [navigate]);

  useEffect(() => {
    // Only sync the language state with localStorage when component mounts
    const storedLanguage = localStorage.getItem('avalanche_language') || 'en';
    setLanguage(storedLanguage);
  }, []); // Empty deps - only run once on mount

  const handleLogout = () => {
    localStorage.removeItem('avalanche_token');
    localStorage.removeItem('avalanche_user');
    window.location.href = '/';
  };

  const handleLanguageChange = async (newLang: string) => {
    try {
      console.log('Changing language to:', newLang, 'Type:', typeof newLang);

      // Ensure newLang is a string
      const langCode = String(newLang);

      // Validate language code
      const validLanguages = ['en', 'es', 'fr', 'de'];
      if (!validLanguages.includes(langCode)) {
        console.error('Invalid language code:', langCode);
        return;
      }

      // Update localStorage first
      localStorage.setItem('avalanche_language', langCode);

      // Verify it was saved correctly
      const savedValue = localStorage.getItem('avalanche_language');
      console.log('Language saved to localStorage:', savedValue, 'Type:', typeof savedValue);

      // Update local state
      setLanguage(langCode);

      // Change i18n language
      await i18n.changeLanguage(langCode);

      console.log('i18n language changed to:', i18n.language);

      // Sync with backend in the background (don't await - let it happen async)
      if (isAuthenticated) {
        API.settings.updateLanguage(langCode)
          .then(() => console.log('Language synced with backend successfully'))
          .catch((backendError) => console.error('Failed to sync language with backend:', backendError));
      }
    } catch (error) {
      console.error('Failed to update language:', error);
      alert(t('messages.errorOccurred'));
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(t('messages.errorOccurred'));
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert(t('messages.errorOccurred'));
      return;
    }

    try {
      setUploading(true);
      const updatedUser = await API.auth.uploadAvatar(file);

      // Update user state
      setUser(updatedUser);

      // Update localStorage
      localStorage.setItem('avalanche_user', JSON.stringify(updatedUser));

      alert(t('messages.success'));
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      alert(t('messages.errorOccurred'));
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveProfile = async () => {
    try {
      // Split display name into first and last name
      const nameParts = displayName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || nameParts[0] || '';

      if (!username || !firstName) {
        alert(t('messages.fillAllFields'));
        return;
      }

      console.log('Sending profile update:', { username, first_name: firstName, last_name: lastName });

      const token = localStorage.getItem('avalanche_token');
      const response = await fetch('http://localhost:8000/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          first_name: firstName,
          last_name: lastName,
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const updatedUser = await response.json();

      // Update user state and localStorage
      setUser(updatedUser);
      localStorage.setItem('avalanche_user', JSON.stringify(updatedUser));

      alert(t('messages.profileUpdated'));
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const errorMessage = error?.message || error?.detail || t('messages.errorOccurred');
      alert(t('messages.errorOccurred'));
    }
  };

  const handleChangePassword = async () => {
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      alert(t('messages.fillAllFields'));
      return;
    }

    if (newPassword !== confirmNewPassword) {
      alert(t('messages.passwordMismatch'));
      return;
    }

    if (newPassword.length < 8) {
      alert(t('messages.passwordTooShort'));
      return;
    }

    try {
      await API.settings.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      alert(t('messages.passwordChanged'));

      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      console.error('Failed to change password:', error);
      alert(t('messages.errorOccurred'));
    }
  };

  const handleChangeEmail = async () => {
    const newEmail = prompt('Enter your new email address:');
    if (!newEmail) return;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      alert(t('messages.errorOccurred'));
      return;
    }

    const password = prompt(t('settings.accountSection.passwordRequired'));
    if (!password) return;

    try {
      const result = await API.settings.changeEmail({
        new_email: newEmail,
        password,
      });

      alert(t('messages.emailUpdated'));

      // Update user email in state
      if (user) {
        const updatedUser = { ...user, email: newEmail };
        setUser(updatedUser);
        localStorage.setItem('avalanche_user', JSON.stringify(updatedUser));
      }
    } catch (error: any) {
      console.error('Failed to change email:', error);
      alert(t('messages.errorOccurred'));
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await API.settings.updateNotificationSettings({
        account_activity: accountActivity,
        security_alerts: securityAlerts,
        new_bids: newBids,
        item_sold: itemSold,
      });

      alert(t('messages.settingsSaved'));
    } catch (error: any) {
      console.error('Failed to save notification settings:', error);
      alert(t('messages.errorOccurred'));
    }
  };

  const handleSavePrivacy = async () => {
    try {
      await API.settings.updatePrivacySettings({
        share_anonymized_data: shareAnonymizedData,
        contribute_to_ai: contributeToAI,
        personalized_recommendations: personalizedRecommendations,
      });

      alert(t('messages.settingsSaved'));
    } catch (error: any) {
      console.error('Failed to save privacy settings:', error);
      alert(t('messages.errorOccurred'));
    }
  };

  const handleDownloadData = async () => {
    try {
      const result = await API.settings.exportData();

      // Create a downloadable JSON file
      const dataStr = JSON.stringify(result.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `avalanche-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert(t('messages.dataExported'));
    } catch (error: any) {
      console.error('Failed to download data:', error);
      alert(t('messages.errorOccurred'));
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action is permanent and cannot be undone.\n\nType "DELETE" to confirm.'
    );

    if (!confirmed) return;

    const verification = prompt('Type DELETE to confirm account deletion:');
    if (verification !== 'DELETE') {
      alert(t('messages.errorOccurred'));
      return;
    }

    const password = prompt(t('settings.accountSection.passwordRequired'));
    if (!password) {
      alert(t('messages.errorOccurred'));
      return;
    }

    try {
      await API.settings.deleteAccount({
        password,
        confirmation: 'DELETE',
      });

      alert(t('messages.accountDeleted'));

      // Log out and redirect
      localStorage.removeItem('avalanche_token');
      localStorage.removeItem('avalanche_user');
      window.location.href = '/';
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      alert(t('messages.errorOccurred'));
    }
  };

  const handleClearHistory = async () => {
    if (confirm(t('settings.privacySection.clearHistoryDesc'))) {
      try {
        await API.settings.clearHistory();
        alert(t('messages.historyCleared'));
      } catch (error: any) {
        console.error('Failed to clear history:', error);
        alert(t('messages.errorOccurred'));
      }
    }
  };

  const menuItems = [
    { id: 'profile', label: t('settings.profileSection.title'), icon: User },
    { id: 'security', label: t('settings.accountSection.title'), icon: Lock },
    { id: 'logout', label: t('nav.logout'), icon: LogOut },
  ];

  const handleMenuClick = (id: string) => {
    if (id === 'logout') {
      handleLogout();
    } else {
      setActiveTab(id);
    }
  };

  return (
    <Layout isAuthenticated={isAuthenticated} showFooter={false}>
      <PageContainer>
        <Sidebar user={user ? { name: `${user.first_name} ${user.last_name}`, level: 22, avatar: user.avatar_url } : undefined} />
        <MainContent>
          <Header>
            <Title>{t('settings.profileSection.title')}</Title>
            <Subtitle>{t('settings.profileSection.description')}</Subtitle>
          </Header>

          <ContentGrid>
            <SettingsSidebar>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarItem
                    key={item.id}
                    active={activeTab === item.id}
                    onClick={() => handleMenuClick(item.id)}
                  >
                    <Icon size={18} />
                    {item.label}
                  </SidebarItem>
                );
              })}
            </SettingsSidebar>

            <ContentArea>
              {activeTab === 'profile' && (
                <>
                  <Section>
                    <SectionHeader>
                      <SectionTitle>{t('settings.profileSection.avatar')}</SectionTitle>
                      <SectionDescription>
                        {t('settings.profileSection.description')}
                      </SectionDescription>
                    </SectionHeader>

                    <ProfilePictureSection>
                      <Avatar>
                        {user?.avatar_url ? (
                          <AvatarImage src={user.avatar_url} alt={user.first_name} />
                        ) : (
                          user ? user.first_name.charAt(0).toUpperCase() : 'M'
                        )}
                      </Avatar>
                      <AvatarInfo>
                        <AvatarTitle>{t('settings.profileSection.avatar')}</AvatarTitle>
                        <AvatarSubtitle>PNG, JPG up to 5MB</AvatarSubtitle>
                      </AvatarInfo>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleAvatarUpload}
                      />
                      <UploadButton onClick={handleUploadClick} disabled={uploading}>
                        {uploading ? t('common.loading') : t('settings.profileSection.uploadAvatar')}
                      </UploadButton>
                    </ProfilePictureSection>

                    <SectionHeader>
                      <SectionTitle>{t('auth.username')}</SectionTitle>
                      <SectionDescription>
                        {t('settings.profileSection.description')}
                      </SectionDescription>
                    </SectionHeader>

                    <FormGrid>
                      <FormGroup>
                        <Label htmlFor="username">{t('settings.profileSection.username')}</Label>
                        <Input
                          id="username"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label htmlFor="displayName">{t('auth.firstName')} {t('auth.lastName')}</Label>
                        <Input
                          id="displayName"
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                        />
                      </FormGroup>
                    </FormGrid>

                    <SaveButton onClick={handleSaveProfile}>{t('settings.profileSection.saveChanges')}</SaveButton>
                  </Section>

                  <Section>
                    <SectionHeader>
                      <SectionTitle>Theme</SectionTitle>
                      <SectionDescription>
                        Customize your display preferences
                      </SectionDescription>
                    </SectionHeader>

                    <PreferenceItem>
                      <PreferenceInfo>
                        <PreferenceTitle>Dark Mode</PreferenceTitle>
                        <PreferenceDescription>
                          Toggle between light and dark themes.
                        </PreferenceDescription>
                      </PreferenceInfo>
                      <Toggle active={theme === 'dark'} onClick={toggleTheme} />
                    </PreferenceItem>
                  </Section>
                </>
              )}

              {activeTab === 'security' && (
                <Section>
                  <SectionHeader>
                    <SectionTitle>{t('settings.accountSection.changePassword')}</SectionTitle>
                    <SectionDescription>
                      Update your password to keep your account secure
                    </SectionDescription>
                  </SectionHeader>

                  <FormGroup style={{ marginBottom: '$4' }}>
                    <Label htmlFor="currentPassword">{t('settings.accountSection.currentPassword')}</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder={t('settings.accountSection.currentPassword')}
                    />
                  </FormGroup>

                  <FormGrid>
                    <FormGroup>
                      <Label htmlFor="newPassword">{t('settings.accountSection.newPassword')}</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={t('settings.accountSection.newPassword')}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label htmlFor="confirmNewPassword">{t('settings.accountSection.confirmNewPassword')}</Label>
                      <Input
                        id="confirmNewPassword"
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder={t('settings.accountSection.confirmNewPassword')}
                      />
                    </FormGroup>
                  </FormGrid>

                  <SaveButton onClick={handleChangePassword}>{t('settings.accountSection.updatePassword')}</SaveButton>
                </Section>
              )}
            </ContentArea>
          </ContentGrid>
        </MainContent>
      </PageContainer>
    </Layout>
  );
};

export default SettingsPage;
