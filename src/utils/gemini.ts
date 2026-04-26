// Gemini API Configuration
export const GEMINI_API_KEY = 'AIzaSyC_kmLk9xPRxmM5ML-KXs-9QEbXLGJAWeA';

// Check if API key is available
export const isGeminiAvailable = () => {
  return GEMINI_API_KEY && GEMINI_API_KEY.length > 0;
};

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
}

// Gemini API for food allergen analysis
// Gemini API for chat assistance
export async function chatWithGemini(
  messages: Array<{ role: string; content: string }>,
  userProfile: { allergies: string[]; severity: { [key: string]: 'low' | 'medium' | 'high' }; dietType?: string }
) {
  // Check if API key is available
  if (!isGeminiAvailable()) {
    console.warn('Gemini API key not configured, using fallback response');
    return 'AI services are currently unavailable. Please configure your API key in the environment settings to enable AI assistance. You can still use the app for manual allergen tracking and search history.';
  }

  try {
    const systemMessage = {
      role: 'user',
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
      - Include practical, actionable advice
      
      Now respond to this user message: ${messages[messages.length - 1]?.content || ''}`
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: systemMessage.content
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Gemini chat API request failed');
    }

    const data: GeminiResponse = await response.json();
    
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not process your request.';
  } catch (error) {
    console.error('Gemini chat error:', error);
    throw error;
  }
}

export async function analyzeFoodWithGemini(
  text: string, 
  userProfile: { allergies: string[]; severity: { [key: string]: 'low' | 'medium' | 'high' } }
) {
  // Check if API key is available
  if (!isGeminiAvailable()) {
    console.warn('Gemini API key not configured, using fallback analysis');
    return analyzeFoodTextFallback(text, userProfile);
  }

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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1000,
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Gemini API request failed');
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('No response from Gemini API');
    }

    // Parse the JSON response from Gemini
    const aiResponse = JSON.parse(data.candidates[0].content.parts[0].text);
    
    return {
      food: text.split(',')[0] || 'Analyzed food',
      allergens: aiResponse.detected_allergens || [],
      riskLevel: aiResponse.risk_level || 'low',
      explanation: aiResponse.explanation || 'AI analysis completed',
      safeAlternatives: aiResponse.safe_alternatives || [],
      ingredients: aiResponse.ingredients || text.split(',').map(i => i.trim()),
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    // Fallback to mock analysis if API fails
    return analyzeFoodTextFallback(text, userProfile);
  }
}

// Fallback function for when Gemini API is unavailable
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
