import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { styled } from '../stitches.config';
import { Lock } from 'lucide-react';
import API from '../services/api';

const PageContainer = styled('div', {
  minHeight: '100vh',
  backgroundColor: 'var(--background-light)',
  color: 'var(--text-primary)',
});

const Header = styled('header', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '$6 $8',
  borderBottom: '1px solid var(--border-color)',
  backgroundColor: 'var(--card-background)',
});

const Logo = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  fontSize: '$xl',
  fontWeight: '$bold',
  color: 'var(--primary-color)',
});

const SecureLabel = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  fontSize: '$sm',
  color: 'var(--text-secondary)',
});

const MainContent = styled('main', {
  maxWidth: '960px',
  margin: '0 auto',
  padding: '$12 $8',
});

const Title = styled('h1', {
  fontSize: '$4xl',
  fontWeight: '$bold',
  marginBottom: '$12',
  color: 'white',
});

const OrderSummarySection = styled('section', {
  marginBottom: '$12',
});

const SectionTitle = styled('h2', {
  fontSize: '$xl',
  fontWeight: '$semibold',
  marginBottom: '$6',
  color: 'var(--text-primary)',
});

const OrderCard = styled('div', {
  display: 'flex',
  gap: '$6',
  backgroundColor: 'var(--card-background)',
  borderRadius: '$lg',
  padding: '$6',
  border: '1px solid var(--border-color)',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
});

const ProjectImage = styled('img', {
  width: '200px',
  height: '200px',
  borderRadius: '$base',
  objectFit: 'cover',
});

const ProjectInfo = styled('div', {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '$3',
});

const ProjectTitle = styled('h3', {
  fontSize: '$xl',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
});

const Seller = styled('p', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
});

const EscrowNotice = styled('p', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
  marginTop: '$2',
});

const PriceBreakdown = styled('div', {
  marginTop: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
  paddingTop: '$4',
  borderTop: '1px solid var(--border-color)',
});

const PriceRow = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '$sm',
  color: 'var(--text-secondary)',

  '&.total': {
    fontSize: '$xl',
    fontWeight: '$bold',
    color: 'var(--text-primary)',
    paddingTop: '$2',
    borderTop: '1px solid var(--border-color)',
  },
});

const PaymentSection = styled('section', {
  marginBottom: '$8',
});

const PaymentMethodCard = styled('div', {
  backgroundColor: 'var(--card-background)',
  border: '2px solid',
  borderRadius: '$lg',
  padding: '$6',
  marginBottom: '$4',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  variants: {
    selected: {
      true: {
        borderColor: 'var(--primary-color)',
        backgroundColor: 'var(--primary-light)',
        boxShadow: '0 0 10px var(--primary-glow)',
      },
      false: {
        borderColor: 'var(--border-color)',
      },
    },
  },
});

const RadioLabel = styled('label', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  cursor: 'pointer',
});

const RadioInput = styled('input', {
  accentColor: '$primary500',
});

const CardIcons = styled('div', {
  marginLeft: 'auto',
  display: 'flex',
  gap: '$2',
});

const CardIcon = styled('div', {
  width: '32px',
  height: '24px',
  backgroundColor: '$gray600',
  borderRadius: '$sm',
});

const FormGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '$4',
  marginTop: '$4',

  '@media (min-width: 640px)': {
    gridTemplateColumns: '2fr 1fr',
  },
});

const FormGroup = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
});

const Label = styled('label', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
});

const Input = styled('input', {
  padding: '$3 $4',
  backgroundColor: 'var(--input-background)',
  border: '1px solid var(--border-color)',
  borderRadius: '$base',
  color: 'var(--text-primary)',
  fontSize: '$base',

  '&::placeholder': {
    color: 'var(--text-tertiary)',
  },

  '&:focus': {
    outline: 'none',
    borderColor: 'var(--primary-color)',
    boxShadow: '0 0 0 3px var(--primary-glow)',
  },
});

const PayButton = styled('button', {
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
  boxShadow: '0 0 15px var(--primary-glow), 0 0 20px var(--primary-glow-soft)',

  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 0 20px var(--primary-glow), 0 0 30px var(--primary-glow-soft)',
  },
});

const SecurityBadges = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '$6',
  marginTop: '$6',
  fontSize: '$sm',
  color: 'var(--text-secondary)',
});

const Footer = styled('footer', {
  borderTop: '1px solid var(--border-color)',
  padding: '$8',
  textAlign: 'center',
  backgroundColor: 'var(--card-background)',
});

const FooterContent = styled('div', {
  maxWidth: '960px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '$sm',
  color: 'var(--text-secondary)',

  '@media (max-width: 640px)': {
    flexDirection: 'column',
    gap: '$4',
  },
});

const FooterLinks = styled('div', {
  display: 'flex',
  gap: '$6',

  'a': {
    color: 'var(--text-secondary)',
    textDecoration: 'none',

    '&:hover': {
      color: 'var(--primary-color)',
    },
  },
});

interface SecureCheckoutPageProps {
  productId?: number;
  projectId?: number;
  itemName?: string;
  itemCost?: number;
  sellerId?: number;
}

