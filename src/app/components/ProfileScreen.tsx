import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, X, Save, AlertCircle, History } from 'lucide-react';
import type { UserProfile } from '../App';

interface ProfileScreenProps {
  userProfile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onBack: () => void;
  onNavigateToHistory?: () => void;
}

const COMMON_ALLERGENS = [
  'Peanuts',
  'Tree Nuts',
  'Milk',
  'Eggs',
  'Fish',
  'Shellfish',
  'Soy',
  'Wheat',
  'Sesame',
];

const DIET_TYPES = ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo'];

export function ProfileScreen({ userProfile, onSave, onBack, onNavigateToHistory }: ProfileScreenProps) {
  const [allergies, setAllergies] = useState<string[]>(userProfile.allergies);
  const [severity, setSeverity] = useState<{ [key: string]: 'low' | 'medium' | 'high' }>(
    userProfile.severity
  );
  const [dietType, setDietType] = useState(userProfile.dietType || 'None');
  const [customAllergen, setCustomAllergen] = useState('');

  const addAllergy = (allergy: string) => {
    if (!allergies.includes(allergy)) {
      setAllergies([...allergies, allergy]);
      setSeverity({ ...severity, [allergy]: 'medium' });
    }
  };

  const removeAllergy = (allergy: string) => {
    setAllergies(allergies.filter((a) => a !== allergy));
    const newSeverity = { ...severity };
    delete newSeverity[allergy];
    setSeverity(newSeverity);
  };

  const addCustomAllergen = () => {
    if (customAllergen.trim() && !allergies.includes(customAllergen.trim())) {
      addAllergy(customAllergen.trim());
      setCustomAllergen('');
    }
  };

  const handleSave = () => {
    onSave({
      allergies,
      severity,
      dietType: dietType === 'None' ? undefined : dietType,
    });
    onBack();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto px-6 py-8 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
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
              Allergy Profile
            </h1>
            <p className="text-sm text-muted-foreground">Manage your allergies and preferences</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary-hover transition-colors flex items-center gap-2"
        >
          <Save className="size-5" />
          <span>Save</span>
        </motion.button>
        {onNavigateToHistory && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNavigateToHistory}
            className="bg-secondary text-secondary-foreground px-4 py-3 rounded-xl hover:bg-secondary/80 transition-colors flex items-center gap-2"
          >
            <History className="size-5" />
            <span>History</span>
          </motion.button>
        )}
      </div>

      {/* Safety notice */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-warning/10 border border-warning/30 rounded-2xl p-6"
      >
        <div className="flex gap-3">
          <AlertCircle className="size-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-warning mb-1">Important Safety Notice</h3>
            <p className="text-sm text-muted-foreground">
              This app is a helpful tool but should not replace professional medical advice. Always
              consult with healthcare providers about your allergies and carry prescribed emergency
              medication.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Common allergens */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h3 className="mb-4">Common Allergens</h3>
        <div className="flex flex-wrap gap-2">
          {COMMON_ALLERGENS.map((allergen) => {
            const isSelected = allergies.includes(allergen);
            return (
              <motion.button
                key={allergen}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => (isSelected ? removeAllergy(allergen) : addAllergy(allergen))}
                className={`px-4 py-2 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted border-border hover:border-primary'
                }`}
              >
                {allergen}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Custom allergen */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h3 className="mb-4">Add Custom Allergen</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={customAllergen}
            onChange={(e) => setCustomAllergen(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomAllergen()}
            placeholder="e.g., Mustard, Celery..."
            className="flex-1 px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addCustomAllergen}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary-hover transition-colors flex items-center gap-2"
          >
            <Plus className="size-5" />
            <span>Add</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Selected allergies with severity */}
      {allergies.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h3 className="mb-4">Your Allergies ({allergies.length})</h3>
          <div className="space-y-3">
            {allergies.map((allergy, index) => (
              <motion.div
                key={allergy}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="bg-muted rounded-xl p-4 flex items-center gap-4"
              >
                <div className="flex-1">
                  <h4 className="mb-2">{allergy}</h4>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setSeverity({ ...severity, [allergy]: level })}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          severity[allergy] === level
                            ? level === 'high'
                              ? 'bg-destructive text-destructive-foreground'
                              : level === 'medium'
                              ? 'bg-warning text-white'
                              : 'bg-success text-white'
                            : 'bg-background hover:bg-accent'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeAllergy(allergy)}
                  className="size-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors"
                >
                  <X className="size-4" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Diet type */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h3 className="mb-4">Dietary Preference (Optional)</h3>
        <div className="flex flex-wrap gap-2">
          {DIET_TYPES.map((type) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDietType(type)}
              className={`px-4 py-2 rounded-xl border transition-all ${
                dietType === type
                  ? 'bg-secondary text-secondary-foreground border-secondary'
                  : 'bg-muted border-border hover:border-secondary'
              }`}
            >
              {type}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
