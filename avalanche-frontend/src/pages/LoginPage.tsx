import React, { useState, useEffect } from 'react';
import { styled } from '../stitches.config';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import API from '../services/api';

const PageContainer = styled('div', {
  minHeight: '100vh',
  display: 'flex',
});

const LeftPanel = styled('div', {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$12',
  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1e40af 100%)',
  position: 'relative',
  overflow: 'hidden',

  '@media (max-width: 968px)': {
    display: 'none',
  },
});

const LeftContent = styled('div', {
  position: 'relative',
  zIndex: 1,
  textAlign: 'center',
  color: 'white',
  maxWidth: '480px',
  padding: '$8',
});

const LeftTitle = styled('h1', {
  fontSize: '56px',
  fontWeight: '$bold',
  marginBottom: '$6',
  lineHeight: '1.1',
});

const LeftSubtitle = styled('p', {
  fontSize: '$lg',
  opacity: 0.95,
  lineHeight: '1.7',
});

const RightPanel = styled('div', {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$8',
  backgroundColor: 'var(--bg-primary)',

  '@media (max-width: 968px)': {
    flex: 'none',
    width: '100%',
  },
});

const FormContainer = styled('div', {
  width: '100%',
  maxWidth: '460px',
});

const Logo = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  marginBottom: '$10',
});

const LogoIcon = styled('div', {
  width: '48px',
  height: '48px',
  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  borderRadius: '$lg',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '$2xl',
});

const LogoText = styled('span', {
  fontSize: '$2xl',
  fontWeight: '$bold',
  color: 'white',
});

const Title = styled('h2', {
  fontSize: '$3xl',
  fontWeight: '$bold',
  color: 'white',
  marginBottom: '$3',
});

const Subtitle = styled('p', {
  fontSize: '$base',
  color: 'var(--text-secondary)',
  marginBottom: '$10',
});

const Form = styled('form', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$6',
});

const FormGroup = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
});

const Label = styled('label', {
  fontSize: '$sm',
  fontWeight: '$medium',
  color: 'white',
});

const InputWrapper = styled('div', {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
});

const Input = styled('input', {
  width: '100%',
  padding: '$4',
  backgroundColor: 'var(--input-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '$base',
  fontSize: '$base',
  color: 'white',
  transition: 'all 0.2s ease',

  '&::placeholder': {
    color: 'var(--text-tertiary)',
  },

  '&:focus': {
    outline: 'none',
    borderColor: 'var(--primary-color)',
    backgroundColor: 'var(--input-bg)',
  },
});

const PasswordToggle = styled('button', {
  position: 'absolute',
  right: '$4',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-secondary)',
  padding: '$1',
  display: 'flex',
  alignItems: 'center',

  '&:hover': {
    color: 'white',
  },
});

const FormFooter = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '-$2',
});

const RememberMe = styled('label', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  fontSize: '$sm',
  color: 'white',
  cursor: 'pointer',

  input: {
    width: '18px',
    height: '18px',
    accentColor: 'var(--primary-color)',
    cursor: 'pointer',
  },
});

const ForgotLink = styled(Link, {
  fontSize: '$sm',
  color: 'var(--primary-color)',
  textDecoration: 'none',
  fontWeight: '$medium',

  '&:hover': {
    textDecoration: 'underline',
  },
});

const SubmitButton = styled('button', {
  width: '100%',
  padding: '$4',
  background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
  color: 'white',
  fontSize: '$base',
  fontWeight: '$semibold',
  border: 'none',
  borderRadius: '$base',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    opacity: 0.9,
    transform: 'translateY(-1px)',
    boxShadow: '0 10px 25px var(--primary-shadow)',
  },

  '&:active': {
    transform: 'translateY(0)',
  },
});

const Divider = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$4',
  margin: '$8 0',

  '&::before, &::after': {
    content: '',
    flex: 1,
    height: '1px',
    backgroundColor: 'var(--border-color)',
  },

  span: {
    fontSize: '$sm',
    color: 'var(--text-secondary)',
  },
});

