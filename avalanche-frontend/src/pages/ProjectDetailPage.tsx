import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { styled } from '../stitches.config';
import { Calendar, DollarSign, Briefcase, FileText, Image as ImageIcon, MapPin, Star, Sparkles } from 'lucide-react';
import API from '../services/api';

const PageContainer = styled('div', {
  minHeight: '100vh',
  backgroundColor: 'var(--bg-primary)',
  paddingTop: '73px',
});

const Container = styled('div', {
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '$8',
});

const Breadcrumb = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  fontSize: '$sm',
  color: 'var(--text-secondary)',
  marginBottom: '$6',
});

const BreadcrumbLink = styled('span', {
  cursor: 'pointer',
  transition: 'color 0.2s',

  '&:hover': {
    color: 'var(--primary-color)',
  },
});

const BreadcrumbSeparator = styled('span', {
  color: 'var(--text-secondary)',
});

const ContentGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr 400px',
  gap: '$6',

  '@media (max-width: 1024px)': {
    gridTemplateColumns: '1fr',
  },
});

const MainContent = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$6',
});

const Card = styled('div', {
  backgroundColor: 'var(--card-bg)',
  borderRadius: '$lg',
  padding: '$6',
  border: '1px solid var(--border-color)',
});

const ProjectHeader = styled('div', {
  marginBottom: '$4',
});

const ProjectTitle = styled('h1', {
  fontSize: '$3xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  marginBottom: '$2',
});

const PostedTime = styled('div', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
});

const Section = styled('div', {
  marginTop: '$6',
});

const SectionTitle = styled('h2', {
  fontSize: '$xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  marginBottom: '$4',
});

const Description = styled('p', {
  fontSize: '$base',
  color: 'var(--text-secondary)',
  lineHeight: '1.6',
});

const SkillsContainer = styled('div', {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '$2',
});

const SkillTag = styled('div', {
  padding: '$2 $4',
  backgroundColor: 'rgba(59, 130, 246, 0.15)',
  color: '#3b82f6',
  borderRadius: '$full',
  fontSize: '$sm',
  fontWeight: '$medium',
});

const AttachmentsGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '$4',
});

const AttachmentCard = styled('div', {
  padding: '$4',
  backgroundColor: 'var(--bg-secondary)',
  borderRadius: '$base',
  border: '1px solid var(--border-color)',
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  cursor: 'pointer',
  transition: 'all 0.2s',

  '&:hover': {
    borderColor: 'var(--primary-color)',
    backgroundColor: 'var(--bg-tertiary)',
  },
});

const AttachmentIcon = styled('div', {
  width: '40px',
  height: '40px',
  borderRadius: '$base',
  backgroundColor: 'rgba(59, 130, 246, 0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#3b82f6',
  flexShrink: 0,
});

const AttachmentInfo = styled('div', {
  flex: 1,
  minWidth: 0,
});

const AttachmentName = styled('div', {
  fontSize: '$sm',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const AttachmentSize = styled('div', {
  fontSize: '$xs',
  color: 'var(--text-secondary)',
});

const Sidebar = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$6',
});

const InfoCard = styled('div', {
  backgroundColor: 'var(--card-bg)',
  borderRadius: '$lg',
  padding: '$6',
  border: '1px solid var(--border-color)',
});

const InfoItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  marginBottom: '$4',

  '&:last-child': {
    marginBottom: 0,
  },
});

const InfoIcon = styled('div', {
  width: '40px',
  height: '40px',
  borderRadius: '$base',
  backgroundColor: 'rgba(59, 130, 246, 0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#3b82f6',
  flexShrink: 0,
});

const InfoContent = styled('div', {
  flex: 1,
});

const InfoLabel = styled('div', {
  fontSize: '$xs',
  color: 'var(--text-secondary)',
  marginBottom: '$1',
});

const InfoValue = styled('div', {
  fontSize: '$base',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
});

const ApplyButton = styled('button', {
  width: '100%',
  padding: '$4',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  border: 'none',
  borderRadius: '$base',
  fontSize: '$base',
  fontWeight: '$semibold',
  cursor: 'pointer',
  marginTop: '$4',
  transition: 'all 0.2s',

  '&:hover': {
    backgroundColor: 'var(--primary-hover)',
    transform: 'translateY(-2px)',
  },

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none',
  },
});

const AIMatchBanner = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  padding: '$3 $4',
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  border: '1px solid rgba(59, 130, 246, 0.3)',
  borderRadius: '$base',
  marginTop: '$4',
});

const AIMatchText = styled('div', {
  fontSize: '$sm',
  color: '#3b82f6',
  flex: 1,
});

const ClientSection = styled('div', {
  marginTop: '$6',
});

const ClientCard = styled('div', {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '$4',
  padding: '$4',
  backgroundColor: 'var(--bg-secondary)',
  borderRadius: '$base',
  marginBottom: '$4',
});

