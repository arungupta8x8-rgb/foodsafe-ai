import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Languages, ChevronDown } from 'lucide-react';

// Translation dictionary
const translations = {
  en: {
    appTitle: 'FoodSafe AI',
    appSubtitle: 'AI Food Safety Assistant',
    home: 'Home',
    scan: 'Scan',
    chat: 'Chat',
    profile: 'Profile',
    searchPlaceholder: 'Ask anything about food safety...',
    send: 'Send',
    typing: 'AI is typing...',
    welcome: '👋 Hello! I\'m FoodSafe AI, your personal food safety companion! I\'m here to help you navigate food allergies, find safe alternatives, and make confident food choices. What would you like to explore today?',
    welcomeWithAllergies: 'Hi! I\'m your AI food safety assistant. I see you\'re allergic to {allergies}. Ask me anything about food safety, alternatives, or restaurants.',
    welcomeWithScan: 'I see you just scanned food containing {allergens}. How can I help you with this?',
    quickCheck: 'Quick Check',
    emergency: 'Emergency',
    searchHistory: 'Search History',
    userProfile: 'User Profile',
    language: 'Language',
    logout: 'Logout',
    memberSince: 'Member Since',
    allergies: 'Allergies',
    dietType: 'Diet Type',
    clearHistory: 'Clear History',
    showMore: 'Show More',
    showLess: 'Show Less',
    noHistory: 'No search history yet',
    startSearching: 'Start searching to see your history here',
    justNow: 'Just now',
    minutesAgo: '{count}m ago',
    hoursAgo: '{count}h ago',
    daysAgo: '{count}d ago',
    responseAvailable: 'Response available',
    tryAsking: 'Try asking:',
    whatRestaurants: 'What restaurants are safe for me?',
    suggestBreakfast: 'Suggest a safe breakfast',
    eatItalian: 'Can I eat at Italian restaurants?',
    hiddenAllergens: 'What are common hidden allergens?',
    // Home screen translations
    heroTitle: 'Stay Safe, Eat Confidently',
    heroSubtitle: 'AI-powered allergen detection to help you make safe food choices instantly',
    welcomeBack: 'Welcome back!',
    setupProfileTitle: 'Set up your allergy profile',
    setupProfileDesc: 'Get personalized protection by adding your allergies and dietary preferences',
    setupProfileButton: 'Set Up Profile',
    scanFood: 'Scan Food',
    scanFoodDesc: 'Take a photo or type ingredients to check for allergens',
    aiAssistant: 'AI Assistant',
    aiAssistantDesc: 'Ask questions and get personalized food safety advice',
    trackedAllergies: 'Tracked Allergies',
    protectionLevel: 'Protection Level',
    poweredAnalysis: 'Powered Analysis',
    quickTips: 'Quick Tips',
    tip1: 'Scan ingredient labels before consuming any packaged food',
    tip2: 'Use Quick Check mode when dining out for instant allergen alerts',
    tip3: 'Chat with AI for safe alternative recommendations',
  },
  hi: {
    appTitle: 'फूडसेफ एआई',
    appSubtitle: 'एआई खाद्य सुरक्षा सहायक',
    home: 'होम',
    scan: 'स्कैन',
    chat: 'चैट',
    profile: 'प्रोफाइल',
    searchPlaceholder: 'खाद्य सुरक्षा के बारे में कुछ भी पूछें...',
    send: 'भेजें',
    typing: 'एआई टाइप कर रहा है...',
    welcome: '👋 नमस्ते! मैं फूडसेफ एआई हूं, आपका व्यक्तिगत खाद्य सुरक्षा साथी! मैं आपकी खाद्य एलर्जी को नेविगेट करने, सुरक्षित विकल्प खोजने और आत्मविश्वास से खाद्य विकल्प चुनने में मदद करने के लिए यहां हूं। आप आज क्या जानना चाहेंगे?',
    welcomeWithAllergies: 'नमस्ते! मैं आपका एआई खाद्य सुरक्षा सहायक हूं। मुझे पता है कि आपको {allergies} से एलर्जी है। खाद्य सुरक्षा, विकल्प या रेस्तरां के बारे में मुझसे कुछ भी पूछें।',
    welcomeWithScan: 'मैं देख रहा हूं कि आपने अभी {allergens} युक्त खाद्य पदार्थ स्कैन किया है। मैं इसके साथ आपकी कैसे सहायता कर सकता हूं?',
    quickCheck: 'त्वरित जांच',
    emergency: 'आपातकालीन',
    searchHistory: 'खोज इतिहास',
    userProfile: 'उपयोगकर्ता प्रोफाइल',
    language: 'भाषा',
    logout: 'लॉगआउट',
    memberSince: 'सदस्य के रूप में',
    allergies: 'एलर्जी',
    dietType: 'आहार प्रकार',
    clearHistory: 'इतिहास साफ करें',
    showMore: 'और दिखाएं',
    showLess: 'कम दिखाएं',
    noHistory: 'अभी तक कोई खोज इतिहास नहीं',
    startSearching: 'अपना इतिहास यहां देखने के लिए खोजना शुरू करें',
    justNow: 'अभी अभी',
    minutesAgo: '{count} मिनट पहले',
    hoursAgo: '{count} घंटे पहले',
    daysAgo: '{count} दिन पहले',
    responseAvailable: 'उत्तर उपलब्ध',
    tryAsking: 'पूछने का प्रयास करें:',
    whatRestaurants: 'मेरे लिए कौन से रेस्तरां सुरक्षित हैं?',
    suggestBreakfast: 'एक सुरक्षित नाश्ता सुझाएं',
    eatItalian: 'क्या मैं इतालवी रेस्तरां में खा सकता हूं?',
    hiddenAllergens: 'सामान्य छिपे हुए एलर्जेन क्या हैं?',
    // Home screen translations
    heroTitle: 'सुरक्षित रहें, आत्मविश्वास से खाएं',
    heroSubtitle: 'एआई-संचालित एलर्जी का पता लगाने के लिए ताकि आप तुरंत सुरक्षित खाद्य विकल्प चुन सकें',
    welcomeBack: 'वापसी पर स्वागत है!',
    setupProfileTitle: 'अपनी एलर्जी प्रोफाइल सेट करें',
    setupProfileDesc: 'अपनी एलर्जी और आहार प्राथमिकताएं जोड़कर व्यक्तिगत सुरक्षा प्राप्त करें',
    setupProfileButton: 'प्रोफाइल सेट करें',
    scanFood: 'खाद्य स्कैन करें',
    scanFoodDesc: 'एलर्जेन की जांच के लिए फोटो लें या सामग्री टाइप करें',
    aiAssistant: 'एआई सहायक',
    aiAssistantDesc: 'खाद्य सुरक्षा सलाह के लिए प्रश्न पूछें और व्यक्तिगत उत्तर प्राप्त करें',
    trackedAllergies: 'ट्रैक की गई एलर्जी',
    protectionLevel: 'सुरक्षा स्तर',
    poweredAnalysis: 'एआई-संचालित विश्लेषण',
    quickTips: 'त्वरित टिप्स',
    tip1: 'किसी भी पैकेज्ड खाद्य का सेवन करने से पहले सामग्री लेबल स्कैन करें',
    tip2: 'तत्काल एलर्जी चेतावनी के लिए बाहर खाने पर त्वरित जांच मोड का उपयोग करें',
    tip3: 'सुरक्षित विकल्प सिफारिशों के लिए एआई के साथ चैट करें',
  },
  es: {
    appTitle: 'FoodSafe AI',
    appSubtitle: 'Asistente de Seguridad Alimentaria IA',
    home: 'Inicio',
    scan: 'Escanear',
    chat: 'Chat',
    profile: 'Perfil',
    searchPlaceholder: 'Pregunta cualquier cosa sobre seguridad alimentaria...',
    send: 'Enviar',
    typing: 'La IA está escribiendo...',
    welcome: '¡Hola! Soy tu asistente de seguridad alimentaria IA. Puedo ayudarte con información sobre alérgenos, recomendaciones de alimentos seguros y consejos dietéticos. ¿Cómo puedo ayudarte hoy?',
    welcomeWithAllergies: '¡Hola! Soy tu asistente de seguridad alimentaria IA. Veo que eres alérgico a {allergies}. Pregúntame cualquier cosa sobre seguridad alimentaria, alternativas o restaurantes.',
    welcomeWithScan: 'Veo que acabas de escanear alimentos que contienen {allergens}. ¿Cómo puedo ayudarte con esto?',
    quickCheck: 'Verificación Rápida',
    emergency: 'Emergencia',
    searchHistory: 'Historial de Búsqueda',
    userProfile: 'Perfil de Usuario',
    language: 'Idioma',
    logout: 'Cerrar Sesión',
    memberSince: 'Miembro Desde',
    allergies: 'Alergias',
    dietType: 'Tipo de Dieta',
    clearHistory: 'Limpiar Historial',
    showMore: 'Mostrar Más',
    showLess: 'Mostrar Menos',
    noHistory: 'Aún no hay historial de búsqueda',
    startSearching: 'Comienza a buscar para ver tu historial aquí',
    justNow: 'Ahora mismo',
    minutesAgo: 'hace {count}m',
    hoursAgo: 'hace {count}h',
    daysAgo: 'hace {count}d',
    responseAvailable: 'Respuesta disponible',
    tryAsking: 'Intenta preguntar:',
    whatRestaurants: '¿Qué restaurantes son seguros para mí?',
    suggestBreakfast: 'Sugiere un desayuno seguro',
    eatItalian: '¿Puedo comer en restaurantes italianos?',
    hiddenAllergens: '¿Cuáles son los alérgenos ocultos comunes?',
  },
  fr: {
    appTitle: 'FoodSafe AI',
    appSubtitle: 'Assistant Sécurité Alimentaire IA',
    home: 'Accueil',
    scan: 'Scanner',
    chat: 'Chat',
    profile: 'Profil',
    searchPlaceholder: 'Demandez n\'importe quoi sur la sécurité alimentaire...',
    send: 'Envoyer',
    typing: 'L\'IA écrit...',
    welcome: 'Bonjour ! Je suis votre assistant de sécurité alimentaire IA. Je peux vous aider avec des informations sur les allergènes, des recommandations d\'aliments sûrs et des conseils diététiques. Comment puis-je vous aider aujourd\'hui ?',
    welcomeWithAllergies: 'Bonjour ! Je suis votre assistant de sécurité alimentaire IA. Je vois que vous êtes allergique à {allergies}. Demandez-moi n\'importe quoi sur la sécurité alimentaire, les alternatives ou les restaurants.',
    welcomeWithScan: 'Je vois que vous venez de scanner des aliments contenant {allergens}. Comment puis-je vous aider avec cela ?',
    quickCheck: 'Vérification Rapide',
    emergency: 'Urgence',
    searchHistory: 'Historique de Recherche',
    userProfile: 'Profil Utilisateur',
    language: 'Langue',
    logout: 'Déconnexion',
    memberSince: 'Membre Depuis',
    allergies: 'Allergies',
    dietType: 'Type de Régime',
    clearHistory: 'Effacer l\'Historique',
    showMore: 'Afficher Plus',
    showLess: 'Afficher Moins',
    noHistory: 'Aucun historique de recherche',
    startSearching: 'Commencez à rechercher pour voir votre historique ici',
    justNow: 'À l\'instant',
    minutesAgo: 'il y a {count}m',
    hoursAgo: 'il y a {count}h',
    daysAgo: 'il y a {count}j',
    responseAvailable: 'Réponse disponible',
    tryAsking: 'Essayez de demander :',
    whatRestaurants: 'Quels restaurants sont sûrs pour moi ?',
    suggestBreakfast: 'Suggérez un petit-déjeuner sûr',
    eatItalian: 'Puis-je manger dans des restaurants italiens ?',
    hiddenAllergens: 'Quels sont les allergènes cachés courants ?',
  },
  de: {
    appTitle: 'FoodSafe AI',
    appSubtitle: 'KI Lebensmittelsicherheits-Assistent',
    home: 'Startseite',
    scan: 'Scannen',
    chat: 'Chat',
    profile: 'Profil',
    searchPlaceholder: 'Fragen Sie alles über Lebensmittelsicherheit...',
    send: 'Senden',
    typing: 'KI schreibt...',
    welcome: 'Hallo! Ich bin Ihr KI-Lebensmittelsicherheits-Assistent. Ich kann Ihnen mit Informationen über Allergene, sichere Lebensmittelempfehlungen und Ernährungstipps helfen. Wie kann ich Ihnen heute helfen?',
    welcomeWithAllergies: 'Hallo! Ich bin Ihr KI-Lebensmittelsicherheits-Assistent. Ich sehe, Sie sind allergisch gegen {allergies}. Fragen Sie mich alles über Lebensmittelsicherheit, Alternativen oder Restaurants.',
    welcomeWithScan: 'Ich sehe, Sie haben gerade Lebensmittel gescannt, die {allergens} enthalten. Wie kann ich Ihnen damit helfen?',
    quickCheck: 'Schnellprüfung',
    emergency: 'Notfall',
    searchHistory: 'Suchverlauf',
    userProfile: 'Benutzerprofil',
    language: 'Sprache',
    logout: 'Abmelden',
    memberSince: 'Mitglied Seit',
    allergies: 'Allergien',
    dietType: 'Ernährungstyp',
    clearHistory: 'Verlauf Löschen',
    showMore: 'Mehr Zeigen',
    showLess: 'Weniger Zeigen',
    noHistory: 'Kein Suchverlauf vorhanden',
    startSearching: 'Beginnen Sie mit der Suche, um Ihren Verlauf hier zu sehen',
    justNow: 'Gerade jetzt',
    minutesAgo: 'vor {count}m',
    hoursAgo: 'vor {count}h',
    daysAgo: 'vor {count}d',
    responseAvailable: 'Antwort verfügbar',
    tryAsking: 'Versuchen Sie zu fragen:',
    whatRestaurants: 'Welche Restaurants sind sicher für mich?',
    suggestBreakfast: 'Schlagen Sie ein sicheres Frühstück vor',
    eatItalian: 'Kann ich in italienischen Restaurants essen?',
    hiddenAllergens: 'Was sind häufige versteckte Allergene?',
  },
};

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

