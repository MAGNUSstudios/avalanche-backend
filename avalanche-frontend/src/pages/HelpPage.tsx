import React, { useState, useRef } from 'react';
import { styled } from '../stitches.config';
import Layout from '../components/layout/Layout';
import { Search, Rocket, User, ShoppingBag, MapPin, Shield, CreditCard, MessageSquare, FileText, ChevronDown } from 'lucide-react';

const PageWrapper = styled('div', {
  minHeight: '100vh',
  backgroundColor: 'var(--bg-primary)',
  paddingTop: '80px',
});

const Container = styled('div', {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 $6',
});

const HeroSection = styled('div', {
  textAlign: 'center',
  paddingTop: '$12',
  paddingBottom: '$8',
});

const Title = styled('h1', {
  fontSize: '$4xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  marginBottom: '$3',
});

const Subtitle = styled('p', {
  fontSize: '$lg',
  color: 'var(--text-secondary)',
  marginBottom: '$8',
});

const SearchBox = styled('div', {
  position: 'relative',
  maxWidth: '600px',
  margin: '0 auto',
});

const SearchInput = styled('input', {
  width: '100%',
  padding: '$4 $4 $4 48px',
  fontSize: '$base',
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '$lg',
  color: 'var(--text-primary)',
  outline: 'none',
  transition: 'border-color 0.2s',

  '&:focus': {
    borderColor: 'var(--primary-color)',
  },

  '&::placeholder': {
    color: 'var(--text-secondary)',
  },
});

const SearchIcon = styled('div', {
  position: 'absolute',
  left: '16px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--text-secondary)',
});

const Section = styled('section', {
  marginBottom: '$12',
});

const SectionTitle = styled('h2', {
  fontSize: '$2xl',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
  marginBottom: '$6',
});

const TopicsGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '$6',
});

const TopicCard = styled('div', {
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '$lg',
  padding: '$6',
  cursor: 'pointer',
  transition: 'all 0.2s',

  '&:hover': {
    borderColor: 'var(--primary-color)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
});

const TopicIcon = styled('div', {
  width: '48px',
  height: '48px',
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  borderRadius: '$base',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--primary-color)',
  marginBottom: '$4',
});

const TopicTitle = styled('h3', {
  fontSize: '$lg',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
  marginBottom: '$2',
});

const TopicDescription = styled('p', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
});

const FAQSection = styled('div', {
  maxWidth: '800px',
  margin: '0 auto',
});

const FAQItem = styled('div', {
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '$lg',
  marginBottom: '$3',
  overflow: 'hidden',
});

const FAQQuestion = styled('button', {
  width: '100%',
  padding: '$4 $6',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: 'transparent',
  border: 'none',
  fontSize: '$base',
  fontWeight: '$medium',
  color: 'var(--text-primary)',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'background-color 0.2s',

  '&:hover': {
    backgroundColor: 'var(--bg-secondary)',
  },
});

const FAQAnswer = styled('div', {
  padding: '0 $6 $4 $6',
  fontSize: '$sm',
  color: 'var(--text-secondary)',
  lineHeight: '1.6',
});

const ChevronIcon = styled('div', {
  transition: 'transform 0.2s',
  color: 'var(--text-secondary)',

  variants: {
    isOpen: {
      true: {
        transform: 'rotate(180deg)',
      },
    },
  },
});

const BottomSection = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '$8',
  marginTop: '$12',
  paddingBottom: '$12',
});

const ContactCard = styled('div', {
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '$lg',
  padding: '$6',
});

const ContactTitle = styled('h3', {
  fontSize: '$xl',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
  marginBottom: '$3',
});

const ContactDescription = styled('p', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
  marginBottom: '$4',
  lineHeight: '1.6',
});

const ContactButton = styled('button', {
  padding: '$3 $6',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  border: 'none',
  borderRadius: '$base',
  fontSize: '$sm',
  fontWeight: '$medium',
  cursor: 'pointer',
  transition: 'background-color 0.2s',

  '&:hover': {
    backgroundColor: 'var(--primary-hover)',
  },
});

