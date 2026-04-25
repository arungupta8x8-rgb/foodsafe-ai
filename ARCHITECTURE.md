# AllerGuard AI - System Architecture Documentation

## 🏗️ System Overview

AllerGuard is an AI-powered allergy food assistant that helps users identify allergens, scan ingredients, get safe food recommendations, and receive personalized dietary insights.

---

## 📐 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  React App   │  │  Components  │  │ Local Storage│          │
│  │  (Tailwind)  │  │  (Motion)    │  │  (Profile)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API Integration Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  AI/ML APIs  │  │  Food APIs   │  │  Vision OCR  │          │
│  │ (OpenAI/     │  │ (Spoonacular,│  │  (Google     │          │
│  │  Gemini)     │  │  Edamam)     │  │   Vision)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend Services Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  API Gateway │  │ Auth Service │  │  Supabase    │          │
│  │ (Rate Limit) │  │              │  │  Functions   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Data Storage Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │  Vector DB   │  │  Cache Layer │          │
│  │  (User Data) │  │  (Pinecone)  │  │  (Redis)     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Core Features & Implementation

### 1. **Allergen Detection Engine**

**Input Methods:**
- ✅ Text input (manual ingredient entry)
- ✅ Image upload (OCR processing)
- ✅ Barcode scanning (UPC database lookup)

**Processing Flow:**
```
User Input → AI Analysis → Allergen Matching → Risk Scoring → Results Display
```

**Risk Levels:**
- **Low**: No allergens matching user profile
- **Medium**: Contains user allergens (low-medium severity)
- **High**: Contains severe allergens from user profile

**Algorithm (Pseudo-code):**
```javascript
function analyzeFood(ingredients, userProfile) {
  // 1. Parse ingredients (NLP/OCR)
  const parsedIngredients = parseIngredients(ingredients);
  
  // 2. Match against allergen database
  const detectedAllergens = matchAllergens(parsedIngredients);
  
  // 3. Cross-reference with user profile
  const userMatches = detectedAllergens.filter(
    allergen => userProfile.allergies.includes(allergen)
  );
  
  // 4. Calculate risk score
  const riskLevel = calculateRisk(userMatches, userProfile.severity);
  
  // 5. Generate explanation with AI
  const explanation = await generateAIExplanation(userMatches, riskLevel);
  
  // 6. Find safe alternatives
  const alternatives = await findSafeAlternatives(ingredients, userProfile);
  
  return {
    allergens: detectedAllergens,
    riskLevel,
    explanation,
    alternatives
  };
}
```

---

### 2. **Smart Food Scanner**

**OCR Pipeline:**
```
Image Upload → Preprocessing → OCR (Google Vision API) → Text Extraction → NLP Processing
```

**Barcode Lookup:**
```
Barcode Scan → UPC Database API → Product Info → Ingredient Extraction → Analysis
```

**Implementation:**
```javascript
// OCR Processing
async function processImage(imageFile) {
  const preprocessed = await preprocessImage(imageFile);
  const ocrResult = await googleVisionAPI.detectText(preprocessed);
  const ingredients = extractIngredients(ocrResult.text);
  return analyzeFood(ingredients, userProfile);
}

// Barcode Lookup
async function lookupBarcode(barcode) {
  const product = await upcDatabaseAPI.lookup(barcode);
  return analyzeFood(product.ingredients, userProfile);
}
```

---

### 3. **Personalized AI Assistant**

**Memory System:**
- User allergy profile (persistent)
- Conversation history (session-based)
- Learned preferences (vector embeddings)

**AI Prompt Strategy:**
```javascript
const systemPrompt = `
You are AllerGuard AI, a helpful food safety assistant.
User allergies: ${userProfile.allergies.join(', ')}
Severity: ${JSON.stringify(userProfile.severity)}
Diet type: ${userProfile.dietType}

Guidelines:
- Prioritize user safety
- Provide actionable advice
- Suggest safe alternatives
- Consider cross-contamination
- Be empathetic and clear
`;

const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: userMessage }
  ]
});
```

