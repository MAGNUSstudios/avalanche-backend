import React, { useState, useEffect } from 'react';
import { styled } from '../stitches.config';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Grid,
  Laptop,
  Shirt,
  Home,
  Gamepad2,
  Sparkles,
  Loader,
  Plus,
  Package,
} from 'lucide-react';
import API from '../services/api';
import { getProductImageUrl } from '../utils/cloudinary';

const PageContainer = styled('div', {
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '$6',
});

const PageHeader = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '$6',
});

const PageTitle = styled('h1', {
  fontSize: '$4xl',
  fontWeight: '$bold',
  color: '$gray900',
});

const AddItemButton = styled(Link, {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$3 $5',
  backgroundColor: '$primary500',
  color: 'white',
  borderRadius: '$base',
  textDecoration: 'none',
  fontWeight: '$medium',
  fontSize: '$base',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '$primary600',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  },
});

const SearchContainer = styled('div', {
  display: 'flex',
  gap: '$4',
  marginBottom: '$8',
  flexWrap: 'wrap',
  '@md': {
    flexWrap: 'nowrap',
  },
});

const SearchInputWrapper = styled('div', {
  position: 'relative',
  flex: 1,
  minWidth: '250px',
});

const SearchIcon = styled(Search, {
  position: 'absolute',
  left: '$4',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '$gray400',
});

const AIIcon = styled(Sparkles, {
  position: 'absolute',
  left: '$4',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '$primary500',
});

const SearchInput = styled('input', {
  width: '100%',
  padding: '$3 $4 $3 $10',
  borderRadius: '$base',
  border: '1px solid $gray300',
  fontSize: '$base',
  '&:focus': {
    outline: 'none',
    borderColor: '$primary500',
    boxShadow: '0 0 0 3px rgba(0, 112, 243, 0.1)',
  },
  '&::placeholder': {
    color: '$gray400',
  },
});

const BudgetInput = styled('input', {
  padding: '$3 $4',
  borderRadius: '$base',
  border: '1px solid $gray300',
  fontSize: '$base',
  width: '200px',
  '&:focus': {
    outline: 'none',
    borderColor: '$primary500',
  },
  '&::placeholder': {
    color: '$gray400',
  },
});

const ContentWrapper = styled('div', {
  display: 'flex',
  gap: '$6',
  flexDirection: 'column',
  '@lg': {
    flexDirection: 'row',
  },
});

const Sidebar = styled('aside', {
  width: '100%',
  '@lg': {
    width: '220px',
    flexShrink: 0,
  },
});

const FilterSection = styled('div', {
  marginBottom: '$6',
});

const FilterTitle = styled('h3', {
  fontSize: '$sm',
  fontWeight: '$semibold',
  color: '$gray600',
  marginBottom: '$3',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
});

const FilterList = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
});

const FilterItem = styled('button', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  padding: '$3 $4',
  borderRadius: '$base',
  border: 'none',
  backgroundColor: 'transparent',
  color: '$gray700',
  fontSize: '$sm',
  fontWeight: '$medium',
  cursor: 'pointer',
  transition: 'all 0.2s',
  textAlign: 'left',
  '&:hover': {
    backgroundColor: '$gray100',
  },
  variants: {
    active: {
      true: {
        backgroundColor: '$primary50',
        color: '$primary600',
      },
    },
  },
});

const ProductsSection = styled('div', {
  flex: 1,
});

const ProductGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '$6',
  marginBottom: '$10',
  '@sm': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  '@lg': {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
  '@xl': {
    gridTemplateColumns: 'repeat(4, 1fr)',
  },
});

const ProductCard = styled('div', {
  backgroundColor: 'white',
  borderRadius: '$lg',
  overflow: 'hidden',
  boxShadow: '$base',
  transition: 'all 0.3s',
  cursor: 'pointer',
  '&:hover': {
    boxShadow: '$lg',
    transform: 'translateY(-4px)',
  },
});

const ProductImageContainer = styled('div', {
  width: '100%',
  height: '200px',
  backgroundColor: '$gray100',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  position: 'relative',
  variants: {
    color: {
      dark: { backgroundColor: '#2d3e50' },
      teal: { backgroundColor: '#5a9c8e' },
      black: { backgroundColor: '#1a1a1a' },
      light: { backgroundColor: '#f5f5f5' },
    },
  },
});

const ProductImage = styled('img', {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const ProductImagePlaceholder = styled('div', {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '$gray400',
});

const ProductInfo = styled('div', {
  padding: '$4',
});

const ProductTitle = styled('h3', {
  fontSize: '$lg',
  fontWeight: '$semibold',
  marginBottom: '$2',
  color: '$gray900',
});

const ProductMeta = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  marginBottom: '$3',
});

const ProductPrice = styled('div', {
  fontSize: '$xl',
  fontWeight: '$bold',
  color: '$primary500',
});

const SellerInfo = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  fontSize: '$sm',
  color: '$gray600',
});

const SellerAvatar = styled('div', {
  width: '20px',
  height: '20px',
  borderRadius: '$full',
  backgroundColor: '$gray300',
});

const RecentlyViewed = styled('section', {
  marginTop: '$10',
});

