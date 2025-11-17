import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '../../stitches.config';
import { Sparkles, Send, Minus, X, Mic, Volume2, Maximize2, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import API from '../../services/api';
import { trackAIChatQuery } from '../../utils/aiTracking';

const ChatContainer = styled('div', {
  position: 'fixed',
  zIndex: 1000,
  transition: 'all 0.3s ease',
  
  variants: {
    isOpen: {
      true: {},
      false: {
        bottom: '24px',
        right: '24px',
        width: '60px',
        height: '60px',
      },
    },
    size: {
      small: {
        width: '400px',
        height: '500px',
        bottom: '24px',
        right: '24px',
        '@media (max-width: 768px)': {
          width: '100%',
          height: '100%',
          bottom: 0,
          right: 0,
        },
      },
      medium: {
        width: '600px',
        height: '700px',
        bottom: '24px',
        right: '24px',
        '@media (max-width: 768px)': {
          width: '100%',
          height: '100%',
          bottom: 0,
          right: 0,
        },
      },
      large: {
        width: '800px',
        height: '85vh',
        bottom: '24px',
        right: '24px',
        '@media (max-width: 1024px)': {
          width: '100%',
          height: '100%',
          bottom: 0,
          right: 0,
        },
      },
      fullscreen: {
        width: '100vw',
        height: '100vh',
        bottom: 0,
        right: 0,
        top: 0,
        left: 0,
      },
    },
  },
});

const ChatWindow = styled('div', {
  width: '100%',
  height: '100%',
  backgroundColor: 'var(--bg-primary)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  
  variants: {
    size: {
      small: {
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        border: '1px solid var(--border-color)',
      },
      medium: {
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        border: '1px solid var(--border-color)',
      },
      large: {
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        border: '1px solid var(--border-color)',
      },
      fullscreen: {
        borderRadius: 0,
        boxShadow: 'none',
        border: 'none',
      },
    },
  },
});

const ChatHeader = styled('div', {
  padding: '20px',
  background: 'var(--card-bg)',
  borderBottom: '1px solid var(--border-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const HeaderLeft = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const AIAvatar = styled('div', {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  animation: 'glow 2s infinite',
  
  '@keyframes glow': {
    '0%, 100%': {
      boxShadow: '0 0 10px rgba(102, 126, 234, 0.5)',
    },
    '50%': {
      boxShadow: '0 0 20px rgba(102, 126, 234, 1)',
    },
  },
});

const HeaderInfo = styled('div', {
  h3: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  
  p: {
    margin: 0,
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
});

const HeaderActions = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const SizeSelector = styled('select', {
  padding: '6px 12px',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  fontSize: '13px',
  cursor: 'pointer',
  outline: 'none',
  transition: 'all 0.2s',
  
  '&:hover': {
    backgroundColor: 'var(--bg-tertiary)',
    borderColor: 'var(--primary-color)',
  },
  
  '&:focus': {
    borderColor: 'var(--primary-color)',
  },
  
  option: {
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
  },
});

const IconButton = styled('button', {
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: 'transparent',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',
  
  '&:hover': {
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--primary-color)',
  },
});

const ChatMessages = styled('div', {
  flex: 1,
  overflowY: 'auto',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  backgroundColor: 'var(--bg-primary)',
  
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  
  '&::-webkit-scrollbar-track': {
    background: 'var(--bg-secondary)',
  },
  
  '&::-webkit-scrollbar-thumb': {
    background: 'var(--primary-color)',
    borderRadius: '3px',
    opacity: 0.5,
  },
});

const Message = styled('div', {
  display: 'flex',
  gap: '12px',
  
  variants: {
    sender: {
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
  borderRadius: '50%',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  
  variants: {
    type: {
      ai: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      },
      user: {
        backgroundColor: '#3b82f6',
        color: 'white',
        fontSize: '14px',
        fontWeight: '600',
      },
    },
  },
});

const MessageBubble = styled('div', {
  maxWidth: '75%',
  padding: '12px 16px',
  borderRadius: '16px',
  fontSize: '14px',
  lineHeight: '1.5',

  variants: {
    sender: {
      ai: {
        backgroundColor: 'var(--card-bg)',
        color: 'var(--text-primary)',
        borderTopLeftRadius: '4px',
        border: '1px solid var(--border-color)',
      },
      user: {
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        borderTopRightRadius: '4px',
      },
    },
  },
});

const DeepLinksContainer = styled('div', {
  marginTop: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const DeepLinkButton = styled('a', {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 16px',
  borderRadius: '12px',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  fontSize: '13px',
  fontWeight: '500',
  textDecoration: 'none',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s',

  '&:hover': {
    backgroundColor: 'var(--primary-hover)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  },

  '&:active': {
    transform: 'translateY(0)',
  },

  '&::before': {
    content: '"sneaker://"',
    fontSize: '11px',
    opacity: 0.8,
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
});

const MessageLabel = styled('div', {
  fontSize: '11px',
  fontWeight: '600',
  color: 'var(--text-secondary)',
  marginBottom: '4px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
});

const QuickActions = styled('div', {
  padding: '0 20px 16px',
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
});

const QuickActionButton = styled('button', {
  padding: '8px 16px',
  borderRadius: '20px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'transparent',
  color: 'var(--text-primary)',
  fontSize: '13px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  
  '&:hover': {
    backgroundColor: 'var(--primary-color)',
    borderColor: 'var(--primary-color)',
    color: 'white',
  },
});

const ChatInput = styled('div', {
  padding: '20px',
  borderTop: '1px solid var(--border-color)',
  backgroundColor: 'var(--card-bg)',
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
});

const InputField = styled('input', {
  flex: 1,
  padding: '12px 16px',
  borderRadius: '24px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  fontSize: '14px',
  outline: 'none',
  transition: 'all 0.2s',
  
  '&::placeholder': {
    color: 'var(--text-secondary)',
  },
  
  '&:focus': {
    borderColor: 'var(--primary-color)',
    backgroundColor: 'var(--bg-tertiary)',
  },
});

const SendButton = styled('button', {
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  border: 'none',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',
  
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
  },
  
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none',
  },
});

const MicButton = styled('button', {
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  border: '1px solid var(--border-color)',
  backgroundColor: 'transparent',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',
  
  '&:hover': {
    backgroundColor: 'var(--bg-tertiary)',
    borderColor: 'var(--primary-color)',
  },
  
  variants: {
    isRecording: {
      true: {
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
        color: 'white',
        animation: 'recordPulse 1s infinite',
        
        '@keyframes recordPulse': {
          '0%, 100%': {
            transform: 'scale(1)',
          },
          '50%': {
            transform: 'scale(1.1)',
          },
        },
      },
    },
  },
});

interface DeepLink {
  link: string;
  type: string;
  id?: number;
  label: string;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
  intent?: string;
  suggestions?: string[];
  links?: DeepLink[];
}

type ChatSize = 'small' | 'medium' | 'large' | 'fullscreen';

interface AIChatInterfaceProps {
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

const AIChatInterface: React.FC<AIChatInterfaceProps> = ({ isOpen: externalIsOpen, onToggle }) => {
  const navigate = useNavigate();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const [chatSize, setChatSize] = useState<ChatSize>('medium');
  const { theme, toggleTheme } = useTheme();

  const toggleOpen = (newState: boolean) => {
    if (onToggle) {
      onToggle(newState);
    } else {
      setInternalIsOpen(newState);
    }
  };

  // Handle deep link navigation
  const handleDeepLink = (link: string) => {
    // Parse sneaker:// protocol
    if (link.startsWith('sneaker://')) {
      const path = link.replace('sneaker://', '');

      // Navigate to the appropriate route
      navigate(`/${path}`);

      // Optionally close the chat after navigation
      // toggleOpen(false);
    }
  };
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hello! I'm your AI Assistant. How can I help you today? You can ask me to find a collaborator, summarize guild activity, or suggest items to sell.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');

    // Track AI chat query for analytics
    trackAIChatQuery(currentInput, {
      conversation_length: messages.length,
      timestamp: new Date().toISOString(),
    });

    try {
      // Build conversation history for API
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'ai' ? 'assistant' : 'user',
        content: msg.text,
      }));

      // Call the real AI backend API
      const response = await API.ai.chat({
        message: currentInput,
        conversation_history: conversationHistory,
      });

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.ai_response || response.response || 'No response received',
        timestamp: new Date(),
        intent: response.intent,
        suggestions: response.suggestions,
        links: response.links || [],
      };

      setMessages((prev) => [...prev, aiResponse]);

      // Optionally speak the response
      // speak(aiResponse.text);
    } catch (error) {
      console.error('Error chatting with AI:', error);

      // Fallback error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleQuickAction = async (action: string) => {
    console.log('🎯 Quick action clicked:', action);

    // Directly send the action without setting input value first
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: action,
      timestamp: new Date(),
    };

    console.log('📤 Adding user message:', userMessage);
    setMessages((prev) => {
      const newMessages = [...prev, userMessage];
      console.log('📝 Messages after user:', newMessages);
      return newMessages;
    });

    try {
      // Build conversation history for API
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'ai' ? 'assistant' : 'user',
        content: msg.text,
      }));

      console.log('📡 Sending to API:', action);

      // Call the real AI backend API
      const response = await API.ai.chat({
        message: action,
        conversation_history: conversationHistory,
      });

      console.log('✅ Received response:', response);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.ai_response || response.response || 'No response received',
        timestamp: new Date(),
        intent: response.intent,
        suggestions: response.suggestions,
        links: response.links || [],
      };

      console.log('📥 Adding AI response:', aiResponse);
      setMessages((prev) => {
        const newMessages = [...prev, aiResponse];
        console.log('📝 Messages after AI:', newMessages);
        return newMessages;
      });
    } catch (error) {
      console.error('❌ Error chatting with AI:', error);

      // Fallback error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <ChatContainer isOpen={true} size={chatSize}>
      <ChatWindow size={chatSize}>
        <ChatHeader>
          <HeaderLeft>
            <AIAvatar>
              <Sparkles size={20} />
            </AIAvatar>
            <HeaderInfo>
              <h3>Avalanche AI</h3>
              <p>Your personal assistant</p>
            </HeaderInfo>
          </HeaderLeft>
          <HeaderActions>
            <SizeSelector 
              value={chatSize} 
              onChange={(e) => setChatSize(e.target.value as ChatSize)}
              title="Chat size"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="fullscreen">Full Screen</option>
            </SizeSelector>
            {isSpeaking && (
              <IconButton onClick={stopSpeaking} title="Stop speaking">
                <Volume2 size={18} />
              </IconButton>
            )}
            <IconButton onClick={toggleTheme} title="Toggle theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </IconButton>
            <IconButton onClick={() => toggleOpen(false)} title="Minimize">
              <Minus size={18} />
            </IconButton>
            <IconButton onClick={() => toggleOpen(false)} title="Close">
              <X size={18} />
            </IconButton>
          </HeaderActions>
        </ChatHeader>

        <ChatMessages>
          {messages.map((message) => (
            <Message key={message.id} sender={message.sender}>
              <MessageAvatar type={message.sender}>
                {message.sender === 'ai' ? (
                  <Sparkles size={16} />
                ) : (
                  'U'
                )}
              </MessageAvatar>
              <div style={{ maxWidth: '75%' }}>
                <MessageLabel>
                  {message.sender === 'ai' ? 'Avalanche AI' : 'User'}
                </MessageLabel>
                <MessageBubble sender={message.sender}>
                  {message.text}
                </MessageBubble>
                {message.links && message.links.length > 0 && (
                  <DeepLinksContainer>
                    {message.links.map((link, index) => (
                      <DeepLinkButton
                        key={index}
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeepLink(link.link);
                        }}
                        href="#"
                        title={link.link}
                      >
                        {link.label}
                      </DeepLinkButton>
                    ))}
                  </DeepLinksContainer>
                )}
              </div>
            </Message>
          ))}
          <div ref={messagesEndRef} />
        </ChatMessages>

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
        </QuickActions>

        <ChatInput>
          <MicButton 
            onClick={toggleRecording} 
            isRecording={isRecording}
            title={isRecording ? 'Stop recording' : 'Start voice input'}
          >
            <Mic size={20} />
          </MicButton>
          <InputField
            type="text"
            placeholder="Ask Avalanche AI..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <SendButton 
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            title="Send message"
          >
            <Send size={20} />
          </SendButton>
        </ChatInput>
      </ChatWindow>
    </ChatContainer>
  );
};

export default AIChatInterface;