**Vector Database (Pinecone) for Personalization:**
```javascript
// Store user interactions as embeddings
async function learnFromInteraction(userMessage, assistantResponse) {
  const embedding = await openai.embeddings.create({
    input: userMessage + " " + assistantResponse,
    model: "text-embedding-ada-002"
  });
  
  await pinecone.upsert({
    id: generateId(),
    values: embedding.data[0].embedding,
    metadata: {
      userId: user.id,
      timestamp: Date.now(),
      allergies: userProfile.allergies
    }
  });
}

// Retrieve relevant context
async function getRelevantContext(query) {
  const queryEmbedding = await openai.embeddings.create({
    input: query,
    model: "text-embedding-ada-002"
  });
  
  const results = await pinecone.query({
    vector: queryEmbedding.data[0].embedding,
    topK: 5,
    filter: { userId: user.id }
  });
  
  return results.matches;
}
```

---

### 4. **Recommendation System**

**Safe Food Recommendations:**
```javascript
async function getSafeRecommendations(userProfile, context) {
  // Use Spoonacular API for recipe search
  const recipes = await spoonacularAPI.searchRecipes({
    excludeIngredients: userProfile.allergies.join(','),
    diet: userProfile.dietType,
    number: 10
  });
  
  // Filter and score
  const safeRecipes = recipes.filter(recipe => 
    !hasAllergenConflict(recipe.ingredients, userProfile)
  );
  
  return safeRecipes;
}
```

**Restaurant Recommendations:**
```javascript
async function getSafeRestaurants(location, userProfile) {
  // Use Google Maps API + custom filtering
  const nearby = await googleMapsAPI.nearbySearch({
    location,
    type: 'restaurant',
    radius: 5000
  });
  
  // Score restaurants based on allergen-friendly menus
  const scored = await Promise.all(
    nearby.map(async restaurant => ({
      ...restaurant,
      safetyScore: await calculateSafetyScore(restaurant, userProfile)
    }))
  );
  
  return scored.sort((a, b) => b.safetyScore - a.safetyScore);
}
```

---

### 5. **Emergency Mode**

**Quick Check Algorithm:**
```javascript
function quickCheck(foodName, userProfile) {
  // Instant matching without API calls
  const keywords = foodName.toLowerCase().split(/\\s+/);
  const matches = userProfile.allergies.filter(allergen =>
    keywords.some(word => word.includes(allergen.toLowerCase()))
  );
  
  if (matches.length > 0) {
    const hasSevere = matches.some(
      allergen => userProfile.severity[allergen] === 'high'
    );
    
    return {
      safe: false,
      allergens: matches,
      severity: hasSevere ? 'HIGH' : 'MEDIUM',
      message: \`⚠️ CONTAINS: \${matches.join(', ')}\`
    };
  }
  
  return { safe: true, message: '✓ No immediate allergen detected' };
}
```

---

## 🔌 API Integration Details

### **1. AI/ML APIs**

#### **OpenAI / Google Gemini**
```javascript
// Configuration
const aiConfig = {
  apiKey: process.env.OPENAI_API_KEY, // Store in Supabase secrets
  model: 'gpt-4-turbo',
  maxTokens: 1000,
  temperature: 0.7
};

// Usage
async function analyzeWithAI(ingredients) {
  const response = await openai.chat.completions.create({
    model: aiConfig.model,
    messages: [{
      role: 'user',
      content: \`Analyze these ingredients for allergens: \${ingredients}\`
    }]
  });
  return response.choices[0].message.content;
}
```

### **2. Food APIs**

#### **Spoonacular API**
```javascript
const spoonacularConfig = {
  apiKey: process.env.SPOONACULAR_API_KEY,
  baseUrl: 'https://api.spoonacular.com'
};

// Get product info
async function getProductInfo(barcode) {
  const response = await fetch(
    \`\${spoonacularConfig.baseUrl}/food/products/upc/\${barcode}?apiKey=\${spoonacularConfig.apiKey}\`
  );
  return response.json();
}

// Search recipes
async function searchRecipes(query, excludeIngredients) {
  const response = await fetch(
    \`\${spoonacularConfig.baseUrl}/recipes/complexSearch?query=\${query}&excludeIngredients=\${excludeIngredients}&apiKey=\${spoonacularConfig.apiKey}\`
  );
  return response.json();
}
```

