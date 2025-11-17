import React from 'react';
import { Link } from 'react-router-dom';
import { styled } from '../stitches.config';
import { Rocket, Eye, Sparkles, Globe2, Users2 } from 'lucide-react';
import Header from '../components/layout/Header';

const PageContainer = styled('div', {
  minHeight: '100vh',
  backgroundColor: 'var(--bg-secondary)',
});

const Hero = styled('section', {
  padding: '$20 $8',
  maxWidth: '1280px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '$16',
  alignItems: 'center',
  backgroundColor: 'var(--bg-primary)',

  '@media (max-width: 968px)': {
    gridTemplateColumns: '1fr',
    padding: '$12 $8',
    gap: '$8',
  },
});

const HeroContent = styled('div', {
  maxWidth: '600px',
});

const HeroTitle = styled('h1', {
  fontSize: '3.5rem',
  fontWeight: '800',
  marginBottom: '$6',
  lineHeight: '1.1',
  color: 'var(--text-primary)',
  letterSpacing: '-0.02em',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

  '@media (max-width: 768px)': {
    fontSize: '2.5rem',
  },
});

const HeroSubtitle = styled('p', {
  fontSize: '1.125rem',
  maxWidth: '600px',
  color: 'var(--text-secondary)',
  lineHeight: '1.7',
  marginBottom: '$8',

  '@media (max-width: 768px)': {
    fontSize: '1rem',
  },
});

const HeroButton = styled('button', {
  padding: '$4 $8',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  border: 'none',
  borderRadius: '$xl',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  textDecoration: 'none',

  '&:hover': {
    backgroundColor: 'var(--primary-hover)',
    transform: 'translateY(-2px)',
    textDecoration: 'none',
  },
});

const HeroImageContainer = styled('div', {
  position: 'relative',
  height: '400px',
  backgroundColor: 'var(--card-bg)',
  borderRadius: '$2xl',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '3px solid var(--border-color)',

  '@media (max-width: 968px)': {
    height: '300px',
  },
});

const MainContent = styled('main', {
  maxWidth: '1280px',
  margin: '0 auto',
  padding: '$16 $8',
});

const Section = styled('section', {
  marginBottom: '$20',
});

const SectionTitle = styled('h2', {
  fontSize: '2rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
  marginBottom: '$3',
  textAlign: 'center',
  letterSpacing: 'normal',

  '@media (max-width: 768px)': {
    fontSize: '1.75rem',
  },
});

const SectionSubtitle = styled('p', {
  fontSize: '1rem',
  color: 'var(--text-secondary)',
  marginBottom: '$12',
  textAlign: 'center',
  maxWidth: '700px',
  margin: '0 auto $12',
  lineHeight: '1.6',
});

const MissionVisionGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '$8',
  marginBottom: '$20',

  '@media (max-width: 768px)': {
    gridTemplateColumns: '1fr',
  },
});

const MissionVisionCard = styled('div', {
  backgroundColor: 'var(--card-bg)',
  borderRadius: '$2xl',
  padding: '$10',
  transition: 'all 0.3s ease',
  border: 'none',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',

  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
  },
});

const IconWrapper = styled('div', {
  width: '56px',
  height: '56px',
  borderRadius: '$lg',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '$5',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
});

const CardTitle = styled('h3', {
  fontSize: '1.25rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
  marginBottom: '$4',
});

const CardDescription = styled('p', {
  fontSize: '0.9375rem',
  color: 'var(--text-secondary)',
  lineHeight: '1.7',
});

const FeaturesSection = styled('section', {
  marginBottom: '$20',
});

const FeaturesGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '$8',

  '@media (max-width: 1024px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },

  '@media (max-width: 768px)': {
    gridTemplateColumns: '1fr',
  },
});

const FeatureCard = styled('div', {
  backgroundColor: 'var(--card-bg)',
  borderRadius: '$2xl',
  padding: '$8',
  textAlign: 'center',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  transition: 'all 0.3s ease',
  border: 'none',

  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  },
});

const FeatureIconWrapper = styled('div', {
  width: '56px',
  height: '56px',
  borderRadius: '$lg',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto $4',

  variants: {
    color: {
      blue: {
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        color: 'var(--primary-color)',
      },
      green: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        color: '#4CAF50',
      },
      purple: {
        backgroundColor: 'rgba(156, 39, 176, 0.1)',
        color: '#9C27B0',
      },
    },
  },
});

