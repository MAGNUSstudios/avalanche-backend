import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { styled } from '../stitches.config';
import { CheckCircle, Sparkles, Loader } from 'lucide-react';
import API from '../services/api';

const PageContainer = styled('div', {
  minHeight: '100vh',
  backgroundColor: 'var(--background-light)',
  color: 'var(--text-primary)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$8',
});

const ContentCard = styled('div', {
  backgroundColor: 'var(--card-background)',
  borderRadius: '$2xl',
  padding: '$12',
  maxWidth: '600px',
  width: '100%',
  textAlign: 'center',
  border: '1px solid var(--border-color)',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
});

const IconWrapper = styled('div', {
  width: '100px',
  height: '100px',
  borderRadius: '$full',
  backgroundColor: 'rgba(16, 185, 129, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto $6',
  animation: 'scaleIn 0.5s ease-out',

  '@keyframes scaleIn': {
    '0%': {
      transform: 'scale(0)',
      opacity: 0,
    },
    '50%': {
      transform: 'scale(1.1)',
    },
    '100%': {
      transform: 'scale(1)',
      opacity: 1,
    },
  },
});

const SuccessIcon = styled(CheckCircle, {
  color: '#10b981',
});

const LoadingIcon = styled(Loader, {
  color: 'var(--primary-color)',
  animation: 'spin 1s linear infinite',

  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
});

const Title = styled('h1', {
  fontSize: '$4xl',
  fontWeight: '$bold',
  marginBottom: '$4',
  background: 'linear-gradient(135deg, #10b981 0%, #0d7ff2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
});

const Description = styled('p', {
  fontSize: '$lg',
  color: 'var(--text-secondary)',
  marginBottom: '$8',
  lineHeight: 1.6,
});

const FeaturesList = styled('div', {
  backgroundColor: 'var(--bg-tertiary)',
  borderRadius: '$lg',
  padding: '$6',
  marginBottom: '$8',
  textAlign: 'left',
});

const FeatureTitle = styled('h3', {
  fontSize: '$lg',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
  marginBottom: '$4',
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
});

const Feature = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  marginBottom: '$3',
  fontSize: '$base',
  color: 'var(--text-secondary)',

  '&:last-child': {
    marginBottom: 0,
  },
});

const FeatureIcon = styled('div', {
  width: '24px',
  height: '24px',
  borderRadius: '$full',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  fontSize: '$sm',
});

const ContinueButton = styled('button', {
  width: '100%',
  padding: '$4',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  fontSize: '$lg',
  fontWeight: '$semibold',
  borderRadius: '$lg',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 12px var(--primary-glow)',

  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px var(--primary-glow)',
  },

  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'none',
  },
});

const ErrorMessage = styled('div', {
  padding: '$4',
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  borderRadius: '$lg',
  color: '#ef4444',
  marginBottom: '$6',
});

const PlanSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [confirming, setConfirming] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tier = searchParams.get('tier');

  useEffect(() => {
    confirmPlan();
  }, []);

  const confirmPlan = async () => {
    if (!tier) {
      setError('Invalid tier information');
      setConfirming(false);
      return;
    }

    try {
      await API.ai.subscription.confirmPlan(tier);
      setConfirming(false);
    } catch (err) {
      console.error('Failed to confirm plan:', err);
      setError('Failed to confirm your subscription. Please contact support.');
      setConfirming(false);
    }
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  const getTierFeatures = () => {
    if (tier === 'pro') {
      return [
        '500 AI requests per month',
        'Advanced AI insights',
        'Market trend analysis',
        'Priority support',
        'Faster response times',
      ];
    } else if (tier === 'max') {
      return [
        'Unlimited AI requests',
        'Dedicated AI assistant',
        'Custom AI training',
        'API access',
        'Premium insights & analytics',
        '24/7 priority support',
      ];
    }
    return [];
  };

  if (confirming) {
    return (
      <PageContainer>
        <ContentCard>
          <IconWrapper>
            <LoadingIcon size={48} />
          </IconWrapper>
          <Title>Confirming Your Subscription</Title>
          <Description>
            Please wait while we activate your plan...
          </Description>
        </ContentCard>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ContentCard>
          <ErrorMessage>{error}</ErrorMessage>
          <ContinueButton onClick={() => navigate('/select-plan')}>
            Try Again
          </ContinueButton>
        </ContentCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentCard>
        <IconWrapper>
          <SuccessIcon size={48} />
        </IconWrapper>

        <Title>Welcome to {tier === 'pro' ? 'Pro' : 'Max'}!</Title>

        <Description>
          Your subscription has been activated successfully. You now have access to all premium features.
        </Description>

        <FeaturesList>
          <FeatureTitle>
            <Sparkles size={20} />
            What's Included
          </FeatureTitle>
          {getTierFeatures().map((feature, index) => (
            <Feature key={index}>
              <FeatureIcon>✓</FeatureIcon>
              {feature}
            </Feature>
          ))}
        </FeaturesList>

        <ContinueButton onClick={handleContinue}>
          Continue to Dashboard
        </ContinueButton>
      </ContentCard>
    </PageContainer>
  );
};

export default PlanSuccessPage;
