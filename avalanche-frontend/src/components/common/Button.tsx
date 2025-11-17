import React from 'react';
import { styled } from '../../stitches.config';

const StyledButton = styled('button', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$2',
  padding: '$3 $6',
  borderRadius: '$base',
  fontSize: '$base',
  fontWeight: '$semibold',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  textDecoration: 'none',

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  variants: {
    variant: {
      primary: {
        backgroundColor: '$primaryColor',
        color: '$textWhite',
        '&:hover': {
          backgroundColor: '$primaryHover',
          transform: 'translateY(-1px)',
          boxShadow: '$md',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      },
      secondary: {
        backgroundColor: '$bgSecondary',
        color: '$textPrimary',
        border: '2px solid $borderColor',
        '&:hover': {
          backgroundColor: '$bgTertiary',
          borderColor: '$gray400',
        },
      },
      outline: {
        backgroundColor: 'transparent',
        color: '$textPrimary',
        border: '1px solid $borderColor',
        '&:hover': {
          backgroundColor: '$bgSecondary',
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '$textPrimary',
        '&:hover': {
          backgroundColor: '$bgSecondary',
        },
      },
    },
    size: {
      sm: {
        padding: '$2 $4',
        fontSize: '$sm',
      },
      md: {
        padding: '$3 $6',
        fontSize: '$base',
      },
      lg: {
        padding: '$4 $8',
        fontSize: '$lg',
      },
    },
  },

  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  as?: any;
  to?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  ...props
}) => {
  return (
    <StyledButton variant={variant} size={size} {...props}>
      {children}
    </StyledButton>
  );
};

export default Button;
