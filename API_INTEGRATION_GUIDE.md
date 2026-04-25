# API Integration Guide 🔌

Step-by-step guide to integrate real APIs when you connect Supabase backend.

## 📋 Prerequisites

1. **Supabase Project Connected** (from Make settings)
2. **API Keys Obtained** from each service
3. **API Keys Added** to Supabase secrets

---

## 🔑 Step 1: Get API Keys

### OpenAI API
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up / Log in
3. Navigate to API Keys
4. Create new key
5. Copy key (starts with `sk-`)

**Cost**: ~$0.002 per request (GPT-4 Turbo)

### Google Gemini (Alternative to OpenAI)
1. Go to [ai.google.dev](https://ai.google.dev)
2. Get API key from Google AI Studio
3. Copy key

**Cost**: Free tier available, then pay-as-you-go

### Spoonacular API
1. Go to [spoonacular.com/food-api](https://spoonacular.com/food-api)
2. Sign up for free account
3. Get API key from dashboard
4. Free tier: 150 requests/day

**Cost**: Free tier → $0.004/request after

### Google Vision API
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project
3. Enable Cloud Vision API
4. Create credentials (API key)
5. Copy key

**Cost**: First 1000 requests/month free, then $1.50/1000

### Google Maps API
1. Same Google Cloud Console
2. Enable Maps JavaScript API
3. Enable Places API
4. Use same API key or create new

**Cost**: $0.017 per request (with free credits)

### UPC Database API (Barcode)
1. Go to [upcdatabase.com](https://upcdatabase.com)
2. Sign up for free
3. Get API key

**Alternative (Free)**: Use Open Food Facts (no key needed)

---

## 🗄️ Step 2: Add Secrets to Supabase

In Supabase dashboard → Settings → Edge Functions → Secrets:

```bash
OPENAI_API_KEY=sk-...
SPOONACULAR_API_KEY=...
GOOGLE_VISION_API_KEY=...
GOOGLE_MAPS_API_KEY=...
UPC_DATABASE_API_KEY=...
```

---

## 💻 Step 3: Create Supabase Edge Functions

### Create Function: `analyze-food`

```bash
# In your terminal
supabase functions new analyze-food
```

Edit `supabase/functions/analyze-food/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { OpenAI } from "https://esm.sh/openai@4.20.0"

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')!,
})

serve(async (req) => {
  try {
    const { ingredients, userProfile } = await req.json()
    
    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: \`You are a food safety AI assistant. 
          User allergies: \${userProfile.allergies.join(', ')}
          Analyze the following ingredients and identify ALL allergens.\`
        },
        {
          role: "user",
          content: \`Ingredients: \${ingredients}\`
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    })
    
    const aiResponse = completion.choices[0].message.content
    
    // Parse AI response and structure data
    const allergens = extractAllergens(aiResponse, userProfile)
    const riskLevel = calculateRisk(allergens, userProfile)
    
    return new Response(
      JSON.stringify({
        allergens,
        riskLevel,
        explanation: aiResponse,
        safeAlternatives: await getSafeAlternatives(ingredients, userProfile)
      }),
      { headers: { "Content-Type": "application/json" } }
    )
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})

function extractAllergens(aiResponse: string, userProfile: any) {
  // Parse AI response to extract allergen list
  const commonAllergens = [
    'peanuts', 'tree nuts', 'milk', 'eggs', 'fish', 
    'shellfish', 'soy', 'wheat', 'sesame'
  ]
  
  const detected = commonAllergens.filter(allergen => 
    aiResponse.toLowerCase().includes(allergen)
  )
  
  return detected
}

function calculateRisk(allergens: string[], userProfile: any) {
  const userMatches = allergens.filter(a => 
    userProfile.allergies.some((ua: string) => 
      a.toLowerCase().includes(ua.toLowerCase())
    )
  )
  
  if (userMatches.length === 0) return 'low'
  
  const hasSevere = userMatches.some(allergen => 
    userProfile.severity[allergen] === 'high'
  )
  
  return hasSevere ? 'high' : 'medium'
}

async function getSafeAlternatives(ingredients: string, userProfile: any) {
  // Use Spoonacular to find alternatives
  const apiKey = Deno.env.get('SPOONACULAR_API_KEY')
  
  const response = await fetch(
    \`https://api.spoonacular.com/recipes/complexSearch?excludeIngredients=\${userProfile.allergies.join(',')}&number=3&apiKey=\${apiKey}\`
  )
  
  const data = await response.json()
  return data.results.map((r: any) => r.title)
}
```

Deploy:
```bash
supabase functions deploy analyze-food
```

### Create Function: `ocr-processor`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const { imageBase64 } = await req.json()
    const apiKey = Deno.env.get('GOOGLE_VISION_API_KEY')
    
    const response = await fetch(
      \`https://vision.googleapis.com/v1/images:annotate?key=\${apiKey}\`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: imageBase64 },
            features: [{ type: 'TEXT_DETECTION' }]
          }]
        })
      }
    )
    
    const data = await response.json()
    const extractedText = data.responses[0]?.textAnnotations?.[0]?.description || ''
    
    return new Response(
      JSON.stringify({ text: extractedText }),
      { headers: { "Content-Type": "application/json" } }
    )
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
```

Deploy:
```bash
supabase functions deploy ocr-processor
```

### Create Function: `chat-assistant`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { OpenAI } from "https://esm.sh/openai@4.20.0"

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')!,
})

serve(async (req) => {
  try {
    const { messages, userProfile } = await req.json()
    
    const systemMessage = {
      role: "system" as const,
      content: \`You are AllerGuard AI, a compassionate and knowledgeable food safety assistant.
      
      User Profile:
      - Allergies: \${userProfile.allergies.join(', ') || 'None set'}
      - Severity: \${JSON.stringify(userProfile.severity)}
      - Diet: \${userProfile.dietType || 'Not specified'}
      
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
      - Include practical, actionable advice\`
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 800
    })
    
    return new Response(
      JSON.stringify({
        message: completion.choices[0].message.content
      }),
      { headers: { "Content-Type": "application/json" } }
    )
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
```

Deploy:
```bash
supabase functions deploy chat-assistant
```

---

## 🔗 Step 4: Update Frontend to Call Functions

Create `src/utils/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function analyzeFood(ingredients: string, userProfile: any) {
  const { data, error } = await supabase.functions.invoke('analyze-food', {
    body: { ingredients, userProfile }
  })
  
  if (error) throw error
  return data
}

export async function processImage(imageBase64: string) {
  const { data, error } = await supabase.functions.invoke('ocr-processor', {
    body: { imageBase64 }
  })
  
  if (error) throw error
  return data.text
}

export async function chatWithAI(messages: any[], userProfile: any) {
  const { data, error } = await supabase.functions.invoke('chat-assistant', {
    body: { messages, userProfile }
  })
  
  if (error) throw error
  return data.message
}
```

Update `ScannerScreen.tsx`:

```typescript
import { analyzeFood, processImage } from '../utils/supabase/client'

// Replace the mock function
const handleTextScan = async () => {
  if (!inputText.trim()) return
  setIsScanning(true)
  
  try {
    const result = await analyzeFood(inputText, userProfile)
    onScan(result)
  } catch (error) {
    console.error('Scan error:', error)
    // Fallback to mock if API fails
    const mockResult = analyzeFoodText(inputText, userProfile)
    onScan(mockResult)
  } finally {
    setIsScanning(false)
  }
}

// Update image handler
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return
  
  setIsScanning(true)
  
  try {
    // Convert to base64
    const base64 = await fileToBase64(file)
    
    // Process with OCR
    const extractedText = await processImage(base64)
    
    // Analyze ingredients
    const result = await analyzeFood(extractedText, userProfile)
    onScan(result)
  } catch (error) {
    console.error('Image scan error:', error)
    alert('Failed to process image. Please try again.')
  } finally {
    setIsScanning(false)
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
  })
}
```

Update `ChatScreen.tsx`:

```typescript
import { chatWithAI } from '../utils/supabase/client'

const handleSend = async () => {
  if (!input.trim()) return
  
  const userMessage: Message = {
    id: Date.now().toString(),
    role: 'user',
    content: input,
    timestamp: new Date(),
  }
  
  setMessages((prev) => [...prev, userMessage])
  setInput('')
  setIsTyping(true)
  
  try {
    // Convert to OpenAI format
    const messagesForAI = messages.map(m => ({
      role: m.role,
      content: m.content
    }))
    
    const response = await chatWithAI(
      [...messagesForAI, { role: 'user', content: input }],
      userProfile
    )
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    }
    
    setMessages((prev) => [...prev, assistantMessage])
  } catch (error) {
    console.error('Chat error:', error)
    // Fallback to mock
    const mockResponse = generateAIResponse(input, userProfile, scanResult)
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: mockResponse,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, assistantMessage])
  } finally {
    setIsTyping(false)
  }
}
```

---

## 📊 Step 5: Set Up Database

Run this SQL in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Allergy profiles
CREATE TABLE allergy_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  allergen VARCHAR(100) NOT NULL,
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, allergen)
);

-- User preferences
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  diet_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Scan history
CREATE TABLE scan_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  food_name VARCHAR(255),
  ingredients TEXT[],
  detected_allergens TEXT[],
  risk_level VARCHAR(20),
  scan_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_allergy_profiles_user ON allergy_profiles(user_id);
CREATE INDEX idx_scan_history_user ON scan_history(user_id);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;

-- Policies (users can only access their own data)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view own allergies" ON allergy_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own history" ON scan_history FOR ALL USING (auth.uid() = user_id);
```

---

## 🧪 Step 6: Test Integration

```typescript
// Test in browser console
import { supabase } from './utils/supabase/client'

// Test analyze-food
const testResult = await supabase.functions.invoke('analyze-food', {
  body: {
    ingredients: 'peanut butter, wheat flour, milk',
    userProfile: {
      allergies: ['peanuts'],
      severity: { peanuts: 'high' }
    }
  }
})

console.log('Test result:', testResult)
```

---

## 💰 Cost Estimation

For 1000 users with moderate usage:

| Service | Usage | Monthly Cost |
|---------|-------|-------------|
| OpenAI GPT-4 | ~10K requests | $20-40 |
| Google Vision | ~5K OCR scans | $10 |
| Spoonacular | ~8K requests | $32 |
| Google Maps | ~3K lookups | $50 |
| Supabase | Database + Edge Functions | $25 |
| **Total** | | **~$137/month** |

Free tier options:
- Use Gemini instead of OpenAI (free tier)
- Use Open Food Facts (free, no key)
- Limit features initially

---

## 🔒 Security Checklist

- [ ] All API keys in Supabase secrets (not code)
- [ ] RLS enabled on all tables
- [ ] HTTPS-only connections
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive info
- [ ] CORS properly configured
- [ ] Authentication required for user data

---

## 🐛 Troubleshooting

**"Function not found"**
- Check function name matches exactly
- Ensure function is deployed: `supabase functions list`
- Redeploy if needed

**"Invalid API key"**
- Verify key is correct in Supabase secrets
- Check for extra spaces in key
- Ensure key has proper permissions

**"CORS error"**
- Add CORS headers to edge function responses
- Check Supabase project settings

**"Rate limit exceeded"**
- Implement caching
- Reduce API calls
- Upgrade API plan if needed

---

## 📚 Additional Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Spoonacular API Docs](https://spoonacular.com/food-api/docs)
- [Google Vision API Guide](https://cloud.google.com/vision/docs)

---

**Ready to go live! 🚀**

Once all APIs are connected, your app will have:
- Real-time AI allergen detection
- Accurate OCR scanning
- Personalized chat assistance
- Safe food recommendations
- Restaurant suggestions
