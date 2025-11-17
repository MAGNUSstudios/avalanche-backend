import React, { useState, useEffect } from 'react';
import { styled } from '../stitches.config';
import { Search, Users, TrendingUp, ChevronDown, Loader } from 'lucide-react';
import Header from '../components/layout/Header';

const PageContainer = styled('div', {
  minHeight: '100vh',
  backgroundColor: 'var(--bg-secondary)',
});

const Hero = styled('section', {
  backgroundColor: 'var(--bg-secondary)',
  padding: '$20 $8 $10 $8',
  maxWidth: '1280px',
  margin: '0 auto',
  paddingTop: '$24',

  '@media (max-width: 768px)': {
    paddingTop: '$16',
  },
});

const HeroTitle = styled('h1', {
  fontSize: '2rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
  letterSpacing: '-0.01em',
  marginBottom: '$3',

  '@media (max-width: 768px)': {
    fontSize: '1.75rem',
  },
});

const HeroSubtitle = styled('p', {
  fontSize: '0.9375rem',
  maxWidth: '700px',
  color: 'var(--text-secondary)',
  lineHeight: '1.6',
});

const MainContent = styled('main', {
  maxWidth: '1280px',
  margin: '0 auto',
  padding: '0 $8 $12 $8',
});

const ControlsBar = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$6',
  marginBottom: '$10',
});

const SearchInputWrapper = styled('div', {
  position: 'relative',
  width: '100%',
});

const SearchIcon = styled(Search, {
  position: 'absolute',
  left: '24px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--primary-color)',
  width: '24px',
  height: '24px',
});

const SearchInput = styled('input', {
  width: '100%',
  padding: '20px 24px 20px 60px',
  backgroundColor: 'var(--card-bg)',
  border: '2px solid var(--border-color)',
  borderRadius: '16px',
  fontSize: '1.125rem',
  color: 'var(--text-primary)',
  fontWeight: '400',

  '&::placeholder': {
    color: 'var(--text-secondary)',
  },

  '&:focus': {
    outline: 'none',
    borderColor: 'var(--primary-color)',
    boxShadow: '0 0 0 4px rgba(0, 122, 255, 0.12)',
  },
});

const FiltersSection = styled('div', {
  display: 'flex',
  gap: '$3',
  alignItems: 'center',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
});

const FilterDropdown = styled('button', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$3 $4',
  backgroundColor: 'var(--bg-tertiary)',
  border: 'none',
  borderRadius: '$lg',
  fontSize: '$sm',
  fontWeight: '600',
  color: 'var(--primary-color)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: 'var(--bg-tertiary)',
  },

  variants: {
    variant: {
      default: {
        backgroundColor: 'var(--card-bg)',
        border: '1px solid #E5E5E5',
        color: 'var(--text-primary)',

        '&:hover': {
          backgroundColor: 'var(--bg-secondary)',
        },
      },
    },
  },
});

const Pagination = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '$2',
  marginTop: '$12',
});

const PageButton = styled('button', {
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--card-bg)',
  border: '1px solid #E5E5E5',
  borderRadius: '$lg',
  fontSize: '$sm',
  fontWeight: '600',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: 'var(--bg-secondary)',
  },

  variants: {
    active: {
      true: {
        backgroundColor: 'var(--primary-color)',
        borderColor: 'var(--primary-color)',
        color: 'white',

        '&:hover': {
          backgroundColor: 'var(--primary-hover)',
        },
      },
    },
    disabled: {
      true: {
        opacity: 0.5,
        cursor: 'not-allowed',

        '&:hover': {
          backgroundColor: 'var(--card-bg)',
        },
      },
    },
  },
});

const GuildsGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '$6',
  marginBottom: '$8',

  '@media (max-width: 1024px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },

  '@media (max-width: 768px)': {
    gridTemplateColumns: '1fr',
  },
});

const GuildCard = styled('div', {
  backgroundColor: 'var(--card-bg)',
  borderRadius: '$2xl',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',

  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
  },
});