const SocialButtons = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  gap: '$4',
});

const SocialButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$3',
  padding: '$3',
  backgroundColor: 'var(--card-bg)',
  border: 'none',
  borderRadius: '$base',
  fontSize: '$sm',
  fontWeight: '$medium',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: 'white',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
});

const SignupPrompt = styled('div', {
  marginTop: '$8',
  textAlign: 'center',
  fontSize: '$sm',
  color: 'var(--text-secondary)',

  a: {
    color: 'var(--primary-color)',
    fontWeight: '$semibold',
    textDecoration: 'none',
    marginLeft: '$2',

    '&:hover': {
      textDecoration: 'underline',
    },
  },
});

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);

  // Load Google OAuth SDK
  // Handle OAuth callback from Google redirect
  useEffect(() => {
    // Check if we're in a popup window (OAuth callback)
    if (window.opener && window.location.hash) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const idToken = params.get('id_token');
      const error = params.get('error');

      if (idToken) {
        // Send token back to parent window
        window.opener.postMessage(
          { type: 'GOOGLE_OAUTH_SUCCESS', id_token: idToken },
          window.location.origin
        );
        window.close();
      } else if (error) {
        // Send error back to parent window
        window.opener.postMessage(
          { type: 'GOOGLE_OAUTH_ERROR', error },
          window.location.origin
        );
        window.close();
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔄 Attempting login with:', formData.email);

    try {
      // Call backend API
      console.log('📡 Sending request to: http://localhost:8000/auth/login');

      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        mode: 'cors', // Explicitly set CORS mode
        credentials: 'omit', // Don't send cookies
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const data = await response.json().catch(() => ({ detail: 'Server error' }));
        throw new Error(data.detail || `Login failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Login successful:', data);

      // Save token to localStorage
      localStorage.setItem('avalanche_token', data.access_token);
      localStorage.setItem('avalanche_user', JSON.stringify(data.user));

      console.log('✅ Token saved to localStorage');
      console.log('🔄 Redirecting to dashboard...');

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('❌ Login failed:', error);
      console.error('❌ Error message:', message);
      alert('Login failed: ' + message);
    }
  };

  const handleGoogleLogin = async () => {
    setOauthLoading('google');

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // Check if OAuth is configured
    if (!clientId) {
      alert('Google OAuth is not configured. Please contact support or use email/password login.');
      setOauthLoading(null);
      return;
    }

    try {
      // Use traditional OAuth2 popup flow instead of One Tap/FedCM
      const redirectUri = encodeURIComponent(window.location.origin + '/login');
      const scope = encodeURIComponent('openid email profile');
      const responseType = 'id_token token';
      const nonce = Math.random().toString(36).substring(7);

      // Store nonce for verification
      sessionStorage.setItem('google_oauth_nonce', nonce);

      // Construct OAuth URL
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `response_type=${responseType}&` +
        `scope=${scope}&` +
        `nonce=${nonce}&` +
        `prompt=select_account`;

      // Open popup window
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        authUrl,
        'Google Sign In',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for message from popup
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
          try {
            const idToken = event.data.id_token;

            // Send ID token to backend
            const result = await API.auth.googleOAuth(idToken);

            // Save token
            localStorage.setItem('avalanche_token', result.access_token);
            localStorage.setItem('avalanche_user', JSON.stringify(result.user));

            // Redirect based on plan selection
            if (result.user.role === 'admin') {
              window.location.href = '/dashboard';
            } else if (!result.user.plan_selected) {
              window.location.href = '/select-plan';
            } else {
              window.location.href = '/dashboard';
            }
          } catch (error) {
            console.error('Google OAuth error:', error);
            alert('Google login failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
            setOauthLoading(null);
          }
        } else if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
          alert('Google login failed. Please try again.');
          setOauthLoading(null);
        }

        window.removeEventListener('message', handleMessage);
      };

      window.addEventListener('message', handleMessage);

      // Check if popup was blocked
      if (!popup || popup.closed) {
        alert('Popup was blocked. Please allow popups for this site.');
        setOauthLoading(null);
        window.removeEventListener('message', handleMessage);
      }
    } catch (error) {
      console.error('Google OAuth initialization error:', error);
      alert('Failed to initialize Google login. Please try again.');
      setOauthLoading(null);
    }
  };

  const handleGitHubLogin = async () => {
    setOauthLoading('github');

    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;

    // Check if OAuth is configured
    if (!clientId) {
      alert('GitHub OAuth is not configured. Please contact support or use email/password login.');
      setOauthLoading(null);
      return;
    }

    try {
      // GitHub OAuth - redirect to GitHub authorization
      const redirectUri = encodeURIComponent(window.location.origin + '/login');
      const scope = 'read:user user:email';
      const state = Math.random().toString(36).substring(7);

      // Store state for verification
      sessionStorage.setItem('github_oauth_state', state);

      // Redirect to GitHub
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      alert('Failed to initialize GitHub login. Please try again.');
      setOauthLoading(null);
    }
  };

  // Handle GitHub OAuth callback
  useEffect(() => {
    const handleGitHubCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const storedState = sessionStorage.getItem('github_oauth_state');

      if (code && state && state === storedState) {
        setOauthLoading('github');
        try {
          // Send code to backend
          const result = await API.auth.githubOAuth(code);

          // Save token
          localStorage.setItem('avalanche_token', result.access_token);
          localStorage.setItem('avalanche_user', JSON.stringify(result.user));

          // Clean up URL and state
          sessionStorage.removeItem('github_oauth_state');
          window.history.replaceState({}, document.title, '/login');

          // Redirect based on plan selection
          if (result.user.role === 'admin') {
            window.location.href = '/dashboard';
          } else if (!result.user.plan_selected) {
            window.location.href = '/select-plan';
          } else {
            window.location.href = '/dashboard';
          }
        } catch (error) {
          console.error('GitHub OAuth error:', error);
          alert('GitHub login failed. Please try again.');
          setOauthLoading(null);
        }
      }
    };

    handleGitHubCallback();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <PageContainer>
      <LeftPanel>
        <LeftContent>
          <LeftTitle>Welcome Back</LeftTitle>
          <LeftSubtitle>
            Join thousands of creators and innovators building the future with Avalanche. Connect, collaborate, and create amazing things together.
          </LeftSubtitle>
        </LeftContent>
      </LeftPanel>

      <RightPanel>
        <FormContainer>
          <Logo>
            <LogoIcon>≡</LogoIcon>
            <LogoText>Avalanche</LogoText>
          </Logo>

          <Title>Sign in to your account</Title>
          <Subtitle>Enter your credentials to access your account</Subtitle>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="email">Email address</Label>
              <InputWrapper>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="magnusstudios7@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="password">Password</Label>
              <InputWrapper>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </PasswordToggle>
              </InputWrapper>
            </FormGroup>

            <FormFooter>
              <RememberMe>
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                Remember me
              </RememberMe>
              <ForgotLink to="/forgot-password">Forgot password?</ForgotLink>
            </FormFooter>

            <SubmitButton type="submit">Sign in</SubmitButton>
          </Form>

          <Divider>
            <span>Or continue with</span>
          </Divider>

          <SocialButtons>
            <SocialButton
              type="button"
              onClick={handleGoogleLogin}
              disabled={oauthLoading !== null}
            >
              {oauthLoading === 'google' ? (
                'Loading...'
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </>
              )}
            </SocialButton>
          </SocialButtons>

          <SignupPrompt>
            Don't have an account?
            <Link to="/signup">Sign up</Link>
          </SignupPrompt>
        </FormContainer>
      </RightPanel>
    </PageContainer>
  );
};

export default LoginPage;
