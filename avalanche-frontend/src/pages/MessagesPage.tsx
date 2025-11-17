import React, { useState, useEffect, useCallback } from 'react';
import { styled } from '../stitches.config';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  MoreVertical,
  Video,
  Info,
  Smile,
  Send,
  Paperclip,
  LayoutDashboard,
  Users,
  Hash,
  Link as LinkIcon,
  Bookmark,
  Pin,
  Reply,
  Forward,
  MoreHorizontal,
  File,
  Image,
  UserCircle,
  CalendarDays,
  BarChart3,
  X,
} from 'lucide-react';
import API from '../services/api';

const PageContainer = styled('div', {
  display: 'flex',
  height: '100vh',
  backgroundColor: 'var(--bg-primary)',
  color: 'var(--text-primary)',
});

const Sidebar = styled('aside', {
  width: '380px',
  backgroundColor: 'var(--card-bg)',
  borderRight: '1px solid var(--border-color)',
  display: 'flex',
  flexDirection: 'column',
});

const UserProfile = styled('div', {
  padding: '$6',
  borderBottom: '1px solid var(--border-color)',
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
});

const Avatar = styled('div', {
  position: 'relative',
  width: '48px',
  height: '48px',
  borderRadius: '$full',
  overflow: 'hidden',
  backgroundColor: 'var(--primary-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontWeight: '$semibold',
  fontSize: '$base',

  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

const OnlineIndicator = styled('div', {
  position: 'absolute',
  bottom: '2px',
  right: '2px',
  width: '12px',
  height: '12px',
  backgroundColor: '#10b981',
  border: '2px solid var(--card-bg)',
  borderRadius: '$full',
});

const UserInfo = styled('div', {
  flex: 1,
});

const UserName = styled('div', {
  fontSize: '$lg',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
});

const UserStatus = styled('div', {
  fontSize: '$sm',
  color: '#10b981',
});

const MenuButton = styled('button', {
  padding: '$2',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-secondary)',

  '&:hover': {
    color: 'var(--text-primary)',
  },
});

const DashboardButton = styled(Link, {
  padding: '$2',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-secondary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  borderRadius: '$base',
  transition: 'all 0.2s',

  '&:hover': {
    color: 'var(--text-primary)',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
});

const SearchContainer = styled('div', {
  padding: '$4',
  borderBottom: '1px solid var(--border-color)',
});

const SearchBar = styled('div', {
  position: 'relative',
});

const SearchInput = styled('input', {
  width: '100%',
  padding: '$3 $3 $3 $10',
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '$base',
  color: 'var(--text-primary)',
  fontSize: '$sm',

  '&::placeholder': {
    color: 'var(--text-secondary)',
  },

  '&:focus': {
    outline: 'none',
    borderColor: 'var(--primary-color)',
    backgroundColor: 'var(--bg-secondary)',
  },
});

const SearchIcon = styled(Search, {
  position: 'absolute',
  left: '$3',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--text-secondary)',
  width: '16px',
  height: '16px',
});

const ConversationsList = styled('div', {
  flex: 1,
  overflowY: 'auto',
});

const ConversationItem = styled('div', {
  display: 'flex',
  gap: '$3',
  padding: '$4',
  cursor: 'pointer',
  borderLeft: '3px solid transparent',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: 'var(--bg-secondary)',
  },

  variants: {
    active: {
      true: {
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderLeftColor: 'var(--primary-color)',
      },
    },
  },
});

const ConversationAvatar = styled('div', {
  width: '48px',
  height: '48px',
  borderRadius: '$full',
  overflow: 'hidden',
  flexShrink: 0,
  position: 'relative',
  backgroundColor: 'var(--primary-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontWeight: '$semibold',
  fontSize: '$base',

  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

const ConversationInfo = styled('div', {
  flex: 1,
  minWidth: 0,
});

const ConversationHeader = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '$1',
});

const ConversationName = styled('div', {
  fontSize: '$base',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
});

const ConversationTime = styled('div', {
  fontSize: '$xs',
  color: 'var(--text-secondary)',
});

const ConversationPreview = styled('div', {
  fontSize: '$sm',
  color: 'var(--primary-color)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const UnreadBadge = styled('div', {
  minWidth: '20px',
  height: '20px',
  padding: '0 $2',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  borderRadius: '$full',
  fontSize: '$xs',
  fontWeight: '$bold',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

const ChatArea = styled('main', {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
});

const ChatHeader = styled('div', {
  padding: '$4 $6',
  borderBottom: '1px solid var(--border-color)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: 'var(--card-bg)',
});

const ChatUserInfo = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
});

const ChatUserDetails = styled('div', {});

const ChatUserName = styled('div', {
  fontSize: '$lg',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
});

const ChatUserMeta = styled('div', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
});

const ChatActions = styled('div', {
  display: 'flex',
  gap: '$3',
});

const IconButton = styled('button', {
  padding: '$2',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-secondary)',
  borderRadius: '$base',

  '&:hover': {
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-secondary)',
  },
});

const MessagesContainer = styled('div', {
  flex: 1,
  overflowY: 'auto',
  padding: '$6',
  display: 'flex',
  flexDirection: 'column',
  gap: '$4',
});

const MessageGroup = styled('div', {
  display: 'flex',
  gap: '$3',
  marginBottom: '$4',
  position: 'relative',

  variants: {
    align: {
      left: {
        flexDirection: 'row',
      },
      right: {
        flexDirection: 'row-reverse',
      },
    },
  },

  '&:hover .message-actions': {
    opacity: 1,
    visibility: 'visible',
  },
});

