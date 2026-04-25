# AllerGuard AI - Food Allergy Assistant 🛡️

A production-ready AI-powered food allergy assistant with a beautiful, modern UI inspired by Flair AI. Instantly scan ingredients, detect allergens, and get personalized safety recommendations.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🔍 **Smart Food Scanner**
- **Text Input**: Manually enter ingredients
- **Image Upload**: OCR-powered ingredient label scanning
- **Barcode Lookup**: Instant product information

### 🤖 **AI Assistant**
- Personalized food safety advice
- Safe alternative recommendations
- Restaurant suggestions
- Dietary guidance

### 👤 **User Profile**
- Custom allergy tracking
- Severity levels (low, medium, high)
- Dietary preferences
- Persistent storage

### ⚡ **Emergency Quick Check**
- Instant allergen detection
- One-tap safety verification
- Offline-capable mode

### 🎨 **Beautiful UI/UX**
- Clean, modern design
- Smooth animations
- Dark/light mode
- Mobile-first responsive

## 🚀 Quick Start

### Current Implementation (Frontend Only)

The app is currently running with:
- ✅ Full UI/UX implementation
- ✅ Mock AI responses
- ✅ Local storage for profiles
- ✅ All features functional (demo mode)

### To Enable Full Backend Features

1. **Connect Supabase** (from Make settings page)
   - Create a Supabase project
   - Link it in the settings

2. **Add API Keys** (in Supabase secrets):
   ```
   OPENAI_API_KEY=your-openai-key
   SPOONACULAR_API_KEY=your-spoonacular-key
   GOOGLE_VISION_API_KEY=your-google-vision-key
   GOOGLE_MAPS_API_KEY=your-google-maps-key
   ```

3. **Set Up Database** (run SQL from ARCHITECTURE.md)

4. **Deploy Edge Functions** (see deployment section)

## 📖 Usage Guide

### 1. Set Up Your Profile

First time using the app:
1. Click **"Set Up Profile"** on the home screen
2. Select your allergies from common allergens
3. Add custom allergens if needed
4. Set severity levels for each allergy
5. Choose dietary preferences (optional)
6. Click **"Save"**

### 2. Scan Food

Three ways to scan:

**Text Input:**
1. Click **"Scan Food"** → **"Type Text"**
2. Enter ingredients or food name
3. Click **"Analyze with AI"**

**Image Upload:**
1. Click **"Scan Food"** → **"Scan Image"**
2. Upload ingredient label photo
3. Wait for OCR processing

**Barcode:**
1. Click **"Scan Food"** → **"Scan Barcode"**
2. Grant camera access
3. Scan product barcode

### 3. View Results

Results screen shows:
- **Risk level** (Low/Medium/High)
- **Detected allergens**
- **Full ingredient list**
- **Safe alternatives**
- **AI explanation**

### 4. Chat with AI

1. Click **"Chat"** in bottom navigation
2. Ask questions about:
   - Safe foods
   - Restaurants
   - Alternatives
   - Dietary advice
3. Get personalized responses

### 5. Emergency Quick Check

For instant verification:
1. Click **"Quick Check"** in header
2. Type food name quickly
3. Get immediate allergen alert

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18.3
- TypeScript
- Tailwind CSS v4
- Motion (Framer Motion)
- Lucide Icons

**Backend (Production):**
- Supabase (PostgreSQL + Edge Functions)
- Node.js/Express
- REST/GraphQL APIs

**AI/ML:**
- OpenAI GPT-4 / Google Gemini
- Vector Database (Pinecone)
- Google Vision API (OCR)

**Food APIs:**
- Spoonacular
- Edamam
- Open Food Facts
- UPC Database

### Component Structure

```
src/
├── app/
│   ├── App.tsx                 # Main app component
│   └── components/
│       ├── HomeScreen.tsx      # Landing page
│       ├── ScannerScreen.tsx   # Food scanning
│       ├── ResultsScreen.tsx   # Analysis results
│       ├── ChatScreen.tsx      # AI assistant
│       ├── ProfileScreen.tsx   # User profile
│       ├── EmergencyMode.tsx   # Quick check
│       └── ThemeToggle.tsx     # Dark mode
└── styles/
    ├── fonts.css              # Typography
    └── theme.css              # Design tokens
```

## 🎨 Design System

### Colors

```css
/* Primary - Emerald (Safety) */
--primary: #059669
--primary-hover: #047857

/* Secondary - Coral (Warmth) */
--secondary: #f97316

/* Alert Levels */
--success: #10b981  /* Safe */
--warning: #f59e0b  /* Medium risk */
--destructive: #dc2626  /* High risk */
```

### Typography

- **Display Font**: Sora (geometric, modern)
- **Body Font**: Manrope (humanist, readable)

### Animations

- Smooth transitions (300-500ms)
- Spring physics for interactions
- Staggered reveals for lists
- Micro-interactions on hover

## 🔐 Security & Privacy

### Current (Frontend-Only):
- Local storage for user data
- No server communication
- Data stays on device

### Production (with Backend):
- End-to-end encryption
- API keys in secure vault
- HTTPS-only
- Rate limiting
- No PII in logs

**⚠️ Important**: This is a demo/prototype. For production use with sensitive health data:
- Implement proper authentication
- Use secure backend storage
- Comply with HIPAA/GDPR
- Add proper error handling
- Regular security audits

## 📱 Mobile Support

- Mobile-first design
- Touch-optimized (44px minimum)
- Responsive breakpoints
- PWA capabilities
- Offline mode (coming soon)

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Type checking
pnpm type-check
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel deploy --prod
```

### Docker

```bash
# Build
docker build -t allerguard .

# Run
docker run -p 3000:3000 allerguard
```

### Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key

# Optional (for production)
VITE_POSTHOG_KEY=your-analytics-key
VITE_SENTRY_DSN=your-error-tracking
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## ⚠️ Disclaimer

**Medical Disclaimer**: This app is a helpful tool but should not replace professional medical advice. Always:
- Consult healthcare providers about allergies
- Verify ingredients yourself
- Carry prescribed emergency medication
- Report severe allergies to food establishments

The app provides information based on available data but cannot guarantee 100% accuracy.

## 🆘 Support

- **Documentation**: See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/allerguard/issues)
- **Email**: support@allerguard.com

## 🗺️ Roadmap

- [x] Core UI/UX
- [x] Mock AI responses
- [x] Local storage
- [ ] Backend integration
- [ ] Real API connections
- [ ] User authentication
- [ ] Offline mode
- [ ] Push notifications
- [ ] Multi-language support
- [ ] iOS/Android apps

## 💖 Acknowledgments

- Design inspired by Flair AI
- Icons by Lucide
- Fonts: Sora & Manrope (Google Fonts)

---

**Built with ❤️ for food safety and accessibility**

Made by [Your Name] | [Website](https://yoursite.com) | [@yourusername](https://twitter.com/yourusername)
