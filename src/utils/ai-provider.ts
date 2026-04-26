// AI Provider Manager - Switch between different AI services
import { analyzeFoodWithGemini, chatWithGemini } from './gemini';
import { analyzeFoodWithGrok, chatWithGrok } from './grok';
import { analyzeFoodWithGrokFree, chatWithGrokFree, analyzeImageWithGrokFree } from './grok-free';

export type AIProvider = 'gemini' | 'grok' | 'grok-free' | 'openai';

export interface UserProfile {
  allergies: string[];
  severity: { [key: string]: 'low' | 'medium' | 'high' };
  dietType?: string;
}

export interface FoodAnalysisResult {
  food: string;
  allergens: string[];
  riskLevel: 'low' | 'medium' | 'high';
  explanation: string;
  safeAlternatives?: string[];
  ingredients: string[];
}

// Food analysis with provider selection
export async function analyzeFood(
  text: string,
  userProfile: UserProfile,
  provider: AIProvider = 'gemini'
): Promise<FoodAnalysisResult> {
  try {
    switch (provider) {
      case 'gemini':
        return await analyzeFoodWithGemini(text, userProfile);
      case 'grok':
        return await analyzeFoodWithGrok(text, userProfile);
      case 'grok-free':
        return await analyzeFoodWithGrokFree(text, userProfile);
      case 'openai':
        // You can add OpenAI integration here later
        throw new Error('OpenAI not yet implemented');
      default:
        return await analyzeFoodWithGemini(text, userProfile);
    }
  } catch (error) {
    // If Grok fails due to credits, fallback to Grok Free
    if (provider === 'grok' && error instanceof Error && error.message === 'GROK_CREDITS_REQUIRED') {
      console.warn('Falling back to Grok Free due to Grok credit requirements');
      return await analyzeFoodWithGrokFree(text, userProfile);
    }
    // If any provider fails, fallback to Grok Free
    console.warn('Falling back to Grok Free due to error:', error instanceof Error ? error.message : 'Unknown error');
    return await analyzeFoodWithGrokFree(text, userProfile);
  }
}

// Image analysis with provider selection
export async function analyzeImage(
  base64Image: string,
  mimeType: string,
  userProfile: UserProfile,
  provider: AIProvider = 'grok-free'
): Promise<FoodAnalysisResult> {
  try {
    switch (provider) {
      case 'gemini':
        // Add Gemini image analysis here if needed
        throw new Error('Gemini image analysis not yet implemented');
      case 'grok':
        // Add Grok image analysis here if needed
        throw new Error('Grok image analysis not yet implemented');
      case 'grok-free':
        return await analyzeImageWithGrokFree(base64Image, mimeType, userProfile);
      case 'openai':
        // Add OpenAI image analysis here later
        throw new Error('OpenAI image analysis not yet implemented');
      default:
        return await analyzeImageWithGrokFree(base64Image, mimeType, userProfile);
    }
  } catch (error) {
    // If any provider fails, fallback to Grok Free
    console.warn('Falling back to Grok Free for image analysis due to error:', error instanceof Error ? error.message : 'Unknown error');
    return await analyzeImageWithGrokFree(base64Image, mimeType, userProfile);
  }
}

// Chat functionality with provider selection
export async function chatWithAI(
  messages: Array<{ role: string; content: string }>,
  userProfile: UserProfile,
  provider: AIProvider = 'gemini'
): Promise<string> {
  switch (provider) {
    case 'gemini':
      return await chatWithGemini(messages, userProfile);
    case 'grok':
      return await chatWithGrok(messages, userProfile);
    case 'grok-free':
      return await chatWithGrokFree(messages, userProfile);
    case 'openai':
      // Add OpenAI chat implementation here later
      throw new Error('OpenAI chat not yet implemented');
    default:
      throw new Error('Chat not available for selected provider');
  }
}

// Provider configuration
export const AI_PROVIDERS = {
  gemini: {
    name: 'Google Gemini',
    description: 'Fast AI (20 requests/day limit)',
    features: ['Food analysis', 'OCR integration', 'Free tier limited'],
    status: 'limited'
  },
  grok: {
    name: 'xAI Grok',
    description: 'Advanced reasoning capabilities (requires API key)',
    features: ['Food analysis', 'Chat assistance', 'Real-time data'],
    status: 'available'
  },
  'grok-free': {
    name: 'Grok Free (Recommended)',
    description: 'Unlimited free access - no limits',
    features: ['Food analysis', 'Chat assistance', 'No API key needed', 'Unlimited requests'],
    status: 'available'
  },
  openai: {
    name: 'OpenAI GPT',
    description: 'Versatile and powerful AI',
    features: ['Food analysis', 'Chat assistance'],
    status: 'coming-soon'
  }
} as const;

// Get available providers
export function getAvailableProviders(): AIProvider[] {
  return Object.keys(AI_PROVIDERS).filter(
    provider => AI_PROVIDERS[provider as AIProvider].status === 'available' || AI_PROVIDERS[provider as AIProvider].status === 'limited'
  ) as AIProvider[];
}

// Provider validation
export function isProviderAvailable(provider: AIProvider): boolean {
  return AI_PROVIDERS[provider]?.status === 'available' || AI_PROVIDERS[provider]?.status === 'limited';
}
