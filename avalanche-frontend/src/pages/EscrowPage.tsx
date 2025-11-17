import React, { useState, useEffect } from 'react';
import { styled } from '../stitches.config';
import Layout from '../components/layout/Layout';
import { Shield, Plus, CheckCircle, DollarSign, Calendar, Package, Briefcase, Upload, MessageSquare } from 'lucide-react';
import EscrowPromptModal from '../components/modals/EscrowPromptModal';
import API from '../services/api';

const PageWrapper = styled('div', {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
  paddingTop: '80px',
});

const Container = styled('div', {
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '0 $6',
});

const Header = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '$8',
  padding: '$6 0',
});

const Title = styled('h1', {
  fontSize: '$4xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  display: 'flex',
  alignItems: 'center',
  gap: '$4',
  margin: 0,

  '& svg': {
    color: 'var(--primary-color)',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
  },
});

const Subtitle = styled('p', {
  fontSize: '$base',
  color: 'var(--text-secondary)',
  marginTop: '$3',
  marginBottom: 0,
  maxWidth: '600px',
});

const CreateButton = styled('button', {
  padding: '$4 $8',
  background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '$lg',
  fontSize: '$base',
  fontWeight: '$semibold',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  position: 'relative',
  overflow: 'hidden',

  '&::before': {
    content: '',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'left 0.5s',
  },

  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)',

    '&::before': {
      left: '100%',
    },
  },

  '&:active': {
    transform: 'translateY(0)',
  },
});

const TabContainer = styled('div', {
  marginBottom: '$8',
  backgroundColor: 'var(--card-bg)',
  borderRadius: '$xl',
  padding: '$2',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
});

const TabButtons = styled('div', {
  display: 'flex',
  gap: '$1',
  backgroundColor: 'var(--bg-secondary)',
  borderRadius: '$lg',
  padding: '$1',
});

const TabButton = styled('button', {
  padding: '$4 $8',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '$base',
  fontSize: '$base',
  fontWeight: '$semibold',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  position: 'relative',
  flex: 1,
  justifyContent: 'center',

  '&:hover': {
    color: 'var(--text-primary)',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },

  variants: {
    active: {
      true: {
        backgroundColor: 'white',
        color: 'var(--primary-color)',
        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15)',
        transform: 'translateY(-1px)',

        '&::after': {
          content: '',
          position: 'absolute',
          bottom: '-2px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: '2px',
          backgroundColor: 'var(--primary-color)',
          borderRadius: '$full',
        },
      },
    },
  },
});

const EscrowGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
  gap: '$6',
});

const EscrowCard = styled('div', {
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '$xl',
  padding: '$8',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',

  '&::before': {
    content: '',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, var(--primary-color), var(--primary-hover))',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },

  '&:hover': {
    borderColor: 'var(--primary-color)',
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(59, 130, 246, 0.1)',

    '&::before': {
      opacity: 1,
    },
  },
});

const CardHeader = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '$6',
});

const ProjectTitle = styled('h3', {
  fontSize: '$xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  marginBottom: '$3',
  lineHeight: 1.3,
});

const StatusBadge = styled('div', {
  padding: '$3 $4',
  borderRadius: '$full',
  fontSize: '$xs',
  fontWeight: '$bold',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  border: '1px solid transparent',

  variants: {
    status: {
      price_agreed: {
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        color: '#1e40af',
        borderColor: 'rgba(59, 130, 246, 0.3)',
      },
      escrow_funded: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        color: '#065f46',
        borderColor: 'rgba(16, 185, 129, 0.3)',
      },
      completed: {
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        color: '#92400e',
        borderColor: 'rgba(245, 158, 11, 0.3)',
      },
      paid: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        color: '#065f46',
        borderColor: 'rgba(16, 185, 129, 0.3)',
      },
      default: {
        backgroundColor: 'rgba(107, 114, 128, 0.15)',
        color: '#374151',
        borderColor: 'rgba(107, 114, 128, 0.3)',
      },
    },
  },
});

const CardContent = styled('div', {
  marginBottom: '$4',
});

const InfoRow = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '$2 0',
  borderBottom: '1px solid var(--border-color)',

  '&:last-child': {
    borderBottom: 'none',
  },
});

const InfoLabel = styled('span', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
});

const InfoValue = styled('span', {
  fontSize: '$sm',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
});

const CardActions = styled('div', {
  display: 'flex',
  gap: '$3',
  marginTop: '$4',
});

