import React, { useState } from 'react';
import { styled } from '../stitches.config';
import { useNavigate } from 'react-router-dom';

const PageContainer = styled('div', {
  minHeight: '100vh',
  backgroundColor: 'var(--bg-primary)',
  padding: '40px 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const FormCard = styled('div', {
  backgroundColor: 'var(--card-bg)',
  borderRadius: '12px',
  padding: '48px',
  maxWidth: '680px',
  width: '100%',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
});

const Title = styled('h1', {
  fontSize: '28px',
  fontWeight: '700',
  textAlign: 'center',
  marginBottom: '8px',
  color: 'var(--text-primary)',
  letterSpacing: '-0.02em',
});

const Subtitle = styled('p', {
  fontSize: '13px',
  color: 'var(--text-secondary)',
  textAlign: 'center',
  marginBottom: '40px',
  lineHeight: '1.5',
});

const Section = styled('div', {
  marginBottom: '32px',
});

const SectionTitle = styled('h3', {
  fontSize: '14px',
  fontWeight: '700',
  color: 'var(--text-primary)',
  marginBottom: '20px',
  letterSpacing: '0.02em',
});

const UploadRow = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
  marginBottom: '24px',
});

const UploadBox = styled('div', {
  border: '2px dashed var(--border-color)',
  borderRadius: '8px',
  padding: '32px 24px',
  textAlign: 'center',
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
  backgroundColor: 'var(--bg-tertiary)',
  borderRadius: '8px',
  margin: '0 auto 12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-secondary)',
  fontSize: '24px',
});

const UploadLabel = styled('div', {
  fontSize: '13px',
  fontWeight: '600',
  color: 'var(--text-primary)',
  marginBottom: '6px',
});

const UploadHint = styled('div', {
  fontSize: '11px',
  color: 'var(--text-tertiary)',
  marginBottom: '16px',
});

const UploadButton = styled('button', {
  fontSize: '12px',
  color: 'var(--primary-color)',
  fontWeight: '600',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  padding: '6px 12px',

  '&:hover': {
    textDecoration: 'underline',
  },
});

const FormGroup = styled('div', {
  marginBottom: '20px',
});

const Label = styled('label', {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  color: 'var(--text-primary)',
  marginBottom: '10px',
});

const Input = styled('input', {
  width: '100%',
  padding: '11px 14px',
  fontSize: '14px',
  border: '1px solid var(--border-color)',
  borderRadius: '6px',
  outline: 'none',
  transition: 'border-color 0.2s',
  backgroundColor: 'var(--input-bg)',
  color: 'var(--text-primary)',

  '&:focus': {
    borderColor: 'var(--primary-color)',
    boxShadow: '0 0 0 3px var(--primary-shadow)',
  },

  '&::placeholder': {
    color: 'var(--text-tertiary)',
  },
});

const TextArea = styled('textarea', {
  width: '100%',
  padding: '11px 14px',
  fontSize: '14px',
  border: '1px solid var(--border-color)',
  borderRadius: '6px',
  outline: 'none',
  resize: 'vertical',
  minHeight: '90px',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
  backgroundColor: 'var(--input-bg)',
  color: 'var(--text-primary)',

  '&:focus': {
    borderColor: 'var(--primary-color)',
    boxShadow: '0 0 0 3px var(--primary-shadow)',
  },

  '&::placeholder': {
    color: 'var(--text-tertiary)',
  },
});

const Select = styled('select', {
  width: '100%',
  padding: '11px 14px',
  fontSize: '14px',
  border: '1px solid var(--border-color)',
  borderRadius: '6px',
  outline: 'none',
  backgroundColor: 'var(--input-bg)',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  transition: 'border-color 0.2s',
  appearance: 'none',
  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' viewBox=\'0 0 12 8\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1.5L6 6.5L11 1.5\' stroke=\'%239ca3af\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: '40px',

  '&:focus': {
    borderColor: 'var(--primary-color)',
    boxShadow: '0 0 0 3px var(--primary-shadow)',
  },

  'option': {
    color: 'var(--text-primary)',
  },
});

const TagsContainer = styled('div', {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginTop: '8px',
});

const Tag = styled('span', {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 10px',
  backgroundColor: 'var(--tag-bg)',
  color: 'var(--tag-text)',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: '500',
});

const RemoveTag = styled('button', {
  border: 'none',
  background: 'none',
  color: 'var(--primary-color)',
  cursor: 'pointer',
  padding: '0',
  fontSize: '16px',
  lineHeight: '1',
  marginLeft: '2px',

  '&:hover': {
    color: 'var(--tag-text)',
  },
});

const TagInput = styled('input', {
  width: '100%',
  padding: '11px 14px',
  fontSize: '14px',
  border: '1px solid var(--border-color)',
  borderRadius: '6px',
  outline: 'none',
  transition: 'border-color 0.2s',
  backgroundColor: 'var(--input-bg)',
  color: 'var(--text-primary)',
  marginTop: '12px',

  '&:focus': {
    borderColor: 'var(--primary-color)',
    boxShadow: '0 0 0 3px var(--primary-shadow)',
  },

  '&::placeholder': {
    color: 'var(--text-tertiary)',
  },
});

