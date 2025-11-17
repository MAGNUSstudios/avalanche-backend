// User types
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  role: 'user' | 'vendor' | 'admin';
  level?: number;
  createdAt: string;
}

// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: ProductCategory;
  seller: Seller;
  inStock: boolean;
  rating?: number;
  reviews?: number;
}

export type ProductCategory =
  | 'all'
  | 'electronics'
  | 'fashion'
  | 'home-goods'
  | 'gaming';

export interface Seller {
  id: string;
  name: string;
  avatar?: string;
  rating?: number;
}

// Guild types
export interface Guild {
  id: string;
  name: string;
  description: string;
  image: string;
  members: number;
  currentProject?: string;
  progress?: number;
}

// Task types
export interface Task {
  id: string;
  title: string;
  description: string;
  guildId: string;
  guildName: string;
  dueDate: string;
  assignees?: User[];
  status: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
}

// Payment types
export interface PaymentMethod {
  type: 'card' | 'bank_transfer' | 'avalanche_crypto';
  label: string;
  description?: string;
}

export interface OrderSummary {
  itemName: string;
  itemCost: number;
  serviceFee: number;
  total: number;
  seller?: Seller;
  escrowProtected: boolean;
}

export interface CardDetails {
  cardNumber: string;
  expiryDate: string;
  cvc: string;
}

// AI Assistant types
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AITranscript {
  id: string;
  sessionId: string;
  messages: AIMessage[];
  startTime: string;
  endTime?: string;
}

// Community types
export interface TrendingTopic {
  hashtag: string;
  posts: number;
}

export interface SuggestedConnection {
  user: User;
  role: string;
}

export interface PlatformStats {
  activeUsers: string;
  newProjects: string;
  guilds: string;
  itemsSold: string;
}
