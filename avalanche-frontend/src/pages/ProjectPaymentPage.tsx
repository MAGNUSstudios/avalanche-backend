import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { styled } from '../stitches.config';
import { Lock, Shield, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import API from '../services/api';

const PageContainer = styled('div', {
  minHeight: '100vh',
  backgroundColor: 'var(--bg-primary)',
  paddingTop: '73px',
});

const Container = styled('div', {
  maxWidth: '900px',
  margin: '0 auto',
  padding: '$8',
});

const Header = styled('div', {
  textAlign: 'center',
  marginBottom: '$8',
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
  maxWidth: '600px',
  margin: '0 auto',
});

const ContentGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr 400px',
  gap: '$6',

  '@media (max-width: 1024px)': {
    gridTemplateColumns: '1fr',
  },
});

const MainCard = styled('div', {
  backgroundColor: 'var(--card-bg)',
  borderRadius: '$lg',
  padding: '$8',
  border: '1px solid var(--border-color)',
});

const SectionTitle = styled('h2', {
  fontSize: '$xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  marginBottom: '$4',
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
});

const ProjectInfo = styled('div', {
  padding: '$4',
  backgroundColor: 'var(--bg-secondary)',
  borderRadius: '$base',
  marginBottom: '$6',
});

const ProjectTitle = styled('div', {
  fontSize: '$lg',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
  marginBottom: '$2',
});

const ProjectBudget = styled('div', {
  fontSize: '$2xl',
  fontWeight: '$bold',
  color: 'var(--primary-color)',
  marginTop: '$2',
});

const EscrowInfo = styled('div', {
  padding: '$6',
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  border: '1px solid rgba(59, 130, 246, 0.3)',
  borderRadius: '$lg',
  marginBottom: '$6',
});

const EscrowTitle = styled('div', {
  fontSize: '$lg',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  marginBottom: '$3',
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
});

const EscrowDescription = styled('p', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
  lineHeight: '1.6',
  marginBottom: '$4',
});

const EscrowFeatures = styled('ul', {
  listStyle: 'none',
  padding: 0,
  margin: 0,
});

const EscrowFeature = styled('li', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  fontSize: '$sm',
  color: 'var(--text-primary)',
  marginBottom: '$2',

  '&:last-child': {
    marginBottom: 0,
  },
});

const PaymentForm = styled('form', {
  marginTop: '$6',
});

const FormGroup = styled('div', {
  marginBottom: '$4',
});

const Label = styled('label', {
  display: 'block',
  fontSize: '$sm',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
  marginBottom: '$2',
});

const Input = styled('input', {
  width: '100%',
  padding: '$3 $4',
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '$base',
  color: 'var(--text-primary)',
  fontSize: '$sm',

  '&:focus': {
    outline: 'none',
    borderColor: 'var(--primary-color)',
  },
});

const CardInputGroup = styled('div', {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr',
  gap: '$3',
});

const PayButton = styled('button', {
  width: '100%',
  padding: '$4',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  border: 'none',
  borderRadius: '$base',
  fontSize: '$base',
  fontWeight: '$semibold',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$2',
  transition: 'all 0.2s',

  '&:hover': {
    backgroundColor: 'var(--primary-hover)',
    transform: 'translateY(-2px)',
  },

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none',
  },
});

const SummaryCard = styled('div', {
  backgroundColor: 'var(--card-bg)',
  borderRadius: '$lg',
  padding: '$6',
  border: '1px solid var(--border-color)',
  position: 'sticky',
  top: '90px',
});

const SummaryRow = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '$3 0',
  borderBottom: '1px solid var(--border-color)',

  '&:last-child': {
    borderBottom: 'none',
    paddingTop: '$4',
    marginTop: '$2',
  },
});

const SummaryLabel = styled('span', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',

  variants: {
    bold: {
      true: {
        fontSize: '$lg',
        fontWeight: '$bold',
        color: 'var(--text-primary)',
      },
    },
  },
});

const SummaryValue = styled('span', {
  fontSize: '$sm',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',

  variants: {
    bold: {
      true: {
        fontSize: '$2xl',
        fontWeight: '$bold',
        color: 'var(--primary-color)',
      },
    },
  },
});

const SecurityBadges = styled('div', {
  display: 'flex',
  gap: '$3',
  marginTop: '$6',
  padding: '$4',
  backgroundColor: 'var(--bg-secondary)',
  borderRadius: '$base',
});

const SecurityBadge = styled('div', {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  fontSize: '$xs',
  color: 'var(--text-secondary)',
});

interface ProjectData {
  id: number;
  title: string;
  budget: number;
  description?: string;
}

const ProjectPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Payment form state
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        setError('Project ID is missing');
        setLoading(false);
        return;
      }

      try {
        const data = await API.projects.getById(parseInt(projectId));
        setProject(data);
      } catch (err) {
        console.error('Failed to load project:', err);
        setError('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  const platformFee = project?.budget ? project.budget * 0.05 : 0;
  const totalAmount = project?.budget ? project.budget + platformFee : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!project) return;

    setProcessing(true);
    setError(null);

    try {
      // Create Stripe Checkout session
      const response = await fetch('http://localhost:8000/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('avalanche_token')}`,
        },
        body: JSON.stringify({ project_id: project.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error('Payment failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize payment. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Container>
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
            Loading payment details...
          </div>
        </Container>
      </PageContainer>
    );
  }

  if (error || !project) {
    return (
      <PageContainer>
        <Container>
          <div style={{ textAlign: 'center', padding: '60px', color: '#ef4444' }}>
            {error || 'Project not found'}
          </div>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <Header>
          <Title>Secure Project Payment</Title>
          <Subtitle>
            Your funds will be held safely in escrow until the project is completed
          </Subtitle>
        </Header>

        <ContentGrid>
          <MainCard>
            <ProjectInfo>
              <ProjectTitle>{project.title}</ProjectTitle>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                {project.description}
              </div>
              <ProjectBudget>${project.budget.toLocaleString()}</ProjectBudget>
            </ProjectInfo>

            <EscrowInfo>
              <EscrowTitle>
                <Shield size={20} />
                How Escrow Protection Works
              </EscrowTitle>
              <EscrowDescription>
                Your payment is held securely by our escrow system and only released to the
                freelancer when you approve the completed work.
              </EscrowDescription>
              <EscrowFeatures>
                <EscrowFeature>
                  <CheckCircle size={16} color="#10b981" />
                  Funds held safely until work is complete
                </EscrowFeature>
                <EscrowFeature>
                  <CheckCircle size={16} color="#10b981" />
                  Negotiate and communicate with freelancer
                </EscrowFeature>
                <EscrowFeature>
                  <CheckCircle size={16} color="#10b981" />
                  Admin oversight for dispute resolution
                </EscrowFeature>
                <EscrowFeature>
                  <CheckCircle size={16} color="#10b981" />
                  Release payment when both parties agree
                </EscrowFeature>
              </EscrowFeatures>
            </EscrowInfo>

            <SectionTitle>
              <CreditCard size={20} />
              Payment Information
            </SectionTitle>

            <PaymentForm onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  type="text"
                  placeholder="John Doe"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim())}
                  maxLength={19}
                  required
                />
              </FormGroup>

              <CardInputGroup>
                <FormGroup>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="text"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length >= 2) {
                        setExpiryDate(val.slice(0, 2) + '/' + val.slice(2, 4));
                      } else {
                        setExpiryDate(val);
                      }
                    }}
                    maxLength={5}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="text"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    maxLength={4}
                    required
                  />
                </FormGroup>
              </CardInputGroup>

              {error && (
                <div style={{
                  padding: '12px',
                  backgroundColor: '#fee',
                  border: '1px solid #fcc',
                  borderRadius: '8px',
                  color: '#c33',
                  fontSize: '14px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <PayButton type="submit" disabled={processing}>
                <Lock size={20} />
                {processing ? 'Processing Payment...' : `Pay $${totalAmount.toLocaleString()}`}
              </PayButton>

              <SecurityBadges>
                <SecurityBadge>
                  <Lock size={14} />
                  SSL Encrypted
                </SecurityBadge>
                <SecurityBadge>
                  <Shield size={14} />
                  PCI Compliant
                </SecurityBadge>
                <SecurityBadge>
                  <CheckCircle size={14} />
                  Escrow Protected
                </SecurityBadge>
              </SecurityBadges>
            </PaymentForm>
          </MainCard>

          <SummaryCard>
            <SectionTitle>Payment Summary</SectionTitle>

            <SummaryRow>
              <SummaryLabel>Project Budget</SummaryLabel>
              <SummaryValue>${project.budget.toLocaleString()}</SummaryValue>
            </SummaryRow>

            <SummaryRow>
              <SummaryLabel>Platform Fee (5%)</SummaryLabel>
              <SummaryValue>${platformFee.toLocaleString()}</SummaryValue>
            </SummaryRow>

            <SummaryRow>
              <SummaryLabel bold>Total Amount</SummaryLabel>
              <SummaryValue bold>${totalAmount.toLocaleString()}</SummaryValue>
            </SummaryRow>
          </SummaryCard>
        </ContentGrid>
      </Container>
    </PageContainer>
  );
};

export default ProjectPaymentPage;