const GuildImage = styled('div', {
  height: '180px',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: 'var(--bg-tertiary)',
});

const GuildImg = styled('img', {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
  transition: 'transform 0.3s ease, opacity 0.3s ease',
  
  '&[data-loaded="false"]': {
    opacity: 0,
  },
  
  '&[data-loaded="true"]': {
    opacity: 1,
  },
});

const GuildContent = styled('div', {
  padding: '$5',
});

const GuildName = styled('h3', {
  fontSize: '1.125rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
  marginBottom: '$2',
});

const GuildDescription = styled('p', {
  fontSize: '0.875rem',
  color: 'var(--text-secondary)',
  marginBottom: '$4',
  lineHeight: '1.5',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

const GuildMeta = styled('div', {
  display: 'flex',
  gap: '$4',
  fontSize: '0.8125rem',
  color: 'var(--text-secondary)',
  fontWeight: '600',
});

const MetaItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$1',
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
  color: 'var(--primary-color)',
  
  '@keyframes spin': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
});

const LoadingText = styled('p', {
  fontSize: '$lg',
  color: 'var(--text-secondary)',
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
  color: 'var(--text-secondary)',
  
  h3: {
    fontSize: '$xl',
    fontWeight: '$bold',
    marginBottom: '$2',
    color: 'var(--text-primary)',
  },
  
  p: {
    fontSize: '$base',
  },
});

const CategoryBadge = styled('span', {
  display: 'inline-block',
  padding: '$1 $3',
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  color: 'var(--primary-color)',
  borderRadius: '$full',
  fontSize: '0.75rem',
  fontWeight: '$semibold',
  marginBottom: '$3',
});

interface Guild {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  is_private: boolean;
  member_count: number;
  owner_id: number;
  created_at: string;
}

const API_BASE_URL = 'http://localhost:8000';

const GuildsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const guildsPerPage = 12;

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('avalanche_token');
    setIsAuthenticated(!!token);
  }, []);

  // Debounce search query to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch guilds from API
  useEffect(() => {
    const fetchGuilds = async () => {
      // Create cache key based on search and category
      const cacheKey = `guilds_cache_${debouncedSearchQuery || 'all'}_${selectedCategory || 'all'}`;

      // Check if we have cached data (valid for 2 minutes)
      const cachedData = sessionStorage.getItem(cacheKey);
      const cacheTimestamp = sessionStorage.getItem(`${cacheKey}_timestamp`);

      if (cachedData && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp);
        // Use cache if less than 2 minutes old
        if (cacheAge < 120000) {
          console.log('Using cached guilds data');
          const data = JSON.parse(cachedData);
          setGuilds(data);

          // Extract unique categories
          const uniqueCategories = Array.from(new Set(data.map((g: Guild) => g.category).filter(Boolean)));
          setCategories(uniqueCategories as string[]);

          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
        if (selectedCategory) params.append('category', selectedCategory);

        console.log('Fetching guilds from API');
        const response = await fetch(`${API_BASE_URL}/guilds?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch guilds');
        }

        const data = await response.json();
        setGuilds(data);

        // Cache the response
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
        sessionStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());

        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data.map((g: Guild) => g.category).filter(Boolean)));
        setCategories(uniqueCategories as string[]);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching guilds:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGuilds();
  }, [debouncedSearchQuery, selectedCategory]);

  // Pagination logic
  const indexOfLastGuild = currentPage * guildsPerPage;
  const indexOfFirstGuild = indexOfLastGuild - guildsPerPage;
  const currentGuilds = guilds.slice(indexOfFirstGuild, indexOfLastGuild);
  const totalPages = Math.ceil(guilds.length / guildsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryFilter = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  return (
    <PageContainer>
      <Header 
        isAuthenticated={isAuthenticated}
        showCreateButton={true}
        createButtonText="Create Guild"
        createButtonHref="/guilds/create"
      />

      <Hero>
        <HeroTitle>Explore Guilds</HeroTitle>
        <HeroSubtitle>
          Find your community, collaborate on projects, and build the future together.
        </HeroSubtitle>
      </Hero>

      <MainContent>
        <ControlsBar>
          <SearchInputWrapper>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Search for guilds by name or keyword"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </SearchInputWrapper>

          <FiltersSection>
            <FilterDropdown 
              onClick={() => handleCategoryFilter(null)}
              style={{ 
                backgroundColor: !selectedCategory ? 'var(--primary-color)' : 'var(--card-bg)',
                color: !selectedCategory ? 'white' : 'var(--text-primary)'
              }}
            >
              All Categories
            </FilterDropdown>
            {categories.map((category) => (
              <FilterDropdown 
                key={category}
                variant="default"
                onClick={() => handleCategoryFilter(category)}
                style={{ 
                  backgroundColor: selectedCategory === category ? 'var(--primary-color)' : 'var(--card-bg)',
                  color: selectedCategory === category ? 'white' : 'var(--text-primary)'
                }}
              >
                {category}
              </FilterDropdown>
            ))}
          </FiltersSection>
        </ControlsBar>

        {loading ? (
          <LoadingContainer>
            <LoadingSpinner>
              <Loader size={48} />
            </LoadingSpinner>
            <LoadingText>Loading guilds...</LoadingText>
          </LoadingContainer>
        ) : error ? (
          <ErrorContainer>
            <p><strong>Error:</strong> {error}</p>
            <p>Please make sure the backend server is running on http://localhost:8000</p>
          </ErrorContainer>
        ) : currentGuilds.length === 0 ? (
          <EmptyState>
            <h3>No guilds found</h3>
            <p>Try adjusting your search or filters</p>
          </EmptyState>
        ) : (
          <>
            <GuildsGrid>
              {currentGuilds.map((guild) => {
                // Helper to handle both Cloudinary and local URLs
                const getImageUrl = (url: string | null) => {
                  if (!url) return null;
                  if (url.startsWith('http://') || url.startsWith('https://')) {
                    // Optimize Picsum images: reduce size and remove blur for faster loading
                    if (url.includes('picsum.photos')) {
                      return url.replace('/1200/400', '/800/300').replace('?blur=2', '');
                    }
                    return url;
                  }
                  return `${API_BASE_URL}${url}`;
                };

                const bannerUrl = getImageUrl(guild.banner_url);
                
                return (
                  <GuildCard key={guild.id} onClick={() => window.location.href = `/guilds/${guild.id}`}>
                    <GuildImage>
                      {bannerUrl ? (
                        <GuildImg 
                          src={bannerUrl}
                          alt={`${guild.name} banner`}
                          loading="lazy"
                          onLoad={(e) => e.currentTarget.setAttribute('data-loaded', 'true')}
                          data-loaded="false"
                        />
                      ) : (
                        <div style={{ 
                          width: '100%', 
                          height: '100%', 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                        }} />
                      )}
                    </GuildImage>
                    <GuildContent>
                      {guild.category && <CategoryBadge>{guild.category}</CategoryBadge>}
                      <GuildName>{guild.name}</GuildName>
                      <GuildDescription>
                        {guild.description || 'No description available'}
                      </GuildDescription>
                      <GuildMeta>
                        <MetaItem>
                          <Users size={16} />
                          {guild.member_count} {guild.member_count === 1 ? 'Member' : 'Members'}
                        </MetaItem>
                      </GuildMeta>
                    </GuildContent>
                  </GuildCard>
                );
              })}
            </GuildsGrid>

            {totalPages > 1 && (
              <Pagination>
                <PageButton 
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  &lt;
                </PageButton>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <PageButton
                      key={pageNum}
                      active={currentPage === pageNum}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </PageButton>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <PageButton disabled>...</PageButton>
                    <PageButton onClick={() => handlePageChange(totalPages)}>
                      {totalPages}
                    </PageButton>
                  </>
                )}
                
                <PageButton 
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  &gt;
                </PageButton>
              </Pagination>
            )}
          </>
        )}
      </MainContent>
    </PageContainer>
  );
};

export default GuildsPage;
