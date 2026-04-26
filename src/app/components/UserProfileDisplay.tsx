import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, History, Search, Trash2, LogOut, Shield, AlertTriangle, Mail, Calendar, Clock } from 'lucide-react';
import { useTranslation } from './LanguageSelector';
import { searchHistoryService } from '../../utils/searchHistory';

interface UserProfileDisplayProps {
  onLogout: () => void;
  userProfile: UserProfile;
}

interface UserInfo {
  name: string;
  email: string;
  createdAt: string;
  allergies: string[];
  dietType?: string;
}

interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  response?: string;
  category?: 'food' | 'allergy' | 'restaurant' | 'general';
}

export function UserProfileDisplay({ onLogout, userProfile }: UserProfileDisplayProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');
  const { translate } = useTranslation();

  useEffect(() => {
    loadUserInfo();
    loadSearchHistory();
    
    // Force reload search history on mount
    const interval = setInterval(() => {
      loadSearchHistory();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [userProfile]);

  // Simple direct addToHistory function
  const addToHistory = (query: string, response?: string) => {
    console.log('UserProfileDisplay: Direct addToHistory called:', { query, response });
    
    try {
      const newItem: SearchHistoryItem = {
        id: Date.now().toString(),
        query,
        timestamp: new Date(),
        response,
        category: categorizeQuery(query)
      };

      // Get existing history from localStorage
      const existingHistory = localStorage.getItem('searchHistory');
      let currentHistory: SearchHistoryItem[] = [];
      
      if (existingHistory) {
        try {
          currentHistory = JSON.parse(existingHistory);
        } catch (e) {
          console.error('Error parsing existing history:', e);
          currentHistory = [];
        }
      }

      // Add new item and keep only last 50
      const updatedHistory = [newItem, ...currentHistory.slice(0, 49)];
      
      // Save to localStorage
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      
      // Update state
      setSearchHistory(updatedHistory);
      
      console.log('UserProfileDisplay: History saved. New length:', updatedHistory.length);
    } catch (error) {
      console.error('UserProfileDisplay: Error in addToHistory:', error);
    }
  };

  // Expose globally and add test function
  useEffect(() => {
    console.log('UserProfileDisplay: Exposing addToSearchHistory function');
    (window as any).addToSearchHistory = addToHistory;
    
    // Add test function for debugging
    (window as any).testSearchHistory = () => {
      const history = searchHistory;
      console.log('Search History Test:', history);
      alert(`Search History has ${history.length} items. Check console for details.`);
      
      // Force add a test item if empty
      if (history.length === 0) {
        addToHistory('Test: User Profile Check', 'This is a test item to verify search history is working');
        setTimeout(() => {
          console.log('After adding test item:', searchHistory);
        }, 100);
      }
    };
    
    return () => {
      delete (window as any).addToSearchHistory;
      delete (window as any).testSearchHistory;
    };
  }, []);

  const categorizeQuery = (query: string): SearchHistoryItem['category'] => {
    const lower = query.toLowerCase();
    if (lower.includes('restaurant') || lower.includes('eat out')) return 'restaurant';
    if (lower.includes('allergy') || lower.includes('allergic')) return 'allergy';
    if (lower.includes('food') || lower.includes('eat') || lower.includes('ingredient')) return 'food';
    return 'general';
  };

  const loadSearchHistory = () => {
    try {
      console.log('UserProfileDisplay: Loading search history from localStorage...');
      const savedHistory = localStorage.getItem('searchHistory');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        const history = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setSearchHistory(history);
        console.log('UserProfileDisplay: Loaded', history.length, 'history items');
      } else {
        console.log('UserProfileDisplay: No existing history found');
      }
    } catch (error) {
      console.error('UserProfileDisplay: Error loading search history:', error);
      setSearchHistory([]);
    }
  };

  const loadUserInfo = () => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setUserInfo({
          name: user.name || user.email.split('@')[0],
          email: user.email,
          createdAt: user.createdAt || new Date().toISOString(),
          allergies: userProfile.allergies || [],
          dietType: userProfile.dietType,
        });
        console.log('UserProfileDisplay: Loaded user info:', user.email);
      } else {
        // Set default user info if no user found
        setUserInfo({
          name: 'Guest User',
          email: 'guest@example.com',
          createdAt: new Date().toISOString(),
          allergies: userProfile.allergies || [],
          dietType: userProfile.dietType,
        });
        console.log('UserProfileDisplay: No user found, using default');
      }
    } catch (error) {
      console.error('Error loading user info:', error);
      // Set default user info on error
      setUserInfo({
        name: 'Guest User',
        email: 'guest@example.com',
        createdAt: new Date().toISOString(),
        allergies: userProfile.allergies || [],
        dietType: userProfile.dietType,
      });
    }
  };

  const clearHistory = () => {
    try {
      localStorage.removeItem('searchHistory');
      setSearchHistory([]);
      console.log('UserProfileDisplay: History cleared');
    } catch (error) {
      console.error('UserProfileDisplay: Error clearing history:', error);
    }
  };

  const deleteHistoryItem = (id: string) => {
    try {
      const updatedHistory = searchHistory.filter(item => item.id !== id);
      setSearchHistory(updatedHistory);
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      console.log('UserProfileDisplay: Deleted history item:', id);
    } catch (error) {
      console.error('UserProfileDisplay: Error deleting history item:', error);
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return translate('justNow');
    if (minutes < 60) return translate('minutesAgo', { count: minutes.toString() });
    if (hours < 24) return translate('hoursAgo', { count: hours.toString() });
    return translate('daysAgo', { count: days.toString() });
  };

  const getCategoryColor = (category?: SearchHistoryItem['category']) => {
    switch (category) {
      case 'food': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'allergy': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'restaurant': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    onLogout();
  };

  if (!userInfo) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6 space-y-6"
    >
      {/* Profile Header */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-card rounded-2xl border border-border p-6 shadow-lg"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
              <User className="size-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{userInfo.name}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="size-3" />
                {userInfo.email}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="px-4 py-2 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20 transition-colors flex items-center gap-2"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">{translate('logout')}</span>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="size-4 text-primary" />
              <span className="text-sm font-medium">{translate('memberSince')}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date(userInfo.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="size-4 text-primary" />
              <span className="text-sm font-medium">{translate('allergies')}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {userInfo.allergies.length > 0 ? `${userInfo.allergies.length} items` : 'None specified'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="bg-card rounded-2xl border border-border p-2">
        <div className="flex gap-2 mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'profile'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent'
            }`}
          >
            <User className="size-4" />
            <span>{translate('userProfile')}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'history'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent'
            }`}
          >
            <History className="size-4" />
            <span>{translate('searchHistory')}</span>
            <span className="bg-primary-foreground/20 px-2 py-1 rounded-full text-xs">
              {searchHistory.length}
            </span>
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'profile' ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Allergy Information */}
              {userInfo.allergies.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-muted/50 rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Shield className="size-5 text-primary" />
                    {translate('allergies')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {userInfo.allergies.map((allergy, index) => (
                      <motion.div
                        key={allergy}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {allergy}
                      </motion.div>
                    ))}
                  </div>
                  {userInfo.dietType && (
                    <div className="mt-4 p-3 bg-secondary/10 rounded-xl">
                      <p className="text-sm">
                        <span className="font-medium">{translate('dietType')}:</span> {userInfo.dietType}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-4"
              >
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-xs text-muted-foreground">AI Support</div>
                </div>
                <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-secondary">{userInfo.allergies.length}</div>
                  <div className="text-xs text-muted-foreground">{translate('allergies')} Tracked</div>
                </div>
                <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-accent">{searchHistory.length}</div>
                  <div className="text-xs text-muted-foreground">Searches</div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <History className="size-5 text-primary" />
                  {translate('searchHistory')}
                </h3>
                {searchHistory.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearHistory}
                    className="px-3 py-2 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="size-4" />
                    <span className="hidden sm:inline">{translate('clearHistory')}</span>
                  </motion.button>
                )}
              </div>

              {searchHistory.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-muted/50 rounded-xl"
                >
                  <Search className="size-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{translate('noHistory')}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {translate('startSearching')}
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {searchHistory.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-muted/50 rounded-xl p-4 hover:bg-accent/50 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Search className="size-4 text-primary" />
                            <p className="font-medium">{item.query}</p>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getCategoryColor(item.category)}`}>
                              {item.category || 'general'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {formatTimeAgo(item.timestamp)}
                            </div>
                            {item.response && (
                              <div className="flex items-center gap-1">
                                <span>{translate('responseAvailable')}</span>
                              </div>
                            )}
                          </div>
                          {item.response && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {item.response}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => deleteHistoryItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20"
                          >
                            <Trash2 className="size-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
