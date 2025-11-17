import React, { useState } from 'react';
import { styled } from '../stitches.config';
import { Lock, Shield } from 'lucide-react';
import Button from '../components/common/Button';
import PaymentProcessor from '../components/payment/PaymentProcessor';
import OrderStatus from '../components/payment/OrderStatus';
import API from '../services/api';

const PageContainer = styled('div', {
  minHeight: '100vh',
  backgroundColor: 'var(--background-light)',
});

const Header = styled('header', {
  backgroundColor: 'var(--background-dark)',
  color: 'var(--text-white)',
  padding: '$4 $6',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid var(--border-color)',
});

const Logo = styled('div', {
  fontSize: '$xl',
  fontWeight: '$bold',
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  color: 'var(--primary-color)',
});

const SecureBadge = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  fontSize: '$sm',
  color: 'var(--text-secondary)',
});

const ContentWrapper = styled('div', {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '$8 $6',
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '$8',
  '@lg': {
    gridTemplateColumns: '1.5fr 1fr',
  },
});

const Section = styled('section', {
  backgroundColor: 'var(--card-background)',
  borderRadius: '$lg',
  padding: '$8',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
});

const SectionTitle = styled('h2', {
  fontSize: '$3xl',
  fontWeight: '$bold',
  marginBottom: '$6',
  color: 'var(--text-primary)',
});

const OrderSummaryCard = styled('div', {
  backgroundColor: 'var(--card-background)',
  borderRadius: '$lg',
  padding: '$6',
  marginBottom: '$6',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
});

const OrderItem = styled('div', {
  display: 'flex',
  gap: '$4',
  marginBottom: '$6',
});

const OrderImage = styled('div', {
  width: '120px',
  height: '120px',
  borderRadius: '$base',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  flexShrink: 0,
});

const OrderInfo = styled('div', {
  flex: 1,
});

const OrderTitle = styled('h3', {
  fontSize: '$lg',
  fontWeight: '$semibold',
  marginBottom: '$1',
  color: 'var(--text-primary)',
});

const OrderSeller = styled('div', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
  marginBottom: '$2',
});

const OrderNote = styled('div', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
  fontStyle: 'italic',
});

const PriceBreakdown = styled('div', {
  borderTop: '1px solid var(--border-color)',
  paddingTop: '$4',
  display: 'flex',
  flexDirection: 'column',
  gap: '$3',
});

const PriceRow = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '$base',
  color: 'var(--text-secondary)',
  variants: {
    total: {
      true: {
        fontSize: '$xl',
        fontWeight: '$bold',
        color: 'var(--text-primary)',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '$3',
        marginTop: '$2',
      },
    },
  },
});

const PaymentMethodSection = styled('div', {
  marginBottom: '$6',
});

const MethodTitle = styled('h3', {
  fontSize: '$lg',
  fontWeight: '$semibold',
  marginBottom: '$4',
  color: 'var(--text-primary)',
});

const PaymentOptions = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$3',
});

const PaymentOption = styled('div', {
  border: '2px solid var(--border-color)',
  borderRadius: '$base',
  padding: '$4',
  cursor: 'pointer',
  transition: 'all 0.2s',
  backgroundColor: 'var(--card-background)',
  variants: {
    selected: {
      true: {
        borderColor: 'var(--primary-color)',
        backgroundColor: 'var(--primary-light)',
        boxShadow: '0 0 10px var(--primary-glow)',
      },
    },
  },
  '&:hover': {
    borderColor: 'var(--primary-color)',
  },
});

const OptionHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
});

const RadioButton = styled('div', {
  width: '20px',
  height: '20px',
  borderRadius: '$full',
  border: '2px solid var(--border-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  variants: {
    selected: {
      true: {
        borderColor: 'var(--primary-color)',
        '&::after': {
          content: '""',
          width: '10px',
          height: '10px',
          borderRadius: '$full',
          backgroundColor: 'var(--primary-color)',
        },
      },
    },
  },
});

const OptionInfo = styled('div', {
  flex: 1,
});

const OptionTitle = styled('div', {
  fontSize: '$base',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
  marginBottom: '$1',
});

const OptionDescription = styled('div', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
});

const CardIcons = styled('div', {
  display: 'flex',
  gap: '$2',
});

