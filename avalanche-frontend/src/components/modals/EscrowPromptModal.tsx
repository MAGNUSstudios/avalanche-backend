import React, { useState } from 'react';
import { styled } from '../../stitches.config';
import { Shield, Lock, CheckCircle, X, AlertCircle } from 'lucide-react';

const Overlay = styled('div', {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000,
  padding: '$4',
});

const Modal = styled('div', {
  backgroundColor: 'var(--card-bg)',
  borderRadius: '$lg',
  maxWidth: '600px',
  width: '100%',
  maxHeight: '90vh',
  overflow: 'auto',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
});

const Header = styled('div', {
  padding: '$6',
  borderBottom: '1px solid var(--border-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const HeaderContent = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  flex: 1,
});

const IconWrapper = styled('div', {
  width: '48px',
  height: '48px',
  borderRadius: '$full',
  backgroundColor: 'rgba(59, 130, 246, 0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#3b82f6',
});

const Title = styled('h2', {
  fontSize: '$xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  marginBottom: '$1',
});

const Subtitle = styled('p', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
});

const CloseButton = styled('button', {
  padding: '$2',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-secondary)',
  borderRadius: '$base',
  transition: 'all 0.2s',

  '&:hover': {
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-secondary)',
  },
});

const Content = styled('div', {
  padding: '$6',
});

const AiMessage = styled('div', {
  padding: '$4',
  backgroundColor: 'rgba(102, 126, 234, 0.1)',
  border: '1px solid rgba(102, 126, 234, 0.3)',
  borderRadius: '$base',
  marginBottom: '$6',
});

const AiTitle = styled('div', {
  fontSize: '$base',
  fontWeight: '$semibold',
  color: '#667eea',
  marginBottom: '$2',
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
});

const AiText = styled('p', {
  fontSize: '$sm',
  color: 'var(--text-primary)',
  lineHeight: '1.6',
});

const ProjectInfo = styled('div', {
  padding: '$4',
  backgroundColor: 'var(--bg-secondary)',
  borderRadius: '$base',
  marginBottom: '$6',
});

const InfoRow = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '$2 0',
  borderBottom: '1px solid var(--border-color)',

  '&:last-child': {
    borderBottom: 'none',
    paddingBottom: 0,
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

const EscrowFeatures = styled('div', {
  marginBottom: '$6',
});

const FeatureItem = styled('div', {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '$3',
  marginBottom: '$3',

  '&:last-child': {
    marginBottom: 0,
  },
});

const FeatureIcon = styled('div', {
  width: '24px',
  height: '24px',
  borderRadius: '$full',
  backgroundColor: 'rgba(16, 185, 129, 0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#10b981',
  flexShrink: 0,
  marginTop: '2px',
});

const FeatureText = styled('div', {
  flex: 1,
});

const FeatureTitle = styled('div', {
  fontSize: '$sm',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
  marginBottom: '$1',
});

const FeatureDescription = styled('div', {
  fontSize: '$xs',
  color: 'var(--text-secondary)',
  lineHeight: '1.5',
});

const ErrorMessage = styled('div', {
  padding: '$3',
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  borderRadius: '$base',
  color: '#ef4444',
  fontSize: '$sm',
  marginBottom: '$4',
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
});

const Footer = styled('div', {
  padding: '$6',
  borderTop: '1px solid var(--border-color)',
  display: 'flex',
  gap: '$3',
  justifyContent: 'flex-end',
});

const Button = styled('button', {
  padding: '$3 $6',
  borderRadius: '$base',
  fontSize: '$base',
  fontWeight: '$semibold',
  cursor: 'pointer',
  transition: 'all 0.2s',
  border: 'none',

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  variants: {
    variant: {
      secondary: {
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-color)',

        '&:hover:not(:disabled)': {
          backgroundColor: 'var(--bg-tertiary)',
        },
      },
      primary: {
        backgroundColor: 'var(--primary-color)',
        color: 'white',

        '&:hover:not(:disabled)': {
          backgroundColor: 'var(--primary-hover)',
          transform: 'translateY(-1px)',
        },
      },
    },
  },
});

interface EscrowPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  agreedAmount: number;
  freelancerName: string;
  onConfirm: () => Promise<void>;
}

const EscrowPromptModal: React.FC<EscrowPromptModalProps> = ({
  isOpen,
  onClose,
  projectTitle,
  agreedAmount,
  freelancerName,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const platformFee = agreedAmount * 0.05;
  const totalAmount = agreedAmount + platformFee;

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place funds in escrow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderContent>
            <IconWrapper>
              <Shield size={24} />
            </IconWrapper>
            <div>
              <Title>Secure Your Agreement</Title>
              <Subtitle>Place funds in escrow to start work</Subtitle>
            </div>
          </HeaderContent>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>

        <Content>
          <AiMessage>
            <AiTitle>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm.5 4.5a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3a.5.5 0 0 1 .5-.5z"/>
              </svg>
              Ava AI Detected Agreement
            </AiTitle>
            <AiText>
              I noticed you and {freelancerName} have reached an agreement! To proceed, please place the
              agreed amount in escrow. This protects both parties and allows work to begin safely.
            </AiText>
          </AiMessage>

          <ProjectInfo>
            <InfoRow>
              <InfoLabel>Project</InfoLabel>
              <InfoValue>{projectTitle}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Freelancer</InfoLabel>
              <InfoValue>{freelancerName}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Agreed Amount</InfoLabel>
              <InfoValue>${agreedAmount.toLocaleString()}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Platform Fee (5%)</InfoLabel>
              <InfoValue>${platformFee.toLocaleString()}</InfoValue>
            </InfoRow>
            <InfoRow style={{ paddingTop: '12px', marginTop: '8px', borderTop: '2px solid var(--border-color)' }}>
              <InfoLabel style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Total</InfoLabel>
              <InfoValue style={{ fontSize: '$lg', color: 'var(--primary-color)' }}>
                ${totalAmount.toLocaleString()}
              </InfoValue>
            </InfoRow>
          </ProjectInfo>

          <EscrowFeatures>
            <FeatureItem>
              <FeatureIcon>
                <Shield size={14} />
              </FeatureIcon>
              <FeatureText>
                <FeatureTitle>Funds Protected</FeatureTitle>
                <FeatureDescription>
                  Your payment is held securely in escrow and only released when you approve completed work
                </FeatureDescription>
              </FeatureText>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon>
                <Lock size={14} />
              </FeatureIcon>
              <FeatureText>
                <FeatureTitle>Work Guaranteed</FeatureTitle>
                <FeatureDescription>
                  Freelancer sees funds are secured and can confidently start work
                </FeatureDescription>
              </FeatureText>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon>
                <CheckCircle size={14} />
              </FeatureIcon>
              <FeatureText>
                <FeatureTitle>Dispute Resolution</FeatureTitle>
                <FeatureDescription>
                  Admin oversight ensures fair resolution if any issues arise
                </FeatureDescription>
              </FeatureText>
            </FeatureItem>
          </EscrowFeatures>

          {error && (
            <ErrorMessage>
              <AlertCircle size={16} />
              {error}
            </ErrorMessage>
          )}
        </Content>

        <Footer>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Not Now
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Processing...' : `Place $${totalAmount.toLocaleString()} in Escrow`}
          </Button>
        </Footer>
      </Modal>
    </Overlay>
  );
};

export default EscrowPromptModal;
