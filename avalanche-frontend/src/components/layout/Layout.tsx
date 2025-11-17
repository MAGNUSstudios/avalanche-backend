import React from 'react';
import { styled } from '../../stitches.config';
import Header from './Header';
import Footer from './Footer';

const LayoutContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
});

const Main = styled('main', {
  flex: 1,
  width: '100%',
});

interface LayoutProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
  showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  isAuthenticated = false,
  showFooter = true,
}) => {
  return (
    <LayoutContainer>
      <Header isAuthenticated={isAuthenticated} />
      <Main>{children}</Main>
      {showFooter && <Footer />}
    </LayoutContainer>
  );
};

export default Layout;