const ActionButton = styled('button', {
  padding: '$3 $5',
  borderRadius: '$lg',
  fontSize: '$sm',
  fontWeight: '$semibold',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: 'none',
  position: 'relative',
  overflow: 'hidden',

  '&::before': {
    content: '',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'left 0.5s',
  },

  variants: {
    variant: {
      primary: {
        background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)',
        color: 'white',
        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',

        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',

          '&::before': {
            left: '100%',
          },
        },
      },
      secondary: {
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',

        '&:hover': {
          backgroundColor: 'var(--bg-tertiary)',
          transform: 'translateY(-1px)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        },
      },
    },
  },
});

const EmptyState = styled('div', {
  textAlign: 'center',
  padding: '$16 $8',
  color: 'var(--text-secondary)',
  backgroundColor: 'var(--card-bg)',
  borderRadius: '$xl',
  border: '2px dashed var(--border-color)',
  margin: '$8 0',
});

const EmptyIcon = styled('div', {
  width: '80px',
  height: '80px',
  margin: '0 auto $6',
  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
  borderRadius: '$full',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--primary-color)',
  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)',
  position: 'relative',

  '&::before': {
    content: '',
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))',
    opacity: 0.1,
  },
});

const EmptyTitle = styled('h3', {
  fontSize: '$xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  marginBottom: '$4',
  background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
});

const EmptyDescription = styled('p', {
  fontSize: '$base',
  color: 'var(--text-secondary)',
  maxWidth: '500px',
  margin: '0 auto',
  lineHeight: 1.6,
});