#### **Edamam Food API**
```javascript
const edamamConfig = {
  appId: process.env.EDAMAM_APP_ID,
  appKey: process.env.EDAMAM_APP_KEY,
  baseUrl: 'https://api.edamam.com/api/food-database/v2'
};

// Nutrition analysis
async function analyzeNutrition(ingredients) {
  const response = await fetch(
    \`\${edamamConfig.baseUrl}/nutrients?app_id=\${edamamConfig.appId}&app_key=\${edamamConfig.appKey}\`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients })
    }
  );
  return response.json();
}
```

#### **Open Food Facts API**
```javascript
// Free, open-source food database
async function getOpenFoodFacts(barcode) {
  const response = await fetch(
    \`https://world.openfoodfacts.org/api/v0/product/\${barcode}.json\`
  );
  const data = await response.json();
  return data.product;
}
```

### **3. Vision OCR**

#### **Google Vision API**
```javascript
const visionConfig = {
  apiKey: process.env.GOOGLE_VISION_API_KEY
};

async function extractTextFromImage(imageBase64) {
  const response = await fetch(
    \`https://vision.googleapis.com/v1/images:annotate?key=\${visionConfig.apiKey}\`,
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
  );
  const data = await response.json();
  return data.responses[0].textAnnotations[0].description;
}
```

### **4. Maps API**

#### **Google Maps API**
```javascript
async function findNearbyRestaurants(location) {
  const response = await fetch(
    \`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=\${location.lat},\${location.lng}&radius=5000&type=restaurant&key=\${process.env.GOOGLE_MAPS_API_KEY}\`
  );
  return response.json();
}
```

---

## 💾 Database Schema

### **PostgreSQL Tables**

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User allergy profiles
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
  location JSONB,
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
  scan_method VARCHAR(50), -- 'text', 'image', 'barcode'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chat history
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Favorites/Saved items
CREATE TABLE saved_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  food_name VARCHAR(255),
  is_safe BOOLEAN,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_allergy_profiles_user ON allergy_profiles(user_id);
CREATE INDEX idx_scan_history_user ON scan_history(user_id);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX idx_saved_foods_user ON saved_foods(user_id);
```

---

## 🚀 Deployment Strategy

### **Frontend (Vercel)**

```bash
# Install dependencies
pnpm install

# Build for production
pnpm build

# Deploy to Vercel
vercel deploy --prod
```

**Environment Variables (Vercel):**
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### **Backend (Supabase Edge Functions)**

```bash
# Deploy edge functions
supabase functions deploy analyze-food
supabase functions deploy ocr-processor
supabase functions deploy chat-assistant

# Set secrets
supabase secrets set OPENAI_API_KEY=your-key
supabase secrets set SPOONACULAR_API_KEY=your-key
supabase secrets set GOOGLE_VISION_API_KEY=your-key
```

### **Alternative: AWS Deployment**

```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=https://api.allerguard.com
  
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://...
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=allerguard
      - POSTGRES_PASSWORD=secure-password
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

---

## 🔒 Security & Privacy

### **Data Protection:**
- All API keys stored in Supabase secrets (server-side)
- User data encrypted at rest
- HTTPS-only communication
- No PII in logs

### **API Rate Limiting:**
```javascript
// Rate limiting with Redis
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests, please try again later'
};

async function checkRateLimit(userId) {
  const key = \`rate_limit:\${userId}\`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, rateLimit.windowMs / 1000);
  if (count > rateLimit.maxRequests) throw new Error(rateLimit.message);
}
```

---

## 📊 Performance Optimization

