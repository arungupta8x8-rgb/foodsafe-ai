import { motion } from 'motion/react';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Share2,
  Lightbulb,
} from 'lucide-react';
import type { ScanResult } from '../App';

interface ResultsScreenProps {
  result: ScanResult;
  onBack: () => void;
  onChat: () => void;
}

export function ResultsScreen({ result, onBack, onChat }: ResultsScreenProps) {
  const riskConfig = {
    low: {
      color: 'success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/30',
      textColor: 'text-success',
      icon: CheckCircle2,
      label: 'Low Risk',
      message: 'This food appears safe based on your allergy profile.',
    },
    medium: {
      color: 'warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/30',
      textColor: 'text-warning',
      icon: AlertCircle,
      label: 'Medium Risk',
      message: 'Contains allergens you should be aware of.',
    },
    high: {
      color: 'destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/30',
      textColor: 'text-destructive',
      icon: AlertTriangle,
      label: 'High Risk',
      message: 'AVOID: Contains allergens from your profile.',
    },
  };

  const config = riskConfig[result.riskLevel];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto px-6 py-8 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="size-10 rounded-xl bg-muted flex items-center justify-center hover:bg-accent transition-colors"
        >
          <ArrowLeft className="size-5" />
        </motion.button>
        <div>
          <h1 className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
            Scan Results
          </h1>
          <p className="text-sm text-muted-foreground">AI-powered allergen analysis</p>
        </div>
      </div>

      {/* Risk level card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className={`${config.bgColor} border ${config.borderColor} rounded-3xl p-8`}
      >
        <div className="flex items-start gap-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
            className={`size-16 rounded-2xl ${config.bgColor} flex items-center justify-center flex-shrink-0`}
          >
            <Icon className={`size-8 ${config.textColor}`} />
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className={config.textColor} style={{ fontFamily: 'var(--font-display)' }}>
                {config.label}
              </h2>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`size-2 rounded-full ${
                  result.riskLevel === 'high' ? 'bg-destructive' : 'bg-current'
                }`}
              />
            </div>
            <p className={`${config.textColor} text-lg mb-3`}>{config.message}</p>
            <p className="text-foreground">{result.explanation}</p>
          </div>
        </div>
      </motion.div>

      {/* Detected allergens */}
      {result.allergens.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h3 className="mb-4">Detected Allergens</h3>
          <div className="flex flex-wrap gap-2">
            {result.allergens.map((allergen, index) => (
              <motion.div
                key={allergen}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg border border-destructive/30"
              >
                {allergen}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Ingredients list */}
      {result.ingredients && result.ingredients.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h3 className="mb-4">Ingredients</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {result.ingredients.map((ingredient, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.03 }}
                className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg"
              >
                <div className="size-1.5 rounded-full bg-primary" />
                <span className="text-sm">{ingredient}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Safe alternatives */}
      {result.safeAlternatives && result.safeAlternatives.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="size-5 text-primary" />
            <h3>Safe Alternatives</h3>
          </div>
          <ul className="space-y-2">
            {result.safeAlternatives.map((alternative, index) => (
              <motion.li
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="flex items-start gap-2"
              >
                <CheckCircle2 className="size-5 text-primary flex-shrink-0 mt-0.5" />
                <span>{alternative}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Action buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onChat}
          className="flex-1 bg-primary text-primary-foreground px-6 py-4 rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
        >
          <MessageCircle className="size-5" />
          <span>Ask AI Assistant</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            // In production, this would share the results
            alert('Share functionality would be implemented here');
          }}
          className="px-6 py-4 rounded-xl bg-muted hover:bg-accent transition-colors flex items-center justify-center gap-2"
        >
          <Share2 className="size-5" />
          <span className="hidden sm:inline">Share</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
