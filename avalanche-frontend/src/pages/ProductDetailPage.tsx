import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { styled } from '../stitches.config';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import {
  ShoppingCart,
  CreditCard,
  Star,
  Package,
  Shield,
  Clock,
  ChevronRight,
  Loader,
  MessageCircle,
} from 'lucide-react';
import API from '../services/api';
import { getProductImageUrl } from '../utils/cloudinary';
import { useCart } from '../context/CartContext';

const PageContainer = styled('div', {
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '$6',
  backgroundColor: 'var(--bg-primary)',
});

const Breadcrumb = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  marginBottom: '$6',
  fontSize: '$sm',
  color: 'var(--text-secondary)',
  flexWrap: 'wrap',
});

const BreadcrumbLink = styled('a', {
  color: 'var(--text-secondary)',
  textDecoration: 'none',
  cursor: 'pointer',
  '&:hover': {
    color: '$primary500',
  },
});

const BreadcrumbSeparator = styled('span', {
  color: 'var(--text-tertiary)',
});

const ContentGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '$8',
  '@md': {
    gridTemplateColumns: '1fr 1.2fr',
  },
});

const ImageSection = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$4',
});

const MainImageContainer = styled('div', {
  width: '100%',
  aspectRatio: '1',
  backgroundColor: 'var(--image-bg)',
  borderRadius: '$lg',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
});

const MainImage = styled('img', {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const ImagePlaceholder = styled('div', {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '$gray400',
  fontSize: '$lg',
});

const ImageCarousel = styled('div', {
  display: 'flex',
  gap: '$3',
  overflowX: 'auto',
  paddingBottom: '$2',
  '&::-webkit-scrollbar': {
    height: '6px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '$gray300',
    borderRadius: '3px',
  },
});

const ThumbnailImage = styled('div', {
  minWidth: '80px',
  width: '80px',
  height: '80px',
  backgroundColor: 'var(--card-bg-dark)',
  borderRadius: '$base',
  cursor: 'pointer',
  border: '2px solid transparent',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: '$primary500',
  },
  variants: {
    active: {
      true: {
        borderColor: '$primary500',
        boxShadow: '0 0 0 1px $colors$primary500',
      },
    },
  },
});

const Thumbnail = styled('img', {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const InfoSection = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$6',
});

const ProductTitle = styled('h1', {
  fontSize: '$3xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  lineHeight: 1.3,
  marginBottom: '$2',
});

const ProductDescription = styled('p', {
  fontSize: '$base',
  color: 'var(--text-secondary)',
  lineHeight: 1.6,
});

const RatingContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  marginBottom: '$4',
});

const StarRating = styled('div', {
  display: 'flex',
  gap: '$1',
});

const RatingText = styled('span', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
});

const PriceSection = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
  padding: '$5',
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '$lg',
  marginBottom: '$4',
});

const PriceRow = styled('div', {
  display: 'flex',
  alignItems: 'baseline',
  gap: '$3',
});

const CurrentPrice = styled('div', {
  fontSize: '$4xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
});

const OriginalPrice = styled('div', {
  fontSize: '$xl',
  color: 'var(--text-tertiary)',
  textDecoration: 'line-through',
});

const AIBadge = styled('div', {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$2 $3',
  backgroundColor: 'var(--tag-bg)',
  color: 'var(--tag-text)',
  borderRadius: '$full',
  fontSize: '$sm',
  fontWeight: '$medium',
});

const StockInfo = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  color: 'var(--success-color)',
  fontSize: '$sm',
  fontWeight: '$medium',
});

const SellerCard = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$4',
  padding: '$4',
  backgroundColor: 'var(--card-bg)',
  border: '1px solid $gray200',
  borderRadius: '$lg',
  marginBottom: '$4',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: '$primary500',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
});

const SellerAvatar = styled('img', {
  width: '60px',
  height: '60px',
  borderRadius: '$full',
  objectFit: 'cover',
});

const SellerAvatarPlaceholder = styled('div', {
  width: '60px',
  height: '60px',
  borderRadius: '$full',
  backgroundColor: '$primary500',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--card-bg)',
  fontSize: '$xl',
  fontWeight: '$bold',
});