const SectionTitle = styled('h2', {
  fontSize: '$2xl',
  fontWeight: '$bold',
  marginBottom: '$6',
  color: '$gray900',
});

const RecentlyViewedGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '$4',
  '@md': {
    gridTemplateColumns: 'repeat(4, 1fr)',
  },
});

const SmallProductCard = styled('div', {
  backgroundColor: 'white',
  borderRadius: '$base',
  overflow: 'hidden',
  boxShadow: '$sm',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    boxShadow: '$md',
  },
});

const SmallProductImage = styled('div', {
  width: '100%',
  height: '120px',
  backgroundColor: '$gray100',
  variants: {
    color: {
      dark: { backgroundColor: '#2d3e50' },
      teal: { backgroundColor: '#5a9c8e' },
      black: { backgroundColor: '#1a1a1a' },
      light: { backgroundColor: '#f5f5f5' },
    },
  },
});

const SmallProductInfo = styled('div', {
  padding: '$3',
});

const SmallProductTitle = styled('div', {
  fontSize: '$sm',
  fontWeight: '$semibold',
  marginBottom: '$1',
  color: '$gray900',
});

const SmallProductPrice = styled('div', {
  fontSize: '$base',
  fontWeight: '$bold',
  color: '$primary500',
});

const LoadingContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
  gap: '$4',
});

const LoadingSpinner = styled('div', {
  animation: 'spin 1s linear infinite',
  color: '$primary500',

  '@keyframes spin': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
});

const LoadingText = styled('p', {
  fontSize: '$lg',
  color: '$gray600',
  fontWeight: '$medium',
});

const ErrorContainer = styled('div', {
  padding: '$6',
  backgroundColor: '#fee',
  border: '1px solid #fcc',
  borderRadius: '$lg',
  color: '#c33',
  textAlign: 'center',
});

const EmptyState = styled('div', {
  textAlign: 'center',
  padding: '$12',
  color: '$gray600',

  h3: {
    fontSize: '$xl',
    fontWeight: '$bold',
    marginBottom: '$2',
    color: '$gray900',
  },

  p: {
    fontSize: '$base',
  },
});

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  stock: number;
  seller_id: number;
  is_active: boolean;
  created_at: string;
}

const MarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [budget, setBudget] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<{[key: string]: Product[]}>({});

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('avalanche_token');
    setIsAuthenticated(!!token);
  }, []);

  // Fetch categories and products
  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch categories
        const categoriesData = ['Electronics', 'Fashion', 'Home & Garden', 'Sports & Outdoors', 'Books & Media', 'Toys & Games', 'Art & Crafts', 'Other'];
        setCategories(categoriesData);

        // Fetch products for each category
        const categoryProducts: {[key: string]: Product[]} = {};
        const allProducts: Product[] = [];

        for (const category of categoriesData) {
          try {
            const params: any = { category };
            const products = await API.products.getAll(params);
            categoryProducts[category] = products;
            allProducts.push(...products);
          } catch (err) {
            console.warn(`Failed to fetch products for category ${category}:`, err);
          }
        }

        setProductsByCategory(categoryProducts);

        // Apply current filters to all products
        let filteredProducts = allProducts;
        if (searchQuery) {
          filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }
        if (activeFilter !== 'all') {
          filteredProducts = filteredProducts.filter(product => product.category === activeFilter);
        }
        if (budget) {
          filteredProducts = filteredProducts.filter(product => product.price <= parseFloat(budget));
        }

        setProducts(filteredProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load marketplace data');
        console.error('Error fetching marketplace data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndProducts();
  }, []);

  // Filter products when search/filter changes
  useEffect(() => {
    let filteredProducts: Product[] = [];

    if (activeFilter === 'all') {
      // Combine all products from all categories
      Object.values(productsByCategory).forEach(categoryProducts => {
        filteredProducts.push(...categoryProducts);
      });
    } else {
      // Use products from specific category
      filteredProducts = productsByCategory[activeFilter] || [];
    }

    // Apply search filter
    if (searchQuery) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply budget filter
    if (budget) {
      filteredProducts = filteredProducts.filter(product => product.price <= parseFloat(budget));
    }

    setProducts(filteredProducts);
  }, [searchQuery, activeFilter, budget, productsByCategory]);

  const filters = [
    { id: 'all', label: 'All', icon: <Grid size={18} /> },
    { id: 'Electronics', label: 'Electronics', icon: <Laptop size={18} /> },
    { id: 'Fashion', label: 'Fashion', icon: <Shirt size={18} /> },
    { id: 'Home', label: 'Home Goods', icon: <Home size={18} /> },
    { id: 'Gaming', label: 'Gaming', icon: <Gamepad2 size={18} /> },
  ];

  const getImageColor = (category: string | null): string => {
    const colors: { [key: string]: string } = {
      'Electronics': 'dark',
      'Fashion': 'light',
      'Home': 'teal',
      'Gaming': 'black',
    };
    return colors[category || 'all'] || 'dark';
  };

  return (
    <Layout isAuthenticated={isAuthenticated}>
      <PageContainer>
        <PageHeader>
          <PageTitle>Marketplace</PageTitle>
          <AddItemButton to="/marketplace/create">
            <Plus size={20} />
            Add Item
          </AddItemButton>
        </PageHeader>

        <SearchContainer>
          <SearchInputWrapper>
            <AIIcon size={20} />
            <SearchInput
              placeholder="What do you want to buy today?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchInputWrapper>
          <BudgetInput
            placeholder="Max Budget (e.g., $500)"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </SearchContainer>

        <ContentWrapper>
          <Sidebar>
            <FilterSection>
              <FilterTitle>Categories</FilterTitle>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                Browse by Category
              </p>
              <FilterList>
                {filters.map((filter) => (
                  <FilterItem
                    key={filter.id}
                    active={activeFilter === filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                  >
                    {filter.icon}
                    {filter.label}
                  </FilterItem>
                ))}
              </FilterList>
            </FilterSection>
          </Sidebar>

          <ProductsSection>
            {loading ? (
              <LoadingContainer>
                <LoadingSpinner>
                  <Loader size={48} />
                </LoadingSpinner>
                <LoadingText>Loading marketplace...</LoadingText>
              </LoadingContainer>
            ) : error ? (
              <ErrorContainer>
                <p><strong>Error:</strong> {error}</p>
                <p>Please make sure the backend server is running on http://localhost:8000</p>
              </ErrorContainer>
            ) : (
              <>
                {/* Display products by category */}
                {activeFilter === 'all' ? (
                  // Show all categories with their products
                  categories.map((category) => {
                    const categoryProducts = productsByCategory[category] || [];
                    if (categoryProducts.length === 0) return null;

                    return (
                      <div key={category} style={{ marginBottom: '3rem' }}>
                        <SectionTitle style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SectionTitle>
                        <ProductGrid>
                          {categoryProducts.slice(0, 4).map((product) => (
                            <ProductCard key={product.id}>
                              <ProductImageContainer color={getImageColor(product.category) as any}>
                                {product.image_url ? (
                                  <ProductImage
                                    src={getProductImageUrl(product.image_url, product.category, 400, 200)}
                                    alt={product.name}
                                    onError={(e) => {
                                      e.currentTarget.src = getProductImageUrl(null, product.category, 400, 200);
                                    }}
                                  />
                                ) : (
                                  <ProductImage
                                    src={getProductImageUrl(null, product.category, 400, 200)}
                                    alt={product.name}
                                  />
                                )}
                              </ProductImageContainer>
                              <ProductInfo>
                                <ProductTitle>{product.name}</ProductTitle>
                                <ProductMeta>
                                  <ProductPrice>${product.price.toFixed(2)}</ProductPrice>
                                  <SellerInfo>
                                    <SellerAvatar />
                                    Seller ID: {product.seller_id}
                                  </SellerInfo>
                                </ProductMeta>
                                <Button
                                  variant="primary"
                                  style={{
                                    width: '100%',
                                    padding: '10px',
                                  }}
                                  onClick={() => navigate(`/marketplace/product/${product.id}`)}
                                >
                                  View Item
                                </Button>
                              </ProductInfo>
                            </ProductCard>
                          ))}
                        </ProductGrid>
                        {categoryProducts.length > 4 && (
                          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <Button
                              variant="secondary"
                              onClick={() => setActiveFilter(category)}
                              style={{ padding: '8px 16px' }}
                            >
                              View All {category} ({categoryProducts.length})
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  // Show filtered products for specific category
                  products.length === 0 ? (
                    <EmptyState>
                      <h3>No products found</h3>
                      <p>Try adjusting your search or filters</p>
                    </EmptyState>
                  ) : (
                    <ProductGrid>
                      {products.map((product) => (
                        <ProductCard key={product.id}>
                          <ProductImageContainer color={getImageColor(product.category) as any}>
                            {product.image_url ? (
                              <ProductImage
                                src={getProductImageUrl(product.image_url, product.category, 400, 200)}
                                alt={product.name}
                                onError={(e) => {
                                  e.currentTarget.src = getProductImageUrl(null, product.category, 400, 200);
                                }}
                              />
                            ) : (
                              <ProductImage
                                src={getProductImageUrl(null, product.category, 400, 200)}
                                alt={product.name}
                              />
                            )}
                          </ProductImageContainer>
                          <ProductInfo>
                            <ProductTitle>{product.name}</ProductTitle>
                            <ProductMeta>
                              <ProductPrice>${product.price.toFixed(2)}</ProductPrice>
                              <SellerInfo>
                                <SellerAvatar />
                                Seller ID: {product.seller_id}
                              </SellerInfo>
                            </ProductMeta>
                            <Button
                              variant="primary"
                              style={{
                                width: '100%',
                                padding: '10px',
                              }}
                              onClick={() => navigate(`/marketplace/product/${product.id}`)}
                            >
                              View Item
                            </Button>
                          </ProductInfo>
                        </ProductCard>
                      ))}
                    </ProductGrid>
                  )
                )}
              </>
            )}
          </ProductsSection>
        </ContentWrapper>
      </PageContainer>
    </Layout>
  );
};

export default MarketplacePage;
