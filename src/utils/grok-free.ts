// Free Grok API Integration via Puter.js
// This provides unlimited free access to Grok models

export interface GrokFreeResponse {
  message: {
    content: string;
    role: string;
  };
  done: boolean;
}

export interface UserProfile {
  allergies: string[];
  severity: { [key: string]: 'low' | 'medium' | 'high' };
  dietType?: string;
}

// Load Puter.js dynamically
declare global {
  interface Window {
    puter: any;
  }
}

// Initialize Puter.js if not already loaded
async function ensurePuterLoaded(): Promise<void> {
  if (window.puter) {
    return; // Already loaded
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Puter.js'));
    document.head.appendChild(script);
  });
}

// Free Grok API for image analysis
export async function analyzeImageWithGrokFree(
  base64Image: string,
  mimeType: string,
  userProfile: UserProfile
) {
  try {
    await ensurePuterLoaded();

    const prompt = `
      Analyze this food image for ingredients and potential allergens.
      
      User's known allergies: ${userProfile.allergies.join(', ')}
      User's allergy severity levels: ${JSON.stringify(userProfile.severity)}
      
      Please extract all visible text/ingredients from this image and analyze for:
      1. Common allergens: peanuts, tree nuts, milk, eggs, fish, shellfish, soy, wheat, sesame
      2. Risk assessment based on user's allergy profile
      3. Safety explanation
      4. Safe alternatives if needed
      
      IMPORTANT: Return ONLY raw JSON. Do not use markdown or backticks. Keep explanations brief (under 100 characters). No extra text or explanations.
      Format: {"detected_allergens": ["allergen1", "allergen2"], "risk_level": "low|medium|high", "explanation": "brief safety explanation", "safe_alternatives": ["alternative1", "alternative2"], "ingredients": ["ingredient1", "ingredient2", "ingredient3"]}
    `;

    // Puter.js supports image analysis - we'll pass the image as a URL or base64
    const response = await window.puter.ai.chat([
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`
            }
          }
        ]
      }
    ], {
      model: 'x-ai/grok-4-1-fast'
    });

    // Parse the JSON response from Grok
    let aiResponse;
    try {
      aiResponse = JSON.parse(response.message.content);
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = response.message.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse AI response as JSON');
      }
    }
    
    return {
      food: 'Analyzed food from image',
      allergens: aiResponse.detected_allergens || [],
      riskLevel: aiResponse.risk_level || 'low',
      explanation: aiResponse.explanation || 'AI analysis completed',
      safeAlternatives: aiResponse.safe_alternatives || [],
      ingredients: aiResponse.ingredients || [],
    };
  } catch (error) {
    console.error('Free Grok image analysis error:', error);
    // Fallback to mock analysis if API fails
    return {
      food: 'Analyzed food from image',
      allergens: [],
      riskLevel: 'low',
      explanation: 'Image analysis failed - please try text input instead',
      safeAlternatives: ['Use text input for ingredient analysis'],
      ingredients: [],
    };
  }
}

// Free Grok API for food allergen analysis
export async function analyzeFoodWithGrokFree(
  text: string, 
  userProfile: UserProfile
) {
  try {
    await ensurePuterLoaded();

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

    const response = await window.puter.ai.chat(prompt, {
      model: 'x-ai/grok-4-1-fast'
    });

    // Parse the JSON response from Grok
    let aiResponse;
    try {
      aiResponse = JSON.parse(response.message.content);
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = response.message.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse AI response as JSON');
      }
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
    console.error('Free Grok API error:', error);
    // Fallback to mock analysis if API fails
    return analyzeFoodTextFallback(text, userProfile);
  }
}

// Free Grok API for chat assistance
export async function chatWithGrokFree(
  messages: Array<{ role: string; content: string }>,
  userProfile: UserProfile
) {
  try {
    await ensurePuterLoaded();

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

    // Convert messages to Puter.js format
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const fullPrompt = `${systemMessage.content}\n\nUser: ${lastUserMessage}\n\nAssistant:`;

    const response = await window.puter.ai.chat(fullPrompt, {
      model: 'x-ai/grok-4-1-fast'
    });
    
    return response.message.content;
  } catch (error) {
    console.error('Free Grok chat error:', error);
    throw error;
  }
}

// Fallback function for when free Grok API is unavailable
function analyzeFoodTextFallback(text: string, userProfile: UserProfile) {
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
