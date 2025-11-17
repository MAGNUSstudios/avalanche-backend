import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '../stitches.config';
import { Upload, X, Info } from 'lucide-react';
import API from '../services/api';

const PageContainer = styled('div', {
  minHeight: '100vh',
  backgroundColor: 'var(--bg-primary)',
  paddingTop: '73px',
});

const Container = styled('div', {
  maxWidth: '800px',
  margin: '0 auto',
  padding: '$8',
});

const Header = styled('h1', {
  fontSize: '$3xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  marginBottom: '$8',
  textAlign: 'center',
});

const FormCard = styled('div', {
  backgroundColor: 'var(--card-bg)',
  borderRadius: '$lg',
  padding: '$8',
  border: '1px solid var(--border-color)',
});

const FormGroup = styled('div', {
  marginBottom: '$6',
});

const Label = styled('label', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  fontSize: '$sm',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
  marginBottom: '$2',
});

const Input = styled('input', {
  width: '100%',
  padding: '$3 $4',
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '$base',
  color: 'var(--text-primary)',
  fontSize: '$sm',
  transition: 'all 0.2s',

  '&::placeholder': {
    color: 'var(--text-secondary)',
  },

  '&:focus': {
    outline: 'none',
    borderColor: 'var(--primary-color)',
    backgroundColor: 'var(--bg-secondary)',
  },
});

const TextArea = styled('textarea', {
  width: '100%',
  minHeight: '120px',
  padding: '$3 $4',
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '$base',
  color: 'var(--text-primary)',
  fontSize: '$sm',
  resize: 'vertical',
  transition: 'all 0.2s',
  fontFamily: 'inherit',

  '&::placeholder': {
    color: 'var(--text-secondary)',
  },

  '&:focus': {
    outline: 'none',
    borderColor: 'var(--primary-color)',
    backgroundColor: 'var(--bg-secondary)',
  },
});

const SkillsInput = styled('div', {
  width: '100%',
  minHeight: '48px',
  padding: '$2',
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '$base',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '$2',
  alignItems: 'center',
  transition: 'all 0.2s',

  '&:focus-within': {
    borderColor: 'var(--primary-color)',
  },
});

const SkillTag = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$1 $3',
  backgroundColor: 'rgba(59, 130, 246, 0.15)',
  color: '#3b82f6',
  borderRadius: '$full',
  fontSize: '$sm',
  fontWeight: '$medium',
});

const RemoveSkillButton = styled('button', {
  padding: '0',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: '#3b82f6',
  display: 'flex',
  alignItems: 'center',
  transition: 'all 0.2s',

  '&:hover': {
    color: '#2563eb',
  },
});

const SkillInput = styled('input', {
  flex: 1,
  minWidth: '120px',
  padding: '$2',
  backgroundColor: 'transparent',
  border: 'none',
  color: 'var(--text-primary)',
  fontSize: '$sm',

  '&::placeholder': {
    color: 'var(--text-secondary)',
  },

  '&:focus': {
    outline: 'none',
  },
});

const TwoColumnGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '$4',
  marginBottom: '$6',
});

const UploadArea = styled('div', {
  width: '100%',
  minHeight: '180px',
  border: '2px dashed var(--border-color)',
  borderRadius: '$lg',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$3',
  padding: '$6',
  cursor: 'pointer',
  transition: 'all 0.2s',
  backgroundColor: 'var(--bg-secondary)',

  '&:hover': {
    borderColor: 'var(--primary-color)',
    backgroundColor: 'var(--bg-tertiary)',
  },
});

const UploadIcon = styled('div', {
  width: '48px',
  height: '48px',
  borderRadius: '$full',
  backgroundColor: 'var(--bg-tertiary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-secondary)',
});

const UploadText = styled('div', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
  textAlign: 'center',
});

const UploadSubtext = styled('div', {
  fontSize: '$xs',
  color: 'var(--text-secondary)',
});

const FileList = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
  marginTop: '$3',
});

const FileItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$2 $3',
  backgroundColor: 'var(--bg-secondary)',
  borderRadius: '$base',
  border: '1px solid var(--border-color)',
});

const FileName = styled('span', {
  fontSize: '$sm',
  color: 'var(--text-primary)',
});

const RemoveFileButton = styled('button', {
  padding: '$1',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-secondary)',
  display: 'flex',
  alignItems: 'center',
  transition: 'all 0.2s',

  '&:hover': {
    color: '#ef4444',
  },
});

const ButtonContainer = styled('div', {
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '$6',
});

const CreateButton = styled('button', {
  padding: '$3 $8',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  border: 'none',
  borderRadius: '$base',
  fontSize: '$base',
  fontWeight: '$semibold',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  transition: 'all 0.2s',

  '&:hover': {
    backgroundColor: 'var(--primary-hover)',
    transform: 'translateY(-1px)',
  },

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none',
  },
});

const InfoIcon = styled(Info, {
  width: '14px',
  height: '14px',
  color: 'var(--text-secondary)',
});

const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<string[]>(['UI Design', 'AI Integration']);
  const [currentSkill, setCurrentSkill] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentSkill.trim()) {
      e.preventDefault();
      if (!skills.includes(currentSkill.trim())) {
        setSkills([...skills, currentSkill.trim()]);
      }
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert('Please fill in the required fields');
      return;
    }

    try {
      setLoading(true);
      const project = await API.projects.create({
        title: title.trim(),
        description: description.trim(),
        budget: budget ? parseFloat(budget) : undefined,
        deadline: deadline || undefined,
      });

      // Redirect directly to Stripe Checkout
      const response = await fetch('http://localhost:8000/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('avalanche_token')}`,
        },
        body: JSON.stringify({ project_id: project.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error('Failed to create project:', err);
      alert('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <Container>
        <Header>Create a New Project</Header>

        <FormCard as="form" onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., AI-Powered E-commerce Platform"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">Detailed Project Description</Label>
            <TextArea
              id="description"
              placeholder="Describe your project in detail. What are the goals, key features, and deliverables?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>
              Required Skills
              <InfoIcon />
            </Label>
            <SkillsInput>
              {skills.map((skill) => (
                <SkillTag key={skill}>
                  {skill}
                  <RemoveSkillButton type="button" onClick={() => handleRemoveSkill(skill)}>
                    <X size={14} />
                  </RemoveSkillButton>
                </SkillTag>
              ))}
              <SkillInput
                type="text"
                placeholder="Add a skill..."
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onKeyDown={handleAddSkill}
              />
            </SkillsInput>
          </FormGroup>

          <TwoColumnGrid>
            <FormGroup>
              <Label htmlFor="budget">Budget (USD)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="Enter budget amount"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                min="0"
                step="0.01"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="deadline">Project Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </FormGroup>
          </TwoColumnGrid>

          <FormGroup>
            <Label>Attachments</Label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              accept=".svg,.png,.jpg,.jpeg,.pdf,.doc,.docx"
            />
            <UploadArea onClick={() => fileInputRef.current?.click()}>
              <UploadIcon>
                <Upload size={20} />
              </UploadIcon>
              <UploadText>
                <strong>Click to upload</strong> or drag and drop
              </UploadText>
              <UploadSubtext>SVG, PNG, JPG or PDF (MAX. 10MB)</UploadSubtext>
            </UploadArea>

            {files.length > 0 && (
              <FileList>
                {files.map((file, index) => (
                  <FileItem key={index}>
                    <FileName>{file.name}</FileName>
                    <RemoveFileButton type="button" onClick={() => handleRemoveFile(index)}>
                      <X size={16} />
                    </RemoveFileButton>
                  </FileItem>
                ))}
              </FileList>
            )}
          </FormGroup>

          <ButtonContainer>
            <CreateButton type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M8 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </CreateButton>
          </ButtonContainer>
        </FormCard>
      </Container>
    </PageContainer>
  );
};

export default CreateProjectPage;
