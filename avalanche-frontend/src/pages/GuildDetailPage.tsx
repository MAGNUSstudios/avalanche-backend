












import React, { useState, useEffect } from 'react';



import { styled } from '../stitches.config';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Calendar, ThumbsUp, ThumbsDown, MessageCircle, Share2, Pin, Image as ImageIcon, X, Smile } from 'lucide-react';
import Header from '../components/layout/Header';

const PageContainer = styled('div', {
  minHeight: '100vh',
  backgroundColor: '#0a0e27',
});

const HeroSection = styled('div', {
  position: 'relative',
  height: '300px',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
});

const HeroOverlay = styled('div', {
  position: 'absolute',
  bottom: '0',
  left: '0',
  right: '0',
  background: 'linear-gradient(to top, rgba(10, 14, 39, 1) 0%, rgba(10, 14, 39, 0) 100%)',
  padding: '80px 0 30px',
});

const Container = styled('div', {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 24px',
});

const GuildHeader = styled('div', {
  display: 'flex',
  alignItems: 'flex-end',
  gap: '20px',
});

const GuildIcon = styled('div', {
  width: '100px',
  height: '100px',
  borderRadius: '20px',
  backgroundColor: '#1a2332',
  border: '4px solid #0a0e27',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  flexShrink: 0,
});

const GuildInfo = styled('div', {
  flex: 1,
  paddingBottom: '10px',
});

const CategoryBadge = styled('span', {
  display: 'inline-block',
  padding: '4px 12px',
  backgroundColor: 'rgba(59, 130, 246, 0.15)',
  color: '#3b82f6',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: '600',
  marginBottom: '8px',
});

const GuildName = styled('h1', {
  fontSize: '32px',
  fontWeight: '700',
  color: 'white',
  marginBottom: '8px',
});

const GuildTagline = styled('p', {
  fontSize: '15px',
  color: '#8b92a7',
});

const ButtonGroup = styled('div', {
  display: 'flex',
  gap: '12px',
  alignSelf: 'flex-end',
  marginBottom: '10px',
});

const JoinButton = styled('button', {
  padding: '12px 32px',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',

  '&:hover': {
    backgroundColor: '#2563eb',
    transform: 'translateY(-1px)',
  },

  '&:disabled': {
    backgroundColor: '#1e293b',
    color: '#64748b',
    cursor: 'not-allowed',
    transform: 'none',
  },
});

const ChatButton = styled('button', {
  padding: '12px 32px',
  backgroundColor: '#0ea5e9',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',

  '&:hover': {
    backgroundColor: '#0284c7',
    transform: 'translateY(-1px)',
  },
});

const LeaveButton = styled('button', {
  padding: '12px 32px',
  backgroundColor: 'transparent',
  color: '#ef4444',
  border: '2px solid #ef4444',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',

  '&:hover': {
    backgroundColor: '#ef4444',
    color: 'white',
    transform: 'translateY(-1px)',
  },
});

const Content = styled('div', {
  display: 'grid',
  gridTemplateColumns: '300px 1fr',
  gap: '24px',
  padding: '24px 0',
});

const Sidebar = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

const Card = styled('div', {
  backgroundColor: '#131829',
  borderRadius: '12px',
  padding: '24px',
  border: '1px solid #1e293b',
});

const CardTitle = styled('h3', {
  fontSize: '16px',
  fontWeight: '700',
  color: 'white',
  marginBottom: '16px',
});

const CardText = styled('p', {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#8b92a7',
  marginBottom: '16px',
});

const StatRow = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 0',
  borderBottom: '1px solid #1e293b',
  color: '#8b92a7',
  fontSize: '14px',

  '&:last-child': {
    borderBottom: 'none',
  },

  svg: {
    color: '#64748b',
  },
});

const RulesList = styled('ul', {
  listStyle: 'none',
  padding: 0,
  margin: 0,

  li: {
    fontSize: '14px',
    color: '#8b92a7',
    lineHeight: '1.6',
    marginBottom: '12px',
    paddingLeft: '20px',
    position: 'relative',

    '&::before': {
      content: '•',
      position: 'absolute',
      left: '8px',
      color: '#3b82f6',
      fontWeight: 'bold',
    },
  },
});

const MembersList = styled('div', {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
});

const MemberAvatar = styled('div', {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: '#1e293b',
  border: '2px solid #131829',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
});

const MoreMembers = styled('div', {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: '#1e293b',
  border: '2px solid #131829',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
  fontWeight: '600',
  color: '#3b82f6',
});

const MainContent = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

const PostComposer = styled('div', {
  backgroundColor: '#131829',
  borderRadius: '12px',
  padding: '20px',
  border: '1px solid #1e293b',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

const ComposerTop = styled('div', {
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-start',
});

const UserAvatar = styled('div', {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: '#1e293b',
  flexShrink: 0,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
});

const PostInputArea = styled('textarea', {
  flex: 1,
  backgroundColor: '#1e293b',
  border: '1px solid #2d3748',
  borderRadius: '8px',
  padding: '12px',
  outline: 'none',
  color: 'white',
  fontSize: '15px',
  minHeight: '80px',
  resize: 'vertical',
  fontFamily: 'inherit',

  '&::placeholder': {
    color: '#64748b',
  },
  
  '&:focus': {
    borderColor: '$primary',
  },
});

const PostButton = styled('button', {
  padding: '10px 24px',
  backgroundColor: '$primary',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '$primaryHover',
    transform: 'translateY(-1px)',
  },
  '&:disabled': {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
    transform: 'none',
  },
});

const ComposerActions = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
});

const PostTypeSelector = styled('select', {
  padding: '8px 12px',
  backgroundColor: '#1e293b',
  border: '1px solid #2d3748',
  borderRadius: '8px',
  color: '#8b92a7',
  fontSize: '14px',
  cursor: 'pointer',
  outline: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: '#3d4758',
  },
  '&:focus': {
    borderColor: '$primary',
  },
});

const ActionButtons = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const ImageUploadButton = styled('label', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '8px 12px',
  backgroundColor: '#1e293b',
  border: '1px solid #2d3748',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  color: '#64748b',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#2d3748',
    borderColor: '#3d4758',
    color: '#8b92a7',
  },
  '& input[type="file"]': {
    display: 'none',
  },
});