const SecureCheckoutPage: React.FC<SecureCheckoutPageProps> = () => {
  const location = useLocation();

  // Get product data from navigation state or use defaults
  const { productId, itemName, itemCost, sellerId, projectId } = (location.state as {
    productId?: number;
    itemName?: string;
    itemCost?: number;
    sellerId?: number;
    projectId?: number;
  }) || {
    itemName: "Project Phoenix - UI/UX Design Collaboration",
    itemCost: 500.00,
    sellerId: 1,
  };

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const serviceFee = (itemCost || 0) * 0.05;
  const totalAmount = (itemCost || 0) + serviceFee;

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!itemCost || !itemName || !sellerId) {
        throw new Error('Missing required payment information');
      }

      // Step 1: Create order
      const order = await API.payments.initialize({
        order_id: productId || 0, // This will need to be adjusted since we don't have an order yet
        payment_method: paymentMethod === 'card' ? 'card' : 'bank_transfer',
        payment_provider: 'stripe',
      });

      console.log('Order created:', order);

      // Step 2: Initialize payment with Stripe
      const payment = await API.payments.initialize({
        order_id: order.id,
        payment_method: 'card',
        payment_provider: 'stripe',
      });

      console.log('Payment initialized:', payment);

      // Step 3: Redirect to Stripe Checkout page
      if (payment.checkout_url || payment.authorization_url) {
        // Redirect to external Stripe checkout page
        window.location.href = payment.checkout_url || payment.authorization_url;
      } else {
        throw new Error('No checkout URL received from payment provider');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      console.error('Payment error:', err);
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <Header>
        <Logo>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" />
            <path d="M2 17L12 22L22 17" opacity="0.7" />
            <path d="M2 12L12 17L22 12" opacity="0.4" />
          </svg>
          Avalanche
        </Logo>
        <SecureLabel>
          <Lock size={16} />
          Secure Payment
        </SecureLabel>
      </Header>

      <MainContent>
        <Title>Secure Checkout</Title>

        <OrderSummarySection>
          <SectionTitle>Order Summary</SectionTitle>
          <OrderCard>
            <ProjectImage
              src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=400&fit=crop"
              alt="Project Phoenix"
            />
            <ProjectInfo>
              <ProjectTitle>{itemName}</ProjectTitle>
              <Seller>Seller ID: {sellerId}</Seller>
              <EscrowNotice>
                Funds will be held securely in escrow until project completion.
              </EscrowNotice>

              <PriceBreakdown>
                <PriceRow>
                  <span>Item Cost</span>
                  <span>${(itemCost || 0).toFixed(2)}</span>
                </PriceRow>
                <PriceRow>
                  <span>Service Fee</span>
                  <span>${serviceFee.toFixed(2)}</span>
                </PriceRow>
                <PriceRow className="total">
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </PriceRow>
              </PriceBreakdown>

              {error && (
                <div style={{
                  padding: '12px',
                  backgroundColor: 'rgba(255, 50, 50, 0.1)',
                  border: '1px solid rgba(255, 50, 50, 0.3)',
                  borderRadius: '8px',
                  color: '#ff3232',
                  marginTop: '16px',
                  fontSize: '14px',
                }}>
                  <strong>Error:</strong> {error}
                </div>
              )}
            </ProjectInfo>
          </OrderCard>
        </OrderSummarySection>

        <PaymentSection>
          <SectionTitle>Choose your payment method</SectionTitle>

          <PaymentMethodCard
            selected={paymentMethod === 'card'}
            onClick={() => setPaymentMethod('card')}
          >
            <RadioLabel>
              <RadioInput
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
              />
              <span>Pay with Card</span>
              <CardIcons>
                <CardIcon style={{ backgroundColor: '#00D4FF' }} />
                <CardIcon style={{ backgroundColor: '#1A1F71' }} />
              </CardIcons>
            </RadioLabel>

            {paymentMethod === 'card' && (
              <>
                <FormGroup style={{ marginTop: '1.5rem' }}>
                  <Label>Card number</Label>
                  <Input type="text" placeholder="0000 0000 0000 0000" />
                </FormGroup>

                <FormGrid>
                  <FormGroup>
                    <Label>Expiration date</Label>
                    <Input type="text" placeholder="MM / YY" />
                  </FormGroup>
                  <FormGroup>
                    <Label>CVC</Label>
                    <Input type="text" placeholder="123" />
                  </FormGroup>
                </FormGrid>
              </>
            )}
          </PaymentMethodCard>

          <PaymentMethodCard
            selected={paymentMethod === 'bank'}
            onClick={() => setPaymentMethod('bank')}
          >
            <RadioLabel>
              <RadioInput
                type="radio"
                name="payment"
                value="bank"
                checked={paymentMethod === 'bank'}
                onChange={() => setPaymentMethod('bank')}
              />
              <span>Bank Transfer</span>
            </RadioLabel>
          </PaymentMethodCard>
        </PaymentSection>

        <PayButton
          onClick={handlePayment}
          disabled={loading}
          style={{
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Redirecting to Stripe...' : `Continue to Payment - $${totalAmount.toFixed(2)}`}
        </PayButton>

        <SecurityBadges>
          <span>🔒 SSL Secured</span>
          <span>|</span>
          <span>🛡️ Escrow Protected</span>
        </SecurityBadges>
      </MainContent>

      <Footer>
        <FooterContent>
          <p>© 2024 Avalanche by MAGNUS Studios. All rights reserved.</p>
          <FooterLinks>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Support</a>
          </FooterLinks>
        </FooterContent>
      </Footer>
    </PageContainer>
  );
};

export default SecureCheckoutPage;
