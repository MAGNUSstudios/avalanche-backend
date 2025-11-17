import React, { useState } from 'react';
import { styled } from '../stitches.config';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import API from '../services/api';

const PageContainer = styled('div', {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--bg-secondary)',
  padding: '$4',
});

const LoginCard = styled('div', {
  width: '100%',
  maxWidth: '440px',
  backgroundColor: 'var(--card-bg)',
  borderRadius: '$xl',
  padding: '$8',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  border: '1px solid var(--border-color)',
});

const LogoSection = styled('div', {
  textAlign: 'center',
  marginBottom: '$8',
});

const LogoIcon = styled('div', {
  width: '64px',
  height: '64px',
  margin: '0 auto $4',
  borderRadius: '$full',
  backgroundColor: 'var(--primary-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '$2xl',
  fontWeight: '$bold',
  color: 'white',
});

const Title = styled('h1', {
  fontSize: '$3xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  marginBottom: '$2',
});

const Subtitle = styled('p', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
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
  color: 'var(--text-primary)',
});

const InputWrapper = styled('div', {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
});

const InputIcon = styled('div', {
  position: 'absolute',
  left: '$3',
  color: 'var(--text-secondary)',
  display: 'flex',
  alignItems: 'center',
});

const Input = styled('input', {
  width: '100%',
  padding: '$3 $3 $3 $10',
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '$base',
  fontSize: '$sm',
  color: 'var(--text-primary)',
  transition: 'all 0.2s',

  '&:focus': {
    outline: 'none',
    borderColor: 'var(--primary-color)',
    backgroundColor: 'var(--bg-primary)',
  },

  '&::placeholder': {
    color: 'var(--text-secondary)',
  },

  variants: {
    hasIcon: {
      true: {
        paddingLeft: '$10',
      },
    },
    hasRightIcon: {
      true: {
        paddingRight: '$10',
      },
    },
  },
});

const TogglePasswordButton = styled('button', {
  position: 'absolute',
  right: '$3',
  background: 'none',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  padding: '$2',

  '&:hover': {
    color: 'var(--text-primary)',
  },
});

const ErrorMessage = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$3',
  backgroundColor: 'var(--error-bg)',
  border: '1px solid var(--error-text)',
  borderRadius: '$base',
  color: 'var(--error-text)',
  fontSize: '$sm',
  marginBottom: '$4',
});

const SubmitButton = styled('button', {
  width: '100%',
  padding: '$3',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  border: 'none',
  borderRadius: '$base',
  fontSize: '$base',
  fontWeight: '$semibold',
  cursor: 'pointer',
  transition: 'all 0.2s',
  marginTop: '$2',

  '&:hover': {
    backgroundColor: 'var(--primary-hover)',
    transform: 'translateY(-1px)',
  },

  '&:active': {
    transform: 'translateY(0)',
  },

  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'none',
  },
});

const Footer = styled('div', {
  marginTop: '$6',
  textAlign: 'center',
  fontSize: '$sm',
  color: 'var(--text-secondary)',
});

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting admin login with:', email);
      const response = await API.auth.adminLogin({ email, password });
      console.log('Admin login response:', response);

      // Store the token
      localStorage.setItem('avalanche_token', response.access_token);

      // Fetch admin info
      console.log('Fetching admin info...');
      const adminResponse = await API.auth.getAdminMe();
      console.log('Admin response:', adminResponse);

      console.log('Admin login successful, redirecting...');
      // Store admin data
      localStorage.setItem('avalanche_user', JSON.stringify(adminResponse));

      // Redirect to admin overview page
      navigate('/admin');
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err instanceof Error ? err.message : 'Invalid admin credentials. Please try again.');
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <LoginCard>
        <LogoSection>
          <LogoIcon>A</LogoIcon>
          <Title>Admin Login</Title>
          <Subtitle>Welcome back! Please login to your admin account.</Subtitle>
        </LogoSection>

        {error && (
          <ErrorMessage>
            <AlertCircle size={16} />
            {error}
          </ErrorMessage>
        )}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">Email Address</Label>
            <InputWrapper>
              <InputIcon>
                <Mail size={18} />
              </InputIcon>
              <Input
                id="email"
                type="email"
                placeholder="admin@avalanche.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                hasIcon
              />
            </InputWrapper>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <InputWrapper>
              <InputIcon>
                <Lock size={18} />
              </InputIcon>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                hasIcon
                hasRightIcon
              />
              <TogglePasswordButton
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </TogglePasswordButton>
            </InputWrapper>
          </FormGroup>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login to Admin Panel'}
          </SubmitButton>
        </Form>

        <Footer>
          © 2025 Avalanche. All rights reserved.
        </Footer>
      </LoginCard>
    </PageContainer>
  );
};

export default AdminLoginPage;
