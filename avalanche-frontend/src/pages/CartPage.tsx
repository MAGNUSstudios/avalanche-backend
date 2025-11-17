import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '../stitches.config';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Header from '../components/layout/Header';
import { getProductImageUrl } from '../utils/cloudinary';

const PageContainer = styled('div', {
  minHeight: '100vh',
  backgroundColor: 'var(--bg-primary)',
  paddingTop: '73px',
});

const Container = styled('div', {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '$8',
});

const BackButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$2 $4',
  backgroundColor: 'transparent',
  border: '1px solid var(--border-color)',
  borderRadius: '$base',
  color: 'var(--text-primary)',
  fontSize: '$sm',
  fontWeight: '$medium',
  cursor: 'pointer',
  marginBottom: '$6',
  transition: 'all 0.2s',

  '&:hover': {
    backgroundColor: 'var(--bg-secondary)',
    borderColor: 'var(--primary-color)',
  },
});

const PageTitle = styled('h1', {
  fontSize: '$3xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  marginBottom: '$6',
});

const CartGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '$8',
  '@md': {
    gridTemplateColumns: '2fr 1fr',
  },
});

const CartItems = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$4',
});

const CartItem = styled('div', {
  backgroundColor: 'var(--card-bg)',
  borderRadius: '$lg',
  padding: '$4',
  border: '1px solid var(--border-color)',
  display: 'flex',
  gap: '$4',
  transition: 'all 0.2s',

  '&:hover': {
    borderColor: 'var(--primary-color)',
  },
});

const ItemImage = styled('img', {
  width: '120px',
  height: '120px',
  borderRadius: '$base',
  objectFit: 'cover',
  backgroundColor: 'var(--bg-tertiary)',
  flexShrink: 0,
});

const ItemDetails = styled('div', {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
});

const ItemName = styled('h3', {
  fontSize: '$lg',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
  marginBottom: '$1',
});

const ItemPrice = styled('div', {
  fontSize: '$xl',
  fontWeight: '$bold',
  color: 'var(--primary-color)',
});

const ItemActions = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  marginTop: 'auto',
});

const QuantityControl = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  border: '1px solid var(--border-color)',
  borderRadius: '$base',
  padding: '$1',
});

const QuantityButton = styled('button', {
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '$base',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  transition: 'all 0.2s',

  '&:hover': {
    backgroundColor: 'var(--bg-tertiary)',
  },

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

const QuantityDisplay = styled('div', {
  minWidth: '40px',
  textAlign: 'center',
  fontSize: '$base',
  fontWeight: '$medium',
  color: 'var(--text-primary)',
});

const DeleteButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$2 $3',
  backgroundColor: 'transparent',
  border: '1px solid #ef4444',
  borderRadius: '$base',
  color: '#ef4444',
  fontSize: '$sm',
  cursor: 'pointer',
  transition: 'all 0.2s',

  '&:hover': {
    backgroundColor: '#ef4444',
    color: 'white',
  },
});

const OrderSummary = styled('div', {
  backgroundColor: 'var(--card-bg)',
  borderRadius: '$lg',
  padding: '$6',
  border: '1px solid var(--border-color)',
  height: 'fit-content',
  position: 'sticky',
  top: '90px',
});

const SummaryTitle = styled('h2', {
  fontSize: '$xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  marginBottom: '$4',
});

const SummaryRow = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '$3',
  fontSize: '$base',
  color: 'var(--text-secondary)',
});

const TotalRow = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '$4',
  paddingTop: '$4',
  borderTop: '2px solid var(--border-color)',
  fontSize: '$xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
});

const CheckoutButton = styled('button', {
  width: '100%',
  padding: '$4',
  borderRadius: '$lg',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  fontSize: '$base',
  fontWeight: '$semibold',
  border: 'none',
  cursor: 'pointer',
  marginTop: '$4',
  transition: 'all 0.2s',

  '&:hover': {
    backgroundColor: 'var(--primary-hover)',
    transform: 'translateY(-1px)',
  },

  '&:disabled': {
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-secondary)',
    cursor: 'not-allowed',
    transform: 'none',
  },
});

const EmptyCart = styled('div', {
  textAlign: 'center',
  padding: '$12',
  backgroundColor: 'var(--card-bg)',
  borderRadius: '$lg',
  border: '1px solid var(--border-color)',
});