const ImagePreviewContainer = styled('div', {
  position: 'relative',
  marginTop: '12px',
  borderRadius: '8px',
  overflow: 'hidden',
  maxWidth: '400px',
});

const ImagePreview = styled('img', {
  width: '100%',
  height: 'auto',
  display: 'block',
});

const RemoveImageButton = styled('button', {
  position: 'absolute',
  top: '8px',
  right: '8px',
  width: '32px',
  height: '32px',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  color: 'white',
  border: 'none',
  borderRadius: '50%',
  fontSize: '20px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
});

const EmojiPickerContainer = styled('div', {
  position: 'relative',
});

const EmojiButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 12px',
  backgroundColor: '#1e293b',
  border: '1px solid #2d3748',
  borderRadius: '8px',
  cursor: 'pointer',
  color: '#64748b',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#2d3748',
    borderColor: '#3d4758',
    color: '#8b92a7',
  },
});

const EmojiPicker = styled('div', {
  position: 'absolute',
  top: '100%',
  left: 0,
  marginTop: '8px',
  backgroundColor: '#1e293b',
  border: '1px solid #2d3748',
  borderRadius: '12px',
  padding: '16px',
  display: 'grid',
  gridTemplateColumns: 'repeat(8, 1fr)',
  gap: '4px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
  zIndex: 1000,
  width: '320px',
  maxHeight: '280px',
  overflowY: 'auto',
});

const EmojiItem = styled('button', {
  fontSize: '24px',
  padding: '8px',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 1,
  width: '36px',
  height: '36px',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
  '&:hover': {
    backgroundColor: '#2d3748',
    transform: 'scale(1.1)',
  },
});

const ModalOverlay = styled('div', {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000,
  padding: '20px',
});

const ModalContent = styled('div', {
  backgroundColor: '#1a2332',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '500px',
  maxHeight: '80vh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid #2d3748',
});

const ModalHeader = styled('div', {
  padding: '24px',
  borderBottom: '1px solid #2d3748',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const ModalTitle = styled('h2', {
  fontSize: '20px',
  fontWeight: '700',
  color: 'white',
  margin: 0,
});

const ModalCloseButton = styled('button', {
  backgroundColor: 'transparent',
  border: 'none',
  color: '#8b92a7',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '8px',
  transition: 'all 0.2s',
  
  '&:hover': {
    backgroundColor: '#2d3748',
    color: 'white',
  },
});

const ModalBody = styled('div', {
  padding: '24px',
  overflowY: 'auto',
  flex: 1,
});

const ReactionSection = styled('div', {
  marginBottom: '24px',
  
  '&:last-child': {
    marginBottom: 0,
  },
});

const ReactionSectionTitle = styled('h3', {
  fontSize: '16px',
  fontWeight: '600',
  color: 'white',
  marginBottom: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const UserList = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const UserItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px',
  backgroundColor: '#0f1419',
  borderRadius: '8px',
  border: '1px solid #2d3748',
});

const ReactionUserAvatar = styled('div', {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: '#3b82f6',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontWeight: '600',
  fontSize: '14px',
});

const ReactionUserInfo = styled('div', {
  flex: 1,
});

const ReactionUserName = styled('div', {
  fontSize: '14px',
  fontWeight: '600',
  color: 'white',
  marginBottom: '2px',
});

const ReactionUserEmail = styled('div', {
  fontSize: '12px',
  color: '#8b92a7',
});

const EmptyState = styled('div', {
  padding: '20px',
  textAlign: 'center',
  color: '#8b92a7',
  fontSize: '14px',
});

const CommentsModalOverlay = styled('div', {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000,
  padding: '20px',
});

const CommentsModalContent = styled('div', {
  backgroundColor: '#1a2332',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '700px',
  maxHeight: '90vh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid #2d3748',
});

const CommentsModalHeader = styled('div', {
  padding: '24px',
  borderBottom: '1px solid #2d3748',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const CommentsModalTitle = styled('h2', {
  fontSize: '20px',
  fontWeight: '700',
  color: 'white',
  margin: 0,
  display: 'inline',
  marginRight: '8px',
});

const CommentsModalBody = styled('div', {
  padding: '24px',
  overflowY: 'auto',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

const CommentCount = styled('span', {
  color: '#8b92a7',
  fontSize: '16px',
  fontWeight: '400',
});

const TabBar = styled('div', {
  display: 'flex',
  gap: '24px',
  borderBottom: '1px solid #1e293b',
  padding: '0 20px',
  backgroundColor: '#131829',
  borderRadius: '12px 12px 0 0',
});

const Tab = styled('button', {
  padding: '16px 0',
  backgroundColor: 'transparent',
  border: 'none',
  borderBottom: '2px solid transparent',
  color: '#64748b',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',

  '&:hover': {
    color: '#8b92a7',
  },

  variants: {
    active: {
      true: {
        color: '#3b82f6',
        borderBottomColor: '#3b82f6',
      },
    },
  },
});

const PostTypeBadge = styled('span', {
  padding: '4px 10px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: '600',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  
  variants: {
    type: {
      announcement: {
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        color: '#3b82f6',
      },
      project: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        color: '#10b981',
      },
    },
  },
});

const PostCard = styled('div', {
  backgroundColor: '#131829',
  borderRadius: '12px',
  padding: '20px',
  border: '1px solid #1e293b',
});

const PostHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '16px',
});

const PostUserInfo = styled('div', {
  flex: 1,
});

const PostUserName = styled('div', {
  fontSize: '15px',
  fontWeight: '600',
  color: 'white',
  marginBottom: '2px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
});

const PostTime = styled('div', {
  fontSize: '13px',
  color: '#64748b',
});

const PinIcon = styled('div', {
  color: '#3b82f6',
  display: 'flex',
  alignItems: 'center',
});

const PostTitle = styled('h4', {
  fontSize: '17px',
  fontWeight: '700',
  color: 'white',
  marginBottom: '12px',
});

const PostText = styled('p', {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#8b92a7',
  marginBottom: '16px',
});

const PostImage = styled('img', {
  width: '100%',
  borderRadius: '8px',
  marginBottom: '16px',
});

const PostActions = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '24px',
  paddingTop: '16px',
  borderTop: '1px solid #1e293b',
});

const ActionButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  backgroundColor: 'transparent',
  border: 'none',
  color: '#64748b',
  fontSize: '14px',
  cursor: 'pointer',
  transition: 'color 0.2s',

  '&:hover': {
    color: '#8b92a7',
  },

  variants: {
    active: {
      true: {
        color: '#3b82f6',
      },
    },
  },

  svg: {
    width: '18px',
    height: '18px',
  },
});

