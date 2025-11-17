# Avalanche Frontend

An AI-powered web and mobile platform that merges commerce, collaboration, and creativity into one intelligent ecosystem.

**"Shop. Create. Collaborate — Intelligently."**

## Overview

Avalanche is a comprehensive platform built for freelancers, communities, and local businesses. Users can:
- Buy and sell goods through an intelligent marketplace
- Collaborate in project-based guilds
- Discover relevant ideas and tasks through the AI Google Box
- Make secure payments with multi-method support and escrow protection

## Tech Stack

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Stitches (CSS-in-JS)
- **Routing**: React Router v7
- **Icons**: Lucide React
- **Backend**: FastAPI (Python) - separate repository
- **Database**: Qdrant + Supabase
- **AI**: LangChain + OpenAI (GPT, Whisper)
- **Payments**: Paystack, Flutterwave, Avalanche Crypto
- **Hosting**: Vercel (frontend) + Render (backend)

## Project Structure

```
avalanche-frontend/
├── src/
│   ├── assets/           # Images, fonts, static files
│   ├── components/       # React components
│   │   ├── common/       # Reusable UI components (buttons, cards, etc.)
│   │   ├── layout/       # Layout components (Header, Footer, Sidebar)
│   │   ├── marketplace/  # Marketplace-specific components
│   │   ├── payment/      # Payment and checkout components
│   │   ├── dashboard/    # Dashboard components
│   │   ├── guilds/       # Guild and collaboration components
│   │   └── ai/           # AI assistant components
│   ├── config/           # Configuration files
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── services/         # API services and utilities
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Helper functions
│   ├── App.tsx           # Main app component with routing
│   ├── main.tsx          # Entry point
│   ├── index.css         # Global styles
│   └── stitches.config.ts # Stitches configuration
├── public/               # Public static files
├── .env                  # Environment variables (not committed)
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd avalanche-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your API keys and configuration:
- Supabase URL and keys
- OpenAI API key
- Payment provider keys (Paystack, Flutterwave)
- Avalanche blockchain configuration

4. Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Core Features

### 1. AI Google Box
Conversational, voice-enabled AI assistant with semantic search and task automation powered by LangChain and OpenAI.

### 2. Community Marketplace
Smart product discovery based on budget and preferences with AI-powered recommendations.

### 3. Guild Hub
A collaboration system for creative or tech teams to work on projects together.

### 4. Payment & Escrow
Multi-method payment protection with Paystack, Flutterwave, and Avalanche crypto support.

### 5. AI Transcripts
Automatic speech-to-text logs for chats, calls, or meetings.

### 6. User Dashboard
Central control for tasks, purchases, guild management, and analytics.

### 7. Community Feed
Public updates and idea-sharing space for community engagement.

## Pages

- `/` - Landing page
- `/marketplace` - Product marketplace with AI-powered search
- `/guilds` - Browse and join guilds
- `/projects` - Collaborative projects
- `/dashboard` - User dashboard
- `/checkout` - Secure checkout with escrow

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow React functional component patterns
- Use Stitches for component-specific styling
- Use Tailwind for utility-based styling
- Keep components small and focused
- Write meaningful commit messages

### Component Structure

```tsx
import React from 'react';
import { styled } from '../../stitches.config';

const StyledComponent = styled('div', {
  // Stitches styles here
});

interface ComponentProps {
  // Props definition
}

const Component: React.FC<ComponentProps> = ({ ...props }) => {
  return (
    <StyledComponent>
      {/* Component content */}
    </StyledComponent>
  );
};

export default Component;
```

### State Management

- Use React hooks (useState, useEffect, useContext) for local state
- Consider adding Redux or Zustand for global state (future enhancement)

### API Integration

- All API calls should be placed in the `src/services/` directory
- Use async/await for asynchronous operations
- Implement proper error handling

## Environment Variables

See `.env.example` for all available environment variables. Key variables:

- `VITE_API_BASE_URL` - Backend API URL
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_OPENAI_API_KEY` - OpenAI API key for AI features
- `VITE_PAYSTACK_PUBLIC_KEY` - Paystack public key
- `VITE_FLUTTERWAVE_PUBLIC_KEY` - Flutterwave public key

## Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Write/update tests if applicable
4. Submit a pull request

## Development Roadmap

**Phase 1 (2 months)**: Build AI Box, Marketplace, and Qdrant setup
**Phase 2 (1 month)**: Integrate Payments and Escrow backend
**Phase 3 (1 month)**: Guilds + Idea Hub development
**Phase 4 (1 month)**: Add Voice and Transcript features
**Phase 5 (Launch)**: Go live in Nigeria, expand regionally

## License

© 2024 Avalanche by MAGNUS Studios. All rights reserved.

## Support

For help and support, visit:
- Documentation: [Coming soon]
- Issues: [GitHub Issues]
- Email: support@avalanche.app