const Hint = styled('div', {
  fontSize: '11px',
  color: 'var(--text-tertiary)',
  marginTop: '10px',
  lineHeight: '1.5',
});

const SubmitButton = styled('button', {
  width: '100%',
  padding: '13px',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  fontSize: '15px',
  fontWeight: '600',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  marginTop: '12px',

  '&:hover': {
    backgroundColor: 'var(--primary-hover)',
    boxShadow: '0 4px 12px var(--primary-shadow)',
  },

  '&:active': {
    transform: 'scale(0.98)',
  },

  '&:disabled': {
    backgroundColor: 'var(--disabled-bg)',
    cursor: 'not-allowed',
    transform: 'none',
  },
});

const ErrorMessage = styled('div', {
  padding: '12px 16px',
  backgroundColor: 'var(--error-bg)',
  color: 'var(--error-text)',
  borderRadius: '8px',
  fontSize: '14px',
  marginBottom: '16px',
});

const FileName = styled('div', {
  fontSize: '12px',
  color: 'var(--primary-color)',
  marginTop: '8px',
});

interface GuildFormData {
  name: string;
  description: string;
  category: string;
  skills: string[];
  icon: File | null;
  banner: File | null;
}

const CreateGuildPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<GuildFormData>({
    name: '',
    description: '',
    category: '',
    skills: ['AI Development', 'UI/UX Design'],
    icon: null,
    banner: null,
  });
  const [currentSkill, setCurrentSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Technology',
    'Design',
    'Business',
    'Marketing',
    'Finance',
    'Education',
    'Healthcare',
    'Entertainment',
    'Gaming',
    'Other',
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'icon' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [type]: file }));
    }
  };

  const handleAddSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()],
      }));
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter a guild name');
      return;
    }

    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('avalanche_token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Use FormData to send files
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('is_private', 'false');
      
      if (formData.icon) {
        formDataToSend.append('icon', formData.icon);
      }
      
      if (formData.banner) {
        formDataToSend.append('banner', formData.banner);
      }

      const response = await fetch('http://localhost:8000/guilds', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to create guild');
      }

      // Redirect to guilds page or the new guild page
      navigate('/guilds');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <FormCard>
        <Title>Create Your Guild</Title>
        <Subtitle>
          Bring your community together and start collaborating on exciting new projects.
        </Subtitle>

        <form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Section>
            <SectionTitle>Guild Identity</SectionTitle>
            <UploadRow>
              <UploadBox>
                <UploadIcon>🖼️</UploadIcon>
                <UploadLabel>Upload Guild Icon</UploadLabel>
                <UploadHint>512x512px recommended.</UploadHint>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="icon-upload"
                  onChange={(e) => handleFileChange(e, 'icon')}
                />
                <UploadButton
                  type="button"
                  onClick={() => document.getElementById('icon-upload')?.click()}
                >
                  Choose file
                </UploadButton>
                {formData.icon && (
                  <FileName>
                    {formData.icon.name}
                  </FileName>
                )}
              </UploadBox>

              <UploadBox>
                <UploadIcon>🖼️</UploadIcon>
                <UploadLabel>Upload Guild Banner</UploadLabel>
                <UploadHint>1920x400px recommended.</UploadHint>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="banner-upload"
                  onChange={(e) => handleFileChange(e, 'banner')}
                />
                <UploadButton
                  type="button"
                  onClick={() => document.getElementById('banner-upload')?.click()}
                >
                  Choose file
                </UploadButton>
                {formData.banner && (
                  <FileName>
                    {formData.banner.name}
                  </FileName>
                )}
              </UploadBox>
            </UploadRow>
          </Section>

          <Section>
            <SectionTitle>Guild Details</SectionTitle>
            
            <FormGroup>
              <Label>Guild Name</Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter a unique name for your guild"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Guild Description</Label>
              <TextArea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell everyone what your guild is about..."
              />
            </FormGroup>

            <FormGroup>
              <Label>Category</Label>
              <Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </FormGroup>
          </Section>

          <Section>
            <SectionTitle>Membership</SectionTitle>
            <FormGroup>
              <Label>Required Skills / Interests</Label>
              <TagsContainer>
                {formData.skills.map((skill) => (
                  <Tag key={skill}>
                    {skill}
                    <RemoveTag type="button" onClick={() => handleRemoveSkill(skill)}>
                      ×
                    </RemoveTag>
                  </Tag>
                ))}
              </TagsContainer>
              <TagInput
                type="text"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a skill and press Enter..."
              />
              <Hint>Add tags that describe the skills or interests you're looking for.</Hint>
            </FormGroup>
          </Section>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? 'Creating Guild...' : 'Create Guild'}
          </SubmitButton>
        </form>
      </FormCard>
    </PageContainer>
  );
};

export default CreateGuildPage;
