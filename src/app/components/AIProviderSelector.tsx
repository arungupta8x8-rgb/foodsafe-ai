import { useState } from 'react';
import { motion } from 'motion/react';
import { Bot, Settings, Check } from 'lucide-react';
import { AIProvider, AI_PROVIDERS, getAvailableProviders } from '../../utils/ai-provider';

interface AIProviderSelectorProps {
  selectedProvider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
  disabled?: boolean;
}

export function AIProviderSelector({ selectedProvider, onProviderChange, disabled = false }: AIProviderSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const availableProviders = getAvailableProviders();

  const getProviderIcon = (provider: AIProvider) => {
    switch (provider) {
      case 'gemini':
        return '🤖';
      case 'grok':
        return '🚀';
      case 'openai':
        return '🧠';
      default:
        return <Bot className="size-4" />;
    }
  };

  const getProviderColor = (provider: AIProvider) => {
    switch (provider) {
      case 'gemini':
        return 'from-blue-500 to-blue-600';
      case 'grok':
        return 'from-purple-500 to-purple-600';
      case 'openai':
        return 'from-green-500 to-green-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="relative">
      {/* Selected Provider Display */}
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
          disabled
            ? 'bg-muted/50 cursor-not-allowed opacity-50'
            : 'bg-card hover:bg-accent cursor-pointer border-border'
        }`}
      >
        <div className={`size-8 rounded-lg bg-gradient-to-br ${getProviderColor(selectedProvider)} flex items-center justify-center text-white font-bold`}>
          {getProviderIcon(selectedProvider)}
        </div>
        <div className="flex-1 text-left">
          <div className="font-medium">{AI_PROVIDERS[selectedProvider]?.name}</div>
          <div className="text-xs text-muted-foreground">
            {AI_PROVIDERS[selectedProvider]?.description}
          </div>
        </div>
        {!disabled && (
          <Settings className={`size-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </motion.button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden"
        >
          <div className="p-2">
            {availableProviders.map((provider) => (
              <motion.button
                key={provider}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onProviderChange(provider);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  selectedProvider === provider
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-accent'
                }`}
              >
                <div className={`size-6 rounded-md bg-gradient-to-br ${getProviderColor(provider)} flex items-center justify-center text-white text-sm font-bold`}>
                  {getProviderIcon(provider)}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">{AI_PROVIDERS[provider]?.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {AI_PROVIDERS[provider]?.description}
                  </div>
                </div>
                {selectedProvider === provider && (
                  <Check className="size-4 text-primary" />
                )}
              </motion.button>
            ))}
          </div>

          {/* Provider Status */}
          <div className="border-t border-border p-3 bg-muted/30">
            <div className="text-xs text-muted-foreground">
              <div className="font-medium mb-1">Available Features:</div>
              <div className="space-y-1">
                {AI_PROVIDERS[selectedProvider]?.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="size-1.5 bg-primary rounded-full"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Click outside to close */}
      {isOpen && !disabled && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Quick Settings Component for inline use
export function AIProviderSettings({ selectedProvider, onProviderChange }: AIProviderSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Bot className="size-4 text-primary" />
        <span className="font-medium">AI Provider</span>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {getAvailableProviders().map((provider) => (
          <motion.button
            key={provider}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onProviderChange(provider)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
              selectedProvider === provider
                ? 'bg-primary/10 border-primary/20 text-primary'
                : 'bg-card border-border hover:bg-accent'
            }`}
          >
            <div className={`size-8 rounded-lg bg-gradient-to-br ${
              provider === 'gemini' ? 'from-blue-500 to-blue-600' :
              provider === 'grok' ? 'from-purple-500 to-purple-600' :
              'from-gray-500 to-gray-600'
            } flex items-center justify-center text-white font-bold`}>
              {provider === 'gemini' ? '🤖' : provider === 'grok' ? '🚀' : '🧠'}
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">{AI_PROVIDERS[provider]?.name}</div>
              <div className="text-xs text-muted-foreground">
                {AI_PROVIDERS[provider]?.description}
              </div>
            </div>
            {selectedProvider === provider && (
              <Check className="size-4 text-primary" />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