const MessageActions = styled('div', {
  position: 'absolute',
  top: '-12px',
  right: '0',
  display: 'flex',
  gap: '$1',
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '$lg',
  padding: '$1',
  opacity: 0,
  visibility: 'hidden',
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
  zIndex: 10,
});

const ActionButton = styled('button', {
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '$base',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  transition: 'all 0.2s',
  position: 'relative',

  '&:hover': {
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
  },

  '&:hover::after': {
    content: 'attr(data-tooltip)',
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: '8px',
    padding: '6px 12px',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    color: 'white',
    fontSize: '12px',
    fontWeight: '$medium',
    borderRadius: '$base',
    whiteSpace: 'nowrap',
    zIndex: 1000,
    pointerEvents: 'none',
  },
});

const MessageAvatar = styled('div', {
  width: '40px',
  height: '40px',
  borderRadius: '$full',
  backgroundColor: 'var(--primary-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontWeight: '$semibold',
  fontSize: '$sm',
  flexShrink: 0,
  overflow: 'hidden',

  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

const MessageContent = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$1',
  maxWidth: '70%',
});

const RepliedMessage = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$2 $3',
  marginBottom: '$2',
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderLeft: '3px solid var(--primary-color)',
  borderRadius: '$base',
  fontSize: '$sm',
  cursor: 'pointer',
  transition: 'all 0.2s',

  '&:hover': {
    backgroundColor: 'var(--bg-tertiary)',
  },
});

const RepliedMessageContent = styled('div', {
  flex: 1,
  minWidth: 0,
});

const RepliedMessageSender = styled('span', {
  fontSize: '$xs',
  fontWeight: '$semibold',
  color: 'var(--primary-color)',
  marginRight: '$2',
});

const RepliedMessageText = styled('span', {
  fontSize: '$xs',
  color: 'var(--text-secondary)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'inline-block',
  maxWidth: '300px',
  verticalAlign: 'middle',
});

const MessageHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  marginBottom: '$1',
});

const MessageSender = styled('span', {
  fontSize: '$sm',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
});

const Message = styled('div', {
  padding: '$3 $4',
  borderRadius: '$lg',
  fontSize: '$sm',
  lineHeight: '1.5',
  wordWrap: 'break-word',

  variants: {
    type: {
      received: {
        backgroundColor: 'var(--card-bg)',
        color: 'var(--text-primary)',
        borderTopLeftRadius: '$sm',
      },
      sent: {
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        borderTopRightRadius: '$sm',
      },
    },
  },
});

const DeepLinksContainer = styled('div', {
  marginTop: '$2',
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
});

const DeepLinkButton = styled('button', {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$2 $3',
  backgroundColor: 'rgba(102, 126, 234, 0.1)',
  border: '1px solid rgba(102, 126, 234, 0.3)',
  borderRadius: '$md',
  color: '#667eea',
  fontSize: '$sm',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  textAlign: 'left',
  width: 'fit-content',

  '&:hover': {
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    borderColor: '#667eea',
    transform: 'translateY(-1px)',
  },

  '&:active': {
    transform: 'translateY(0)',
  },
});

const MessageTime = styled('span', {
  fontSize: '$xs',
  color: 'var(--text-secondary)',
});

const EmojiPickerPopup = styled('div', {
  position: 'absolute',
  top: '100%',
  right: 0,
  marginTop: '8px',
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '$lg',
  padding: '$4',
  display: 'grid',
  gridTemplateColumns: 'repeat(8, 1fr)',
  gap: '$1',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
  zIndex: 1000,
  width: '320px',
  maxHeight: '280px',
  overflowY: 'auto',
});

const EmojiItem = styled('button', {
  fontSize: '24px',
  padding: '$2',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '$base',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  '&:hover': {
    backgroundColor: 'var(--bg-secondary)',
    transform: 'scale(1.2)',
  },
});

const AttachmentMenu = styled('div', {
  position: 'absolute',
  bottom: '100%',
  left: 0,
  marginBottom: '8px',
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '$lg',
  padding: '$2',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
  zIndex: 1000,
  minWidth: '220px',
});

const AttachmentMenuItem = styled('button', {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  padding: '$3 $4',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '$base',
  color: 'var(--text-primary)',
  fontSize: '$base',
  fontWeight: '$medium',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  textAlign: 'left',

  '&:hover': {
    backgroundColor: 'var(--bg-secondary)',
  },
});

const MenuIconWrapper = styled('div', {
  width: '40px',
  height: '40px',
  borderRadius: '$base',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,

  variants: {
    color: {
      blue: {
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        color: '#3b82f6',
      },
      orange: {
        backgroundColor: 'rgba(249, 115, 22, 0.15)',
        color: '#f97316',
      },
      red: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        color: '#ef4444',
      },
      yellow: {
        backgroundColor: 'rgba(234, 179, 8, 0.15)',
        color: '#eab308',
      },
    },
  },
});

const InputContainer = styled('div', {
  borderTop: '1px solid var(--border-color)',
  backgroundColor: 'var(--card-bg)',
});

const ReplyBar = styled('div', {
  padding: '$3 $6',
  backgroundColor: 'var(--bg-secondary)',
  borderBottom: '1px solid var(--border-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '$3',
});

const ReplyContent = styled('div', {
  flex: 1,
  minWidth: 0,
});

const ReplyHeader = styled('div', {
  fontSize: '$sm',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
  marginBottom: '$1',
});

const ReplyText = styled('div', {
  fontSize: '$sm',
  color: 'var(--text-secondary)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const CloseButton = styled('button', {
  padding: '$2',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-secondary)',
  borderRadius: '$base',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',

  '&:hover': {
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-tertiary)',
  },
});

