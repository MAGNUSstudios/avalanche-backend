import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '../stitches.config';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import Header from '../components/layout/Header';
import API from '../services/api';

const PageContainer = styled('div', {
  minHeight: '100vh',
  backgroundColor: 'var(--bg-secondary)',
});

const Hero = styled('section', {
  backgroundColor: 'var(--bg-secondary)',
  padding: '$20 $8 $10 $8',
  maxWidth: '1280px',
  margin: '0 auto',
  paddingTop: '$20',

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
  marginBottom: '$8',
});

const MainContent = styled('main', {
  maxWidth: '1280px',
  margin: '0 auto',
  padding: '0 $8 $12 $8',
});

const SearchWrapper = styled('div', {
  marginBottom: '$6',
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
  color: 'var(--text-secondary)',
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

const FiltersBar = styled('div', {
  display: 'flex',
  gap: '$3',
  marginBottom: '$10',
  alignItems: 'center',
  flexWrap: 'wrap',
  justifyContent: 'space-between',

  '@media (max-width: 968px)': {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
});

const FiltersLeft = styled('div', {
  display: 'flex',
  gap: '$3',
  flexWrap: 'wrap',
});

const FilterDropdown = styled('button', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$3 $4',
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '$lg',
  fontSize: '$sm',
  fontWeight: '$medium',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: 'var(--bg-secondary)',
    borderColor: '#D1D1D6',
  },
});

const ToggleWrapper = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
});

const ToggleLabel = styled('span', {
  fontSize: '$sm',
  color: '$gray600',
});

const Toggle = styled('button', {
  width: '44px',
  height: '24px',
  backgroundColor: 'var(--bg-tertiary)',
  borderRadius: '$full',
  border: 'none',
  cursor: 'pointer',
  position: 'relative',
  transition: 'background-color 0.2s ease',

  '&::after': {
    content: '""',
    position: 'absolute',
    width: '18px',
    height: '18px',
    backgroundColor: 'var(--card-bg)',
    borderRadius: '$full',
    top: '3px',
    left: '3px',
    transition: 'transform 0.2s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },

  variants: {
    active: {
      true: {
        backgroundColor: 'var(--primary-color)',

        '&::after': {
          transform: 'translateX(20px)',
        },
      },
    },
  },
});

const ProjectsGrid = styled('div', {
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

const ProjectCard = styled('div', {
  backgroundColor: 'var(--card-bg)',
  borderRadius: '$2xl',
  padding: '$6',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  position: 'relative',

  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
  },
});

const ProjectHeader = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'start',
  marginBottom: '$4',
});

const ProjectTitle = styled('h3', {
  fontSize: '1.125rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
  marginBottom: '$2',
  flex: 1,
});

const Avatar = styled('img', {
  width: '40px',
  height: '40px',
  borderRadius: '$full',
  objectFit: 'cover',
  border: '2px solid #F5F5F7',
});