type LanguageCode = keyof typeof translations;

interface LanguageSelectorProps {
  onLanguageChange?: (language: LanguageCode) => void;
}

export function LanguageSelector({ onLanguageChange }: LanguageSelectorProps) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load saved language preference
    const saved = localStorage.getItem('language') as LanguageCode;
    if (saved && translations[saved]) {
      setCurrentLanguage(saved);
    }
  }, []);

  const handleLanguageChange = (language: LanguageCode) => {
    setCurrentLanguage(language);
    localStorage.setItem('language', language);
    setIsOpen(false);
    
    // Update global translation function
    (window as any).currentLanguage = language;
    (window as any).translate = (key: string, params?: { [key: string]: string }) => {
      const translation = translations[language][key as keyof typeof translations[typeof language]] || key;
      if (params) {
        return Object.keys(params).reduce((str, param) => 
          str.replace(new RegExp(`{${param}}`, 'g'), params[param]), translation);
      }
      return translation;
    };
    
    onLanguageChange?.(language);
    
    // Trigger a custom event for language change
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { language } }));
  };

  // Initialize global translation function
  useEffect(() => {
    handleLanguageChange(currentLanguage);
  }, []);

  const selectedLanguage = languages.find(lang => lang.code === currentLanguage);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-muted rounded-xl hover:bg-accent transition-colors"
      >
        <Globe className="size-4" />
        <span className="hidden sm:inline">{selectedLanguage?.flag}</span>
        <span className="text-sm">{selectedLanguage?.name}</span>
        <ChevronDown className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 right-0 bg-card border border-border rounded-xl shadow-lg z-50 min-w-[160px]"
          >
            <div className="p-2">
              {languages.map((language) => (
                <motion.button
                  key={language.code}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    currentLanguage === language.code
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  <span className="text-lg">{language.flag}</span>
                  <span className="text-sm">{language.name}</span>
                  {currentLanguage === language.code && (
                    <div className="ml-auto w-2 h-2 bg-primary-foreground rounded-full" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Hook for using translations
export function useTranslation() {
  const [language, setLanguage] = useState<LanguageCode>('en');

  useEffect(() => {
    const saved = localStorage.getItem('language') as LanguageCode;
    if (saved && translations[saved]) {
      setLanguage(saved);
    }

    const handleLanguageChange = (event: CustomEvent) => {
      setLanguage(event.detail.language);
    };

    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, []);

  const translate = (key: string, params?: { [key: string]: string }) => {
    const translation = translations[language][key as keyof typeof translations[typeof language]] || key;
    if (params) {
      return Object.keys(params).reduce((str, param) => 
        str.replace(new RegExp(`{${param}}`, 'g'), params[param]), translation);
    }
    return translation;
  };

  return { translate, language, setLanguage };
}