const FeatureTitle = styled('h3', {
  fontSize: '1.125rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
  marginBottom: '$3',
});

const FeatureDescription = styled('p', {
  fontSize: '0.875rem',
  color: 'var(--text-secondary)',
  lineHeight: '1.6',
});


const AboutPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  // Check authentication status
  React.useEffect(() => {
    const token = localStorage.getItem('avalanche_token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <PageContainer>
      <Header isAuthenticated={isAuthenticated} />

      <Hero>
        <HeroContent>
          <HeroTitle>Powering Africa's Digital Future with AI</HeroTitle>
          <HeroSubtitle>
            An AI-powered community and marketplace platform, allowing users to buy/sell items, join guilds, and collaborate on projects.
          </HeroSubtitle>
          <HeroButton as={Link} to="/signup">Join the Community</HeroButton>
        </HeroContent>
        <HeroImageContainer>
          <svg width="300" height="300" viewBox="0 0 300 300" fill="none">
            <path d="M150 50 L250 150 L150 250 L50 150 Z" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none"/>
            <circle cx="150" cy="50" r="6" fill="rgba(255,255,255,0.6)"/>
            <circle cx="250" cy="150" r="6" fill="rgba(255,255,255,0.6)"/>
            <circle cx="150" cy="250" r="6" fill="rgba(255,255,255,0.6)"/>
            <circle cx="50" cy="150" r="6" fill="rgba(255,255,255,0.6)"/>
            <circle cx="150" cy="150" r="8" fill="rgba(255,255,255,0.8)"/>
            <line x1="150" y1="50" x2="150" y2="150" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
            <line x1="150" y1="150" x2="250" y2="150" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
            <line x1="150" y1="150" x2="150" y2="250" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
            <line x1="150" y1="150" x2="50" y2="150" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
            <circle cx="180" cy="100" r="4" fill="rgba(255,255,255,0.4)"/>
            <circle cx="200" cy="180" r="4" fill="rgba(255,255,255,0.4)"/>
            <circle cx="100" cy="200" r="4" fill="rgba(255,255,255,0.4)"/>
          </svg>
        </HeroImageContainer>
      </Hero>

      <MainContent>
        <Section>
          <SectionTitle>Our Mission & Vision</SectionTitle>
          <SectionSubtitle>
           
          </SectionSubtitle>
          
          <MissionVisionGrid>
            <MissionVisionCard>
              <IconWrapper>
                <Rocket size={28} />
              </IconWrapper>
              <CardTitle>Our Mission</CardTitle>
              <CardDescription>
                To empower African creators and entrepreneurs by providing a global AI-powered marketplace and collaborative community.
              </CardDescription>
            </MissionVisionCard>

            <MissionVisionCard>
              <IconWrapper>
                <Eye size={28} />
              </IconWrapper>
              <CardTitle>Our Vision</CardTitle>
              <CardDescription>
                To build Africa's largest digital economy, driven by artificial intelligence and fostering innovation for a prosperous future.
              </CardDescription>
            </MissionVisionCard>
          </MissionVisionGrid>
        </Section>

        <FeaturesSection>
          <SectionTitle>What Makes Us Different</SectionTitle>
          <SectionSubtitle>
            
          </SectionSubtitle>
          
          <FeaturesGrid>
            <FeatureCard>
              <FeatureIconWrapper color="blue">
                <Sparkles size={28} />
              </FeatureIconWrapper>
              <FeatureTitle>AI-Driven Suggestions</FeatureTitle>
              <FeatureDescription>
                Our intelligent algorithms enhance buying, selling, and project collaboration with personalized recommendations.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIconWrapper color="green">
                <Globe2 size={28} />
              </FeatureIconWrapper>
              <FeatureTitle>Africa-First Community</FeatureTitle>
              <FeatureDescription>
                We are dedicated to empowering local creators and entrepreneurs by providing a platform for global reach.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIconWrapper color="purple">
                <Users2 size={28} />
              </FeatureIconWrapper>
              <FeatureTitle>Collaborative Guilds</FeatureTitle>
              <FeatureDescription>
                Join interest-based guilds to network, share knowledge, and collaborate on exciting projects with peers.
              </FeatureDescription>
            </FeatureCard>
          </FeaturesGrid>
        </FeaturesSection>
      </MainContent>
    </PageContainer>
  );
};

export default AboutPage;