const ProjectDescription = styled('p', {
  fontSize: '0.875rem',
  color: 'var(--text-secondary)',
  lineHeight: '1.5',
  marginBottom: '$4',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

const SkillTags = styled('div', {
  display: 'flex',
  gap: '$2',
  flexWrap: 'wrap',
  marginBottom: '$4',
});

const SkillTag = styled('span', {
  padding: '$1 $3',
  backgroundColor: 'var(--bg-tertiary)',
  borderRadius: '$md',
  fontSize: '$xs',
  color: 'var(--primary-color)',
  fontWeight: '600',
});

const ProjectButton = styled('button', {
  width: '100%',
  padding: '$3',
  backgroundColor: 'var(--primary-color)',
  border: 'none',
  borderRadius: '$lg',
  fontSize: '$sm',
  fontWeight: '600',
  color: 'white',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: 'var(--primary-hover)',
  },

  variants: {
    variant: {
      secondary: {
        backgroundColor: 'var(--bg-tertiary)',
        color: 'var(--primary-color)',

        '&:hover': {
          backgroundColor: 'var(--bg-tertiary)',
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
  border: '1px solid var(--border-color)',
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

interface Project {
  id: number;
  title: string;
  description: string | null;
  status: string;
  budget: number | null;
  deadline: string | null;
  owner_id: number;
  guild_id: number | null;
  created_at: string;
  updated_at: string;
}

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [aiSuggested, setAiSuggested] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('avalanche_token');
    setIsAuthenticated(!!token);
  }, []);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await API.projects.getAll({
          skip: 0,
          limit: 50,
        });
        setProjects(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);


  return (
    <PageContainer>
      <Header 
        isAuthenticated={isAuthenticated}
        showCreateButton={true}
        createButtonText="Create Project"
        createButtonHref="/projects/create"
      />

      <Hero>
        <HeroTitle>Explore Projects</HeroTitle>
        <HeroSubtitle>
          Discover opportunities powered by the Avalanche community and AI.
        </HeroSubtitle>
      </Hero>

      <MainContent>
        <SearchWrapper>
          <SearchInputWrapper>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Search projects by keyword, skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchInputWrapper>
        </SearchWrapper>

        <FiltersBar>
          <FiltersLeft>
            <FilterDropdown>
              Category
              <ChevronDown size={16} />
            </FilterDropdown>
            <FilterDropdown>
              Skills Required
              <ChevronDown size={16} />
            </FilterDropdown>
            <FilterDropdown>
              Project Type
              <ChevronDown size={16} />
            </FilterDropdown>
            <FilterDropdown>
              Compensation
              <ChevronDown size={16} />
            </FilterDropdown>
          </FiltersLeft>

          <ToggleWrapper>
            <ToggleLabel>AI-Suggested</ToggleLabel>
            <Toggle
              active={aiSuggested}
              onClick={() => setAiSuggested(!aiSuggested)}
            />
          </ToggleWrapper>
        </FiltersBar>

        {loading ? (
          <LoadingContainer>
            <LoadingSpinner>
              <Loader size={48} />
            </LoadingSpinner>
            <LoadingText>Loading projects...</LoadingText>
          </LoadingContainer>
        ) : error ? (
          <ErrorContainer>
            <p><strong>Error:</strong> {error}</p>
            <p>Please make sure the backend server is running on http://localhost:8000</p>
          </ErrorContainer>
        ) : projects.length === 0 ? (
          <EmptyState>
            <h3>No projects found</h3>
            <p>Be the first to create a project!</p>
          </EmptyState>
        ) : (
          <>
            <ProjectsGrid>
              {projects.map((project) => (
                <ProjectCard key={project.id} onClick={() => navigate(`/projects/${project.id}`)}>
                  <ProjectHeader>
                    <ProjectTitle>{project.title}</ProjectTitle>
                    <Avatar
                      src={`https://i.pravatar.cc/150?img=${project.owner_id}`}
                      alt="Project owner"
                    />
                  </ProjectHeader>
                  <ProjectDescription>
                    {project.description || 'No description provided'}
                  </ProjectDescription>
                  <SkillTags>
                    <SkillTag>Budget: ${project.budget || 'TBD'}</SkillTag>
                    <SkillTag>Status: {project.status}</SkillTag>
                  </SkillTags>
                  <ProjectButton onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/projects/${project.id}`);
                  }}>Apply Now</ProjectButton>
                </ProjectCard>
              ))}
            </ProjectsGrid>
          </>
        )}

        <Pagination>
          <PageButton disabled>
            <ChevronLeft size={16} />
          </PageButton>
          <PageButton active>{currentPage}</PageButton>
          <PageButton onClick={() => setCurrentPage(2)}>2</PageButton>
          <PageButton onClick={() => setCurrentPage(3)}>3</PageButton>
          <PageButton disabled>...</PageButton>
          <PageButton onClick={() => setCurrentPage(10)}>10</PageButton>
          <PageButton>
            <ChevronRight size={16} />
          </PageButton>
        </Pagination>
      </MainContent>
    </PageContainer>
  );
};

export default ProjectsPage;