const OnlineBadge = styled('span', {
  display: 'inline-block',
  padding: '$1 $2',
  backgroundColor: '#10b981',
  color: 'white',
  fontSize: '$xs',
  fontWeight: '$medium',
  borderRadius: '$sm',
  marginLeft: '$2',
});

const HelpPage: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const faqRefs = {
    'getting-started': useRef<HTMLDivElement>(null),
    'account-profile': useRef<HTMLDivElement>(null),
    'marketplace-guide': useRef<HTMLDivElement>(null),
    'project-collaboration': useRef<HTMLDivElement>(null),
    'guild-management': useRef<HTMLDivElement>(null),
    'payments-billing': useRef<HTMLDivElement>(null),
  };

  React.useEffect(() => {
    const token = localStorage.getItem('avalanche_token');
    setIsAuthenticated(!!token);
  }, []);

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  const scrollToFAQ = (id: keyof typeof faqRefs) => {
    faqRefs[id].current?.scrollIntoView({ behavior: 'smooth' });
  };

  const topics = [
    { id: 'getting-started', icon: <Rocket size={24} />, title: 'Getting Started', description: 'Learn the basics of Avalanche' },
    { id: 'account-profile', icon: <User size={24} />, title: 'Account & Profile', description: 'Manage your personal info' },
    { id: 'marketplace-guide', icon: <ShoppingBag size={24} />, title: 'Marketplace Guide', description: 'How to buy and sell items' },
    { id: 'project-collaboration', icon: <MapPin size={24} />, title: 'Project Collaboration', description: 'Collaborate on new projects' },
    { id: 'guild-management', icon: <Shield size={24} />, title: 'Guild Management', description: 'Create and manage your guild' },
    { id: 'payments-billing', icon: <CreditCard size={24} />, title: 'Payments & Billing', description: 'Handle your transactions' },
  ];

  const faqs = {
    'getting-started': [
      { id: 'gs-1', question: 'What is Avalanche?', answer: 'Avalanche is a platform for freelancers and clients to connect, collaborate on projects, buy and sell digital goods, and form communities (Guilds).' },
      { id: 'gs-2', question: 'How do I sign up?', answer: 'Click the "Sign Up" button on the top right of the homepage. You can sign up with your email address or by connecting your Google or GitHub account.' },
    ],
    'account-profile': [
      { id: 'ap-1', question: 'How do I change my profile picture?', answer: 'Go to your Settings page, which you can find by clicking your profile icon in the header. Under "Profile Information", you can upload a new avatar.' },
      { id: 'ap-2', question: 'Can I change my username?', answer: 'Usernames are unique and cannot be changed after registration to maintain identity consistency on the platform.' },
    ],
    'marketplace-guide': [
      { id: 'mg-1', question: 'How do I sell an item?', answer: 'Navigate to the Marketplace and click "Sell an Item". You will be guided through a form to upload your item, set a price, write a description, and publish it.' },
      { id: 'mg-2', question: 'What are the fees for selling?', answer: 'Avalanche charges a 5% platform fee on each successful sale. This helps us maintain the platform and provide support. There are no listing fees.' },
    ],
    'project-collaboration': [
      { id: 'pc-1', question: 'How do I create a new project?', answer: 'Go to the "Projects" page and click "Create Project". Fill out the details, budget, and timeline. You can then invite collaborators.' },
      { id: 'pc-2', question: 'How does payment escrow work for projects?', answer: 'When a client funds a project, the money is held in escrow. It is released to the freelancer in milestones as work is completed and approved by the client, ensuring security for both parties.' },
    ],
    'guild-management': [
      { id: 'gm-1', question: 'How can I join a guild?', answer: 'Explore guilds on the "Guilds" page. When you find one you like, click "Request to Join". The guild admin will review your request.' },
      { id: 'gm-2', question: 'Can I create my own guild?', answer: 'Yes! Go to the "Guilds" page and click "Create Guild". You can set rules, invite members, and build your own community.' },
    ],
    'payments-billing': [
      { id: 'pb-1', question: 'What payment methods are accepted?', answer: 'We accept all major credit cards, PayPal, and select cryptocurrencies. All payments are processed securely via our payment partners.' },
      { id: 'pb-2', question: 'How do I get paid for my sales or project work?', answer: 'You can withdraw your earnings from your Avalanche wallet. Go to Dashboard > Payouts to set up your withdrawal method (e.g., bank transfer, PayPal). Withdrawals are processed within 3-5 business days.' },
    ],
  };

  return (
    <Layout isAuthenticated={isAuthenticated}>
      <PageWrapper>
        <Container>
          <HeroSection>
            <Title>How can we help?</Title>
            <Subtitle>Find answers, contact support, or connect with the community.</Subtitle>
            <SearchBox>
              <SearchIcon>
                <Search size={20} />
              </SearchIcon>
              <SearchInput placeholder="Search our knowledge base..." />
            </SearchBox>
          </HeroSection>

          <Section>
            <SectionTitle>Browse by Topic</SectionTitle>
            <TopicsGrid>
              {topics.map((topic) => (
                <TopicCard key={topic.id} onClick={() => scrollToFAQ(topic.id as keyof typeof faqRefs)}>
                  <TopicIcon>{topic.icon}</TopicIcon>
                  <TopicTitle>{topic.title}</TopicTitle>
                  <TopicDescription>{topic.description}</TopicDescription>
                </TopicCard>
              ))}
            </TopicsGrid>
          </Section>

          {Object.entries(faqs).map(([categoryId, categoryFaqs]) => (
            <Section key={categoryId} ref={faqRefs[categoryId as keyof typeof faqRefs]}>
              <FAQSection>
                <SectionTitle>{topics.find(t => t.id === categoryId)?.title}</SectionTitle>
                {categoryFaqs.map((faq) => (
                  <FAQItem key={faq.id}>
                    <FAQQuestion onClick={() => toggleFAQ(faq.id)}>
                      {faq.question}
                      <ChevronIcon isOpen={openFAQ === faq.id}>
                        <ChevronDown size={20} />
                      </ChevronIcon>
                    </FAQQuestion>
                    {openFAQ === faq.id && <FAQAnswer>{faq.answer}</FAQAnswer>}
                  </FAQItem>
                ))}
              </FAQSection>
            </Section>
          ))}

          <Section>
            <SectionTitle style={{ textAlign: 'center', marginBottom: '$3' }}>
              Still need help?
            </SectionTitle>
            <BottomSection>
              <ContactCard>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '$3' }}>
                  <MessageSquare size={24} color="var(--primary-color)" />
                  <ContactTitle style={{ margin: '0 0 0 $3' }}>
                    Live Chat
                    <OnlineBadge>Online</OnlineBadge>
                  </ContactTitle>
                </div>
                <ContactDescription>
                  Our support team is available for immediate assistance during business hours (9am-5pm EST).
                </ContactDescription>
                <ContactButton>Start Chat</ContactButton>
              </ContactCard>

              <ContactCard>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '$3' }}>
                  <FileText size={24} color="var(--primary-color)" />
                  <ContactTitle style={{ margin: '0 0 0 $3' }}>
                    Submit a Ticket
                  </ContactTitle>
                </div>
                <ContactDescription>
                  For detailed issues or non-urgent requests, submit a ticket and we'll get back to you within 24 hours.
                </ContactDescription>
                <ContactButton>Create Ticket</ContactButton>
              </ContactCard>
            </BottomSection>
          </Section>

          <Section style={{ textAlign: 'center', paddingBottom: '$12' }}>
            <SectionTitle>Join the Conversation</SectionTitle>
            <ContactCard style={{ maxWidth: '600px', margin: '0 auto' }}>
              <ContactTitle>Community Forums</ContactTitle>
              <ContactDescription>
                Ask questions, share your work, and get help from fellow Avalanche users and experts in our community forums.
              </ContactDescription>
              <ContactButton>Visit Forums</ContactButton>
            </ContactCard>
          </Section>
        </Container>
      </PageWrapper>
    </Layout>
  );
};

export default HelpPage;
