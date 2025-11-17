import React from 'react';
import { styled } from '../../stitches.config';

const StyledCard = styled('div', {
  backgroundColor: '$cardBg',
  borderRadius: '$lg',
  padding: '$6',
  boxShadow: '$base',
  transition: 'all 0.3s ease',

  '&:hover': {
    boxShadow: '$lg',
    transform: 'translateY(-4px)',
  },

  variants: {
    variant: {
      default: {
        border: '1px solid $borderColor',
      },
      elevated: {
        boxShadow: '$md',
      },
      outline: {
        border: '1px solid $borderColor',
        boxShadow: 'none',
      },
    },
  },

  defaultVariants: {
    variant: 'default',
  },
});

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outline';
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className,
  onClick,
}) => {
  return (
    <StyledCard variant={variant} className={className} onClick={onClick}>
      {children}
    </StyledCard>
  );
};

export default Card;