const CardIcon = styled('div', {
  width: '32px',
  height: '22px',
  borderRadius: '4px',
  backgroundColor: '$gray700',
  variants: {
    type: {
      visa: { backgroundColor: '#1A1F71' },
      mastercard: { backgroundColor: '#EB001B' },
    },
  },
});

const PaymentForm = styled('form', {
  marginTop: '$6',
  display: 'flex',
  flexDirection: 'column',
  gap: '$4',
});

const FormGroup = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
});

const Label = styled('label', {
  fontSize: '$sm',
  fontWeight: '$medium',
  color: 'var(--text-secondary)',
});

const Input = styled('input', {
  padding: '$3 $4',
  borderRadius: '$base',
  border: '1px solid var(--border-color)',
  fontSize: '$base',
  backgroundColor: 'var(--input-background)',
  color: 'var(--text-primary)',
  '&::placeholder': {
    color: 'var(--text-tertiary)',
  },
  '&:focus': {
    outline: 'none',
    borderColor: 'var(--primary-color)',
    boxShadow: '0 0 0 3px var(--primary-glow)',
  },
});

const Footer = styled('footer', {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '$6',
  display: 'flex',
  justifyContent: 'center',
  gap: '$6',
  fontSize: '$sm',
  color: 'var(--text-secondary)',
  borderTop: '1px solid var(--border-color)',
});

const FooterLink = styled('a', {
  color: 'var(--text-secondary)',
  textDecoration: 'none',
  '&:hover': {
    color: 'var(--primary-color)',
  },
});

const EscrowBadge = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$2',
  padding: '$3',
  backgroundColor: 'var(--primary-light)',
  borderRadius: '$base',
  fontSize: '$sm',
  color: 'var(--primary-color)',
  marginTop: '$4',
});

const AvalancheIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 19h20L12 2zm0 4l7 13H5l7-13z" />
  </svg>
);