const SellerInfo = styled('div', {
  flex: 1,
});

const SellerName = styled('div', {
  fontSize: '$base',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
  marginBottom: '$1',
});

const SellerBadge = styled('div', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
});

const SellerStats = styled('div', {
  display: 'flex',
  gap: '$1',
  fontSize: '$xs',
  color: 'var(--text-tertiary)',
  marginTop: '$1',
});

const ActionButtons = styled('div', {
  display: 'flex',
  gap: '$3',
  marginBottom: '$6',
  flexWrap: 'wrap',
});

const AddToCartButton = styled('button', {
  flex: 1,
  minWidth: '200px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$2',
  padding: '$4 $6',
  backgroundColor: '$primary500',
  color: 'var(--card-bg)',
  border: 'none',
  borderRadius: '$lg',
  fontSize: '$base',
  fontWeight: '$semibold',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '$primary600',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px var(--primary-shadow)',
  },
  '&:disabled': {
    backgroundColor: '$gray300',
    cursor: 'not-allowed',
    transform: 'none',
  },
});

const BuyNowButton = styled('button', {
  flex: 1,
  minWidth: '200px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$2',
  padding: '$4 $6',
  backgroundColor: 'var(--card-bg)',
  color: '$primary500',
  border: '2px solid $primary500',
  borderRadius: '$lg',
  fontSize: '$base',
  fontWeight: '$semibold',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '$primary50',
    transform: 'translateY(-1px)',
  },
  '&:disabled': {
    borderColor: '$gray300',
    color: '$gray400',
    cursor: 'not-allowed',
    transform: 'none',
  },
});

const ChatSellerButton = styled('button', {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$2',
  padding: '$3 $6',
  backgroundColor: 'var(--card-bg)',
  color: 'var(--success-color)',
  border: '2px solid var(--success-color)',
  borderRadius: '$lg',
  fontSize: '$base',
  fontWeight: '$semibold',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#f0fdf4',
    transform: 'translateY(-1px)',
  },
  '&:disabled': {
    borderColor: '$gray300',
    color: '$gray400',
    cursor: 'not-allowed',
    transform: 'none',
  },
});

const TabContainer = styled('div', {
  marginTop: '$8',
  borderTop: '1px solid var(--border-color)',
});

const TabList = styled('div', {
  display: 'flex',
  gap: '$6',
  borderBottom: '2px solid var(--border-color)',
  marginBottom: '$6',
});

const Tab = styled('button', {
  padding: '$3 $4',
  backgroundColor: 'transparent',
  border: 'none',
  borderBottom: '2px solid transparent',
  marginBottom: '-2px',
  fontSize: '$base',
  fontWeight: '$medium',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    color: '$primary500',
  },
  variants: {
    active: {
      true: {
        color: '$primary500',
        borderBottomColor: '$primary500',
      },
    },
  },
});

const TabContent = styled('div', {
  padding: '$6 0',
});

const FeatureList = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$4',
});

const FeatureItem = styled('div', {
  display: 'flex',
  gap: '$3',
  alignItems: 'flex-start',
});

const FeatureIcon = styled('div', {
  minWidth: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '$primary500',
});

const FeatureText = styled('div', {
  flex: 1,
});

const FeatureTitle = styled('div', {
  fontSize: '$base',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
  marginBottom: '$1',
});

const FeatureDescription = styled('div', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
  lineHeight: 1.6,
});

const RecommendationsSection = styled('section', {
  marginTop: '$12',
  paddingTop: '$8',
  borderTop: '1px solid var(--border-color)',
});

const SectionTitle = styled('h2', {
  fontSize: '$2xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  marginBottom: '$6',
});

const RecommendationsGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '$6',
});

const RecommendedCard = styled('div', {
  backgroundColor: 'var(--bg-primary)',
  borderRadius: '$lg',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
  },
});

const RecommendedImage = styled('div', {
  width: '100%',
  aspectRatio: '1',
  backgroundColor: 'var(--card-bg-dark)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const RecommendedInfo = styled('div', {
  padding: '$4',
});