const CommentsSection = styled('div', {
  marginTop: '16px',
  paddingTop: '16px',
  borderTop: '1px solid #1e293b',
});

const CommentInputContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginBottom: '24px',
  padding: '20px',
  backgroundColor: '#0f1419',
  borderRadius: '12px',
  border: '1px solid #2d3748',
});

const CommentInput = styled('textarea', {
  flex: 1,
  backgroundColor: '#1e293b',
  border: '1px solid #2d3748',
  borderRadius: '8px',
  padding: '12px 16px',
  color: 'white',
  fontSize: '14px',
  minHeight: '80px',
  resize: 'vertical',
  fontFamily: 'inherit',
  outline: 'none',
  
  '&::placeholder': {
    color: '#64748b',
  },
  
  '&:focus': {
    borderColor: '$primary',
  },
});

const CommentButton = styled('button', {
  padding: '8px 16px',
  backgroundColor: '$primary',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  height: 'fit-content',
  transition: 'all 0.2s ease',
  
  '&:hover': {
    backgroundColor: '$primaryHover',
  },
  
  '&:disabled': {
    backgroundColor: '#4a5568',
    cursor: 'not-allowed',
  },
});

const CommentsList = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

const CommentCard = styled('div', {
  backgroundColor: '#1e293b',
  borderRadius: '8px',
  padding: '12px',
});

const CommentHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '8px',
});

const CommentAuthor = styled('span', {
  fontSize: '14px',
  fontWeight: '600',
  color: 'white',
});

const CommentTime = styled('span', {
  fontSize: '12px',
  color: '#64748b',
});

const CommentText = styled('p', {
  fontSize: '14px',
  color: '#cbd5e1',
  lineHeight: 1.5,
  margin: 0,
});

const CommentActions = styled('div', {
  display: 'flex',
  gap: '12px',
  marginTop: '8px',
});

