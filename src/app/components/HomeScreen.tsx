import { motion } from 'motion/react';
import { Scan, MessageCircle, User, Camera, Sparkles, Shield, TrendingUp } from 'lucide-react';
import type { Screen, UserProfile } from '../App';
import { useTranslation } from './LanguageSelector';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
  userProfile: UserProfile;
}

export function HomeScreen({ onNavigate, userProfile }: HomeScreenProps) {
  const hasProfile = userProfile.allergies.length > 0;
  const { translate } = useTranslation();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto px-6 py-8 space-y-8"
    >
      {/* Hero section */}
      <motion.div variants={item} className="text-center space-y-4 py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="size-24 mx-auto rounded-3xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-2xl"
        >
          <Shield className="size-12 text-white" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
          {hasProfile ? translate('welcomeBack') : translate('heroTitle')}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {translate('heroSubtitle')}
        </p>
      </motion.div>

      {/* Setup reminder */}
      {!hasProfile && (
        <motion.div
          variants={item}
          className="bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/30 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="size-6 text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="mb-2">{translate('setupProfileTitle')}</h3>
              <p className="text-muted-foreground mb-4">
                {translate('setupProfileDesc')}
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('profile')}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary-hover transition-colors"
              >
                {translate('setupProfileButton')}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main actions */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('scanner')}
          className="group relative overflow-hidden bg-gradient-to-br from-primary to-primary-hover text-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all"
        >
          <div className="relative z-10">
            <div className="size-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <Camera className="size-7" />
            </div>
            <h3 className="text-xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              {translate('scanFood')}
            </h3>
            <p className="text-white/80">
              {translate('scanFoodDesc')}
            </p>
          </div>
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/20"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('chat')}
          className="group relative overflow-hidden bg-card border border-border p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all"
        >
          <div className="relative z-10">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center mb-4">
              <MessageCircle className="size-7 text-white" />
            </div>
            <h3 className="text-xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              {translate('aiAssistant')}
            </h3>
            <p className="text-muted-foreground">
              {translate('aiAssistantDesc')}
            </p>
          </div>
        </motion.button>
      </motion.div>

      {/* Stats/Features */}
      {hasProfile && (
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="size-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
                  {userProfile.allergies.length}
                </div>
                <div className="text-sm text-muted-foreground">{translate('trackedAllergies')}</div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-10 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="size-5 text-success" />
              </div>
              <div>
                <div className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
                  Safe
                </div>
                <div className="text-sm text-muted-foreground">{translate('protectionLevel')}</div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Sparkles className="size-5 text-secondary" />
              </div>
              <div>
                <div className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
                  AI
                </div>
                <div className="text-sm text-muted-foreground">{translate('poweredAnalysis')}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick tips */}
      <motion.div variants={item} className="bg-muted/50 rounded-2xl p-6">
        <h3 className="mb-4">{translate('quickTips')}</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs text-primary">1</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {translate('tip1')}
            </p>
          </li>
          <li className="flex items-start gap-3">
            <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs text-primary">2</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {translate('tip2')}
            </p>
          </li>
          <li className="flex items-start gap-3">
            <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs text-primary">3</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {translate('tip3')}
            </p>
          </li>
        </ul>
      </motion.div>
    </motion.div>
  );
}
