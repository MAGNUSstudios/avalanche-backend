import React from 'react';
import { styled } from '../../stitches.config';
import { CheckCircle, Clock, XCircle, Shield } from 'lucide-react';

const StatusCard = styled('div', {
  padding: '$6',
  borderRadius: '$lg',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--card-background)',
  display: 'flex',
  alignItems: 'center',
  gap: '$4',
});

const IconWrapper = styled('div', {
  width: '48px',
  height: '48px',
  borderRadius: '$full',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  variants: {
    status: {
      completed: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        color: '#22c55e',
      },
      pending: {
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        color: '#eab308',
      },
      failed: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        color: '#ef4444',
      },
      escrow: {
        backgroundColor: 'var(--primary-light)',
        color: 'var(--primary-color)',
      },
    },
  },
});

const StatusContent = styled('div', {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '$1',
});

const StatusTitle = styled('h3', {
  fontSize: '$lg',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
});

const StatusDescription = styled('p', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
});

const StatusBadge = styled('span', {
  padding: '$1 $3',
  borderRadius: '$full',
  fontSize: '$xs',
  fontWeight: '$medium',
  variants: {
    status: {
      completed: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        color: '#22c55e',
      },
      pending: {
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        color: '#eab308',
      },
      failed: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        color: '#ef4444',
      },
      escrow: {
        backgroundColor: 'var(--primary-light)',
        color: 'var(--primary-color)',
      },
    },
  },
});

interface OrderStatusProps {
  status: 'completed' | 'pending' | 'failed' | 'escrow';
  title?: string;
  description?: string;
  showBadge?: boolean;
}

const OrderStatus: React.FC<OrderStatusProps> = ({
  status,
  title,
  description,
  showBadge = false,
}) => {
  const getIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={24} />;
      case 'pending':
        return <Clock size={24} />;
      case 'failed':
        return <XCircle size={24} />;
      case 'escrow':
        return <Shield size={24} />;
    }
  };

  const getDefaultTitle = () => {
    switch (status) {
      case 'completed':
        return 'Payment Successful';
      case 'pending':
        return 'Payment Pending';
      case 'failed':
        return 'Payment Failed';
      case 'escrow':
        return 'Funds in Escrow';
    }
  };

  const getDefaultDescription = () => {
    switch (status) {
      case 'completed':
        return 'Your payment has been processed successfully';
      case 'pending':
        return 'Your payment is being processed';
      case 'failed':
        return 'There was an issue processing your payment';
      case 'escrow':
        return 'Your payment is securely held until project completion';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      case 'escrow':
        return 'In Escrow';
    }
  };

  return (
    <StatusCard>
      <IconWrapper status={status}>{getIcon()}</IconWrapper>
      <StatusContent>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <StatusTitle>{title || getDefaultTitle()}</StatusTitle>
          {showBadge && <StatusBadge status={status}>{getStatusText()}</StatusBadge>}
        </div>
        <StatusDescription>{description || getDefaultDescription()}</StatusDescription>
      </StatusContent>
    </StatusCard>
  );
};

export default OrderStatus;
