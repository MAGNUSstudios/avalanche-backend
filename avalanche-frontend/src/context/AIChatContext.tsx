import React from 'react';

export const AIChatContext = React.createContext<{
  isAIChatOpen: boolean;
  setIsAIChatOpen: (open: boolean) => void;
}>({
  isAIChatOpen: false,
  setIsAIChatOpen: () => {},
});
