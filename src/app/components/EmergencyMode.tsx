import { useState } from 'react';
import { motion } from 'motion/react';
import { X, AlertTriangle, Zap, Type } from 'lucide-react';
import type { UserProfile, ScanResult } from '../App';

interface EmergencyModeProps {
  userProfile: UserProfile;
  onClose: () => void;
  onScan: (result: ScanResult) => void;
}

export function EmergencyMode({ userProfile, onClose, onScan }: EmergencyModeProps) {
  const [quickInput, setQuickInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const quickCheck = () => {
    if (!quickInput.trim()) return;

    setIsChecking(true);

    setTimeout(() => {
      const result = quickAnalyze(quickInput, userProfile);
      setIsChecking(false);
      onScan(result);
      onClose();
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-destructive/20 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-lg bg-card border-2 border-destructive rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-destructive to-destructive/80 p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="size-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <Zap className="size-6" />
              </motion.div>
              <div>
                <h2 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                  Quick Check
                </h2>
                <p className="text-white/80 text-sm">Instant allergen detection</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="size-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="size-5" />
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Alert message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-warning/10 border border-warning/30 rounded-2xl p-4"
          >
            <div className="flex gap-3">
              <AlertTriangle className="size-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm">
                  <strong>Your allergies:</strong> {userProfile.allergies.join(', ')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block mb-3">What food are you checking?</label>
            <textarea
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Type or paste ingredients quickly..."
              className="w-full h-32 px-4 py-3 bg-input-background border-2 border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-destructive text-lg"
              autoFocus
            />
          </motion.div>

          {/* Quick examples */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm text-muted-foreground mb-2">Quick examples:</p>
            <div className="flex flex-wrap gap-2">
              {['Peanut butter cookie', 'Shrimp pasta', 'Almond milk latte'].map((example) => (
                <motion.button
                  key={example}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQuickInput(example)}
                  className="px-3 py-1.5 bg-muted rounded-lg text-sm hover:bg-accent transition-colors"
                >
                  {example}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Action button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={quickCheck}
            disabled={!quickInput.trim() || isChecking}
            className="w-full bg-destructive text-destructive-foreground px-6 py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            {isChecking ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Zap className="size-6" />
                </motion.div>
                <span>Checking...</span>
              </>
            ) : (
              <>
                <Zap className="size-6" />
                <span>Check Now</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Quick analyze function for emergency mode
function quickAnalyze(text: string, userProfile: UserProfile): ScanResult {
  const textLower = text.toLowerCase();
  const detectedAllergens: string[] = [];

  userProfile.allergies.forEach((allergy) => {
    if (textLower.includes(allergy.toLowerCase())) {
      detectedAllergens.push(allergy);
    }
  });

  const hasHighSeverity = detectedAllergens.some(
    (allergen) => userProfile.severity[allergen] === 'high'
  );

  return {
    food: text,
    allergens: detectedAllergens,
    riskLevel: detectedAllergens.length === 0 ? 'low' : hasHighSeverity ? 'high' : 'medium',
    explanation:
      detectedAllergens.length > 0
        ? `⚠️ CONTAINS: ${detectedAllergens.join(', ').toUpperCase()}. DO NOT CONSUME.`
        : '✓ No detected allergens matching your profile. Always verify ingredients.',
    safeAlternatives:
      detectedAllergens.length > 0 ? ['Ask for allergen-free alternatives', 'Check safe options'] : undefined,
  };
}
