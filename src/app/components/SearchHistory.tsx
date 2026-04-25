import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, Clock, Search, Trash2, ArrowRight } from 'lucide-react';

interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  response?: string;
  category?: 'food' | 'allergy' | 'restaurant' | 'general';
}

interface SearchHistoryProps {
  onSelectHistory?: (query: string) => void;
}

export function SearchHistory({ onSelectHistory }: SearchHistoryProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const savedHistory = localStorage.getItem('searchHistory');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const addToHistory = (query: string, response?: string) => {
    const newItem: SearchHistoryItem = {
      id: Date.now().toString(),
      query,
      timestamp: new Date(),
      response: response?.substring(0, 100) + '...',
      category: categorizeQuery(query)
    };

    const updatedHistory = [newItem, ...history.slice(0, 49)]; // Keep last 50 items
    setHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  const categorizeQuery = (query: string): SearchHistoryItem['category'] => {
    const lower = query.toLowerCase();
    if (lower.includes('restaurant') || lower.includes('eat out')) return 'restaurant';
    if (lower.includes('allergy') || lower.includes('allergic')) return 'allergy';
    if (lower.includes('food') || lower.includes('eat') || lower.includes('ingredient')) return 'food';
    return 'general';
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const deleteItem = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  const getCategoryColor = (category?: SearchHistoryItem['category']) => {
    switch (category) {
      case 'food': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'allergy': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'restaurant': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Expose addToHistory function globally for other components
  useEffect(() => {
    (window as any).addToSearchHistory = addToHistory;
    return () => {
      delete (window as any).addToSearchHistory;
    };
  }, [history]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
            <History className="size-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Search History</h2>
            <p className="text-sm text-muted-foreground">
              {history.length} recent searches
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearHistory}
              className="px-3 py-2 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20 transition-colors flex items-center gap-2"
            >
              <Trash2 className="size-4" />
              <span className="hidden sm:inline">Clear</span>
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-2 bg-muted rounded-xl hover:bg-accent transition-colors"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </motion.button>
        </div>
      </div>

      {/* History List */}
      <AnimatePresence>
        {history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-card rounded-2xl border border-border"
          >
            <Search className="size-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No search history yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start searching to see your history here
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {history.slice(0, isExpanded ? history.length : 5).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl border border-border p-4 hover:bg-accent/50 transition-colors group"
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
                          <span>Response available</span>
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
                    {onSelectHistory && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSelectHistory(item.query)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20"
                      >
                        <ArrowRight className="size-4" />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => deleteItem(item.id)}
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
      </AnimatePresence>
    </motion.div>
  );
}
