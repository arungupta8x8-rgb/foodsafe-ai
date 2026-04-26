// Centralized search history service
// This works independently of component mounting

interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  response?: string;
  category?: 'food' | 'allergy' | 'restaurant' | 'general';
}

class SearchHistoryService {
  private static instance: SearchHistoryService;
  private history: SearchHistoryItem[] = [];
  private listeners: ((history: SearchHistoryItem[]) => void)[] = [];

  private constructor() {
    this.loadHistory();
  }

  static getInstance(): SearchHistoryService {
    if (!SearchHistoryService.instance) {
      SearchHistoryService.instance = new SearchHistoryService();
    }
    return SearchHistoryService.instance;
  }

  private loadHistory() {
    try {
      const savedHistory = localStorage.getItem('searchHistory');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        this.history = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        console.log('SearchHistoryService: Loaded history with', this.history.length, 'items');
      }
    } catch (error) {
      console.error('SearchHistoryService: Error loading history:', error);
      this.history = [];
    }
  }

  private saveHistory() {
    try {
      localStorage.setItem('searchHistory', JSON.stringify(this.history));
      console.log('SearchHistoryService: Saved history with', this.history.length, 'items');
    } catch (error) {
      console.error('SearchHistoryService: Error saving history:', error);
    }
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.history));
  }

  private categorizeQuery(query: string): SearchHistoryItem['category'] {
    const lower = query.toLowerCase();
    if (lower.includes('restaurant') || lower.includes('eat out')) return 'restaurant';
    if (lower.includes('allergy') || lower.includes('allergic')) return 'allergy';
    if (lower.includes('food') || lower.includes('eat') || lower.includes('ingredient')) return 'food';
    return 'general';
  }

  addToHistory(query: string, response?: string) {
    console.log('SearchHistoryService: Adding to history:', { query, response });
    
    const newItem: SearchHistoryItem = {
      id: Date.now().toString(),
      query,
      timestamp: new Date(),
      response,
      category: this.categorizeQuery(query)
    };

    this.history = [newItem, ...this.history.slice(0, 49)]; // Keep last 50 items
    this.saveHistory();
    
    console.log('SearchHistoryService: History updated. New length:', this.history.length);
  }

  getHistory(): SearchHistoryItem[] {
    return this.history;
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem('searchHistory');
    this.notifyListeners();
  }

  deleteHistoryItem(id: string) {
    this.history = this.history.filter(item => item.id !== id);
    this.saveHistory();
  }

  subscribe(listener: (history: SearchHistoryItem[]) => void) {
    this.listeners.push(listener);
    listener(this.history); // Immediately send current history
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

// Export singleton instance
export const searchHistoryService = SearchHistoryService.getInstance();

// Export convenience functions
export const addToSearchHistory = (query: string, response?: string) => {
  searchHistoryService.addToHistory(query, response);
};

// Expose globally for backward compatibility
if (typeof window !== 'undefined') {
  (window as any).addToSearchHistory = addToSearchHistory;
}
