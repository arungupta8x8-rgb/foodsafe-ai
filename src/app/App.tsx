import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scan, MessageCircle, User, Shield, Camera, Type, Barcode, AlertCircle, History, Globe } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { AuthScreen } from './components/AuthScreen';
import { HomeScreen } from './components/HomeScreen';
import { ScannerScreen } from './components/ScannerScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { ChatScreen } from './components/ChatScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { EmergencyMode } from './components/EmergencyMode';
import { ThemeToggle } from './components/ThemeToggle';
import { UserProfileDisplay } from './components/UserProfileDisplay';
import { LanguageSelector, useTranslation } from './components/LanguageSelector';
import { searchHistoryService } from '../utils/searchHistory';

export type Screen = 'home' | 'scanner' | 'results' | 'chat' | 'profile' | 'emergency' | 'userprofile';

export interface UserProfile {
  allergies: string[];
  dietType?: string;
  severity: { [key: string]: 'low' | 'medium' | 'high' };
}

export interface ScanResult {
  food: string;
  allergens: string[];
  riskLevel: 'low' | 'medium' | 'high';
  explanation: string;
  safeAlternatives?: string[];
  ingredients?: string[];
}

// Local authentication system - no Supabase client needed

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    allergies: [],
    severity: {},
  });
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const { translate } = useTranslation();

  // Initialize services and check for existing session on mount
  useEffect(() => {
    // Initialize search history service
    console.log('App: Initializing search history service');
    searchHistoryService.getHistory(); // This will trigger loading from localStorage
    
    // Test search history service
    console.log('App: Testing search history service...');
    try {
      searchHistoryService.addToHistory('Test: App initialized', 'This is a test from App.tsx');
      console.log('App: Test item added to search history');
      const history = searchHistoryService.getHistory();
      console.log('App: Current search history length:', history.length);
      console.log('App: Search history items:', history);
    } catch (error) {
      console.error('App: Error testing search history service:', error);
    }
    
    // Expose test function globally
    (window as any).testSearchHistory = () => {
      const history = searchHistoryService.getHistory();
      console.log('Test Search History:', history);
      alert(`Search History has ${history.length} items. Check console for details.`);
    };
    
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // Check local storage for existing session
      const savedToken = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('currentUser');
      
      if (savedToken && savedUser) {
        setAccessToken(savedToken);
        setIsAuthenticated(true);
        const user = JSON.parse(savedUser);
        setUserProfile({
          allergies: user.allergies || [],
          dietType: user.dietType,
          severity: user.severity || {},
        });
        console.log('Restored session from local storage:', user);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const loadUserProfile = async (token: string) => {
    try {
      // Load from local storage
      const users = JSON.parse(localStorage.getItem('localUsers') || '[]');
      const decoded = atob(token);
      const [userId] = decoded.split(':');
      
      if (userId) {
        const user = users.find((u: any) => u.id === userId);
        if (user) {
          setUserProfile({
            allergies: user.allergies || [],
            dietType: user.dietType,
            severity: user.severity || {},
          });
          console.log('Loaded user profile from local storage:', user);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      // Local authentication to bypass server issues
      console.log('Attempting local login for:', email);
      
      // Simple local user database (in production, use proper backend)
      const users = JSON.parse(localStorage.getItem('localUsers') || '[]');
      const user = users.find((u: any) => u.email === email);
      
      if (!user) {
        // Auto-create user if doesn't exist (demo mode)
        const newUser = {
          id: Date.now().toString(),
          email,
          name: email.split('@')[0],
          password,
          allergies: [],
          severity: {},
          dietType: undefined,
          createdAt: new Date().toISOString(),
        };
        
        users.push(newUser);
        localStorage.setItem('localUsers', JSON.stringify(users));
        
        setAccessToken(btoa(`${newUser.id}:${Date.now()}`));
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        setUserProfile({
          allergies: newUser.allergies,
          dietType: newUser.dietType,
          severity: newUser.severity,
        });
        
        console.log('Auto-created and logged in user:', newUser);
        return;
      }
      
      // Check password
      if (user.password !== password) {
        throw new Error('Invalid email or password');
      }
      
      // Login successful
      setAccessToken(btoa(`${user.id}:${Date.now()}`));
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setUserProfile({
        allergies: user.allergies || [],
        dietType: user.dietType,
        severity: user.severity || {},
      });
      
      console.log('Successfully logged in user:', user);
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    try {
      console.log('Attempting local signup for:', { email, name });
      
      // Local authentication to bypass server issues
      const users = JSON.parse(localStorage.getItem('localUsers') || '[]');
      
      // Check if user already exists
      const existingUser = users.find((u: any) => u.email === email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email,
        name: name || email.split('@')[0],
        password,
        allergies: [],
        severity: {},
        dietType: undefined,
        createdAt: new Date().toISOString(),
      };
      
      users.push(newUser);
      localStorage.setItem('localUsers', JSON.stringify(users));
      
      // Auto-login after signup
      setAccessToken(btoa(`${newUser.id}:${Date.now()}`));
      setIsAuthenticated(true);
      setUserProfile({
        allergies: newUser.allergies,
        dietType: newUser.dietType,
        severity: newUser.severity,
      });
      
      console.log('Successfully created and logged in user:', newUser);
    } catch (error: any) {
      console.error('Signup error details:', error);
      throw error;
    }
  };

  const saveProfile = async (profile: UserProfile) => {
    setUserProfile(profile);
    
    // Save to local storage
    if (accessToken) {
      try {
        const users = JSON.parse(localStorage.getItem('localUsers') || '[]');
        const decoded = atob(accessToken);
        const [userId] = decoded.split(':');
        
        if (userId) {
          const userIndex = users.findIndex((u: any) => u.id === userId);
          if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...profile };
            localStorage.setItem('localUsers', JSON.stringify(users));
            console.log('Saved profile to local storage:', users[userIndex]);
          }
        }
      } catch (error) {
        console.error('Error saving profile to local storage:', error);
      }
    }
  };

  const handleScan = (result: ScanResult) => {
    setScanResult(result);
    setCurrentScreen('results');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAccessToken(null);
    setUserProfile({ allergies: [], severity: {} });
    setCurrentScreen('home');
  };

  const handleHistorySelect = (query: string) => {
    setCurrentScreen('chat');
    // Pass the selected query to chat screen
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (input) {
        input.value = query;
        input.focus();
      }
    }, 100);
  };

  // Show loading screen while checking auth
  if (isCheckingAuth) {
    return (
      <div className="size-full min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="size-16 rounded-3xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-xl mb-4 mx-auto">
            <Shield className="size-8 text-white" />
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="size-8 border-2 border-primary/30 border-t-primary rounded-full mx-auto"
          />
        </motion.div>
      </div>
    );
  }

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} onSignup={handleSignup} />;
  }

  return (
    <div className="size-full min-h-screen bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1 }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 size-full flex flex-col">
        {/* Header */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-border/50 backdrop-blur-sm bg-background/80">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="size-10 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg">
              <Shield className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>{translate('appTitle')}</h1>
              <p className="text-xs text-muted-foreground">{translate('appSubtitle')}</p>
            </div>
          </motion.div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            {userProfile.allergies.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEmergencyMode(!isEmergencyMode)}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
                  isEmergencyMode
                    ? 'bg-destructive text-destructive-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                <AlertCircle className="size-4" />
                <span className="hidden sm:inline">{translate('quickCheck')}</span>
              </motion.button>
            )}
          </div>
        </header>

        {/* Screen content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            {isEmergencyMode ? (
              <EmergencyMode
                key="emergency"
                userProfile={userProfile}
                onClose={() => setIsEmergencyMode(false)}
                onScan={handleScan}
              />
            ) : (
              <>
                {currentScreen === 'home' && (
                  <HomeScreen
                    key="home"
                    onNavigate={setCurrentScreen}
                    userProfile={userProfile}
                  />
                )}
                {currentScreen === 'scanner' && (
                  <ScannerScreen
                    key="scanner"
                    onBack={() => setCurrentScreen('home')}
                    onScan={handleScan}
                    userProfile={userProfile}
                  />
                )}
                {currentScreen === 'results' && scanResult && (
                  <ResultsScreen
                    key="results"
                    result={scanResult}
                    onBack={() => setCurrentScreen('home')}
                    onChat={() => setCurrentScreen('chat')}
                  />
                )}
                {currentScreen === 'chat' && (
                  <ChatScreen
                    key="chat"
                    onBack={() => setCurrentScreen('home')}
                    userProfile={userProfile}
                    scanResult={scanResult}
                  />
                )}
                {currentScreen === 'profile' && (
                  <ProfileScreen
                    key="profile"
                    userProfile={userProfile}
                    onSave={saveProfile}
                    onBack={() => setCurrentScreen('home')}
                    onNavigateToHistory={() => setCurrentScreen('userprofile')}
                  />
                )}
                {currentScreen === 'userprofile' && (
                  <UserProfileDisplay
                    key="userprofile"
                    onLogout={handleLogout}
                    userProfile={userProfile}
                  />
                )}
              </>
            )}
          </AnimatePresence>
        </main>

        {/* Bottom navigation */}
        {!isEmergencyMode && (
          <nav className="border-t border-border/50 backdrop-blur-sm bg-background/80 px-6 py-3">
            <div className="flex items-center justify-around max-w-md mx-auto">
              {[
                { id: 'home' as Screen, icon: Shield, label: translate('home') },
                { id: 'scanner' as Screen, icon: Scan, label: translate('scan') },
                { id: 'chat' as Screen, icon: MessageCircle, label: translate('chat') },
                { id: 'profile' as Screen, icon: User, label: translate('profile') },
                { id: 'userprofile' as Screen, icon: User, label: translate('userProfile') },
              ].slice(0, window.innerWidth < 640 ? 4 : 5).map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrentScreen(item.id)}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                    currentScreen === item.id
                      ? 'text-primary bg-accent'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <item.icon className="size-5" />
                  <span className="text-xs">{item.label}</span>
                </motion.button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}