interface CheckoutPageProps {
  productId?: number;
  projectId?: number;
  itemName?: string;
  itemCost?: number;
  sellerId?: number;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({
  productId,
  projectId,
  itemName = "AI-Powered Landing Page Design",
  itemCost = 250.00,
  sellerId = 1,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState('');

  const serviceFee = itemCost * 0.05;
  const totalAmount = itemCost + serviceFee;

  const initializePayment = async () => {
    if (!userEmail) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Create order
      const order = await API.payments.initialize({
        order_id: productId || 0, // This will need to be adjusted since we don't have an order yet
        payment_method: paymentMethod === 'card' ? 'card' : 'bank_transfer',
        payment_provider: 'paystack',
      });

      setOrderId(order.id);

      // Step 2: Initialize payment with provider
      const payment = await API.payments.initialize({
        order_id: order.id,
        payment_method: paymentMethod === 'card' ? 'card' : 'bank_transfer',
        payment_provider: 'paystack',
      });

      console.log('Payment initialized:', payment);
      return order.id;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment initialization failed');
      console.error('Payment error:', err);
      setLoading(false);
      return null;
    }
  };

  const handlePaymentSuccess = async (reference: string) => {
    try {
      // Verify payment with backend
      await API.payments.verify({
        provider_reference: reference,
        payment_provider: 'paystack',
      });

      setSuccess(true);
      setError(null);
      console.log('Payment verified successfully');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment verification failed');
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentCancel = () => {
    setLoading(false);
    setError('Payment was cancelled');
  };

  return (
    <PageContainer>
      <Header>
        <Logo>
          <AvalancheIcon />
          Avalanche
        </Logo>
        <SecureBadge>
          <Lock size={16} />
          Secure Payment
        </SecureBadge>
      </Header>

      <ContentWrapper>
        <Section>
          <SectionTitle>Complete Your Payment</SectionTitle>

          <PaymentMethodSection>
            <MethodTitle>Choose a Payment Method</MethodTitle>
            <PaymentOptions>
              <PaymentOption
                selected={paymentMethod === 'card'}
                onClick={() => setPaymentMethod('card')}
              >
                <OptionHeader>
                  <RadioButton selected={paymentMethod === 'card'} />
                  <OptionInfo>
                    <OptionTitle>Pay with Card</OptionTitle>
                    <OptionDescription>Securely pay with Paystack or Flutterwave</OptionDescription>
                  </OptionInfo>
                  <CardIcons>
                    <CardIcon type="visa" />
                    <CardIcon type="mastercard" />
                  </CardIcons>
                </OptionHeader>
              </PaymentOption>

              <PaymentOption
                selected={paymentMethod === 'bank'}
                onClick={() => setPaymentMethod('bank')}
              >
                <OptionHeader>
                  <RadioButton selected={paymentMethod === 'bank'} />
                  <OptionInfo>
                    <OptionTitle>Direct Bank Transfer</OptionTitle>
                    <OptionDescription>Transfer directly from your local bank account</OptionDescription>
                  </OptionInfo>
                </OptionHeader>
              </PaymentOption>
            </PaymentOptions>
          </PaymentMethodSection>

          {paymentMethod === 'card' && (
            <div>
              <MethodTitle>Payment Details</MethodTitle>
              <PaymentForm>
                <FormGroup>
                  <Label>Email Address *</Label>
                  <Input 
                    type="email"
                    placeholder="your@email.com" 
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    required
                  />
                </FormGroup>
              </PaymentForm>
              <p style={{ 
                fontSize: '14px', 
                color: 'var(--text-secondary)', 
                marginTop: '12px' 
              }}>
                Payment will be processed securely via Paystack. Card details are entered on their secure payment page.
              </p>
            </div>
          )}
        </Section>

        <div>
          <OrderSummaryCard>
            <MethodTitle>Order Summary</MethodTitle>
            <OrderItem>
              <OrderImage />
              <OrderInfo>
                <OrderTitle>{itemName}</OrderTitle>
                <OrderSeller>Seller ID: {sellerId}</OrderSeller>
                <OrderNote>Funds will be held securely in escrow until project completion.</OrderNote>
              </OrderInfo>
            </OrderItem>

            <PriceBreakdown>
              <PriceRow>
                <span>Item Cost</span>
                <span>${itemCost.toFixed(2)}</span>
              </PriceRow>
              <PriceRow>
                <span>Avalanche Escrow Fee</span>
                <span>${serviceFee.toFixed(2)}</span>
              </PriceRow>
              <PriceRow total>
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </PriceRow>
            </PriceBreakdown>

            <EscrowBadge>
              <Shield size={16} />
              Your payment is protected by Avalanche Escrow.
            </EscrowBadge>

            {error && (
              <div style={{
                padding: '12px',
                backgroundColor: '#fee',
                border: '1px solid #fcc',
                borderRadius: '8px',
                color: '#c33',
                marginTop: '16px',
                fontSize: '14px',
              }}>
                <strong>Error:</strong> {error}
              </div>
            )}

            {success && (
              <OrderStatus 
                status="escrow" 
                title="Payment Successful!"
                description={`Order #${orderId} created. Funds are held securely in escrow until project completion.`}
                showBadge
              />
            )}
          </OrderSummaryCard>

          {!success && paymentMethod === 'card' && orderId && (
            <PaymentProcessor
              amount={totalAmount}
              email={userEmail}
              orderId={orderId}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          )}

          {!success && paymentMethod === 'card' && !orderId && (
            <Button
              variant="primary"
              onClick={async () => {
                await initializePayment();
              }}
              disabled={loading || !userEmail}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                opacity: loading || !userEmail ? 0.6 : 1,
                cursor: loading || !userEmail ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Processing...' : `Initialize Payment - $${totalAmount.toFixed(2)}`}
            </Button>
          )}

          {!success && paymentMethod === 'bank' && (
            <Button
              variant="primary"
              disabled={loading || !userEmail}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                opacity: loading || !userEmail ? 0.6 : 1,
                cursor: loading || !userEmail ? 'not-allowed' : 'pointer',
              }}
            >
              Generate Bank Transfer Details
            </Button>
          )}
        </div>
      </ContentWrapper>

      <Footer>
        <FooterLink href="#">Terms of Service</FooterLink>
        <FooterLink href="#">Privacy Policy</FooterLink>
        <FooterLink href="#">Support</FooterLink>
      </Footer>
    </PageContainer>
  );
};

export default CheckoutPage;