### **Caching Strategy:**
```javascript
// Cache common queries
const cacheConfig = {
  productInfo: 3600, // 1 hour
  allergenData: 86400, // 24 hours
  aiResponses: 300 // 5 minutes
};

async function getCached(key, ttl, fetcher) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  
  const data = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}
```

### **Image Optimization:**
```javascript
// Compress images before OCR
async function preprocessImage(file) {
  const compressed = await sharp(file)
    .resize(1200, 1200, { fit: 'inside' })
    .jpeg({ quality: 85 })
    .toBuffer();
  return compressed;
}
```

---

## 🧪 Testing Strategy

```javascript
// Unit tests (Jest)
describe('Allergen Detection', () => {
  test('detects peanuts in ingredients', () => {
    const result = analyzeFood('peanut butter', mockProfile);
    expect(result.allergens).toContain('peanuts');
  });
  
  test('calculates high risk correctly', () => {
    const result = analyzeFood('peanut oil', {
      allergies: ['peanuts'],
      severity: { peanuts: 'high' }
    });
    expect(result.riskLevel).toBe('high');
  });
});

// Integration tests
describe('API Integration', () => {
  test('fetches product from Spoonacular', async () => {
    const product = await getProductInfo('012345678901');
    expect(product).toHaveProperty('ingredients');
  });
});

// E2E tests (Playwright)
test('user can scan food and see results', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Scan Food');
  await page.fill('textarea', 'milk, eggs, wheat');
  await page.click('text=Analyze with AI');
  await expect(page.locator('text=Scan Results')).toBeVisible();
});
```

---

## 📈 Monitoring & Analytics

```javascript
// Error tracking (Sentry)
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

// Analytics (PostHog)
posthog.capture('food_scanned', {
  method: 'text',
  allergens_detected: result.allergens.length,
  risk_level: result.riskLevel
});

// Performance monitoring
const metric = performance.measure('scan_duration', 'scan_start', 'scan_end');
console.log(\`Scan took \${metric.duration}ms\`);
```

---

## 🎨 UI/UX Design System

### **Color Palette:**
```css
/* Primary (Emerald - Safety) */
--primary: #059669;
--primary-hover: #047857;

/* Secondary (Coral - Warmth) */
--secondary: #f97316;

/* Alert Levels */
--success: #10b981;
--warning: #f59e0b;
--destructive: #dc2626;
```

### **Typography:**
```css
/* Display Font (Headings) */
--font-display: 'Sora', system-ui, sans-serif;

/* Body Font (Content) */
--font-body: 'Manrope', system-ui, sans-serif;
```

### **Animation Principles:**
- Smooth transitions (300-500ms)
- Spring physics for interactive elements
- Staggered reveals for lists
- Pulsing indicators for active states

---

## 🔄 Continuous Integration/Deployment

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build
      - uses: vercel/action@v2
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
```

---

## 📱 Mobile Optimization

- Mobile-first responsive design
- Touch-optimized buttons (min 44px)
- PWA capabilities (offline mode)
- Native camera integration
- Push notifications for alerts

---

## 🌐 Internationalization

```javascript
// i18n support
const translations = {
  en: { scan_food: 'Scan Food' },
  es: { scan_food: 'Escanear Comida' },
  fr: { scan_food: 'Scanner la Nourriture' }
};

// Multi-language allergen database
const allergenNames = {
  peanuts: { en: 'Peanuts', es: 'Cacahuetes', fr: 'Arachides' }
};
```

---

## ⚡ Next Steps for Production

1. **Connect Supabase** from Make settings page
2. **Add API keys** as Supabase secrets:
   - OPENAI_API_KEY
   - SPOONACULAR_API_KEY
   - GOOGLE_VISION_API_KEY
   - GOOGLE_MAPS_API_KEY
3. **Set up database** with provided schema
4. **Deploy edge functions** for backend processing
5. **Enable authentication** (email/OAuth)
6. **Configure rate limiting** and caching
7. **Set up monitoring** (Sentry, PostHog)
8. **Test thoroughly** with real data

---

**Built with ❤️ for food safety and accessibility**
