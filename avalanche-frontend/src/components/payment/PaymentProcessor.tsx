import React, { useEffect } from 'react';
import { styled } from '../../stitches.config';

const PaystackContainer = styled('div', {
  width: '100%',
});

interface PaymentProcessorProps {
  amount: number;
  email: string;
  orderId: number;
  onSuccess: (reference: string) => void;
  onCancel: () => void;
  publicKey?: string;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        ref: string;
        onClose: () => void;
        callback: (response: { reference: string }) => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  amount,
  email,
  orderId,
  onSuccess,
  onCancel,
  publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_xxx',
}) => {
  useEffect(() => {
    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializePayment = () => {
    if (!window.PaystackPop) {
      alert('Payment system is loading, please try again in a moment.');
      return;
    }

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: email,
      amount: amount * 100, // Convert to kobo/cents
      ref: `ORDER_${orderId}_${Date.now()}`,
      onClose: () => {
        onCancel();
      },
      callback: (response) => {
        onSuccess(response.reference);
      },
    });

    handler.openIframe();
  };

  return (
    <PaystackContainer>
      <button
        onClick={initializePayment}
        style={{
          width: '100%',
          padding: '16px',
          backgroundColor: 'var(--primary-color)',
          color: 'white',
          fontSize: '16px',
          fontWeight: '600',
          borderRadius: '12px',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 0 15px var(--primary-glow), 0 0 20px var(--primary-glow-soft)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 0 20px var(--primary-glow), 0 0 30px var(--primary-glow-soft)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 0 15px var(--primary-glow), 0 0 20px var(--primary-glow-soft)';
        }}
      >
        Pay ${amount.toFixed(2)} Securely
      </button>
    </PaystackContainer>
  );
};

export default PaymentProcessor;
