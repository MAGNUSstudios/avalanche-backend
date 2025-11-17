import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '../stitches.config';
import { Check, Zap, Sparkles, Crown, Shield } from 'lucide-react';
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

const ContentWrapper = styled('div', {
  maxWidth: '1200px',
  width: '100%',
});

const Header = styled('div', {
  textAlign: 'center',
  marginBottom: '$12',
});

const Title = styled('h1', {
  fontSize: '$5xl',
  fontWeight: '$bold',
  marginBottom: '$4',
  background: 'linear-gradient(135deg, var(--primary-color) 0%, #00D4FF 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
});

const Subtitle = styled('p', {
  fontSize: '$xl',
  color: 'var(--text-secondary)',
  maxWidth: '600px',
  margin: '0 auto',
});

const PlansGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '$6',
  marginBottom: '$8',

  '@media (min-width: 768px)': {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
});

const PlanCard = styled('div', {
  backgroundColor: 'var(--card-background)',
  borderRadius: '$xl',
  padding: '$8',
  border: '2px solid var(--border-color)',
  position: 'relative',
  transition: 'all 0.3s ease',
  cursor: 'pointer',

  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
  },

  variants: {
    featured: {
      true: {
        border: '2px solid var(--primary-color)',
        boxShadow: '0 0 30px var(--primary-glow)',
      },
    },
    selected: {
      true: {
        border: '2px solid var(--primary-color)',
        backgroundColor: 'var(--primary-light)',
        boxShadow: '0 0 30px var(--primary-glow)',
      },
    },
  },
});

const PopularBadge = styled('div', {
  position: 'absolute',
  top: '-12px',
  right: '$6',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  padding: '$2 $4',
  borderRadius: '$full',
  fontSize: '$sm',
  fontWeight: '$semibold',
  boxShadow: '0 4px 12px var(--primary-glow)',
});

const PlanIcon = styled('div', {
  width: '60px',
  height: '60px',
  borderRadius: '$full',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '$4',

  variants: {
    tier: {
      free: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        color: '#6366f1',
      },
      pro: {
        backgroundColor: 'rgba(13, 127, 242, 0.1)',
        color: 'var(--primary-color)',
      },
      max: {
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        color: '#fbbf24',
      },
      admin: {
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        color: '#a855f7',
      },
    },
  },
});

const PlanName = styled('h2', {
  fontSize: '$3xl',
  fontWeight: '$bold',
  marginBottom: '$2',
  color: 'var(--text-primary)',
});

const PlanPrice = styled('div', {
  marginBottom: '$6',
});

const Price = styled('span', {
  fontSize: '$4xl',
  fontWeight: '$bold',
  color: 'var(--primary-color)',
});

const PriceUnit = styled('span', {
  fontSize: '$lg',
  color: 'var(--text-secondary)',
  marginLeft: '$2',
});

const FeatureList = styled('ul', {
  listStyle: 'none',
  padding: 0,
  margin: '$6 0',
});

const FeatureItem = styled('li', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  marginBottom: '$3',
  fontSize: '$base',
  color: 'var(--text-secondary)',
});