const InputWrapper = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  padding: '$4 $6',
});

const AttachButton = styled('button', {
  padding: '$2',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-secondary)',

  '&:hover': {
    color: 'var(--text-primary)',
  },
});

const MessageInput = styled('input', {
  flex: 1,
  padding: '$3 $4',
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '$lg',
  color: 'var(--text-primary)',
  fontSize: '$sm',

  '&::placeholder': {
    color: 'var(--text-secondary)',
  },

  '&:focus': {
    outline: 'none',
    borderColor: 'var(--primary-color)',
    backgroundColor: 'var(--bg-secondary)',
  },
});

const SendButton = styled('button', {
  width: '48px',
  height: '48px',
  backgroundColor: 'var(--primary-color)',
  border: 'none',
  borderRadius: '$full',
  cursor: 'pointer',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: 'var(--primary-hover)',
    transform: 'scale(1.05)',
  },
});

const RightSidebar = styled('aside', {
  width: '320px',
  backgroundColor: 'var(--card-bg)',
  borderLeft: '1px solid var(--border-color)',
  padding: '$6',
  overflowY: 'auto',
});

const ProfileSection = styled('div', {
  textAlign: 'center',
  marginBottom: '$8',
});

const LargeAvatar = styled('div', {
  width: '120px',
  height: '120px',
  borderRadius: '$full',
  overflow: 'hidden',
  margin: '0 auto $4',
  position: 'relative',
  backgroundColor: 'var(--primary-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontWeight: '$bold',
  fontSize: '48px',

  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

const ProfileName = styled('div', {
  fontSize: '$xl',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  marginBottom: '$1',
});

interface Conversation {
  user_id: number;
  user_name: string;
  user_avatar?: string;
  last_message?: {
    content: string;
    sent_at: string;
    is_from_me: boolean;
  };
  unread_count: number;
  is_online: boolean;
}

interface GuildChat {
  id: number;
  guild_id: number;
  guild_name: string;
  guild_avatar?: string;
  last_message?: {
    sender_name: string;
    content: string;
    sent_at: string;
  };
  unread_count: number;
}

interface Message {
  id: number;
  content: string;
  is_from_me: boolean;
  sent_at: string;
  is_read: boolean;
  sender_name?: string; // For Ava messages
  sender_avatar?: string; // For Ava messages
  reply_to?: {
    id: number;
    sender: string;
    content: string;
  };
}

interface GuildChatMessage {
  id: number;
  sender_id: number;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  created_at: string;
  is_deleted: boolean;
  reply_to?: {
    id: number;
    sender: string;
    content: string;
  };
}

interface ConversationDetails {
  other_user: {
    id: number;
    name: string;
    avatar?: string;
    is_online: boolean;
  };
  messages: Message[];
}

interface GuildChatDetails {
  guild_id: number;
  guild_name: string;
  guild_avatar?: string;
  messages: GuildChatMessage[];
}

const MessagesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [messageInput, setMessageInput] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [guildChats, setGuildChats] = useState<GuildChat[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedGuildId, setSelectedGuildId] = useState<number | null>(null);
  const [conversationDetails, setConversationDetails] = useState<ConversationDetails | null>(null);
  const [guildChatDetails, setGuildChatDetails] = useState<GuildChatDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string; avatar_url?: string } | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);
  const [showInputEmojiPicker, setShowInputEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: number; sender: string; content: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const photoVideoInputRef = React.useRef<HTMLInputElement>(null);
  const hasLoadedRef = React.useRef(false);
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);

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

  const loadCurrentUser = useCallback(async () => {
    try {
      // Check if token exists
      const token = localStorage.getItem('avalanche_token');
      console.log('Token exists:', !!token);
      
      const user = await API.auth.getMe();
      console.log('User loaded:', user);
      setCurrentUser({ 
        id: user.id, 
        name: user.username || `${user.first_name} ${user.last_name}`,
        avatar_url: user.avatar_url
      });
    } catch (err) {
      console.error('Failed to load current user:', err);
      setError('Authentication failed. Please refresh the page or log in again.');
    }
  }, []);

  // Type for deep links
  interface DeepLink {
    label: string;
    link: string;
  }

  // Helper function to parse message content and extract links
  const parseMessageContent = (content: string): { text: string; links: DeepLink[] } => {
    const linksMarker = '\n\n__LINKS__:';
    if (content.includes(linksMarker)) {
      const [text, linksJson] = content.split(linksMarker);
      try {
        const links = JSON.parse(linksJson);
        return { text: text.trim(), links };
      } catch (e) {
        console.error('Failed to parse links:', e);
        return { text: content, links: [] };
      }
    }
    return { text: content, links: [] };
  };

  // Handle deep link navigation
  const handleDeepLink = (link: string) => {
    if (link.startsWith('sneaker://')) {
      const path = link.replace('sneaker://', '');
      navigate(`/${path}`);
    }
  };

  const loadConversations = useCallback(async (autoSelect = false) => {
    try {
      setLoading(true);
      const [dmData, guildChatsData] = await Promise.all([
        API.messages.getConversations(),
        API.guildChats.getAll(),
      ]);
      setConversations(dmData);
      setGuildChats(guildChatsData);
      
      if (autoSelect) {
        // Check if navigating from guild chat button
        const state = location.state as { guildId?: number } | null;
        if (state?.guildId) {
          setSelectedGuildId(state.guildId);
          setSelectedUserId(null);
        } else if (guildChatsData.length > 0) {
          // Auto-select first guild chat if available
          setSelectedGuildId(guildChatsData[0].guild_id);
        } else if (dmData.length > 0) {
          // Otherwise auto-select first DM
          setSelectedUserId(dmData[0].user_id);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load conversations';
      setError(errorMsg);
      console.error('Load conversations error:', err);
    } finally {
      setLoading(false);
    }
  }, [location.state]);

  const loadConversationMessages = useCallback(async (userId: number) => {
    try {
      setLoadingMessages(true);
      const data = await API.messages.getConversationMessages(userId);
      setConversationDetails(data);
      setGuildChatDetails(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      console.error('Load messages error:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const loadGuildChatMessages = useCallback(async (guildId: number) => {
    try {
      setLoadingMessages(true);
      const messages = await API.guildChats.getMessages(guildId);
      const guildChat = guildChats.find(gc => gc.guild_id === guildId);
      setGuildChatDetails({
        guild_id: guildId,
        guild_name: guildChat?.guild_name || 'Guild Chat',
        guild_avatar: guildChat?.guild_avatar,
        messages,
      });
      setConversationDetails(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load guild chat');
      console.error('Load guild chat error:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, [guildChats]);

  // Load current user and conversations on mount
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadCurrentUser();
      loadConversations(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load conversation messages when user selected
  useEffect(() => {
    if (selectedUserId) {
      loadConversationMessages(selectedUserId);
    }
  }, [selectedUserId, loadConversationMessages]);

  // Load guild chat messages when guild selected
  useEffect(() => {
    if (selectedGuildId) {
      loadGuildChatMessages(selectedGuildId);
    }
  }, [selectedGuildId, loadGuildChatMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [conversationDetails?.messages, guildChatDetails?.messages]);

  const sendMessage = async () => {
    if (!messageInput.trim()) return;

    try {
      const messageContent = messageInput.trim();
      const hasAvaMention = messageContent.toLowerCase().includes('@ava');

      if (selectedUserId) {
        // Send DM
        await API.messages.send({
          recipient_id: selectedUserId,
          content: messageContent,
          // Note: In a real implementation, you'd send reply_to_id: replyingTo?.id
        });
        setMessageInput('');
        setReplyingTo(null);

        // If @Ava mentioned, wait a bit for AI response before reloading
        if (hasAvaMention) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        await loadConversationMessages(selectedUserId);
      } else if (selectedGuildId) {
        // Send guild chat message
        await API.guildChats.send(selectedGuildId, messageContent);
        setMessageInput('');
        setReplyingTo(null);

        // If @Ava mentioned, wait a bit for AI response before reloading
        if (hasAvaMention) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        await loadGuildChatMessages(selectedGuildId);
      }
      await loadConversations(false); // Update conversation list without auto-select
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('Send message error:', err);
    }
  };

  const deleteGuildMessage = async (messageId: number) => {
    if (!selectedGuildId) return;
    
    try {
      await API.guildChats.deleteMessage(messageId);
      await loadGuildChatMessages(selectedGuildId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
      console.error('Delete message error:', err);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Message action handlers
  const copyMessageId = (messageId: number) => {
    navigator.clipboard.writeText(messageId.toString());
    alert(`Message ID ${messageId} copied to clipboard!`);
  };

  const copyMessageLink = (messageId: number) => {
    const link = `${window.location.origin}${window.location.pathname}#message-${messageId}`;
    navigator.clipboard.writeText(link);
    alert('Message link copied to clipboard!');
  };

  const saveMessage = (messageId: number, content: string) => {
    const savedMessages = JSON.parse(localStorage.getItem('savedMessages') || '[]');
    const newSavedMessage = {
      id: messageId,
      content,
      savedAt: new Date().toISOString(),
    };
    savedMessages.push(newSavedMessage);
    localStorage.setItem('savedMessages', JSON.stringify(savedMessages));
    alert('Message saved successfully!');
  };

  const pinMessage = (messageId: number, content: string) => {
    const pinnedMessages = JSON.parse(localStorage.getItem('pinnedMessages') || '[]');
    const newPinnedMessage = {
      id: messageId,
      content,
      pinnedAt: new Date().toISOString(),
    };
    pinnedMessages.push(newPinnedMessage);
    localStorage.setItem('pinnedMessages', JSON.stringify(pinnedMessages));
    alert('Message pinned successfully!');
  };

  const addReaction = (messageId: number) => {
    setShowEmojiPicker(showEmojiPicker === messageId ? null : messageId);
  };

  const handleEmojiSelect = (messageId: number, emoji: string) => {
    alert(`Reaction ${emoji} added to message ${messageId}!`);
    setShowEmojiPicker(null);
    // In a real implementation, you'd save this to the backend
  };

  const replyToMessage = (messageId: number, content: string, senderName: string) => {
    setReplyingTo({
      id: messageId,
      sender: senderName,
      content: content,
    });
  };

  const forwardMessage = (messageId: number, content: string) => {
    alert(`Forward message: "${content.substring(0, 50)}..."`);
    // In a real app, you'd show a dialog to select recipients
  };

  const showMoreOptions = (messageId: number) => {
    const action = prompt('More options:\n1. Edit message\n2. Delete message\n3. Forward message\n4. Reply to message\n\nEnter option number:');

    if (action === '1') {
      alert('Edit message functionality');
    } else if (action === '2') {
      if (confirm('Are you sure you want to delete this message?')) {
        deleteGuildMessage(messageId);
      }
    } else if (action === '3') {
      alert('Forward message functionality');
    } else if (action === '4') {
      alert('Reply to message functionality');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowAttachmentMenu(false);
      alert(`File selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
      // In a real implementation, you'd upload this file
    }
  };

  const handlePhotoVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowAttachmentMenu(false);
      alert(`Media selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      // In a real implementation, you'd upload this media file
    }
  };


  const handleInputEmojiSelect = (emoji: string) => {
    setMessageInput(messageInput + emoji);
    setShowInputEmojiPicker(false);
  };

  return (
    <PageContainer>
      <Sidebar>
        <UserProfile>
          <Avatar>
            {currentUser?.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser?.name || 'User'}
              />
            ) : (
              (currentUser?.name || 'U').charAt(0).toUpperCase()
            )}
            <OnlineIndicator />
          </Avatar>
          <UserInfo>
            <UserName>{currentUser?.name || 'Loading...'}</UserName>
            <UserStatus>Online</UserStatus>
          </UserInfo>
          <DashboardButton to="/dashboard" aria-label="Go to Dashboard">
            <LayoutDashboard size={20} />
          </DashboardButton>
          <MenuButton>
            <MoreVertical size={20} />
          </MenuButton>
        </UserProfile>

        <SearchContainer>
          <SearchBar>
            <SearchIcon />
            <SearchInput placeholder="Search users or guilds" />
          </SearchBar>
        </SearchContainer>

        <ConversationsList>
          {loading && conversations.length === 0 && guildChats.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading conversations...
            </div>
          )}
          {error && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
              {error}
            </div>
          )}
          {!loading && conversations.length === 0 && guildChats.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No conversations yet. Start messaging!
            </div>
          )}
          {/* Guild Chats */}
          {guildChats.map((chat) => (
            <ConversationItem 
              key={`guild-${chat.guild_id}`} 
              active={chat.guild_id === selectedGuildId}
              onClick={() => {
                setSelectedGuildId(chat.guild_id);
                setSelectedUserId(null);
              }}
            >
              <ConversationAvatar>
                {chat.guild_avatar ? (
                  <img
                    src={chat.guild_avatar}
                    alt={chat.guild_name}
                  />
                ) : (
                  chat.guild_name.charAt(0).toUpperCase()
                )}
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  backgroundColor: 'var(--card-bg)',
                  borderRadius: '50%',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Users size={14} color="#3b82f6" />
                </div>
              </ConversationAvatar>
              <ConversationInfo>
                <ConversationHeader>
                  <ConversationName>{chat.guild_name}</ConversationName>
                  <ConversationTime>
                    {chat.last_message ? formatTimeAgo(chat.last_message.sent_at) : 'No messages'}
                  </ConversationTime>
                </ConversationHeader>
                <ConversationPreview>
                  {chat.last_message ? 
                    `${chat.last_message.sender_name}: ${chat.last_message.content.slice(0, 35)}...` 
                    : 'Start chatting with your guild'
                  }
                </ConversationPreview>
              </ConversationInfo>
              {chat.unread_count > 0 && <UnreadBadge>{chat.unread_count}</UnreadBadge>}
            </ConversationItem>
          ))}
          {/* Direct Messages */}
          {conversations.map((conv) => (
            <ConversationItem 
              key={`dm-${conv.user_id}`} 
              active={conv.user_id === selectedUserId}
              onClick={() => {
                setSelectedUserId(conv.user_id);
                setSelectedGuildId(null);
              }}
            >
              <ConversationAvatar>
                {conv.user_avatar ? (
                  <img
                    src={conv.user_avatar}
                    alt={conv.user_name}
                  />
                ) : (
                  conv.user_name.charAt(0).toUpperCase()
                )}
              </ConversationAvatar>
              <ConversationInfo>
                <ConversationHeader>
                  <ConversationName>{conv.user_name}</ConversationName>
                  <ConversationTime>
                    {conv.last_message ? formatTimeAgo(conv.last_message.sent_at) : 'No messages'}
                  </ConversationTime>
                </ConversationHeader>
                <ConversationPreview>
                  {conv.last_message ? 
                    (conv.last_message.is_from_me ? 'You: ' : '') + conv.last_message.content.slice(0, 40) + '...' 
                    : 'Start a conversation'
                  }
                </ConversationPreview>
              </ConversationInfo>
              {conv.unread_count > 0 && <UnreadBadge>{conv.unread_count}</UnreadBadge>}
            </ConversationItem>
          ))}
        </ConversationsList>
      </Sidebar>

      <ChatArea>
        {conversationDetails ? (
          <>
            <ChatHeader>
              <ChatUserInfo>
                <Avatar onClick={() => setShowUserProfile(!showUserProfile)} style={{ cursor: 'pointer' }}>
                  {conversationDetails.other_user.avatar ? (
                    <img
                      src={conversationDetails.other_user.avatar}
                      alt={conversationDetails.other_user.name}
                    />
                  ) : (
                    conversationDetails.other_user.name.charAt(0).toUpperCase()
                  )}
                  {conversationDetails.other_user.is_online && <OnlineIndicator />}
                </Avatar>
                <ChatUserDetails>
                  <ChatUserName onClick={() => setShowUserProfile(!showUserProfile)} style={{ cursor: 'pointer' }}>
                    {conversationDetails.other_user.name}
                  </ChatUserName>
                  <ChatUserMeta>
                    {conversationDetails.other_user.is_online ? 'Online' : 'Offline'}
                  </ChatUserMeta>
                </ChatUserDetails>
              </ChatUserInfo>
              <ChatActions>
                <IconButton>
                  <Video size={20} />
                </IconButton>
                <IconButton>
                  <Search size={20} />
                </IconButton>
                <IconButton onClick={() => setShowUserProfile(!showUserProfile)}>
                  <Info size={20} />
                </IconButton>
              </ChatActions>
            </ChatHeader>

            <MessagesContainer ref={messagesContainerRef}>
              {loadingMessages ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: 'var(--text-secondary)'
                }}>
                  Loading messages...
                </div>
              ) : conversationDetails.messages.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px', 
                  color: 'var(--text-secondary)' 
                }}>
                  No messages yet. Start the conversation!
                </div>
              ) : (
                conversationDetails.messages.map((msg) => {
                  const isOwnMessage = msg.is_from_me;
                  const isAvaMessage = msg.sender_name === "Ava AI";
                  const senderName = isAvaMessage ? "Ava AI" : conversationDetails.other_user.name;
                  const senderAvatar = isAvaMessage ? "/ava-avatar.png" : conversationDetails.other_user.avatar;

                  return (
                    <MessageGroup key={msg.id} align={isOwnMessage ? 'right' : 'left'}>
                      <MessageActions className="message-actions">
                        <ActionButton data-tooltip="Message ID" aria-label="Message ID" onClick={() => copyMessageId(msg.id)}>
                          <Hash size={16} />
                        </ActionButton>
                        <ActionButton data-tooltip="Copy Link" aria-label="Copy Link" onClick={() => copyMessageLink(msg.id)}>
                          <LinkIcon size={16} />
                        </ActionButton>
                        <ActionButton data-tooltip="Save" aria-label="Save Message" onClick={() => saveMessage(msg.id, msg.content)}>
                          <Bookmark size={16} />
                        </ActionButton>
                        <ActionButton data-tooltip="Pin" aria-label="Pin Message" onClick={() => pinMessage(msg.id, msg.content)}>
                          <Pin size={16} />
                        </ActionButton>
                        <ActionButton
                          data-tooltip="Add Reaction"
                          aria-label="Add Reaction"
                          onClick={() => addReaction(msg.id)}
                          style={{ position: 'relative' }}
                        >
                          <Smile size={16} />
                          {showEmojiPicker === msg.id && (
                            <EmojiPickerPopup>
                              {popularEmojis.map((emoji, index) => (
                                <EmojiItem
                                  key={index}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEmojiSelect(msg.id, emoji);
                                  }}
                                >
                                  {emoji}
                                </EmojiItem>
                              ))}
                            </EmojiPickerPopup>
                          )}
                        </ActionButton>
                        <ActionButton data-tooltip="Reply" aria-label="Reply" onClick={() => replyToMessage(msg.id, msg.content, senderName)}>
                          <Reply size={16} />
                        </ActionButton>
                        <ActionButton data-tooltip="Forward" aria-label="Forward" onClick={() => forwardMessage(msg.id, msg.content)}>
                          <Forward size={16} />
                        </ActionButton>
                        <ActionButton data-tooltip="More" aria-label="More Options" onClick={() => showMoreOptions(msg.id)}>
                          <MoreHorizontal size={16} />
                        </ActionButton>
                      </MessageActions>

                      {!isOwnMessage && (
                        <MessageAvatar
                          {...(isAvaMessage ? {} : { as: Link, to: `/user/${conversationDetails.other_user.id}` })}
                          style={{ cursor: isAvaMessage ? 'default' : 'pointer', textDecoration: 'none' }}
                        >
                          {senderAvatar ? (
                            <img
                              src={senderAvatar}
                              alt={senderName}
                            />
                          ) : (
                            senderName.charAt(0).toUpperCase()
                          )}
                        </MessageAvatar>
                      )}
                      <MessageContent>
                        {!isOwnMessage && (
                          <MessageHeader>
                            <MessageSender
                              {...(isAvaMessage ? {} : { as: Link, to: `/user/${conversationDetails.other_user.id}` })}
                              style={{ cursor: isAvaMessage ? 'default' : 'pointer', textDecoration: 'none', color: isAvaMessage ? '#667eea' : 'inherit' }}
                            >
                              {senderName}
                            </MessageSender>
                            <MessageTime>
                              {new Date(msg.sent_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </MessageTime>
                          </MessageHeader>
                        )}
                        {msg.reply_to && (
                          <RepliedMessage>
                            <Reply size={14} style={{ flexShrink: 0, color: 'var(--primary-color)' }} />
                            <RepliedMessageContent>
                              <RepliedMessageSender>{msg.reply_to.sender}</RepliedMessageSender>
                              <RepliedMessageText>{msg.reply_to.content}</RepliedMessageText>
                            </RepliedMessageContent>
                          </RepliedMessage>
                        )}
                        <Message type={isOwnMessage ? 'sent' : 'received'}>
                          {(() => {
                            const { text, links } = parseMessageContent(msg.content);
                            return (
                              <>
                                {text}
                                {links.length > 0 && (
                                  <DeepLinksContainer>
                                    {links.map((link: DeepLink, index: number) => (
                                      <DeepLinkButton
                                        key={index}
                                        onClick={() => handleDeepLink(link.link)}
                                      >
                                        {link.label}
                                      </DeepLinkButton>
                                    ))}
                                  </DeepLinksContainer>
                                )}
                              </>
                            );
                          })()}
                        </Message>
                        {isOwnMessage && (
                          <MessageTime style={{ alignSelf: 'flex-end', marginTop: '4px' }}>
                            {new Date(msg.sent_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </MessageTime>
                        )}
                      </MessageContent>
                    </MessageGroup>
                  );
                })
              )}
            </MessagesContainer>

            <InputContainer>
              {replyingTo && (
                <ReplyBar>
                  <ReplyContent>
                    <ReplyHeader>Replying to {replyingTo.sender}</ReplyHeader>
                    <ReplyText>{replyingTo.content}</ReplyText>
                  </ReplyContent>
                  <CloseButton onClick={() => setReplyingTo(null)}>
                    <X size={20} />
                  </CloseButton>
                </ReplyBar>
              )}
              <InputWrapper>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                  style={{ display: 'none' }}
                />
                <input
                  type="file"
                  ref={photoVideoInputRef}
                  onChange={handlePhotoVideoSelect}
                  accept="image/*,video/*"
                  style={{ display: 'none' }}
                />
                <AttachButton
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  style={{ position: 'relative' }}
                >
                  <Paperclip size={20} />
                  {showAttachmentMenu && (
                    <AttachmentMenu>
                      <AttachmentMenuItem onClick={() => fileInputRef.current?.click()}>
                        <MenuIconWrapper color="blue">
                          <File size={20} />
                        </MenuIconWrapper>
                        <span>File</span>
                      </AttachmentMenuItem>
                      <AttachmentMenuItem onClick={() => photoVideoInputRef.current?.click()}>
                        <MenuIconWrapper color="blue">
                          <Image size={20} />
                        </MenuIconWrapper>
                        <span>Photos & videos</span>
                      </AttachmentMenuItem>
                    </AttachmentMenu>
                  )}
                </AttachButton>
                <MessageInput
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <AttachButton
                  onClick={() => setShowInputEmojiPicker(!showInputEmojiPicker)}
                  style={{ position: 'relative' }}
                >
                  <Smile size={20} />
                  {showInputEmojiPicker && (
                    <EmojiPickerPopup style={{ bottom: '100%', top: 'auto', marginBottom: '8px', marginTop: '0' }}>
                      {popularEmojis.map((emoji, index) => (
                        <EmojiItem
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInputEmojiSelect(emoji);
                          }}
                        >
                          {emoji}
                        </EmojiItem>
                      ))}
                    </EmojiPickerPopup>
                  )}
                </AttachButton>
                <SendButton onClick={sendMessage} disabled={!messageInput.trim()}>
                  <Send size={20} />
                </SendButton>
              </InputWrapper>
            </InputContainer>
          </>
        ) : guildChatDetails ? (
          <>
            <ChatHeader>
              <ChatUserInfo>
                <Avatar>
                  {guildChatDetails.guild_avatar ? (
                    <img
                      src={guildChatDetails.guild_avatar}
                      alt={guildChatDetails.guild_name}
                    />
                  ) : (
                    guildChatDetails.guild_name.charAt(0).toUpperCase()
                  )}
                  <div style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '50%',
                    padding: '2px'
                  }}>
                    <Users size={14} color="#3b82f6" />
                  </div>
                </Avatar>
                <ChatUserDetails>
                  <ChatUserName>{guildChatDetails.guild_name}</ChatUserName>
                  <ChatUserMeta>Guild Chat</ChatUserMeta>
                </ChatUserDetails>
              </ChatUserInfo>
              <ChatActions>
                <IconButton>
                  <Search size={20} />
                </IconButton>
                <IconButton>
                  <Info size={20} />
                </IconButton>
              </ChatActions>
            </ChatHeader>

            <MessagesContainer ref={messagesContainerRef}>
              {loadingMessages ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: 'var(--text-secondary)'
                }}>
                  Loading messages...
                </div>
              ) : guildChatDetails.messages.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px', 
                  color: 'var(--text-secondary)' 
                }}>
                  No messages yet. Start the guild chat!
                </div>
              ) : (
                guildChatDetails.messages.map((msg) => {
                  const isOwnMessage = currentUser && msg.sender_id === currentUser.id;
                  return (
                    <MessageGroup key={msg.id} align={isOwnMessage ? 'right' : 'left'}>
                      <MessageActions className="message-actions">
                        <ActionButton data-tooltip="Message ID" aria-label="Message ID" onClick={() => copyMessageId(msg.id)}>
                          <Hash size={16} />
                        </ActionButton>
                        <ActionButton data-tooltip="Copy Link" aria-label="Copy Link" onClick={() => copyMessageLink(msg.id)}>
                          <LinkIcon size={16} />
                        </ActionButton>
                        <ActionButton data-tooltip="Save" aria-label="Save Message" onClick={() => saveMessage(msg.id, msg.content)}>
                          <Bookmark size={16} />
                        </ActionButton>
                        <ActionButton data-tooltip="Pin" aria-label="Pin Message" onClick={() => pinMessage(msg.id, msg.content)}>
                          <Pin size={16} />
                        </ActionButton>
                        <ActionButton
                          data-tooltip="Add Reaction"
                          aria-label="Add Reaction"
                          onClick={() => addReaction(msg.id)}
                          style={{ position: 'relative' }}
                        >
                          <Smile size={16} />
                          {showEmojiPicker === msg.id && (
                            <EmojiPickerPopup>
                              {popularEmojis.map((emoji, index) => (
                                <EmojiItem
                                  key={index}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEmojiSelect(msg.id, emoji);
                                  }}
                                >
                                  {emoji}
                                </EmojiItem>
                              ))}
                            </EmojiPickerPopup>
                          )}
                        </ActionButton>
                        <ActionButton data-tooltip="Reply" aria-label="Reply" onClick={() => replyToMessage(msg.id, msg.content, conversationDetails?.other_user.name || guildChatDetails?.messages.find(m => m.id === msg.id)?.sender_name || 'User')}>
                          <Reply size={16} />
                        </ActionButton>
                        <ActionButton data-tooltip="Forward" aria-label="Forward" onClick={() => forwardMessage(msg.id, msg.content)}>
                          <Forward size={16} />
                        </ActionButton>
                        <ActionButton data-tooltip="More" aria-label="More Options" onClick={() => showMoreOptions(msg.id)}>
                          <MoreHorizontal size={16} />
                        </ActionButton>
                      </MessageActions>

                      {!isOwnMessage && (
                        <MessageAvatar
                          as={Link}
                          to={`/user/${msg.sender_id}`}
                          style={{ cursor: 'pointer', textDecoration: 'none' }}
                        >
                          {msg.sender_avatar ? (
                            <img
                              src={msg.sender_avatar}
                              alt={msg.sender_name}
                            />
                          ) : (
                            msg.sender_name.charAt(0).toUpperCase()
                          )}
                        </MessageAvatar>
                      )}
                      <MessageContent>
                        {!isOwnMessage && (
                          <MessageHeader>
                            <MessageSender
                              as={Link}
                              to={`/user/${msg.sender_id}`}
                              style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
                            >
                              {msg.sender_name}
                            </MessageSender>
                            <MessageTime>
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </MessageTime>
                          </MessageHeader>
                        )}
                        {msg.reply_to && (
                          <RepliedMessage>
                            <Reply size={14} style={{ flexShrink: 0, color: 'var(--primary-color)' }} />
                            <RepliedMessageContent>
                              <RepliedMessageSender>{msg.reply_to.sender}</RepliedMessageSender>
                              <RepliedMessageText>{msg.reply_to.content}</RepliedMessageText>
                            </RepliedMessageContent>
                          </RepliedMessage>
                        )}
                        <Message type={isOwnMessage ? 'sent' : 'received'}>
                          {msg.is_deleted ? (
                            <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                              Message deleted
                            </span>
                          ) : (
                            msg.content
                          )}
                        </Message>
                        {isOwnMessage && (
                          <MessageTime style={{ alignSelf: 'flex-end', marginTop: '4px' }}>
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </MessageTime>
                        )}
                      </MessageContent>
                    </MessageGroup>
                  );
                })
              )}
            </MessagesContainer>

            <InputContainer>
              {replyingTo && (
                <ReplyBar>
                  <ReplyContent>
                    <ReplyHeader>Replying to {replyingTo.sender}</ReplyHeader>
                    <ReplyText>{replyingTo.content}</ReplyText>
                  </ReplyContent>
                  <CloseButton onClick={() => setReplyingTo(null)}>
                    <X size={20} />
                  </CloseButton>
                </ReplyBar>
              )}
              <InputWrapper>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                  style={{ display: 'none' }}
                />
                <input
                  type="file"
                  ref={photoVideoInputRef}
                  onChange={handlePhotoVideoSelect}
                  accept="image/*,video/*"
                  style={{ display: 'none' }}
                />
                <AttachButton
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  style={{ position: 'relative' }}
                >
                  <Paperclip size={20} />
                  {showAttachmentMenu && (
                    <AttachmentMenu>
                      <AttachmentMenuItem onClick={() => fileInputRef.current?.click()}>
                        <MenuIconWrapper color="blue">
                          <File size={20} />
                        </MenuIconWrapper>
                        <span>File</span>
                      </AttachmentMenuItem>
                      <AttachmentMenuItem onClick={() => photoVideoInputRef.current?.click()}>
                        <MenuIconWrapper color="blue">
                          <Image size={20} />
                        </MenuIconWrapper>
                        <span>Photos & videos</span>
                      </AttachmentMenuItem>
                    </AttachmentMenu>
                  )}
                </AttachButton>
                <MessageInput
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <AttachButton
                  onClick={() => setShowInputEmojiPicker(!showInputEmojiPicker)}
                  style={{ position: 'relative' }}
                >
                  <Smile size={20} />
                  {showInputEmojiPicker && (
                    <EmojiPickerPopup style={{ bottom: '100%', top: 'auto', marginBottom: '8px', marginTop: '0' }}>
                      {popularEmojis.map((emoji, index) => (
                        <EmojiItem
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInputEmojiSelect(emoji);
                          }}
                        >
                          {emoji}
                        </EmojiItem>
                      ))}
                    </EmojiPickerPopup>
                  )}
                </AttachButton>
                <SendButton onClick={sendMessage} disabled={!messageInput.trim()}>
                  <Send size={20} />
                </SendButton>
              </InputWrapper>
            </InputContainer>
          </>
        ) : (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: 'var(--text-secondary)'
          }}>
            Select a conversation to start messaging
          </div>
        )}
      </ChatArea>

      {showUserProfile && conversationDetails && (
        <RightSidebar>
          <ProfileSection>
            <LargeAvatar>
              {conversationDetails.other_user.avatar ? (
                <img
                  src={conversationDetails.other_user.avatar}
                  alt={conversationDetails.other_user.name}
                />
              ) : (
                conversationDetails.other_user.name.charAt(0).toUpperCase()
              )}
              {conversationDetails.other_user.is_online && <OnlineIndicator />}
            </LargeAvatar>
            <ProfileName>{conversationDetails.other_user.name}</ProfileName>
            <div style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginBottom: '24px'
            }}>
              {conversationDetails.other_user.is_online ? 'Online' : 'Offline'}
            </div>
          </ProfileSection>

          <div style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '16px'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '$semibold',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              marginBottom: '12px'
            }}>
              About
            </div>
            <div style={{
              fontSize: '14px',
              color: 'var(--text-primary)',
              lineHeight: '1.5'
            }}>
              {conversationDetails.other_user.name}
            </div>
          </div>

          <div style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '16px',
            marginTop: '16px'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '$semibold',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              marginBottom: '12px'
            }}>
              Member Since
            </div>
            <div style={{
              fontSize: '14px',
              color: 'var(--text-primary)'
            }}>
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </RightSidebar>
      )}
    </PageContainer>
  );
};

export default MessagesPage;