const EmptyCartIcon = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '$4',
  color: 'var(--text-secondary)',
});

const EmptyCartText = styled('p', {
  fontSize: '$lg',
  color: 'var(--text-secondary)',
  marginBottom: '$2',
});

const ContinueShoppingButton = styled('button', {
  marginTop: '$4',
  padding: '$3 $6',
  borderRadius: '$lg',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  fontSize: '$base',
  fontWeight: '$semibold',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s',

  '&:hover': {
    backgroundColor: 'var(--primary-hover)',
  },
});

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, itemCount, totalAmount, updateQuantity, removeFromCart } = useCart();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('avalanche_token');
    setIsAuthenticated(!!token);
  }, []);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/cart');
      return;
    }

    try {
      // Prepare cart items for checkout
      const cartItems = items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }));

      // Call cart checkout endpoint
      const response = await fetch('http://localhost:8000/cart/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('avalanche_token')}`
        },
        body: JSON.stringify({
          items: cartItems,
          payment_method: 'card',
          payment_provider: 'stripe'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Checkout failed');
      }

      const checkoutData = await response.json();

      // Store checkout info in session storage for payment verification
      sessionStorage.setItem('checkout_session_id', checkoutData.checkout_session_id);
      sessionStorage.setItem('checkout_orders', JSON.stringify(checkoutData.orders));

      // Redirect to Stripe (in production)
      // window.location.href = checkoutData.payment_url;

      // Redirect to Stripe checkout URL
      if (checkoutData.payment_url) {
        window.location.href = checkoutData.payment_url;
      } else {
        alert('Payment URL not available. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(`Checkout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const serviceFee = totalAmount * 0.05; // 5% service fee
  const total = totalAmount + serviceFee;

  if (items.length === 0) {
    return (
      <>
        <Header isAuthenticated={isAuthenticated} />
        <PageContainer>
          <Container>
            <BackButton onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
              Back
            </BackButton>

            <EmptyCart>
              <EmptyCartIcon>
                <ShoppingBag size={80} />
              </EmptyCartIcon>
              <EmptyCartText>Your cart is empty</EmptyCartText>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Looks like you haven't added anything to your cart yet
              </p>
              <ContinueShoppingButton onClick={() => navigate('/marketplace')}>
                Continue Shopping
              </ContinueShoppingButton>
            </EmptyCart>
          </Container>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <Header isAuthenticated={isAuthenticated} />
      <PageContainer>
        <Container>
          <BackButton onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            Back
          </BackButton>

          <PageTitle>Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})</PageTitle>

          <CartGrid>
            <CartItems>
              {items.map((item) => (
                <CartItem key={item.product_id}>
                  <ItemImage
                    src={getProductImageUrl(item.image_url, 'electronics', 300, 300)}
                    alt={item.name}
                    onClick={() => navigate(`/marketplace/product/${item.product_id}`)}
                    style={{ cursor: 'pointer' }}
                  />
                  <ItemDetails>
                    <ItemName
                      onClick={() => navigate(`/marketplace/product/${item.product_id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      {item.name}
                    </ItemName>
                    <ItemPrice>${item.price.toFixed(2)}</ItemPrice>
                    <ItemActions>
                      <QuantityControl>
                        <QuantityButton
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={16} />
                        </QuantityButton>
                        <QuantityDisplay>{item.quantity}</QuantityDisplay>
                        <QuantityButton
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        >
                          <Plus size={16} />
                        </QuantityButton>
                      </QuantityControl>
                      <DeleteButton onClick={() => removeFromCart(item.product_id)}>
                        <Trash2 size={16} />
                        Remove
                      </DeleteButton>
                    </ItemActions>
                  </ItemDetails>
                </CartItem>
              ))}
            </CartItems>

            <OrderSummary>
              <SummaryTitle>Order Summary</SummaryTitle>
              <SummaryRow>
                <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                <span>${totalAmount.toFixed(2)}</span>
              </SummaryRow>
              <SummaryRow>
                <span>Service Fee (5%)</span>
                <span>${serviceFee.toFixed(2)}</span>
              </SummaryRow>
              <TotalRow>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </TotalRow>
              <CheckoutButton onClick={handleCheckout}>
                Proceed to Checkout
              </CheckoutButton>
            </OrderSummary>
          </CartGrid>
        </Container>
      </PageContainer>
    </>
  );
};

export default CartPage;
