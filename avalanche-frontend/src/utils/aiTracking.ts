/**
 * AI Interaction Tracking Utility
 * Tracks AI interactions for analytics
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export type InteractionType = 'assistant' | 'recommendation' | 'suggestion' | 'verification';
export type Feature = 'product_recommendation' | 'chatbot' | 'project_suggestion' | 'fraud_detection' | 'ai_chat';
export type Action = 'query' | 'click' | 'view' | 'accept' | 'reject';

interface TrackAIOptions {
  interactionType: InteractionType;
  feature: Feature;
  action: Action;
  metadata?: Record<string, any>;
}

/**
 * Track an AI interaction for analytics
 */
export const trackAIInteraction = async (options: TrackAIOptions): Promise<void> => {
  try {
    const token = localStorage.getItem('avalanche_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    await fetch(`${API_BASE_URL}/ai/track`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        interaction_type: options.interactionType,
        feature: options.feature,
        action: options.action,
        metadata: options.metadata || {},
      }),
    });

    // Silent tracking - don't throw errors to not disrupt user experience
  } catch (error) {
    console.warn('Failed to track AI interaction:', error);
  }
};

/**
 * Track AI chat message
 */
export const trackAIChatQuery = (message: string, metadata?: Record<string, any>) => {
  return trackAIInteraction({
    interactionType: 'assistant',
    feature: 'ai_chat',
    action: 'query',
    metadata: { message_length: message.length, ...metadata },
  });
};

/**
 * Track product recommendation view
 */
export const trackRecommendationView = (productId: number | string, metadata?: Record<string, any>) => {
  return trackAIInteraction({
    interactionType: 'recommendation',
    feature: 'product_recommendation',
    action: 'view',
    metadata: { product_id: productId, ...metadata },
  });
};

/**
 * Track product recommendation click
 */
export const trackRecommendationClick = (productId: number | string, metadata?: Record<string, any>) => {
  return trackAIInteraction({
    interactionType: 'recommendation',
    feature: 'product_recommendation',
    action: 'click',
    metadata: { product_id: productId, ...metadata },
  });
};

/**
 * Track project suggestion view
 */
export const trackProjectSuggestionView = (projectId: number | string, metadata?: Record<string, any>) => {
  return trackAIInteraction({
    interactionType: 'suggestion',
    feature: 'project_suggestion',
    action: 'view',
    metadata: { project_id: projectId, ...metadata },
  });
};

/**
 * Track project suggestion acceptance
 */
export const trackProjectSuggestionAccept = (projectId: number | string, metadata?: Record<string, any>) => {
  return trackAIInteraction({
    interactionType: 'suggestion',
    feature: 'project_suggestion',
    action: 'accept',
    metadata: { project_id: projectId, ...metadata },
  });
};

/**
 * Track chatbot usage
 */
export const trackChatbotQuery = (query: string, metadata?: Record<string, any>) => {
  return trackAIInteraction({
    interactionType: 'assistant',
    feature: 'chatbot',
    action: 'query',
    metadata: { query_length: query.length, ...metadata },
  });
};
