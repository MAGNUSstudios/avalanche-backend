import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { styled } from '../stitches.config';
import { CheckCircle, Shield, ArrowRight } from 'lucide-react';

const PageContainer = styled('div', {
  minHeight: '100vh',
  backgroundColor: 'var(--bg-primary)',
  paddingTop: '73px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const Container = styled('div', {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '$8',
  textAlign: 'center',
});

const SuccessIcon = styled('div', {
  width: '80px',
  height: '80px',
  margin: '0 auto $6',
  backgroundColor: 'rgba(16, 185, 129, 0.1)',
  borderRadius: '$full',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#10b981',
});

const Title = styled('h1', {
  fontSize: '$3xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  marginBottom: '$3',
});

const Subtitle = styled('p', {
  fontSize: '$lg',
  color: 'var(--text-secondary)',
  marginBottom: '$8',
  lineHeight: 1.6,
});

const InfoCard = styled('div', {
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '$lg',
  padding: '$6',
  marginBottom: '$6',
});

const InfoRow = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '$3 0',
  borderBottom: '1px solid var(--border-color)',

  '&:last-child': {
    borderBottom: 'none',
  },
});

const InfoLabel = styled('span', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
});

const InfoValue = styled('span', {
  fontSize: '$sm',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
});

const EscrowBadge = styled('div', {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$3 $4',
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  border: '1px solid rgba(59, 130, 246, 0.3)',
  borderRadius: '$full',
  color: '#3b82f6',
  fontSize: '$sm',
  fontWeight: '$semibold',
  marginBottom: '$6',
});

const Button = styled('button', {
  padding: '$3 $6',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  border: 'none',
  borderRadius: '$base',
  fontSize: '$base',
  fontWeight: '$semibold',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '$2',
  transition: 'all 0.2s',

  '&:hover': {
    backgroundColor: 'var(--primary-hover)',
    transform: 'translateY(-1px)',
  },
});

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const projectId = searchParams.get('project_id');

  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !projectId) {
        navigate('/');
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8000/stripe/payment-success/${sessionId}?project_id=${projectId}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('avalanche_token')}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setPaymentData(data);
        }
      } catch (err) {
        console.error('Failed to verify payment:', err);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, projectId, navigate]);

  if (loading) {
    return (
      <PageContainer>
        <Container>
          <Title>Verifying payment...</Title>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <SuccessIcon>
          <CheckCircle size={40} />
        </SuccessIcon>

        <Title>Payment Successful!</Title>
        <Subtitle>
          Your payment has been processed successfully and the funds are now held securely in escrow.
        </Subtitle>

        <EscrowBadge>
          <Shield size={16} />
          Funds Protected by Escrow
        </EscrowBadge>

        {paymentData && (
          <InfoCard>
            <InfoRow>
              <InfoLabel>Order Number</InfoLabel>
              <InfoValue>{paymentData.order?.order_number || 'N/A'}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Amount Paid</InfoLabel>
              <InfoValue>${(paymentData.session?.amount_total || 0).toFixed(2)}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Status</InfoLabel>
              <InfoValue>Held in Escrow</InfoValue>
            </InfoRow>
          </InfoCard>
        )}

        <Subtitle style={{ fontSize: '$sm', marginTop: '$6', marginBottom: '$6' }}>
          The funds will be released to the freelancer once you approve the completed work.
          You have 14 days to review the deliverables.
        </Subtitle>

        <Button onClick={() => navigate(projectId ? `/projects/${projectId}` : '/projects')}>
          View Project
          <ArrowRight size={16} />
        </Button>
      </Container>
    </PageContainer>
  );
};

export default PaymentSuccessPage;
