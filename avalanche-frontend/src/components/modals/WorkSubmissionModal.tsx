import React, { useState } from 'react';
import { styled } from '../../stitches.config';
import { Upload, File, X, CheckCircle, AlertCircle, Paperclip } from 'lucide-react';

const Overlay = styled('div', {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000,
  padding: '$4',
});

const Modal = styled('div', {
  backgroundColor: 'var(--card-bg)',
  borderRadius: '$lg',
  maxWidth: '700px',
  width: '100%',
  maxHeight: '90vh',
  overflow: 'auto',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
});

const Header = styled('div', {
  padding: '$6',
  borderBottom: '1px solid var(--border-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const HeaderContent = styled('div', {
  flex: 1,
});

const Title = styled('h2', {
  fontSize: '$xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  marginBottom: '$1',
});

const Subtitle = styled('p', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
});

const CloseButton = styled('button', {
  padding: '$2',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-secondary)',
  borderRadius: '$base',
  transition: 'all 0.2s',

  '&:hover': {
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-secondary)',
  },
});

const Content = styled('div', {
  padding: '$6',
});

const FormGroup = styled('div', {
  marginBottom: '$6',
});

const Label = styled('label', {
  display: 'block',
  fontSize: '$sm',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
  marginBottom: '$2',
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
  fontFamily: 'inherit',

  '&::placeholder': {
    color: 'var(--text-secondary)',
  },

  '&:focus': {
    outline: 'none',
    borderColor: 'var(--primary-color)',
  },
});

const UploadArea = styled('div', {
  width: '100%',
  minHeight: '160px',
  border: '2px dashed var(--border-color)',
  borderRadius: '$base',
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
  backgroundColor: 'rgba(59, 130, 246, 0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#3b82f6',
});

const UploadText = styled('div', {
  fontSize: '$sm',
  color: 'var(--text-primary)',
  textAlign: 'center',
  fontWeight: '$medium',
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
  gap: '$3',
  padding: '$3',
  backgroundColor: 'var(--bg-secondary)',
  borderRadius: '$base',
  border: '1px solid var(--border-color)',
});

const FileIcon = styled('div', {
  width: '36px',
  height: '36px',
  borderRadius: '$base',
  backgroundColor: 'rgba(59, 130, 246, 0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#3b82f6',
  flexShrink: 0,
});

const FileInfo = styled('div', {
  flex: 1,
  minWidth: 0,
});

const FileName = styled('div', {
  fontSize: '$sm',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const FileSize = styled('div', {
  fontSize: '$xs',
  color: 'var(--text-secondary)',
});

const RemoveButton = styled('button', {
  padding: '$1',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-secondary)',
  borderRadius: '$base',
  display: 'flex',
  alignItems: 'center',
  transition: 'all 0.2s',

  '&:hover': {
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
});

const InfoBox = styled('div', {
  padding: '$4',
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  border: '1px solid rgba(59, 130, 246, 0.3)',
  borderRadius: '$base',
  marginBottom: '$6',
});

const InfoText = styled('p', {
  fontSize: '$sm',
  color: 'var(--text-primary)',
  lineHeight: '1.6',
});

const ErrorMessage = styled('div', {
  padding: '$3',
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  borderRadius: '$base',
  color: '#ef4444',
  fontSize: '$sm',
  marginBottom: '$4',
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
});

const Footer = styled('div', {
  padding: '$6',
  borderTop: '1px solid var(--border-color)',
  display: 'flex',
  gap: '$3',
  justifyContent: 'flex-end',
});

const Button = styled('button', {
  padding: '$3 $6',
  borderRadius: '$base',
  fontSize: '$base',
  fontWeight: '$semibold',
  cursor: 'pointer',
  transition: 'all 0.2s',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '$2',

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  variants: {
    variant: {
      secondary: {
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-color)',

        '&:hover:not(:disabled)': {
          backgroundColor: 'var(--bg-tertiary)',
        },
      },
      primary: {
        backgroundColor: 'var(--primary-color)',
        color: 'white',

        '&:hover:not(:disabled)': {
          backgroundColor: 'var(--primary-hover)',
          transform: 'translateY(-1px)',
        },
      },
    },
  },
});

interface WorkSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  clientName: string;
  agreedAmount: number;
  onSubmit: (description: string, files: File[]) => Promise<void>;
}

const WorkSubmissionModal: React.FC<WorkSubmissionModalProps> = ({
  isOpen,
  onClose,
  projectTitle,
  clientName,
  agreedAmount,
  onSubmit,
}) => {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('Please provide a description of your work');
      return;
    }

    if (files.length === 0) {
      setError('Please upload at least one deliverable file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit(description.trim(), files);
      setDescription('');
      setFiles([]);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit work');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderContent>
            <Title>Submit Completed Work</Title>
            <Subtitle>
              {projectTitle} • ${agreedAmount.toLocaleString()}
            </Subtitle>
          </HeaderContent>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>

        <Content>
          <InfoBox>
            <InfoText>
              You're submitting work to <strong>{clientName}</strong>. Once approved, ${agreedAmount.toLocaleString()} will be released from escrow to your wallet.
            </InfoText>
          </InfoBox>

          <FormGroup>
            <Label htmlFor="description">Work Description</Label>
            <TextArea
              id="description"
              placeholder="Describe what you've completed, any notes for the client, and how to access/use the deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label>Deliverables</Label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              accept="*/*"
            />
            <UploadArea onClick={() => fileInputRef.current?.click()}>
              <UploadIcon>
                <Upload size={20} />
              </UploadIcon>
              <UploadText>
                Click to upload files or drag and drop
              </UploadText>
              <UploadSubtext>
                Any file type accepted • Up to 100MB per file
              </UploadSubtext>
            </UploadArea>

            {files.length > 0 && (
              <FileList>
                {files.map((file, index) => (
                  <FileItem key={index}>
                    <FileIcon>
                      <File size={18} />
                    </FileIcon>
                    <FileInfo>
                      <FileName>{file.name}</FileName>
                      <FileSize>{formatFileSize(file.size)}</FileSize>
                    </FileInfo>
                    <RemoveButton onClick={() => handleRemoveFile(index)}>
                      <X size={16} />
                    </RemoveButton>
                  </FileItem>
                ))}
              </FileList>
            )}
          </FormGroup>

          {error && (
            <ErrorMessage>
              <AlertCircle size={16} />
              {error}
            </ErrorMessage>
          )}
        </Content>

        <Footer>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            <CheckCircle size={18} />
            {loading ? 'Submitting...' : 'Submit Work'}
          </Button>
        </Footer>
      </Modal>
    </Overlay>
  );
};

export default WorkSubmissionModal;