const CheckIcon = styled('div', {
  width: '20px',
  height: '20px',
  borderRadius: '$full',
  backgroundColor: 'rgba(13, 127, 242, 0.1)',
  color: 'var(--primary-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

const SelectButton = styled('button', {
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

  variants: {
    variant: {
      outline: {
        backgroundColor: 'transparent',
        border: '2px solid var(--primary-color)',
        color: 'var(--primary-color)',
        boxShadow: 'none',

        '&:hover': {
          backgroundColor: 'var(--primary-color)',
          color: 'white',
        },
      },
    },
  },
});

const SkipLink = styled('div', {
  textAlign: 'center',
  marginTop: '$6',
});

const SkipButton = styled('button', {
  background: 'none',
  border: 'none',
  color: 'var(--text-secondary)',
  fontSize: '$base',
  cursor: 'pointer',
  textDecoration: 'underline',
  transition: 'color 0.2s',

  '&:hover': {
    color: 'var(--primary-color)',
  },
});

interface Tier {
  id: string;
  name: string;
  price: number;
  monthly_requests: number;
  features: string[];
}

const SelectPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user already has a plan selected
    const checkUserPlan = async () => {
      try {
        const token = localStorage.getItem('avalanche_token');
        if (!token) {
          // No token, redirect to login
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:8000/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();

          // If user already has a plan selected, redirect to dashboard
          if (userData.plan_selected) {
            navigate('/dashboard');
            return;
          }
        }
      } catch (error) {
        console.error('Failed to check user plan:', error);
      }
    };

    checkUserPlan();
    loadTiers();
  }, [navigate]);

  const loadTiers = async () => {
    try {
      const response = await API.ai.subscription.getTiers();
      setTiers(response.tiers);
    } catch (error) {
      console.error('Failed to load tiers:', error);
    }
  };

  const handleSelectPlan = async (tierId: string) => {
    setSelectedTier(tierId);
    setLoading(true);

    try {
      console.log(`Selecting plan: ${tierId}`);
      const response = await API.ai.subscription.selectPlan(tierId);
      console.log('Plan selection response:', response);

      // Free tier or admin - redirect to dashboard
      if (response.redirect_to_dashboard) {
        console.log('Redirecting to dashboard...');
        navigate('/dashboard');
      }
      // Pro/Max tier - redirect to Stripe
      else if (response.redirect_to_stripe && response.checkout_url) {
        console.log('Redirecting to Stripe:', response.checkout_url);
        window.location.href = response.checkout_url;
      } else {
        console.warn('Unexpected response:', response);
        alert('Unexpected response from server. Please try again.');
        setLoading(false);
        setSelectedTier(null);
      }
    } catch (error) {
      console.error('Failed to select plan:', error);
      alert(`Failed to select plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
      setSelectedTier(null);
    }
  };

  const handleSkip = () => {
    // Select free tier and go to dashboard
    handleSelectPlan('free');
  };

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'free':
        return <Zap size={32} />;
      case 'pro':
        return <Sparkles size={32} />;
      case 'max':
        return <Crown size={32} />;
      case 'admin':
        return <Shield size={32} />;
      default:
        return <Zap size={32} />;
    }
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <Title>Choose Your AI Plan</Title>
          <Subtitle>
            Select the perfect plan for your creative journey. Upgrade or downgrade anytime.
          </Subtitle>
        </Header>

        <PlansGrid>
          {tiers.map((tier, index) => (
            <PlanCard
              key={tier.id}
              featured={tier.id === 'pro'}
              selected={selectedTier === tier.id}
              onClick={() => !loading && handleSelectPlan(tier.id)}
            >
              {tier.id === 'pro' && <PopularBadge>Most Popular</PopularBadge>}

              <PlanIcon tier={tier.id as 'free' | 'pro' | 'max' | 'admin'}>
                {getTierIcon(tier.id)}
              </PlanIcon>

              <PlanName>{tier.name}</PlanName>

              <PlanPrice>
                <Price>${tier.price}</Price>
                <PriceUnit>/month</PriceUnit>
              </PlanPrice>

              <FeatureList>
                {tier.features.map((feature, idx) => (
                  <FeatureItem key={idx}>
                    <CheckIcon>
                      <Check size={12} />
                    </CheckIcon>
                    {feature}
                  </FeatureItem>
                ))}
              </FeatureList>

              <SelectButton
                disabled={loading && selectedTier === tier.id}
                variant={tier.id === 'free' ? 'outline' : undefined}
              >
                {loading && selectedTier === tier.id
                  ? 'Processing...'
                  : tier.id === 'free'
                  ? 'Start Free'
                  : tier.id === 'admin'
                  ? 'Activate Admin Access'
                  : `Get ${tier.name}`}
              </SelectButton>
            </PlanCard>
          ))}
        </PlansGrid>

        <SkipLink>
          <SkipButton onClick={handleSkip} disabled={loading}>
            Skip for now (Free plan)
          </SkipButton>
        </SkipLink>
      </ContentWrapper>
    </PageContainer>
  );
};

export default SelectPlanPage;
