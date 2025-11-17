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
  overflowY: 'auto',

  '@media (max-width: 968px)': {
    flex: 'none',
    width: '100%',
  },
});

const FormContainer = styled('div', {
  width: '100%',
  maxWidth: '460px',
  paddingTop: '$4',
  paddingBottom: '$4',
});

const Logo = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  marginBottom: '$8',
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
  marginBottom: '$8',
});

const Form = styled('form', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$5',
});

const FormRow = styled('div', {
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

const Select = styled('select', {
  width: '100%',
  padding: '$4',
  backgroundColor: 'var(--input-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '$base',
  fontSize: '$base',
  color: 'white',
  transition: 'all 0.2s ease',
  cursor: 'pointer',

  '&:focus': {
    outline: 'none',
    borderColor: 'var(--primary-color)',
    backgroundColor: 'var(--input-bg)',
  },

  option: {
    backgroundColor: 'var(--bg-primary)',
    color: 'white',
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

const PasswordStrength = styled('div', {
  display: 'flex',
  gap: '$2',
  marginTop: '$2',
});

const StrengthBar = styled('div', {
  flex: 1,
  height: '4px',
  backgroundColor: 'var(--border-color)',
  borderRadius: '$full',
  transition: 'all 0.3s ease',

  variants: {
    active: {
      true: {},
    },
    strength: {
      weak: {
        backgroundColor: '#ef4444',
      },
      medium: {
        backgroundColor: '#f59e0b',
      },
      strong: {
        backgroundColor: '#10b981',
      },
    },
  },
});

const StrengthText = styled('span', {
  fontSize: '$xs',
  color: 'var(--text-secondary)',
  marginTop: '$1',
  textTransform: 'capitalize',
});

const TermsCheckbox = styled('label', {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '$3',
  fontSize: '$sm',
  color: 'white',
  cursor: 'pointer',

  input: {
    width: '18px',
    height: '18px',
    accentColor: 'var(--primary-color)',
    cursor: 'pointer',
    marginTop: '2px',
    flexShrink: 0,
  },

  a: {
    color: 'var(--primary-color)',
    textDecoration: 'none',
    fontWeight: '$medium',

    '&:hover': {
      textDecoration: 'underline',
    },
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

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none',
  },
});

const Divider = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$4',
  margin: '$6 0',

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

const LoginPrompt = styled('div', {
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

const SignupPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);

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

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return null;
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    return 'strong';
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      console.error('Passwords do not match');
      return;
    }
    
    // Validate password strength
    if (passwordStrength === 'weak') {
      console.error('Password too weak');
      return;
    }
    
    try {
      // Call backend API
      const response = await fetch('http://localhost:8000/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          country: formData.country,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Signup failed');
      }

      // Save token to localStorage
      localStorage.setItem('avalanche_token', data.access_token);
      localStorage.setItem('avalanche_user', JSON.stringify(data.user));

      // Redirect based on user role and plan selection status
      if (data.user.role === 'admin') {
        // Admins go directly to dashboard
        window.location.href = '/dashboard';
      } else if (!data.user.plan_selected) {
        // New users need to select a plan
        window.location.href = '/select-plan';
      } else {
        // Users with selected plan go to dashboard
        window.location.href = '/dashboard';
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Signup failed:', message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = type === 'checkbox' ? target.checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleGoogleSignup = async () => {
    setOauthLoading('google');

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // Check if OAuth is configured
    if (!clientId) {
      alert('Google OAuth is not configured. Please contact support or use email/password signup.');
      setOauthLoading(null);
      return;
    }

    try {
      // Use traditional OAuth2 popup flow instead of One Tap/FedCM
      const redirectUri = encodeURIComponent(window.location.origin + '/signup');
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
            alert('Google signup failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
            setOauthLoading(null);
          }
        } else if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
          alert('Google signup failed. Please try again.');
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
      alert('Failed to initialize Google signup. Please try again.');
      setOauthLoading(null);
    }
  };

  const handleGitHubSignup = async () => {
    setOauthLoading('github');

    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;

    // Check if OAuth is configured
    if (!clientId) {
      alert('GitHub OAuth is not configured. Please contact support or use email/password signup.');
      setOauthLoading(null);
      return;
    }

    try {
      // GitHub OAuth - redirect to GitHub authorization
      const redirectUri = encodeURIComponent(window.location.origin + '/signup');
      const scope = 'read:user user:email';
      const state = Math.random().toString(36).substring(7);

      // Store state for verification
      sessionStorage.setItem('github_oauth_state', state);

      // Redirect to GitHub
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      alert('Failed to initialize GitHub signup. Please try again.');
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
          window.history.replaceState({}, document.title, '/signup');

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
          alert('GitHub signup failed. Please try again.');
          setOauthLoading(null);
        }
      }
    };

    handleGitHubCallback();
  }, []);

  return (
    <PageContainer>
      <LeftPanel>
        <LeftContent>
          <LeftTitle>Join Avalanche</LeftTitle>
          <LeftSubtitle>
            Start your journey with Africa's premier AI-powered platform for collaboration and innovation.
            Connect with talented creators, build amazing projects, and grow your business.
          </LeftSubtitle>
        </LeftContent>
      </LeftPanel>

      <RightPanel>
        <FormContainer>
          <Logo>
            <LogoIcon>≡</LogoIcon>
            <LogoText>Avalanche</LogoText>
          </Logo>

          <Title>Create your account</Title>
          <Subtitle>Join thousands of creators building the future</Subtitle>

          <Form onSubmit={handleSubmit}>
            <FormRow>
              <FormGroup>
                <Label htmlFor="firstName">First name</Label>
                <InputWrapper>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </InputWrapper>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="lastName">Last name</Label>
                <InputWrapper>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </InputWrapper>
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label htmlFor="email">Email address</Label>
              <InputWrapper>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="country">Country</Label>
              <InputWrapper>
                <Select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your country</option>
                  <option value="NG">Nigeria</option>
                  <option value="KE">Kenya</option>
                  <option value="GH">Ghana</option>
                  <option value="ZA">South Africa</option>
                  <option value="EG">Egypt</option>
                  <option value="UG">Uganda</option>
                  <option value="TZ">Tanzania</option>
                  <option value="RW">Rwanda</option>
                  <option value="ET">Ethiopia</option>
                  <option value="OTHER">Other</option>
                </Select>
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="password">Password</Label>
              <InputWrapper>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
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
              {formData.password && (
                <>
                  <PasswordStrength>
                    <StrengthBar
                      active={passwordStrength !== null}
                      strength={passwordStrength === 'weak' ? 'weak' : undefined}
                    />
                    <StrengthBar
                      active={passwordStrength === 'medium' || passwordStrength === 'strong'}
                      strength={passwordStrength === 'medium' ? 'medium' : undefined}
                    />
                    <StrengthBar
                      active={passwordStrength === 'strong'}
                      strength={passwordStrength === 'strong' ? 'strong' : undefined}
                    />
                  </PasswordStrength>
                  <StrengthText>
                    Password strength: {passwordStrength}
                  </StrengthText>
                </>
              )}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <InputWrapper>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </PasswordToggle>
              </InputWrapper>
            </FormGroup>

            <TermsCheckbox>
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                required
              />
              <span>
                I agree to the <Link to="/terms">Terms of Service</Link> and{' '}
                <Link to="/privacy">Privacy Policy</Link>
              </span>
            </TermsCheckbox>

            <SubmitButton type="submit" disabled={!formData.agreeToTerms}>
              Create account
            </SubmitButton>
          </Form>

          <Divider>
            <span>Or sign up with</span>
          </Divider>

          <SocialButtons>
            <SocialButton
              type="button"
              onClick={handleGoogleSignup}
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

          <LoginPrompt>
            Already have an account?
            <Link to="/login">Sign in</Link>
          </LoginPrompt>
        </FormContainer>
      </RightPanel>
    </PageContainer>
  );
};

export default SignupPage;
