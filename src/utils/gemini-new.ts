// Gemini API Configuration with 1.5 Flash model
export const GEMINI_API_KEY = (import.meta.env as any).VITE_GEMINI_API_KEY || '';

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

// Gemini API for food allergen analysis using 1.5 Flash model
export async function analyzeFoodWithGemini(
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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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

    // Parse the JSON response from Gemini with better error handling
    let aiResponse;
    try {
      aiResponse = JSON.parse(data.candidates[0].content.parts[0].text);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      // Fallback response if JSON parsing fails
      aiResponse = {
        detected_allergens: [],
        risk_level: 'low',
        explanation: 'AI analysis unavailable. Please check ingredients manually.',
        safe_alternatives: [],
        ingredients: text.split(',').map(i => i.trim()),
      };
    }
    
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
    return {
      food: text.split(',')[0] || 'Analyzed food',
      allergens: [],
      riskLevel: 'low',
      explanation: 'AI analysis unavailable. Please check ingredients manually.',
      safeAlternatives: [],
      ingredients: text.split(',').map((i) => i.trim()),
    };
  }
}