const ClientAvatar = styled('div', {
  width: '60px',
  height: '60px',
  borderRadius: '$full',
  overflow: 'hidden',
  backgroundColor: 'var(--primary-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '$xl',
  fontWeight: '$bold',
  flexShrink: 0,

  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

const ClientInfo = styled('div', {
  flex: 1,
});

const ClientName = styled('div', {
  fontSize: '$lg',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  marginBottom: '$1',
});

const ViewProfileLink = styled('div', {
  fontSize: '$sm',
  color: '#3b82f6',
  cursor: 'pointer',
  marginBottom: '$2',

  '&:hover': {
    textDecoration: 'underline',
  },
});

const ClientMeta = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$4',
  fontSize: '$sm',
  color: 'var(--text-secondary)',
  marginTop: '$2',
});

const MetaItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$1',
});

const Rating = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$1',
  color: '#eab308',
});

interface ProjectData {
  id: number;
  title: string;
  description?: string;
  budget?: number;
  deadline?: string;
  status: string;
  created_at: string;
  creator?: {
    id: number;
    name: string;
    avatar_url?: string;
    location?: string;
    rating?: number;
    projects_count?: number;
  };
}

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await API.projects.getById(parseInt(id));
        setProject(data);
      } catch (err) {
        console.error('Failed to load project:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Posted today';
    if (diffDays === 1) return 'Posted 1 day ago';
    return `Posted ${diffDays} days ago`;
  };

  const handleApply = async () => {
    if (!project) return;

    try {
      setApplying(true);

      // Call the apply endpoint which creates a chat and returns chat_id
      const response = await API.projects.applyToProject(project.id);

      // Redirect to messages page with the poster's user ID
      // The backend creates a chat, so navigating to messages will show the conversation
      if (response.poster?.id) {
        navigate(`/messages?userId=${response.poster.id}`);
      } else {
        // Fallback to general messages page
        navigate('/messages');
      }
    } catch (error: any) {
      console.error('Failed to apply to project:', error);
      alert(error.message || 'Failed to apply to project. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Container>
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
            Loading project...
          </div>
        </Container>
      </PageContainer>
    );
  }

  if (!project) {
    return (
      <PageContainer>
        <Container>
          <div style={{ textAlign: 'center', padding: '60px', color: '#ef4444' }}>
            Project not found
          </div>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <Breadcrumb>
          <BreadcrumbLink onClick={() => navigate('/projects')}>Projects</BreadcrumbLink>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <span>{project.title}</span>
        </Breadcrumb>

        <ContentGrid>
          <MainContent>
            <Card>
              <ProjectHeader>
                <ProjectTitle>{project.title}</ProjectTitle>
                <PostedTime>{getTimeAgo(project.created_at)}</PostedTime>
              </ProjectHeader>

              {project.description && (
                <Section>
                  <SectionTitle>Project Description</SectionTitle>
                  <Description>{project.description}</Description>
                </Section>
              )}
            </Card>

            {project.creator && (
              <Card>
                <SectionTitle>About the Client</SectionTitle>
                <ClientCard>
                  <ClientAvatar>
                    {project.creator.avatar_url ? (
                      <img src={project.creator.avatar_url} alt={project.creator.name} />
                    ) : (
                      project.creator.name.charAt(0).toUpperCase()
                    )}
                  </ClientAvatar>
                  <ClientInfo>
                    <ClientName>{project.creator.name}</ClientName>
                    <ViewProfileLink onClick={() => navigate(`/user/${project.creator?.id}`)}>
                      View Profile
                    </ViewProfileLink>
                    {(project.creator.location || project.creator.rating || project.creator.projects_count) && (
                      <ClientMeta>
                        {project.creator.location && (
                          <MetaItem>
                            <MapPin size={14} />
                            {project.creator.location}
                          </MetaItem>
                        )}
                        {project.creator.rating && project.creator.projects_count && (
                          <Rating>
                            <Star size={14} fill="#eab308" />
                            {project.creator.rating} Star Rating ({project.creator.projects_count} projects)
                          </Rating>
                        )}
                      </ClientMeta>
                    )}
                  </ClientInfo>
                </ClientCard>
              </Card>
            )}
          </MainContent>

          <Sidebar>
            <InfoCard>
              {project.budget && (
                <InfoItem>
                  <InfoIcon>
                    <DollarSign size={20} />
                  </InfoIcon>
                  <InfoContent>
                    <InfoLabel>Budget</InfoLabel>
                    <InfoValue>${project.budget.toLocaleString()}</InfoValue>
                  </InfoContent>
                </InfoItem>
              )}

              {project.deadline && (
                <InfoItem>
                  <InfoIcon>
                    <Calendar size={20} />
                  </InfoIcon>
                  <InfoContent>
                    <InfoLabel>Deadline</InfoLabel>
                    <InfoValue>{formatDate(project.deadline)}</InfoValue>
                  </InfoContent>
                </InfoItem>
              )}

              <InfoItem>
                <InfoIcon>
                  <Briefcase size={20} />
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>Status</InfoLabel>
                  <InfoValue style={{ textTransform: 'capitalize' }}>{project.status}</InfoValue>
                </InfoContent>
              </InfoItem>

              <ApplyButton onClick={handleApply} disabled={applying}>
                {applying ? 'Applying...' : 'Apply Now'}
              </ApplyButton>
            </InfoCard>
          </Sidebar>
        </ContentGrid>
      </Container>
    </PageContainer>
  );
};

export default ProjectDetailPage;
