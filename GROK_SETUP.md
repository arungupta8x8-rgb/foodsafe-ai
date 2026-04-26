# Grok API Setup Guide 🚀

## 📋 Getting Your Grok API Key

### Step 1: Get xAI Access
1. Go to [x.ai](https://x.ai)
2. Sign up for an xAI account (requires X/Twitter account)
3. Wait for approval (may take a few hours to days)

### Step 2: Get API Key
1. Once approved, go to [console.x.ai](https://console.x.ai)
2. Navigate to API Keys section
3. Create new API key
4. Copy the key (starts with `xai-`)

### Step 3: Add API Key to Your Project

#### Option 1: Environment Variable (Recommended)
```bash
# Create .env file in project root
GROK_API_KEY=your-xai-api-key-here
```

#### Option 2: Update Directly in Code
Edit `src/utils/grok.ts`:
```typescript
export const GROK_API_KEY = 'your-actual-grok-api-key';
```

## 🔧 Integration Features

The Grok integration provides:
- ✅ Food allergen analysis
- ✅ Chat assistance 
- ✅ Real-time data access
- ✅ Advanced reasoning capabilities

## 📊 Usage Examples

### Food Analysis
```typescript
import { analyzeFood } from './utils/ai-provider';

const result = await analyzeFood(
  "peanut butter, wheat flour, milk",
  userProfile,
  'grok' // Use Grok instead of Gemini
);
```

### Chat Assistant
```typescript
import { chatWithAI } from './utils/ai-provider';

const response = await chatWithAI(
  [{ role: 'user', content: 'Is this safe for my peanut allergy?' }],
  userProfile,
  'grok'
);
```

## 🆚 Grok vs Gemini

| Feature | Grok | Gemini |
|---------|------|--------|
| Real-time data | ✅ | ❌ |
| Cost | ~$5/1M tokens | Free tier available |
| Reasoning | Advanced | Good |
| Speed | Fast | Very fast |
| Food analysis | ✅ | ✅ |

## 🔒 Security Notes

- Never expose API keys in frontend code
- Use environment variables in production
- Consider rate limiting for production apps
- Monitor API usage costs

## 🐛 Troubleshooting

**"Invalid API key"**
- Verify key starts with `xai-`
- Check for extra spaces
- Ensure key has proper permissions

**"Rate limit exceeded"**
- Implement caching
- Reduce API calls
- Consider upgrading plan

**"Access denied"**
- Ensure xAI account is approved
- Check API key permissions
- Verify console access

## 📞 Support

- xAI Documentation: [docs.x.ai](https://docs.x.ai)
- API Reference: Available in xAI console
- Community: xAI Discord server

---

**Ready to use Grok! 🎉**

Once you have your API key, your FoodSafe AI app will be able to switch between Gemini and Grok for enhanced food safety analysis.