const RecommendedTitle = styled('div', {
  fontSize: '$sm',
  fontWeight: '$medium',
  color: 'var(--text-primary)',
  marginBottom: '$2',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const RecommendedPrice = styled('div', {
  fontSize: '$lg',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
});

const LoadingContainer = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '400px',
  color: '$primary500',
});

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  condition: string;
  image_url?: string;
  seller_id: number;
  seller?: {
    id: number;
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
  created_at: string;
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [addedToCart, setAddedToCart] = useState(false);

  // Get product images - use Cloudinary placeholders if no image
  const productImages = product 
    ? [
        getProductImageUrl(product.image_url, product.category, 800, 800),
        getProductImageUrl(product.image_url, product.category, 800, 800),
        getProductImageUrl(product.image_url, product.category, 800, 800),
        getProductImageUrl(product.image_url, product.category, 800, 800),
      ]
    : [];

  const loadProduct = async () => {
    try {
      setLoading(true);
      console.log('Loading product with ID:', id);
      const productData = await API.products.getById(Number(id));
      console.log('Product response:', productData);
      setProduct(productData);
    } catch (error) {
      console.error('Failed to load product:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const recommendationsData = await API.products.getAll({ limit: 4 });
      console.log('Recommendations response:', recommendationsData);
      // Check if response is array or has a data property
      const productsArray = Array.isArray(recommendationsData) ? recommendationsData : recommendationsData.data || [];
      setRecommendations(productsArray);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('avalanche_token');
    setIsAuthenticated(!!token);
    if (id) {
      loadProduct();
      loadRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      id: Date.now(), // Temporary ID for cart item
      product_id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      seller_id: product.seller_id,
    });

    // Show feedback
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!product) {
      alert('Product information not available');
      return;
    }

    // Validate required product fields
    if (!product.seller_id) {
      console.error('Product missing seller_id:', product);
      alert('Product seller information is missing. Please contact support.');
      return;
    }

    setBuyNowLoading(true);

    try {
      // Calculate escrow fee (5%)
      const serviceFee = product.price * 0.05;

      console.log('Creating order with data:', {
        product_id: product.id,
        seller_id: product.seller_id,
        item_name: product.name,
        item_cost: product.price,
      });

      // Step 1: Create order directly
      const order = await API.payments.initialize({
        order_id: product.id, // This will need to be adjusted since we don't have an order yet
        payment_method: 'card',
        payment_provider: 'stripe',
      });

      console.log('Order created successfully:', order);

      // Step 2: Initialize Stripe payment and get checkout URL
      const payment = await API.payments.initialize({
        order_id: order.id,
        payment_method: 'card',
        payment_provider: 'stripe',
      });

      console.log('Payment initialized successfully:', payment);

      // Step 3: Redirect directly to Stripe Checkout
      if (payment.checkout_url || payment.authorization_url) {
        window.location.href = payment.checkout_url || payment.authorization_url;
      } else {
        throw new Error('No checkout URL received from payment provider');
      }

    } catch (error) {
      console.error('Payment initialization failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to initialize payment: ${errorMessage}`);
      setBuyNowLoading(false);
    }
  };

  const handleSellerClick = () => {
    if (product?.seller_id) {
      navigate(`/user/${product.seller_id}`);
    }
  };

  const handleChatWithSeller = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!product?.seller_id) {
      alert('Seller information not available');
      return;
    }

    try {
      // Send initial message to create conversation
      const initialMessage = `Hi, I'm interested in your product "${product.name}". Can we discuss the details?`;
      await API.messages.send({
        content: initialMessage,
        recipient_id: product.seller_id,
      });

      // Navigate to messages page with the seller conversation
      navigate(`/messages?user=${product.seller_id}`);
    } catch (error) {
      console.error('Failed to initiate chat:', error);
      alert('Failed to start conversation. Please try again.');
    }
  };

  const getOriginalPrice = (price: number) => {
    // Mock original price calculation (20% markup for display)
    return Math.round(price * 1.2 * 100) / 100;
  };

  const getRatingCount = () => {
    // Mock rating count
    return Math.floor(Math.random() * 2000) + 100;
  };

  if (loading) {
    return (
      <Layout isAuthenticated={isAuthenticated}>
        <LoadingContainer>
          <Loader size={40} className="animate-spin" />
        </LoadingContainer>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout isAuthenticated={isAuthenticated}>
        <PageContainer>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>Product Not Found</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/marketplace')}>Back to Marketplace</Button>
          </div>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout isAuthenticated={isAuthenticated}>
      <PageContainer>
        <Breadcrumb>
          <BreadcrumbLink onClick={() => navigate('/')}>Home</BreadcrumbLink>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbLink onClick={() => navigate('/marketplace')}>Marketplace</BreadcrumbLink>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbLink onClick={() => navigate(`/marketplace?category=${product.category}`)}>
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </BreadcrumbLink>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <span style={{ color: 'var(--text-primary)' }}>{product.name}</span>
        </Breadcrumb>

        <ContentGrid>
          {/* Image Section */}
          <ImageSection>
            <MainImageContainer>
              {productImages.length > 0 ? (
                <MainImage src={productImages[selectedImageIndex]} alt={product.name} />
              ) : (
                <ImagePlaceholder>
                  <Package size={80} color="var(--text-tertiary)" />
                </ImagePlaceholder>
              )}
            </MainImageContainer>
            
            {productImages.length > 1 && (
              <ImageCarousel>
                {productImages.map((image, index) => (
                  <ThumbnailImage
                    key={index}
                    active={selectedImageIndex === index}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Thumbnail src={image} alt={`${product.name} ${index + 1}`} />
                  </ThumbnailImage>
                ))}
              </ImageCarousel>
            )}
          </ImageSection>

          {/* Info Section */}
          <InfoSection>
            <div>
              <ProductTitle>{product.name}</ProductTitle>
              <ProductDescription>{product.description}</ProductDescription>
              
              <RatingContainer>
                <StarRating>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      fill={star <= 4 ? '#fbbf24' : 'none'}
                      color="#fbbf24"
                    />
                  ))}
                </StarRating>
                <RatingText>({getRatingCount()} ratings)</RatingText>
              </RatingContainer>
            </div>

            <PriceSection>
              <PriceRow>
                <CurrentPrice>${product.price.toFixed(2)}</CurrentPrice>
                <OriginalPrice>${getOriginalPrice(product.price).toFixed(2)}</OriginalPrice>
              </PriceRow>
              <AIBadge>
                <Shield size={16} />
                AI Suggested Deal
              </AIBadge>
              <StockInfo>
                <Package size={18} />
                Available in stock. Ships in 2-3 business days.
              </StockInfo>
            </PriceSection>

            <SellerCard onClick={handleSellerClick}>
              {product.seller?.avatar_url ? (
                <SellerAvatar src={product.seller.avatar_url} alt={product.seller.username} />
              ) : (
                <SellerAvatarPlaceholder>
                  {product.seller?.username?.charAt(0).toUpperCase() || 'U'}
                </SellerAvatarPlaceholder>
              )}
              <SellerInfo>
                <SellerName>
                  Sold by {product.seller?.full_name || product.seller?.username || 'MAGNUS Studios'}
                </SellerName>
                <SellerBadge>Top Rated Seller • 98.5% Positive Feedback</SellerBadge>
                <SellerStats>
                  <span>⭐ 4.9/5.0</span>
                  <span>•</span>
                  <span>1,234 sales</span>
                </SellerStats>
              </SellerInfo>
              <ChevronRight size={24} color="var(--text-tertiary)" />
            </SellerCard>

            <ActionButtons>
              <AddToCartButton onClick={handleAddToCart} disabled={product.stock === 0}>
                <ShoppingCart size={20} />
                {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
              </AddToCartButton>
              <BuyNowButton onClick={handleBuyNow} disabled={product.stock === 0 || buyNowLoading}>
                <CreditCard size={20} />
                {buyNowLoading ? 'Processing...' : 'Buy Now'}
              </BuyNowButton>
            </ActionButtons>

            <ChatSellerButton onClick={handleChatWithSeller}>
              <MessageCircle size={20} />
              Chat with Seller
            </ChatSellerButton>
          </InfoSection>
        </ContentGrid>

        {/* Tabs Section */}
        <TabContainer>
          <TabList>
            <Tab
              active={activeTab === 'description'}
              onClick={() => setActiveTab('description')}
            >
              Description
            </Tab>
            <Tab
              active={activeTab === 'specifications'}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </Tab>
            <Tab
              active={activeTab === 'reviews'}
              onClick={() => setActiveTab('reviews')}
            >
              User Reviews ({getRatingCount()})
            </Tab>
          </TabList>

          <TabContent>
            {activeTab === 'description' && (
              <FeatureList>
                <FeatureItem>
                  <FeatureIcon>
                    <Package size={24} />
                  </FeatureIcon>
                  <FeatureText>
                    <FeatureTitle>Product Overview</FeatureTitle>
                    <FeatureDescription>
                      {product.description}
                    </FeatureDescription>
                  </FeatureText>
                </FeatureItem>
                
                <FeatureItem>
                  <FeatureIcon>
                    <Shield size={24} />
                  </FeatureIcon>
                  <FeatureText>
                    <FeatureTitle>Quality Assurance</FeatureTitle>
                    <FeatureDescription>
                      This product is in {product.condition} condition and has been verified by our quality assurance team.
                      All items come with buyer protection and a satisfaction guarantee.
                    </FeatureDescription>
                  </FeatureText>
                </FeatureItem>
                
                <FeatureItem>
                  <FeatureIcon>
                    <Clock size={24} />
                  </FeatureIcon>
                  <FeatureText>
                    <FeatureTitle>Shipping & Delivery</FeatureTitle>
                    <FeatureDescription>
                      Fast shipping available. Most orders ship within 2-3 business days. 
                      Track your order from dispatch to delivery with our integrated tracking system.
                    </FeatureDescription>
                  </FeatureText>
                </FeatureItem>
              </FeatureList>
            )}

            {activeTab === 'specifications' && (
              <FeatureList>
                <FeatureItem>
                  <FeatureText>
                    <FeatureTitle>Category</FeatureTitle>
                    <FeatureDescription>
                      {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                    </FeatureDescription>
                  </FeatureText>
                </FeatureItem>
                
                <FeatureItem>
                  <FeatureText>
                    <FeatureTitle>Condition</FeatureTitle>
                    <FeatureDescription>
                      {product.condition.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </FeatureDescription>
                  </FeatureText>
                </FeatureItem>
                
                <FeatureItem>
                  <FeatureText>
                    <FeatureTitle>Stock Available</FeatureTitle>
                    <FeatureDescription>{product.stock} units</FeatureDescription>
                  </FeatureText>
                </FeatureItem>
                
                <FeatureItem>
                  <FeatureText>
                    <FeatureTitle>Listed Date</FeatureTitle>
                    <FeatureDescription>
                      {new Date(product.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </FeatureDescription>
                  </FeatureText>
                </FeatureItem>
              </FeatureList>
            )}

            {activeTab === 'reviews' && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                <Star size={48} color="#fbbf24" style={{ margin: '0 auto 16px' }} />
                <p style={{ fontSize: '18px', marginBottom: '8px' }}>Reviews Coming Soon</p>
                <p style={{ fontSize: '14px' }}>
                  Be the first to review this product and help other buyers make informed decisions.
                </p>
              </div>
            )}
          </TabContent>
        </TabContainer>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <RecommendationsSection>
            <SectionTitle>You Might Also Like</SectionTitle>
            <RecommendationsGrid>
              {recommendations.map((item) => (
                <RecommendedCard
                  key={item.id}
                  onClick={() => navigate(`/marketplace/product/${item.id}`)}
                >
                  <RecommendedImage>
                    <img
                      src={getProductImageUrl(item.image_url, item.category, 300, 300)}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.src = getProductImageUrl(null, item.category, 300, 300);
                      }}
                    />
                  </RecommendedImage>
                  <RecommendedInfo>
                    <RecommendedTitle>{item.name}</RecommendedTitle>
                    <RecommendedPrice>${item.price.toFixed(2)}</RecommendedPrice>
                  </RecommendedInfo>
                </RecommendedCard>
              ))}
            </RecommendationsGrid>
          </RecommendationsSection>
        )}
      </PageContainer>
    </Layout>
  );
};

export default ProductDetailPage;
