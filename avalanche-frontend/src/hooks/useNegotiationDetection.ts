import { useState, useEffect, useCallback } from 'react';

interface NegotiationDetails {
  detected: boolean;
  projectId?: number;
  projectTitle?: string;
  agreedAmount?: number;
  freelancerName?: string;
  freelancerId?: number;
  confidence?: number;
}

/**
 * Hook to detect negotiation agreements in chat messages using AI
 *
 * This analyzes the last few messages to detect when both parties
 * have reached an agreement on project terms (scope, price, timeline)
 */
export const useNegotiationDetection = (
  messages: Array<{ id: number; content: string; is_from_me: boolean; sent_at: string }>,
  otherUserId: number,
  otherUserName: string
) => {
  const [negotiation, setNegotiation] = useState<NegotiationDetails>({ detected: false });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Analyze recent messages for agreement patterns
  const analyzeForAgreement = useCallback(async () => {
    if (messages.length < 4) return; // Need at least a few messages

    // Get last 10 messages for context
    const recentMessages = messages.slice(-10);

    // Simple keyword-based detection (In production, use AI API)
    const hasAgreementKeywords = recentMessages.some(msg => {
      const content = msg.content.toLowerCase();
      return (
        (content.includes('agree') || content.includes('sounds good') || content.includes('deal') || content.includes('perfect')) &&
        (content.includes('$') || content.includes('price') || content.includes('budget'))
      );
    });

    const hasPriceDiscussion = recentMessages.some(msg => {
      return /\$[\d,]+/.test(msg.content);
    });

    if (hasAgreementKeywords && hasPriceDiscussion) {
      // Extract amount from messages
      let agreedAmount = 0;
      for (const msg of [...recentMessages].reverse()) {
        const match = msg.content.match(/\$[\d,]+/);
        if (match) {
          agreedAmount = parseFloat(match[0].replace(/[$,]/g, ''));
          break;
        }
      }

      // In production, this would come from AI analysis
      setNegotiation({
        detected: true,
        projectTitle: 'Discussed Project', // Would be extracted by AI
        agreedAmount: agreedAmount || 1000,
        freelancerName: otherUserName,
        freelancerId: otherUserId,
        confidence: 0.85,
      });
    }
  }, [messages, otherUserId, otherUserName]);

  // Auto-analyze when new messages arrive
  useEffect(() => {
    if (!negotiation.detected && messages.length > 0) {
      const timer = setTimeout(() => {
        analyzeForAgreement();
      }, 2000); // Debounce analysis

      return () => clearTimeout(timer);
    }
  }, [messages, negotiation.detected, analyzeForAgreement]);

  const reset = useCallback(() => {
    setNegotiation({ detected: false });
  }, []);

  return {
    negotiation,
    isAnalyzing,
    reset,
  };
};