interface Project {
  id: number;
  title: string;
  workflow_status: string;
  agreed_price?: number;
  escrow_funded: boolean;
  escrow_amount?: number;
  escrow_funded_at?: string;
  completed_at?: string;
  payment_released_at?: string;
  freelancer_id?: number;
  freelancer?: {
    id: number;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

interface Order {
  id: number;
  order_number: string;
  item_name: string;
  item_description?: string;
  item_cost: number;
  total_amount: number;
  status: string;
  created_at: string;
  buyer_id: number;
  seller_id: number;
  product_id?: number;
  project_id?: number;
  escrow?: {
    id: number;
    amount: number;
    status: string;
    buyer_approved?: boolean;
    delivery_confirmed?: boolean;
    released_at?: string;
    refunded_at?: string;
  };
  buyer?: {
    id: number;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  seller?: {
    id: number;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

const EscrowPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'marketplace'>('projects');

  useEffect(() => {
    const token = localStorage.getItem('avalanche_token');
    setIsAuthenticated(!!token);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load both projects and orders
      const [projectsData, ordersData] = await Promise.all([
        API.projects.getMyProjects(),
        API.escrow.getAll()
      ]);
      setProjects(projectsData);
      setOrders(ordersData);
    } catch (err) {
      console.error('Failed to load escrow data:', err);
      setError('Failed to load escrow data');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceEscrow = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleEscrowConfirm = async () => {
    if (!selectedProject) return;

    try {
      // Call the place in escrow API
      const response = await fetch('http://localhost:8000/projects/escrow/place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('avalanche_token')}`,
        },
        body: JSON.stringify({
          project_id: selectedProject.id,
          amount: selectedProject.agreed_price,
          freelancer_id: selectedProject.freelancer_id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to place funds in escrow');
      }

      const data = await response.json();

      // Redirect to Stripe checkout
      window.location.href = data.checkout_url;

    } catch (err) {
      console.error('Escrow placement failed:', err);
      throw err;
    }
  };

  const handleEscrowAction = async (projectId: number, action: string) => {
    try {
      if (action === 'fund') {
        // This would typically open a payment modal
        alert('Funding escrow would open payment modal here');
      } else if (action === 'submit_work') {
        // This would open a work submission modal
        alert('Submitting work would open submission modal here');
      } else if (action === 'approve') {
        await API.projects.approveWork(projectId);
        await loadData();
      }
    } catch (err) {
      console.error('Escrow action failed:', err);
      alert('Action failed. Please try again.');
    }
  };

  const handleOrderAction = async (orderId: number, action: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order?.escrow) return;

      if (action === 'confirm_delivery') {
        await API.escrow.confirmDelivery(order.escrow.id);
        await loadData();
      } else if (action === 'approve') {
        await API.escrow.approve(order.escrow.id);
        await loadData();
      } else if (action === 'dispute') {
        const reason = prompt('Please provide a reason for the dispute:');
        if (reason) {
          await API.escrow.dispute(order.escrow.id, reason);
          await loadData();
        }
      }
    } catch (err) {
      console.error('Order escrow action failed:', err);
      alert('Action failed. Please try again.');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'price_agreed':
        return 'price_agreed';
      case 'escrow_funded':
        return 'escrow_funded';
      case 'completed':
        return 'completed';
      case 'paid':
        return 'paid';
      default:
        return 'default';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <Layout isAuthenticated={isAuthenticated}>
        <PageWrapper>
          <Container>
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
              Loading escrow projects...
            </div>
          </Container>
        </PageWrapper>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout isAuthenticated={isAuthenticated}>
        <PageWrapper>
          <Container>
            <div style={{ textAlign: 'center', padding: '60px', color: '#ef4444' }}>
              {error}
            </div>
          </Container>
        </PageWrapper>
      </Layout>
    );
  }

  const escrowProjects = projects.filter(project =>
    ['price_agreed', 'escrow_funded', 'completed', 'paid'].includes(project.workflow_status)
  );

  const escrowOrders = orders.filter(order =>
    order.escrow && ['held', 'disputed'].includes(order.escrow.status)
  );

  const renderProjectCard = (project: Project) => (
    <EscrowCard key={project.id}>
      <CardHeader>
        <div>
          <ProjectTitle>{project.title}</ProjectTitle>
          {project.freelancer && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <Briefcase size={16} />
              {project.freelancer.first_name} {project.freelancer.last_name}
            </div>
          )}
        </div>
        <StatusBadge status={getStatusBadgeVariant(project.workflow_status)}>
          {formatStatus(project.workflow_status)}
        </StatusBadge>
      </CardHeader>

      <CardContent>
        <InfoRow>
          <InfoLabel>Agreed Price</InfoLabel>
          <InfoValue>${project.agreed_price?.toLocaleString() || 'N/A'}</InfoValue>
        </InfoRow>
        {project.escrow_amount && (
          <InfoRow>
            <InfoLabel>Escrow Amount</InfoLabel>
            <InfoValue>${project.escrow_amount.toLocaleString()}</InfoValue>
          </InfoRow>
        )}
        {project.escrow_funded_at && (
          <InfoRow>
            <InfoLabel>Funded Date</InfoLabel>
            <InfoValue>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} />
                {new Date(project.escrow_funded_at).toLocaleDateString()}
              </div>
            </InfoValue>
          </InfoRow>
        )}
        {project.completed_at && (
          <InfoRow>
            <InfoLabel>Completed Date</InfoLabel>
            <InfoValue>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={14} />
                {new Date(project.completed_at).toLocaleDateString()}
              </div>
            </InfoValue>
          </InfoRow>
        )}
      </CardContent>

      <CardActions>
        {project.workflow_status === 'price_agreed' && (
          <ActionButton
            variant="primary"
            onClick={() => handlePlaceEscrow(project)}
          >
            <DollarSign size={16} />
            Place in Escrow
          </ActionButton>
        )}
        {project.workflow_status === 'escrow_funded' && (
          <ActionButton
            variant="primary"
            onClick={() => handleEscrowAction(project.id, 'submit_work')}
          >
            <Upload size={16} />
            Submit Work
          </ActionButton>
        )}
        {project.workflow_status === 'pending_approval' && (
          <ActionButton
            variant="primary"
            onClick={() => handleEscrowAction(project.id, 'approve')}
          >
            <CheckCircle size={16} />
            Approve Work
          </ActionButton>
        )}
        <ActionButton
          variant="secondary"
          onClick={() => window.location.href = `/projects/${project.id}`}
        >
          View Details
        </ActionButton>
      </CardActions>
    </EscrowCard>
  );

  const renderOrderCard = (order: Order) => (
    <EscrowCard key={order.id}>
      <CardHeader>
        <div>
          <ProjectTitle>{order.item_name}</ProjectTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <Package size={16} />
            Order #{order.order_number}
          </div>
        </div>
        <StatusBadge status={order.escrow?.status === 'held' ? 'escrow_funded' : 'default'}>
          {order.escrow?.status === 'held' ? 'In Escrow' : 'Processing'}
        </StatusBadge>
      </CardHeader>

      <CardContent>
        <InfoRow>
          <InfoLabel>Order Total</InfoLabel>
          <InfoValue>${order.total_amount.toLocaleString()}</InfoValue>
        </InfoRow>
        {order.escrow && (
          <InfoRow>
            <InfoLabel>Escrow Amount</InfoLabel>
            <InfoValue>${order.escrow.amount.toLocaleString()}</InfoValue>
          </InfoRow>
        )}
        <InfoRow>
          <InfoLabel>Order Date</InfoLabel>
          <InfoValue>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={14} />
              {new Date(order.created_at).toLocaleDateString()}
            </div>
          </InfoValue>
        </InfoRow>
        {order.escrow?.buyer_approved && (
          <InfoRow>
            <InfoLabel>Buyer Status</InfoLabel>
            <InfoValue style={{ color: '#10b981' }}>
              <CheckCircle size={14} style={{ marginRight: '4px' }} />
              Approved
            </InfoValue>
          </InfoRow>
        )}
        {order.escrow?.delivery_confirmed && (
          <InfoRow>
            <InfoLabel>Delivery Status</InfoLabel>
            <InfoValue style={{ color: '#10b981' }}>
              <CheckCircle size={14} style={{ marginRight: '4px' }} />
              Confirmed
            </InfoValue>
          </InfoRow>
        )}
      </CardContent>

      <CardActions>
        {order.escrow && !order.escrow.delivery_confirmed && (
          <ActionButton
            variant="primary"
            onClick={() => handleOrderAction(order.id, 'confirm_delivery')}
          >
            <Upload size={16} />
            Confirm Delivery
          </ActionButton>
        )}
        {order.escrow && !order.escrow.buyer_approved && (
          <ActionButton
            variant="primary"
            onClick={() => handleOrderAction(order.id, 'approve')}
          >
            <CheckCircle size={16} />
            Approve & Release
          </ActionButton>
        )}
        {order.escrow && order.escrow.status === 'held' && (
          <ActionButton
            variant="secondary"
            onClick={() => handleOrderAction(order.id, 'dispute')}
          >
            <MessageSquare size={16} />
            Dispute
          </ActionButton>
        )}
        <ActionButton
          variant="secondary"
          onClick={() => window.location.href = `/escrow/${order.id}`}
        >
          View Details
        </ActionButton>
      </CardActions>
    </EscrowCard>
  );

  return (
    <Layout isAuthenticated={isAuthenticated}>
      <PageWrapper>
        <Container>
          <Header>
            <div>
              <Title>
                <Shield size={32} />
                Escrow Management
              </Title>
              <Subtitle>
                Securely manage project payments and marketplace escrow funds
              </Subtitle>
            </div>
            <CreateButton onClick={() => window.location.href = '/projects/create'}>
              <Plus size={20} />
              Create Project
            </CreateButton>
          </Header>

          <TabContainer>
            <TabButtons>
              <TabButton active={activeTab === 'projects'} onClick={() => setActiveTab('projects')}>
                <Briefcase size={18} style={{ marginRight: '8px' }} />
                Projects ({escrowProjects.length})
              </TabButton>
              <TabButton active={activeTab === 'marketplace'} onClick={() => setActiveTab('marketplace')}>
                <Package size={18} style={{ marginRight: '8px' }} />
                Marketplace ({escrowOrders.length})
              </TabButton>
            </TabButtons>
          </TabContainer>

          {activeTab === 'projects' && (
            <>
              {escrowProjects.length === 0 ? (
                <EmptyState>
                  <EmptyIcon>
                    <Briefcase size={32} />
                  </EmptyIcon>
                  <EmptyTitle>No Project Escrows Yet</EmptyTitle>
                  <EmptyDescription>
                    Create a project and agree on pricing with a freelancer to start using escrow protection.
                    Your funds will be securely held until work is completed.
                  </EmptyDescription>
                </EmptyState>
              ) : (
                <EscrowGrid>
                  {escrowProjects.map(renderProjectCard)}
                </EscrowGrid>
              )}
            </>
          )}

          {activeTab === 'marketplace' && (
            <>
              {escrowOrders.length === 0 ? (
                <EmptyState>
                  <EmptyIcon>
                    <Package size={32} />
                  </EmptyIcon>
                  <EmptyTitle>No Marketplace Escrows Yet</EmptyTitle>
                  <EmptyDescription>
                    Purchase items from the marketplace to see escrow-protected orders here.
                    Funds are held securely until delivery confirmation.
                  </EmptyDescription>
                </EmptyState>
              ) : (
                <EscrowGrid>
                  {escrowOrders.map(renderOrderCard)}
                </EscrowGrid>
              )}
            </>
          )}

          {selectedProject && (
            <EscrowPromptModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedProject(null);
              }}
              projectTitle={selectedProject.title}
              agreedAmount={selectedProject.agreed_price || 0}
              freelancerName={selectedProject.freelancer ?
                `${selectedProject.freelancer.first_name} ${selectedProject.freelancer.last_name}` :
                'Freelancer'
              }
              onConfirm={handleEscrowConfirm}
            />
          )}
        </Container>
      </PageWrapper>
    </Layout>
  );
};

export default EscrowPage;
