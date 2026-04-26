// Grok API Configuration
export const GROK_API_KEY = import.meta.env.VITE_GROK_API_KEY || '';

export interface GrokResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GrokRequest {
  messages: Array<{
    role: string;
    content: string;
  }>;
  model: string;
  temperature: number;
  max_tokens: number;
}

// Grok API for food allergen analysis
export async function analyzeFoodWithGrok(
  text: string, 
  userProfile: { allergies: string[]; severity: { [key: string]: 'low' | 'medium' | 'high' } }
) {
  try {
    const prompt = `
      Analyze the following food ingredients or text for potential allergens and safety concerns.
      
      User's known allergies: ${userProfile.allergies.join(', ')}
      User's allergy severity levels: ${JSON.stringify(userProfile.severity)}
      
      Food/Ingredients to analyze: ${text}
      
      Please provide:
      1. A list of detected allergens from this list: peanuts, tree nuts, milk, eggs, fish, shellfish, soy, wheat, sesame
      2. Risk level assessment (low, medium, high) based on the user's allergy profile
      3. Safety explanation
      4. Safe alternatives if needed
      5. List of all ingredients found
      
      Format your response as JSON with this structure:
      {
        "detected_allergens": ["allergen1", "allergen2"],
        "risk_level": "low|medium|high", 
        "explanation": "detailed safety explanation",
        "safe_alternatives": ["alternative1", "alternative2"],
        "ingredients": ["ingredient1", "ingredient2", "ingredient3"]
      }
    `;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'grok-beta',
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error('Grok API request failed');
    }

    const data: GrokResponse = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('No response from Grok API');
    }

    // Parse the JSON response from Grok
    const aiResponse = JSON.parse(data.choices[0].message.content);
    
    return {
      food: text.split(',')[0] || 'Analyzed food',
      allergens: aiResponse.detected_allergens || [],
      riskLevel: aiResponse.risk_level || 'low',
      explanation: aiResponse.explanation || 'AI analysis completed',
      safeAlternatives: aiResponse.safe_alternatives || [],
      ingredients: aiResponse.ingredients || text.split(',').map(i => i.trim()),
    };
  } catch (error) {
    console.error('Grok API error:', error);
    
    // Check for specific credit/license errors
    if (error instanceof Error && (error.message.includes('credits') || error.message.includes('licenses'))) {
      console.warn('Grok API: Credits or licenses required - falling back to Gemini');
      throw new Error('GROK_CREDITS_REQUIRED');
    }
    
    // Fallback to mock analysis if API fails
    return analyzeFoodTextFallback(text, userProfile);
  }
}

// Grok API for chat assistance
export async function chatWithGrok(
  messages: Array<{ role: string; content: string }>,
  userProfile: { allergies: string[]; severity: { [key: string]: 'low' | 'medium' | 'high' }; dietType?: string }
) {
  try {
    const systemMessage = {
      role: 'system',
      content: `You are AllerGuard AI, a compassionate and knowledgeable food safety assistant.
      
      User Profile:
      - Allergies: ${userProfile.allergies.join(', ') || 'None set'}
      - Severity: ${JSON.stringify(userProfile.severity)}
      - Diet: ${userProfile.dietType || 'Not specified'}
      
      Your role:
      1. Provide accurate, helpful food safety information
      2. Suggest safe alternatives when needed
      3. Be empathetic to allergy concerns
      4. Always prioritize user safety
      5. Recommend consulting healthcare providers for medical decisions
      6. When suggesting restaurants or foods, consider cross-contamination risks
      
      Guidelines:
      - Be concise but thorough
      - Use bullet points for clarity
      - Always mention when to verify with staff/labels
      - Include practical, actionable advice`
    };

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [systemMessage, ...messages],
        model: 'grok-beta',
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error('Grok API request failed');
    }

    const data: GrokResponse = await response.json();
    
    return data.choices[0]?.message?.content || 'Sorry, I could not process your request.';
  } catch (error) {
    console.error('Grok chat error:', error);
    throw error;
  }
}

// Fallback function for when Grok API is unavailable
function analyzeFoodTextFallback(text: string, userProfile: { allergies: string[]; severity: { [key: string]: 'low' | 'medium' | 'high' } }) {
  const commonAllergens = [
    'peanuts', 'tree nuts', 'milk', 'eggs', 'fish', 'shellfish', 'soy', 'wheat', 'sesame'
  ];

  const textLower = text.toLowerCase();
  const detectedAllergens: string[] = [];

  commonAllergens.forEach((allergen) => {
    if (textLower.includes(allergen) || textLower.includes(allergen.slice(0, -1))) {
      detectedAllergens.push(allergen);
    }
  });

  // Check against user allergies
  const userAllergyMatches = userProfile.allergies.filter((allergy) =>
    detectedAllergens.some((detected) => detected.includes(allergy.toLowerCase()))
  );

  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (userAllergyMatches.length > 0) {
    const hasSevere = userAllergyMatches.some(
      (allergy) => userProfile.severity[allergy] === 'high'
    );
    riskLevel = hasSevere ? 'high' : userAllergyMatches.length > 1 ? 'medium' : 'medium';
  } else if (detectedAllergens.length > 0) {
    riskLevel = 'low';
  }

  const safeAlternatives =
    riskLevel !== 'low'
      ? ['Allergen-free brands available', 'Check store for alternatives', 'Homemade options']
      : undefined;

  return {
    food: text.split(',')[0] || 'Analyzed food',
    allergens: detectedAllergens,
    riskLevel,
    explanation:
      userAllergyMatches.length > 0
        ? `⚠️ Contains ${userAllergyMatches.join(', ')} which you are allergic to.`
        : detectedAllergens.length > 0
        ? `Contains ${detectedAllergens.join(', ')} but no match with your allergy profile.`
        : '✓ No common allergens detected in this food.',
    safeAlternatives,
    ingredients: text.split(',').map((i) => i.trim()),
  };
}
