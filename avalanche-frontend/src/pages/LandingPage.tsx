import React from 'react';
import { Link } from 'react-router-dom';
import { styled } from '../stitches.config';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { ShoppingBag, Users, Rocket } from 'lucide-react';

const HeroSection = styled('section', {
  padding: '$10 $6',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '500px',
  margin: '0 auto',
  maxWidth: '1280px',
});

const HeroCard = styled('div', {
  width: '100%',
  maxWidth: '900px',
  background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 50%, #7a8a9e 100%)',
  borderRadius: '$xl',
  padding: '$10 $8',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  color: 'white',
  boxShadow: '$xl',
  marginBottom: '$10',
});

const HeroTitle = styled('h1', {
  fontSize: '$5xl',
  fontWeight: '$bold',
  lineHeight: '$tight',
  marginBottom: '$4',
  '@md': {
    fontSize: '56px',
  },
});

const HeroSubtitle = styled('p', {
  fontSize: '$lg',
  lineHeight: '$relaxed',
  marginBottom: '$8',
  opacity: 0.95,
  maxWidth: '600px',
});

const ButtonGroup = styled('div', {
  display: 'flex',
  gap: '$4',
  flexWrap: 'wrap',
  justifyContent: 'center',
});

const FeaturesSection = styled('section', {
  padding: '$10 $6',
  maxWidth: '1280px',
  margin: '0 auto',
});

const SectionTitle = styled('h2', {
  fontSize: '$4xl',
  fontWeight: '$bold',
  textAlign: 'center',
  marginBottom: '$3',
  color: '$gray900',
});

const SectionDescription = styled('p', {
  fontSize: '$lg',
  textAlign: 'center',
  color: '$gray600',
  marginBottom: '$10',
  maxWidth: '700px',
  margin: '0 auto $10',
});

const FeaturesGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '$6',
  '@md': {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
});

const FeatureCard = styled(Card, {
  textAlign: 'left',
  cursor: 'pointer',
});

const IconWrapper = styled('div', {
  width: '48px',
  height: '48px',
  borderRadius: '$base',
  backgroundColor: '$primary50',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '$4',
  color: '$primary500',
});

const FeatureTitle = styled('h3', {
  fontSize: '$xl',
  fontWeight: '$semibold',
  marginBottom: '$2',
  color: '$gray900',
});

const FeatureDescription = styled('p', {
  fontSize: '$base',
  color: '$gray600',
  lineHeight: '$relaxed',
});

const LandingPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  // Check authentication status on mount and when page becomes visible
  React.useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('avalanche_token');
      setIsAuthenticated(!!token);
    };

    // Check on mount
    checkAuth();

    // Check when page becomes visible (e.g., after logout redirect)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAuth();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const features = [
    {
      icon: <ShoppingBag size={24} />,
      title: 'Intelligent Marketplace',
      description: 'Buy and sell items with AI-powered suggestions and insights.',
    },
    {
      icon: <Users size={24} />,
      title: 'Join & Create Guilds',
      description: 'Connect with like-minded individuals to share knowledge and resources.',
    },
    {
      icon: <Rocket size={24} />,
      title: 'Launch Collaborative Projects',
      description: 'Work together on groundbreaking projects with a global community.',
    },
  ];

  return (
    <Layout isAuthenticated={isAuthenticated}>
      <HeroSection>
        <HeroCard>
          <HeroTitle>Build, Buy, Belong — with Avalanche.</HeroTitle>
          <HeroSubtitle>
            Africa's first AI-driven community and marketplace for creators, entrepreneurs, and
            collaborators.
          </HeroSubtitle>
          <ButtonGroup>
            <Button
              as={Link}
              to="/signup"
              variant="primary"
              size="lg"
              style={{
                fontSize: '16px',
                padding: '12px 32px',
              }}
            >
              Join Community
            </Button>
            <Button
              as={Link}
              to="/marketplace"
              variant="secondary"
              size="lg"
              style={{
                fontSize: '16px',
                padding: '12px 32px',
              }}
            >
              Start Shopping
            </Button>
          </ButtonGroup>
        </HeroCard>
      </HeroSection>

      <FeaturesSection>
        <SectionTitle>Discover Our Platform</SectionTitle>
        <SectionDescription>
          Explore the core features that make Avalanche the premier destination for innovation and
          commerce.
        </SectionDescription>

        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard key={index}>
              <IconWrapper>{feature.icon}</IconWrapper>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </FeaturesSection>
    </Layout>
  );
};

export default LandingPage;