const CommentActionButton = styled('button', {
  backgroundColor: 'transparent',
  border: 'none',
  color: '#64748b',
  fontSize: '12px',
  cursor: 'pointer',
  padding: '4px 8px',
  borderRadius: '4px',
  transition: 'all 0.2s',
  fontWeight: '600',
  
  '&:hover': {
    color: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
});

const DeleteButton = styled('button', {
  backgroundColor: 'transparent',
  border: 'none',
  color: '#64748b',
  fontSize: '12px',
  cursor: 'pointer',
  padding: '4px 8px',
  borderRadius: '4px',
  transition: 'all 0.2s',
  fontWeight: '600',
  
  '&:hover': {
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
});

const RepliesContainer = styled('div', {
  marginLeft: '24px',
  marginTop: '12px',
  paddingLeft: '16px',
  borderLeft: '2px solid #2d3748',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

const ReplyInputContainer = styled('div', {
  marginTop: '12px',
  padding: '12px',
  backgroundColor: '#0f1419',
  borderRadius: '8px',
  border: '1px solid #2d3748',
});

const ReplyInputHeader = styled('div', {
  fontSize: '12px',
  color: '#8b92a7',
  marginBottom: '8px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const ReplyInputActions = styled('div', {
  display: 'flex',
  gap: '8px',
  marginTop: '8px',
  justifyContent: 'flex-end',
});

const API_BASE_URL = 'http://localhost:8000';

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
  rules: string | null;
  created_at: string;
}

interface Post {
  id: number;
  title: string | null;
  content: string;
  image_url: string | null;
  author: {
    id: number;
    name: string;
    email: string;
  };
  is_pinned: boolean;
  post_type: string;
  likes_count: number;
  unlikes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_unliked: boolean;
  created_at: string;
}

interface Comment {
  id: number;
  content: string;
  image_url: string | null;
  author: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  replies: Comment[];
}

interface ReactingUser {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
}

interface Reactions {
  likes: ReactingUser[];
  unlikes: ReactingUser[];
}

const GuildDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [guild, setGuild] = useState<Guild | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [isMember, setIsMember] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCommentEmojiPicker, setShowCommentEmojiPicker] = useState(false);
  const [postType, setPostType] = useState<'post' | 'announcement' | 'project'>('post');
  const [expandedComments, setExpandedComments] = useState<{ [key: number]: boolean }>({});
  const [comments, setComments] = useState<{ [key: number]: Comment[] }>({});
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
  const [showReactionsModal, setShowReactionsModal] = useState(false);
  const [currentReactions, setCurrentReactions] = useState<Reactions | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ postId: number; commentId: number; authorName: string } | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<number | null>(null);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [isEditingRules, setIsEditingRules] = useState(false);
  const [editedRules, setEditedRules] = useState<string[]>([]);

  // Close emoji pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showEmojiPicker && !target.closest('[data-emoji-picker]')) {
        setShowEmojiPicker(false);
      }
      if (showCommentEmojiPicker && !target.closest('[data-comment-emoji-picker]')) {
        setShowCommentEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker, showCommentEmojiPicker]);

  useEffect(() => {
    const fetchGuild = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/guilds/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch guild');
        }
        const data = await response.json();
        setGuild(data);
        
        // Check if current user is owner
        const userStr = localStorage.getItem('avalanche_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const isUserOwner = user.id === data.owner_id;
          setIsOwner(isUserOwner);
          
          // Owner is automatically a member
          if (isUserOwner) {
            setIsMember(true);
          } else {
            // Check if user is a member
            checkMembership(user.id, data.owner_id);
          }
        }
      } catch (error) {
        console.error('Error fetching guild:', error);
      } finally {
        setLoading(false);
      }
    };

    const checkMembership = async (userId: number, ownerId: number) => {
      // Owner is always a member
      if (userId === ownerId) {
        setIsMember(true);
        return;
      }

      // Check if user is in the members list
      try {
        const token = localStorage.getItem('avalanche_token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/guilds/${id}/members`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const memberIds = data.members.map((m: { id: number }) => m.id);
          setIsMember(memberIds.includes(userId));
        }
      } catch (error) {
        console.error('Error checking membership:', error);
      }
    };

    const fetchPosts = async () => {
      try {
        const filter = activeTab === 'all' ? '' : `?post_type=${activeTab}`;
        const response = await fetch(`${API_BASE_URL}/guilds/${id}/posts${filter}`);
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    if (id) {
      fetchGuild();
      fetchPosts();
    }
  }, [id, activeTab]);

  const handleJoinGuild = async () => {
    const token = localStorage.getItem('avalanche_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/guilds/${id}/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsMember(true);
        if (guild) {
          setGuild({ ...guild, member_count: guild.member_count + 1 });
        }
      }
    } catch (error) {
      console.error('Error joining guild:', error);
    }
  };

  const handleLeaveGuild = async () => {
    if (!confirm('Are you sure you want to leave this guild?')) return;
    
    const token = localStorage.getItem('avalanche_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/guilds/${id}/leave`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        navigate('/guilds');
      }
    } catch (error) {
      console.error('Error leaving guild:', error);
    }
  };

  const handleGuildChat = () => {
    navigate('/messages', { state: { guildId: id } });
  };

  const handleCreatePost = async () => {
    const token = localStorage.getItem('avalanche_token');
    if (!token || !newPostContent.trim()) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('content', newPostContent);
      formData.append('post_type', postType);
      
      // Add image if selected
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetch(`${API_BASE_URL}/guilds/${id}/posts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const newPost = await response.json();
        setPosts([newPost, ...posts]);
        setNewPostContent('');
        setSelectedImage(null);
        setPostType('post');
        setImagePreview(null);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewPostContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleSaveRules = async () => {
    const token = localStorage.getItem('avalanche_token');
    if (!token || !guild) return;

    try {
      const formData = new FormData();
      formData.append('rules', JSON.stringify(editedRules));

      const response = await fetch(`${API_BASE_URL}/guilds/${guild.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const updatedGuild = await response.json();
        setGuild(updatedGuild);
        setIsEditingRules(false);
        alert('Rules updated successfully!');
      } else {
        alert('Failed to update rules');
      }
    } catch (error) {
      console.error('Error updating rules:', error);
      alert('Failed to update rules');
    }
  };

  const handleAddRule = () => {
    setEditedRules([...editedRules, '']);
  };

  const handleRemoveRule = (index: number) => {
    setEditedRules(editedRules.filter((_, i) => i !== index));
  };

  const handleRuleChange = (index: number, value: string) => {
    const newRules = [...editedRules];
    newRules[index] = value;
    setEditedRules(newRules);
  };

  const handleLikePost = async (postId: number) => {
    const token = localStorage.getItem('avalanche_token');
    if (!token) {
      alert('Please log in to like posts');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(posts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes_count: data.likes_count, 
                unlikes_count: data.unlikes_count,
                is_liked: data.liked,
                is_unliked: false 
              }
            : post
        ));
      } else {
        console.error('Error response:', response.status, await response.text());
        alert('Failed to like post. Please try logging in again.');
      }
    } catch (error) {
      console.error('Error liking post:', error);
      alert('Failed to like post. Please check your connection.');
    }
  };

  const handleUnlikePost = async (postId: number) => {
    const token = localStorage.getItem('avalanche_token');
    if (!token) {
      alert('Please log in to react to posts');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/unlike`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(posts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes_count: data.likes_count, 
                unlikes_count: data.unlikes_count,
                is_liked: false,
                is_unliked: data.unliked 
              }
            : post
        ));
      } else {
        console.error('Error response:', response.status, await response.text());
        alert('Failed to react to post. Please try logging in again.');
      }
    } catch (error) {
      console.error('Error reacting to post:', error);
      alert('Failed to react to post. Please check your connection.');
    }
  };

  const toggleComments = async (post: Post) => {
    // Open modal
    setActiveCommentsPostId(post.id);
    setActivePost(post);
    
    // Fetch comments if not already loaded
    if (!comments[post.id]) {
      try {
        const response = await fetch(`${API_BASE_URL}/posts/${post.id}/comments`);
        if (response.ok) {
          const data = await response.json();
          setComments(prev => ({ ...prev, [post.id]: data }));
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    }
  };

  const closeCommentsModal = () => {
    setActiveCommentsPostId(null);
    setActivePost(null);
    setReplyingTo(null);
    setReplyContent('');
    setSelectedImage(null);
    setImagePreview(null);
    setShowCommentEmojiPicker(false);
  };

  const handleAddComment = async (postId: number) => {
    const token = localStorage.getItem('avalanche_token');
    const content = newComment[postId];
    
    if (!token) {
      alert('Please log in to comment');
      return;
    }
    
    if (!content?.trim()) return;

    try {
      const formData = new FormData();
      formData.append('content', content);
      
      // Append image if selected
      if (selectedImage) {
        formData.append('image', selectedImage);
        console.log('Uploading image:', selectedImage.name, selectedImage.size);
      }

      console.log('Posting comment with content:', content);

      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const newCommentData = await response.json();
        console.log('New comment posted successfully:', newCommentData);
        
        // Reload comments from API to get complete structure with image URLs
        const commentsResponse = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (commentsResponse.ok) {
          const allComments = await commentsResponse.json();
          setComments(prev => ({
            ...prev,
            [postId]: allComments
          }));
        }
        
        setNewComment(prev => ({ ...prev, [postId]: '' }));
        
        // Reset image state
        setSelectedImage(null);
        setImagePreview(null);
        
        // Update comment count
        setPosts(posts.map(post =>
          post.id === postId
            ? { ...post, comments_count: post.comments_count + 1 }
            : post
        ));
        
        // Update active post if in modal
        if (activePost && activePost.id === postId) {
          setActivePost({
            ...activePost,
            comments_count: activePost.comments_count + 1
          });
        }
      } else {
        console.error('Error response:', response.status, await response.text());
        alert('Failed to add comment. Please try logging in again.');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please check your connection.');
    }
  };

  const handleViewReactions = async (postId: number) => {
    const token = localStorage.getItem('avalanche_token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/reactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentReactions(data);
        setShowReactionsModal(true);
      } else if (response.status === 403) {
        // Not the post author, ignore
        return;
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  const handleReplyToComment = (postId: number, commentId: number, authorName: string) => {
    setReplyingTo({ postId, commentId, authorName });
    setReplyContent('');
  };

  const handleSubmitReply = async () => {
    if (!replyingTo || !replyContent.trim()) return;

    const token = localStorage.getItem('avalanche_token');
    if (!token) {
      alert('Please log in to reply');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('content', replyContent);
      formData.append('parent_id', replyingTo.commentId.toString());
      
      // Append image if selected
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetch(`${API_BASE_URL}/posts/${replyingTo.postId}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const newReply = await response.json();
        console.log('New reply posted:', newReply);
        
        // Reload comments from API to get complete structure with image URLs
        const commentsResponse = await fetch(`${API_BASE_URL}/posts/${replyingTo.postId}/comments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (commentsResponse.ok) {
          const allComments = await commentsResponse.json();
          setComments(prev => ({
            ...prev,
            [replyingTo.postId]: allComments
          }));
        }

        setReplyingTo(null);
        setReplyContent('');
        setSelectedImage(null);
        setImagePreview(null);
      } else {
        alert('Failed to post reply');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('Failed to post reply');
    }
  };

  const handleDeleteComment = async (postId: number, commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    const token = localStorage.getItem('avalanche_token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove comment from state
        setComments(prev => {
          const postComments = prev[postId] || [];
          const removeComment = (comments: Comment[]): Comment[] => {
            return comments.filter(comment => {
              if (comment.id === commentId) return false;
              if (comment.replies.length > 0) {
                comment.replies = removeComment(comment.replies);
              }
              return true;
            });
          };
          
          return {
            ...prev,
            [postId]: removeComment(postComments)
          };
        });

        // Update post comment count
        setPosts(posts.map(post =>
          post.id === postId
            ? { ...post, comments_count: Math.max(0, post.comments_count - 1) }
            : post
        ));
        
        // Update active post if in modal
        if (activePost && activePost.id === postId) {
          setActivePost({
            ...activePost,
            comments_count: Math.max(0, activePost.comments_count - 1)
          });
        }
      } else {
        alert('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const popularEmojis = [
    '😀', '😂', '🤣', '😊', '😍', '🥰', '😎', '🤔',
    '😢', '😭', '😡', '🤯', '🥳', '😴', '🤗', '🤩',
    '👍', '👎', '👏', '🙌', '🤝', '💪', '✌️', '🤞',
    '❤️', '💔', '💯', '🔥', '⭐', '✨', '🎉', '🎊',
    '🚀', '💡', '⚡', '🌟', '🎯', '🏆', '🎮', '💻',
    '🎨', '🎵', '🎸', '🍕', '🍔', '🍟', '☕', '🍺',
    '🌈', '🌙', '☀️', '⛈️', '❄️', '🔴', '🟢', '🟡',
    '💬', '📱', '📷', '📚', '✉️', '🔔', '🔓', '🔒',
  ];

  const handleUpdateGuildImages = async (icon?: File, banner?: File) => {
    const token = localStorage.getItem('avalanche_token');
    if (!token) {
      return;
    }

    try {
      const formData = new FormData();
      if (icon) formData.append('icon', icon);
      if (banner) formData.append('banner', banner);

      const response = await fetch(`${API_BASE_URL}/guilds/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const updatedGuild = await response.json();
        setGuild(updatedGuild);
      }
    } catch (error) {
      console.error('Error updating guild:', error);
    }
  };

  const token = localStorage.getItem('avalanche_token');
  const isAuthenticated = !!token;

  if (loading) {
    return (
      <PageContainer>
        <Header isAuthenticated={isAuthenticated} />
        <Container style={{ paddingTop: '100px', textAlign: 'center', color: 'white' }}>
          Loading...
        </Container>
      </PageContainer>
    );
  }

  if (!guild) {
    return (
      <PageContainer>
        <Header isAuthenticated={isAuthenticated} />
        <Container style={{ paddingTop: '100px', textAlign: 'center', color: 'white' }}>
          Guild not found
        </Container>
      </PageContainer>
    );
  }

  // Helper function to get full image URL (handles both Cloudinary and local paths)
  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return undefined;
    // If URL starts with http/https, it's already a full URL (Cloudinary)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Otherwise, it's a local path, prepend API_BASE_URL
    return `${API_BASE_URL}${url}`;
  };

  const bannerUrl = guild.banner_url
    ? getImageUrl(guild.banner_url)
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

  const iconUrl = getImageUrl(guild.avatar_url);

  return (
    <PageContainer>
      <Header isAuthenticated={isAuthenticated} />
      <HeroSection
        style={{
          backgroundImage: guild.banner_url ? `url(${bannerUrl})` : bannerUrl,
        }}
      >
        <HeroOverlay>
          <Container>
            <GuildHeader>
              <GuildIcon
                style={
                  iconUrl
                    ? { backgroundImage: `url(${iconUrl})` }
                    : { backgroundColor: '#1e3a5f' }
                }
              />
              <GuildInfo>
                {guild.category && <CategoryBadge>{guild.category}</CategoryBadge>}
                <GuildName>{guild.name}</GuildName>
                <GuildTagline>{guild.description || 'No description available'}</GuildTagline>
              </GuildInfo>
              <ButtonGroup>
                {isMember && (
                  <ChatButton onClick={handleGuildChat}>
                    <MessageCircle size={18} />
                    Chat
                  </ChatButton>
                )}
                {!isOwner && !isMember && (
                  <JoinButton onClick={handleJoinGuild}>
                    Join Guild
                  </JoinButton>
                )}
                {!isOwner && isMember && (
                  <LeaveButton onClick={handleLeaveGuild}>
                    Leave Guild
                  </LeaveButton>
                )}
              </ButtonGroup>
            </GuildHeader>
          </Container>
        </HeroOverlay>
      </HeroSection>

      <Container>
        <Content>
          <Sidebar>
            <Card>
              <CardTitle>About this Guild</CardTitle>
              <CardText>
                {guild.description ||
                  'A detailed description of the guild\'s purpose, mission, and focus.'}
              </CardText>
              <StatRow>
                <Users size={18} />
                <span>{guild.member_count.toLocaleString()} Members</span>
              </StatRow>
              <StatRow>
                <Calendar size={18} />
                <span>Founded {new Date(guild.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </StatRow>
            </Card>

            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <CardTitle>Rules & Guidelines</CardTitle>
                {isOwner && !isEditingRules && (
                  <button
                    onClick={() => {
                      const currentRules = guild.rules ? JSON.parse(guild.rules) : [
                        'Be respectful to all members.',
                        'Share constructive feedback only.',
                        'No self-promotion outside of designated channels.',
                        'Credit AI tools and original artists where applicable.'
                      ];
                      setEditedRules(currentRules);
                      setIsEditingRules(true);
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Edit
                  </button>
                )}
              </div>
              {isEditingRules ? (
                <div>
                  {editedRules.map((rule, index) => (
                    <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={rule}
                        onChange={(e) => handleRuleChange(index, e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          color: '#e2e8f0',
                          fontSize: '14px'
                        }}
                        placeholder={`Rule ${index + 1}`}
                      />
                      <button
                        onClick={() => handleRemoveRule(index)}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      onClick={handleAddRule}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      + Add Rule
                    </button>
                    <button
                      onClick={handleSaveRules}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingRules(false)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#64748b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <RulesList>
                  {guild.rules ? (
                    JSON.parse(guild.rules).map((rule: string, index: number) => (
                      <li key={index}>{rule}</li>
                    ))
                  ) : (
                    <>
                      <li>Be respectful to all members.</li>
                      <li>Share constructive feedback only.</li>
                      <li>No self-promotion outside of designated channels.</li>
                      <li>Credit AI tools and original artists where applicable.</li>
                    </>
                  )}
                </RulesList>
              )}
            </Card>

            <Card>
              <CardTitle>Members ({guild.member_count.toLocaleString()})</CardTitle>
              <MembersList>
                <MemberAvatar />
                <MemberAvatar />
                <MemberAvatar />
                <MemberAvatar />
                <MemberAvatar />
                <MemberAvatar />
                {guild.member_count > 6 && (
                  <MoreMembers>+{guild.member_count - 6}k</MoreMembers>
                )}
              </MembersList>
            </Card>
          </Sidebar>

          <MainContent>
            {/* Only show post composer for authenticated members or owner */}
            {isAuthenticated && (isMember || isOwner) && (
              <PostComposer>
                <ComposerTop>
                  <UserAvatar />
                  <PostInputArea 
                    placeholder="What's on your mind?" 
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        e.preventDefault();
                        handleCreatePost();
                      }
                    }}
                  />
                </ComposerTop>
                {imagePreview && (
                  <ImagePreviewContainer>
                    <ImagePreview src={imagePreview} alt="Preview" />
                    <RemoveImageButton onClick={handleRemoveImage}>
                      <X size={16} />
                    </RemoveImageButton>
                  </ImagePreviewContainer>
                )}
                <ComposerActions>
                  <PostTypeSelector 
                    value={postType} 
                    onChange={(e) => setPostType(e.target.value as 'post' | 'announcement' | 'project')}
                  >
                    <option value="post">General Post</option>
                    <option value="announcement">📢 Announcement</option>
                    <option value="project">🚀 Project</option>
                  </PostTypeSelector>
                  <ActionButtons>
                    <EmojiPickerContainer data-emoji-picker>
                      <EmojiButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                        <Smile size={18} />
                      </EmojiButton>
                      {showEmojiPicker && (
                        <EmojiPicker>
                          {popularEmojis.map((emoji, index) => (
                            <EmojiItem 
                              key={index} 
                              onClick={() => handleEmojiSelect(emoji)}
                              type="button"
                            >
                              {emoji}
                            </EmojiItem>
                          ))}
                        </EmojiPicker>
                      )}
                    </EmojiPickerContainer>
                    <ImageUploadButton>
                      <ImageIcon size={18} />
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageSelect}
                      />
                    </ImageUploadButton>
                    <PostButton onClick={handleCreatePost}>Post</PostButton>
                  </ActionButtons>
                </ComposerActions>
              </PostComposer>
            )}

            {/* Message for non-members */}
            {isAuthenticated && !isMember && !isOwner && (
              <Card style={{ textAlign: 'center', padding: '24px' }}>
                <CardText>Join this guild to create posts and participate in discussions.</CardText>
                <JoinButton onClick={handleJoinGuild} style={{ marginTop: '12px' }}>
                  Join Guild
                </JoinButton>
              </Card>
            )}

            {/* Message for non-authenticated users */}
            {!isAuthenticated && (
              <Card style={{ textAlign: 'center', padding: '24px' }}>
                <CardText>Please log in to create posts and join this guild.</CardText>
                <JoinButton onClick={() => navigate('/login')} style={{ marginTop: '12px' }}>
                  Log In
                </JoinButton>
              </Card>
            )}

            {isOwner && (
              <Card style={{ marginTop: '16px', padding: '16px' }}>
                <CardTitle>Guild Settings (Owner)</CardTitle>
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <label style={{ cursor: 'pointer', padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '6px', fontSize: '14px' }}>
                    Upload Icon
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpdateGuildImages(file, undefined);
                      }}
                    />
                  </label>
                  <label style={{ cursor: 'pointer', padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '6px', fontSize: '14px' }}>
                    Upload Banner
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpdateGuildImages(undefined, file);
                      }}
                    />
                  </label>
                </div>
              </Card>
            )}

            <div>
              <TabBar>
                <Tab active={activeTab === 'all'} onClick={() => setActiveTab('all')}>
                  All
                </Tab>
                <Tab
                  active={activeTab === 'announcement'}
                  onClick={() => setActiveTab('announcement')}
                >
                  Announcements
                </Tab>
                <Tab active={activeTab === 'project'} onClick={() => setActiveTab('project')}>
                  Projects
                </Tab>
              </TabBar>

              {posts.length === 0 ? (
                <Card style={{ marginTop: '16px', textAlign: 'center', padding: '40px' }}>
                  <CardText>No posts yet. Be the first to post!</CardText>
                </Card>
              ) : (
                posts.map((post) => (
                  <PostCard key={post.id} style={{ marginTop: '16px' }}>
                    <PostHeader>
                      <UserAvatar />
                      <PostUserInfo>
                        <PostUserName>
                          {post.author.name}
                          {post.post_type === 'announcement' && (
                            <PostTypeBadge type="announcement">📢 Announcement</PostTypeBadge>
                          )}
                          {post.post_type === 'project' && (
                            <PostTypeBadge type="project">🚀 Project</PostTypeBadge>
                          )}
                        </PostUserName>
                        <PostTime>
                          {new Date(post.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </PostTime>
                      </PostUserInfo>
                      {post.is_pinned && (
                        <PinIcon>
                          <Pin size={18} />
                        </PinIcon>
                      )}
                    </PostHeader>
                    {post.title && <PostTitle>{post.title}</PostTitle>}
                    <PostText>{post.content}</PostText>
                    {post.image_url && (
                      <PostImage src={getImageUrl(post.image_url) || ''} alt="Post image" />
                    )}
                    <PostActions>
                      <ActionButton 
                        active={post.is_liked}
                        onClick={() => handleLikePost(post.id)}
                        onDoubleClick={() => {
                          const userStr = localStorage.getItem('avalanche_user');
                          if (userStr) {
                            const user = JSON.parse(userStr);
                            if (user.id === post.author.id) {
                              handleViewReactions(post.id);
                            }
                          }
                        }}
                      >
                        <ThumbsUp fill={post.is_liked ? '#3b82f6' : 'none'} />
                        <span style={{ marginLeft: '6px' }}>{post.likes_count || 0}</span>
                      </ActionButton>
                      <ActionButton 
                        active={post.is_unliked}
                        onClick={() => handleUnlikePost(post.id)}
                        onDoubleClick={() => {
                          const userStr = localStorage.getItem('avalanche_user');
                          if (userStr) {
                            const user = JSON.parse(userStr);
                            if (user.id === post.author.id) {
                              handleViewReactions(post.id);
                            }
                          }
                        }}
                      >
                        <ThumbsDown fill={post.is_unliked ? '#ef4444' : 'none'} />
                        <span style={{ marginLeft: '6px' }}>{post.unlikes_count || 0}</span>
                      </ActionButton>
                      <ActionButton onClick={() => toggleComments(post)}>
                        <MessageCircle />
                        <span style={{ marginLeft: '6px' }}>{post.comments_count || 0}</span>
                      </ActionButton>
                      <ActionButton>
                        <Share2 />
                        Share
                      </ActionButton>
                    </PostActions>
                  </PostCard>
                ))
              )}
            </div>
          </MainContent>
        </Content>
      </Container>

      {showReactionsModal && currentReactions && (
        <ModalOverlay onClick={() => setShowReactionsModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Reactions</ModalTitle>
              <ModalCloseButton onClick={() => setShowReactionsModal(false)}>
                <X size={20} />
              </ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              <ReactionSection>
                <ReactionSectionTitle>
                  <ThumbsUp size={18} color="#3b82f6" />
                  Likes ({currentReactions.likes.length})
                </ReactionSectionTitle>
                {currentReactions.likes.length === 0 ? (
                  <EmptyState>No likes yet</EmptyState>
                ) : (
                  <UserList>
                    {currentReactions.likes.map((user) => (
                      <UserItem key={user.id}>
                        <ReactionUserAvatar>
                          {user.name.charAt(0).toUpperCase()}
                        </ReactionUserAvatar>
                        <ReactionUserInfo>
                          <ReactionUserName>{user.name}</ReactionUserName>
                          <ReactionUserEmail>{user.email}</ReactionUserEmail>
                        </ReactionUserInfo>
                      </UserItem>
                    ))}
                  </UserList>
                )}
              </ReactionSection>

              <ReactionSection>
                <ReactionSectionTitle>
                  <ThumbsDown size={18} color="#ef4444" />
                  Unlikes ({currentReactions.unlikes.length})
                </ReactionSectionTitle>
                {currentReactions.unlikes.length === 0 ? (
                  <EmptyState>No unlikes yet</EmptyState>
                ) : (
                  <UserList>
                    {currentReactions.unlikes.map((user) => (
                      <UserItem key={user.id}>
                        <ReactionUserAvatar>
                          {user.name.charAt(0).toUpperCase()}
                        </ReactionUserAvatar>
                        <ReactionUserInfo>
                          <ReactionUserName>{user.name}</ReactionUserName>
                          <ReactionUserEmail>{user.email}</ReactionUserEmail>
                        </ReactionUserInfo>
                      </UserItem>
                    ))}
                  </UserList>
                )}
              </ReactionSection>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      {activeCommentsPostId && activePost && (
        <CommentsModalOverlay onClick={closeCommentsModal}>
          <CommentsModalContent onClick={(e) => e.stopPropagation()}>
            <CommentsModalHeader>
              <div>
                <CommentsModalTitle>Community Discussion</CommentsModalTitle>
                <CommentCount>({comments[activeCommentsPostId]?.length || 0})</CommentCount>
              </div>
              <ModalCloseButton onClick={closeCommentsModal}>
                <X size={20} />
              </ModalCloseButton>
            </CommentsModalHeader>
            <CommentsModalBody>
              {isAuthenticated && (
                <CommentInputContainer>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <CommentInput
                      placeholder="Join the conversation..."
                      value={newComment[activeCommentsPostId] || ''}
                      onChange={(e) => setNewComment(prev => ({ ...prev, [activeCommentsPostId]: e.target.value }))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          handleAddComment(activeCommentsPostId);
                        }
                      }}
                    />
                    <div style={{ 
                      display: 'flex', 
                      gap: '8px', 
                      marginTop: '8px',
                      alignItems: 'center'
                    }}>
                      <div style={{ position: 'relative' }} data-comment-emoji-picker>
                        <EmojiButton 
                          onClick={() => setShowCommentEmojiPicker(!showCommentEmojiPicker)}
                          title="Add emoji"
                        >
                          <Smile size={20} />
                        </EmojiButton>
                        {showCommentEmojiPicker && (
                          <EmojiPicker>
                            {popularEmojis.map((emoji, index) => (
                              <EmojiItem
                                key={index}
                                onClick={() => {
                                  setNewComment(prev => ({
                                    ...prev,
                                    [activeCommentsPostId]: (prev[activeCommentsPostId] || '') + emoji
                                  }));
                                  setShowCommentEmojiPicker(false);
                                }}
                              >
                                {emoji}
                              </EmojiItem>
                            ))}
                          </EmojiPicker>
                        )}
                      </div>
                      
                      <label style={{ cursor: 'pointer' }}>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSelectedImage(file);
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setImagePreview(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <EmojiButton as="span" title="Add image">
                          <ImageIcon size={20} />
                        </EmojiButton>
                      </label>
                    </div>
                    
                    {imagePreview && (
                      <div style={{ 
                        marginTop: '12px', 
                        position: 'relative',
                        display: 'inline-block'
                      }}>
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          style={{ 
                            maxWidth: '200px', 
                            maxHeight: '200px',
                            borderRadius: '8px',
                            border: '1px solid #2d3748'
                          }} 
                        />
                        <button
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            fontWeight: 'bold'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                  <CommentButton 
                    onClick={() => handleAddComment(activeCommentsPostId)}
                    disabled={!newComment[activeCommentsPostId]?.trim()}
                  >
                    Post Comment
                  </CommentButton>
                </CommentInputContainer>
              )}
              
              <CommentsList>
                {comments[activeCommentsPostId]?.length === 0 ? (
                  <EmptyState>No comments yet. Be the first to comment!</EmptyState>
                ) : (
                  comments[activeCommentsPostId]?.map((comment) => {
                    const userStr = localStorage.getItem('avalanche_user');
                    const currentUser = userStr ? JSON.parse(userStr) : null;
                    const canDelete = currentUser && (currentUser.id === comment.author.id || currentUser.id === activePost.author.id);
                    
                    const renderComment = (c: Comment, depth: number = 0) => (
                      <div key={c.id}>
                        <CommentCard>
                          <CommentHeader>
                            <CommentAuthor>{c.author.name}</CommentAuthor>
                            <CommentTime>
                              {(() => {
                                const now = new Date();
                                const commentDate = new Date(c.created_at);
                                const diffMs = now.getTime() - commentDate.getTime();
                                const diffMins = Math.floor(diffMs / 60000);
                                const diffHours = Math.floor(diffMs / 3600000);
                                const diffDays = Math.floor(diffMs / 86400000);
                                
                                if (diffMins < 1) return 'Just now';
                                if (diffMins < 60) return `${diffMins}m ago`;
                                if (diffHours < 24) return `${diffHours}h ago`;
                                if (diffDays < 7) return `${diffDays}d ago`;
                                return commentDate.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                });
                              })()}
                            </CommentTime>
                          </CommentHeader>
                          <CommentText>{c.content}</CommentText>
                          {c.image_url && (
                            <div style={{ marginTop: '8px' }}>
                              <img 
                                src={c.image_url} 
                                alt="Comment attachment" 
                                style={{ 
                                  maxWidth: '100%', 
                                  maxHeight: '300px',
                                  borderRadius: '8px',
                                  objectFit: 'cover'
                                }} 
                              />
                            </div>
                          )}
                          <CommentActions>
                            <CommentActionButton onClick={() => handleReplyToComment(activeCommentsPostId, c.id, c.author.name)}>
                              <MessageCircle size={14} style={{ marginRight: '4px' }} />
                              Reply
                            </CommentActionButton>
                            {canDelete && (
                              <DeleteButton onClick={() => handleDeleteComment(activeCommentsPostId, c.id)}>
                                Delete
                              </DeleteButton>
                            )}
                          </CommentActions>
                        </CommentCard>
                        
                        {c.replies && c.replies.length > 0 && (
                          <RepliesContainer>
                            {c.replies.map(reply => renderComment(reply, depth + 1))}
                          </RepliesContainer>
                        )}
                      </div>
                    );
                    
                    return renderComment(comment);
                  })
                )}
                
                {replyingTo && replyingTo.postId === activeCommentsPostId && (
                  <ReplyInputContainer>
                    <ReplyInputHeader>
                      Replying to {replyingTo.authorName}
                      <CommentActionButton onClick={() => setReplyingTo(null)}>
                        Cancel
                      </CommentActionButton>
                    </ReplyInputHeader>
                    <CommentInput
                      placeholder="Write your reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          handleSubmitReply();
                        }
                      }}
                    />
                    <div style={{ 
                      display: 'flex', 
                      gap: '8px', 
                      marginTop: '8px',
                      alignItems: 'center',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ position: 'relative' }} data-comment-emoji-picker>
                        <EmojiButton 
                          onClick={() => setShowCommentEmojiPicker(!showCommentEmojiPicker)}
                          title="Add emoji"
                        >
                          <Smile size={20} />
                        </EmojiButton>
                        {showCommentEmojiPicker && (
                          <EmojiPicker>
                            {popularEmojis.map((emoji, index) => (
                              <EmojiItem
                                key={index}
                                onClick={() => {
                                  setReplyContent(prev => prev + emoji);
                                  setShowCommentEmojiPicker(false);
                                }}
                              >
                                {emoji}
                              </EmojiItem>
                            ))}
                          </EmojiPicker>
                        )}
                      </div>
                      
                      <label style={{ cursor: 'pointer' }}>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSelectedImage(file);
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setImagePreview(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <EmojiButton title="Upload image">
                          <ImageIcon size={20} />
                        </EmojiButton>
                      </label>
                      
                      {imagePreview && (
                        <div style={{ 
                          position: 'relative', 
                          display: 'inline-block',
                          marginTop: '8px'
                        }}>
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            style={{ 
                              maxWidth: '200px', 
                              maxHeight: '150px', 
                              borderRadius: '8px',
                              objectFit: 'cover'
                            }} 
                          />
                          <button
                            onClick={() => {
                              setSelectedImage(null);
                              setImagePreview(null);
                            }}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              backgroundColor: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px',
                              fontWeight: 'bold'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                    <ReplyInputActions>
                      <CommentButton 
                        onClick={handleSubmitReply}
                        disabled={!replyContent.trim()}
                      >
                        Reply
                      </CommentButton>
                    </ReplyInputActions>
                  </ReplyInputContainer>
                )}
              </CommentsList>
            </CommentsModalBody>
          </CommentsModalContent>
        </CommentsModalOverlay>
      )}
    </PageContainer>
  );
};

export default GuildDetailPage;
