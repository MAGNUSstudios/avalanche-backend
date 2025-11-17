import React, { useState } from 'react';
import { styled } from '../stitches.config';
import { X, Minus, Send, Sparkles } from 'lucide-react';
import API from '../services/api';
import { useCart } from '../context/CartContext';

const Overlay = styled('div', {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '$4',

  variants: {
    visible: {
      true: {
        opacity: 1,
        pointerEvents: 'all',
      },
      false: {
        opacity: 0,
        pointerEvents: 'none',
      },
    },
  },
});

const Modal = styled('div', {
  width: '100%',
  maxWidth: '720px',
  height: '80vh',
  maxHeight: '800px',
  backgroundColor: '$gray900',
  borderRadius: '$xl',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
});

const Header = styled('div', {
  padding: '$4 $6',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: 'rgba(30, 41, 59, 0.8)',
});

const HeaderLeft = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
});

const AIIcon = styled('div', {
  width: '32px',
  height: '32px',
  borderRadius: '$full',
  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
});

const HeaderTitle = styled('div', {});

const Title = styled('h2', {
  fontSize: '$lg',
  fontWeight: '$bold',
  color: 'white',
  margin: 0,
});

const Subtitle = styled('p', {
  fontSize: '$xs',
  color: '$gray400',
  margin: 0,
});

const HeaderActions = styled('div', {
  display: 'flex',
  gap: '$2',
});

const IconButton = styled('button', {
  padding: '$2',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: '$gray400',
  borderRadius: '$base',
  transition: 'all 0.2s ease',

  '&:hover': {
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

const ChatArea = styled('div', {
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

  variants: {
    type: {
      ai: {
        alignItems: 'flex-start',
      },
      user: {
        alignItems: 'flex-end',
        flexDirection: 'row-reverse',
      },
    },
  },
});

const MessageAvatar = styled('div', {
  width: '32px',
  height: '32px',
  borderRadius: '$full',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  variants: {
    type: {
      ai: {
        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        color: 'white',
      },
      user: {
        backgroundColor: '$gray700',
        overflow: 'hidden',
      },
    },
  },
});

const MessageContent = styled('div', {
  flex: 1,
  maxWidth: '85%',
});

const MessageBubble = styled('div', {
  padding: '$4',
  borderRadius: '$lg',
  fontSize: '$sm',
  lineHeight: '1.6',

  variants: {
    type: {
      ai: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        color: 'white',
      },
      user: {
        backgroundColor: '$primary500',
        color: 'white',
      },
    },
  },
});

const MessageLabel = styled('div', {
  fontSize: '$xs',
  fontWeight: '$semibold',
  color: '$gray400',
  marginBottom: '$2',
});

const QuickActions = styled('div', {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '$2',
  marginTop: '$3',
});

const QuickActionButton = styled('button', {
  padding: '$2 $4',
  backgroundColor: 'transparent',
  border: '1px solid $primary500',
  borderRadius: '$full',
  color: '$primary500',
  fontSize: '$sm',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
});

const InputArea = styled('div', {
  padding: '$4 $6',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  backgroundColor: 'rgba(30, 41, 59, 0.8)',
});

const InputWrapper = styled('div', {
  display: 'flex',
  alignItems: 'flex-end',
  gap: '$3',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '$lg',
  padding: '$3',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.2s ease',

  '&:focus-within': {
    borderColor: '$primary500',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});

const Input = styled('textarea', {
  flex: 1,
  backgroundColor: 'transparent',
  border: 'none',
  color: 'white',
  fontSize: '$sm',
  resize: 'none',
  outline: 'none',
  minHeight: '24px',
  maxHeight: '120px',
  fontFamily: 'inherit',

  '&::placeholder': {
    color: '$gray500',
  },
});

const SendButton = styled('button', {
  width: '36px',
  height: '36px',
  backgroundColor: '$primary500',
  border: 'none',
  borderRadius: '$full',
  cursor: 'pointer',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '$primary600',
    transform: 'scale(1.05)',
  },

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none',
  },
});

interface Message {
  id: number;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      content: "Hello! I'm your AI Assistant. How can I help you today? You can ask me to find a collaborator, summarize guild activity, or suggest items to sell.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');

    try {
      // Build conversation history for API
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'ai' ? 'assistant' : 'user',
        content: msg.content,
      }));

      // Call the real AI backend API
      const response = await API.ai.chat({
        message: currentInput,
        conversation_history: conversationHistory,
      });

      // Handle cart actions if present in response
      if (response.action_result && response.action_result.success && response.action_result.data) {
        // Add items to cart if this was an add_to_cart action
        if (response.action_performed === 'add_to_cart' && response.action_result.data) {
          response.action_result.data.forEach((item: { product_id: number; name: string; price: number; image_url?: string }) => {
            addToCart({
              id: item.product_id,
              product_id: item.product_id,
              name: item.name,
              price: item.price,
              image_url: item.image_url,
              seller_id: 0, // Will be set by backend
            });
          });
        }
      }

      const aiMessage: Message = {
        id: messages.length + 2,
        type: 'ai',
        content: response.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error chatting with AI:', error);

      // Fallback error message
      const errorMessage: Message = {
        id: messages.length + 2,
        type: 'ai',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay visible={isOpen} onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <AIIcon>
              <Sparkles size={18} />
            </AIIcon>
            <HeaderTitle>
              <Title>Avalanche AI</Title>
              <Subtitle>Your personal assistant</Subtitle>
            </HeaderTitle>
          </HeaderLeft>
          <HeaderActions>
            <IconButton onClick={onClose}>
              <Minus size={20} />
            </IconButton>
            <IconButton onClick={onClose}>
              <X size={20} />
            </IconButton>
          </HeaderActions>
        </Header>

        <ChatArea>
          {messages.map((message) => (
            <MessageGroup key={message.id} type={message.type}>
              <MessageAvatar type={message.type}>
                {message.type === 'ai' ? (
                  <Sparkles size={16} />
                ) : (
                  <img
                    src="https://i.pravatar.cc/150?img=68"
                    alt="User"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
              </MessageAvatar>
              <MessageContent>
                <MessageLabel>
                  {message.type === 'ai' ? 'Avalanche AI' : 'User'}
                </MessageLabel>
                <MessageBubble type={message.type}>
                  {message.content}
                </MessageBubble>
              </MessageContent>
            </MessageGroup>
          ))}

          {messages.length === 1 && (
            <QuickActions>
              <QuickActionButton onClick={() => handleQuickAction('Find a collaborator')}>
                Find a collaborator
              </QuickActionButton>
              <QuickActionButton onClick={() => handleQuickAction("Summarize my guild's activity")}>
                Summarize my guild's activity
              </QuickActionButton>
              <QuickActionButton onClick={() => handleQuickAction('Suggest items to sell')}>
                Suggest items to sell
              </QuickActionButton>
              <QuickActionButton onClick={() => handleQuickAction('Check my escrow status')}>
                Check my escrow status
              </QuickActionButton>
              <QuickActionButton onClick={() => handleQuickAction('Release escrow payment')}>
                Release escrow payment
              </QuickActionButton>
              <QuickActionButton onClick={() => handleQuickAction('Fund project escrow')}>
                Fund project escrow
              </QuickActionButton>
            </QuickActions>
          )}
        </ChatArea>

        <InputArea>
          <InputWrapper>
            <Input
              placeholder="Ask Avalanche AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <SendButton onClick={handleSend} disabled={!input.trim()}>
              <Send size={16} />
            </SendButton>
          </InputWrapper>
        </InputArea>
      </Modal>
    </Overlay>
  );
};

export default AIAssistant;
