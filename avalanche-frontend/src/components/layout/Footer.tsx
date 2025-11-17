import React from 'react';
import { Link } from 'react-router-dom';
import { styled } from '../../stitches.config';

const FooterContainer = styled('footer', {
  backgroundColor: '$bgSecondary',
  borderTop: '1px solid $borderColor',
  padding: '$8 $6',
  marginTop: 'auto',
});

const FooterContent = styled('div', {
  maxWidth: '1280px',
  margin: '0 auto',
});

const FooterTop = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '$8',
  marginBottom: '$8',
  '@md': {
    gridTemplateColumns: 'repeat(4, 1fr)',
  },
});

const FooterColumn = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$4',
});

const FooterTitle = styled('h3', {
  fontSize: '$lg',
  fontWeight: '$semibold',
  color: '$textPrimary',
  marginBottom: '$2',
});

const FooterLink = styled(Link, {
  fontSize: '$sm',
  color: '$textSecondary',
  textDecoration: 'none',
  transition: 'color 0.2s',
  '&:hover': {
    color: '$primaryColor',
  },
});

const FooterBottom = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$4',
  paddingTop: '$6',
  borderTop: '1px solid $borderColor',
  '@md': {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const Copyright = styled('p', {
  fontSize: '$sm',
  color: '$textSecondary',
});

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterTop>
          <FooterColumn>
            <FooterTitle>Platform</FooterTitle>
            <FooterLink to="/marketplace">Marketplace</FooterLink>
            <FooterLink to="/guilds">Guilds</FooterLink>
            <FooterLink to="/projects">Projects</FooterLink>
            <FooterLink to="/dashboard">Dashboard</FooterLink>
          </FooterColumn>

          <FooterColumn>
            <FooterTitle>Account</FooterTitle>
            <FooterLink to="/login">Login</FooterLink>
            <FooterLink to="/signup">Sign Up</FooterLink>
                      </FooterColumn>

          <FooterColumn>
            <FooterTitle>Shopping</FooterTitle>
            <FooterLink to="/cart">Cart</FooterLink>
            <FooterLink to="/marketplace/create">Sell an Item</FooterLink>
            <FooterLink to="/guilds/create">Create Guild</FooterLink>
            <FooterLink to="/projects/create">Start Project</FooterLink>
          </FooterColumn>

          <FooterColumn>
            <FooterTitle>Help</FooterTitle>
            <FooterLink to="/help">Help Center</FooterLink>
            <FooterLink to="/about">About</FooterLink>
          </FooterColumn>
        </FooterTop>

        <FooterBottom>
          <Copyright>
            © 2025 Avalanche by MAGNUS Studios. All rights reserved.
          </Copyright>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
