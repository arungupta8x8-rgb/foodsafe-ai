import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ArrowLeft, Bot, User as UserIcon, Sparkles } from 'lucide-react';
import type { ScanResult, UserProfile } from '../App';
import { analyzeFoodWithGemini } from '../../utils/gemini-new';
import { GEMINI_API_KEY } from '../../utils/gemini-new';
import { useTranslation } from './LanguageSelector';

// Debug: Check if API key is loaded
console.log('Gemini API Key loaded:', GEMINI_API_KEY ? 'Yes' : 'No');

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatScreenProps {
  onBack: () => void;
  userProfile: UserProfile;
  scanResult: ScanResult | null;
}

export function ChatScreen({ onBack, userProfile, scanResult }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { translate } = useTranslation();

  useEffect(() => {
    // Add welcome message
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: scanResult
          ? translate('welcomeWithScan', { allergens: scanResult.allergens.join(', ') })
          : userProfile.allergies.length > 0
          ? translate('welcomeWithAllergies', { allergies: userProfile.allergies.join(', ') })
          : translate('welcome'),
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [translate, scanResult, userProfile.allergies]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Debug: Check API key before making request
      console.log('Making API call with key:', GEMINI_API_KEY ? 'Key exists' : 'No key');
      
      // Use Gemini API for real AI responses
      const context = scanResult 
        ? `Previous scan result: Food: ${scanResult.food}, Allergens: ${scanResult.allergens.join(', ')}, Risk Level: ${scanResult.riskLevel}`
        : 'User is asking about food safety and allergies.';

      const prompt = `
        You are AllerGuard AI, an intelligent and flexible food safety and allergy assistant.

        Your responsibilities:
        - Help users with food allergies, ingredients, symptoms, and safe alternatives
        - Answer even if question is indirect or not clearly about allergies
        - If question is slightly unrelated, gently connect it to food safety or health
        - Never reject a question

        User Profile:
        Allergies: ${userProfile.allergies.join(', ')}
        Severity levels: ${JSON.stringify(userProfile.severity)}
        
        User Question: ${input}
        
        ${context}
        
        Guidelines:
        - Be clear, simple, and helpful
        - Use bullet points when needed
        - If medical risk is involved, advise consulting a doctor
        - For serious reactions, mention emergency help
        - Do NOT say "I only answer food allergy questions"
        - Try to understand user's intent (even if unclear)
        - Answer ALL questions - never reject

        Please provide a helpful, accurate, and safety-focused response about food allergies, ingredients, and safe alternatives.
        Always prioritize user safety and be clear about potential risks.
      `;

      console.log('Sending request to Gemini API...');
      
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
              temperature: 0.7,
              maxOutputTokens: 1000,
            }
          }),
        }
      );

      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error:', errorData);
        throw new Error(`Gemini API request failed: ${response.status} ${errorData}`);
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('No response from Gemini API');
      }

      const aiResponse = data.candidates[0].content.parts[0].text;
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
      
      // Add to search history
      if ((window as any).addToSearchHistory) {
        (window as any).addToSearchHistory(input, aiResponse);
      }
    } catch (error) {
      console.error('Gemini chat error:', error);
      setIsTyping(false);
      // Show user-friendly error instead of crashing
      const errorMessage = (error as Error)?.message || 'Unknown error occurred';
      alert(`Chat error: ${errorMessage}. Please try again.`);
      
      // Generate helpful fallback response based on common food safety questions
      const lowerInput = input.toLowerCase();
      let fallbackResponse = '';
      
      if (lowerInput.includes('pizza') && lowerInput.includes('cheese')) {
        const allergyText = userProfile.allergies.length > 0 
          ? userProfile.allergies.includes('milk') || userProfile.allergies.includes('dairy')
            ? 'Since you have a milk/dairy allergy, traditional pizza with cheese is not safe for you.'
            : 'Based on your allergy profile, please be cautious with cheese.'
          : 'If you have a dairy allergy, traditional pizza with cheese is not safe.';
        
        fallbackResponse = `${allergyText} 
Safe alternatives include:
• Dairy-free cheese pizza (check labels for casein)
• Pizza with nutritional yeast instead of cheese
• Vegan cheese options
• Plain pizza crust with sauce and vegetables
Always read ingredient labels carefully and consider preparing meals at home to ensure safety.`;
      } else if (lowerInput.includes('dairy') || (lowerInput.includes('allergy') && lowerInput.includes('avoid'))) {
        fallbackResponse = `If you have a dairy allergy, you should avoid these foods:

🥛 **Obvious Dairy Products:**
• Milk, cheese, butter, yogurt, ice cream
• Cream, sour cream, whipped cream
• Cottage cheese, cream cheese

🍞 **Hidden Dairy Ingredients:**
• Whey, casein, lactose
• Milk solids, milk protein
• Lactalbumin, lactoglobulin

🥐 **Foods That Often Contain Dairy:**
• Baked goods (cakes, cookies, bread)
• Processed foods (soups, sauces, dressings)
• Chocolate and candy
• Margarine (some contain milk)
• Protein bars and supplements

🥤 **Safe Alternatives:**
• Plant-based milks (oat, almond, soy)
• Dairy-free cheese alternatives
• Vegan protein sources
• Fresh fruits and vegetables
• Lactose-free products

Always read ingredient labels carefully and consider preparing meals at home to ensure safety.`;
      } else if (lowerInput.includes('peanut') || lowerInput.includes('nut')) {
        fallbackResponse = `If you have a peanut or nut allergy, avoid:

🥜 **Nuts & Nut Products:**
• Peanuts, almonds, walnuts, cashews
• Nut butters, nut oils, nut milks
• Mixed nuts, trail mixes

🍫 **Foods That May Contain Nuts:**
• Baked goods, cookies, cakes
• Chocolate, candy bars
• Granola bars, cereals
• Asian foods (satay sauces, pad thai)
• Pestos, some salad dressings

🥤 **Safe Alternatives:**
• Seed butters (sunflower, pumpkin)
• Tahini instead of nut butters
• Coconut-based products
• Always verify "nut-free" labels

Cross-contamination is common - read labels carefully!`;
      } else if (lowerInput.includes('gluten') || lowerInput.includes('wheat')) {
        fallbackResponse = `For gluten/wheat allergy or celiac disease, avoid:

🌾 **Gluten-Containing Grains:**
• Wheat, barley, rye, oats (unless certified gluten-free)
• Bread, pasta, cereals, crackers
• Flour, tortillas, pizza crust

🥨 **Processed Foods with Gluten:**
• Soups, sauces, gravies
• Salad dressings, marinades
• Processed meats, sausages
• Beer, many alcoholic beverages

🥗 **Gluten-Free Alternatives:**
• Rice, quinoa, corn, potatoes
• Gluten-free breads and pastas
• Almond/coconut flour
• Certified gluten-free oats

Look for "certified gluten-free" labels!`;
      } else {
        fallbackResponse = `I'm having trouble connecting to my AI services right now. For general food safety:

• Always read ingredient labels
• Check for allergen warnings
• When in doubt, choose safer alternatives
• Consult healthcare providers for medical advice
• Consider using food allergy apps and scanners

Is there a specific food or ingredient you'd like to know more about?`;
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
      
      // Add to search history for fallback responses
      if ((window as any).addToSearchHistory) {
        (window as any).addToSearchHistory(input, fallbackResponse);
      }
    }
  };

  const quickPrompts = [
    translate('whatRestaurants'),
    translate('suggestBreakfast'),
    translate('eatItalian'),
    translate('hiddenAllergens')
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto h-full flex flex-col"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-border/50 flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="size-10 rounded-xl bg-muted flex items-center justify-center hover:bg-accent transition-colors"
        >
          <ArrowLeft className="size-5" />
        </motion.button>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
            <Bot className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              AI Assistant
            </h1>
            <p className="text-xs text-muted-foreground">Always here to help</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-6 py-6 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message: Message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center flex-shrink-0">
                  <Bot className="size-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-card border border-border rounded-bl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="size-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <UserIcon className="size-4" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
              <Bot className="size-4 text-white" />
            </div>
            <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="size-2 rounded-full bg-primary"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-3 border-t border-border/50"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="size-4 text-primary" />
            <p className="text-sm text-muted-foreground">{translate('tryAsking')}:</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <motion.button
                key={prompt}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setInput(prompt)}
                className="px-3 py-2 bg-muted hover:bg-accent rounded-lg text-sm transition-colors"
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input */}
      <div className="px-6 py-4 border-t border-border/50">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={translate('searchPlaceholder')}
            className="flex-1 px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!input.trim()}
            className="size-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="size-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
