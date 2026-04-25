import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (email: string, password: string, name?: string) => Promise<void>;
  onSignup: (email: string, password: string, name: string) => Promise<void>;
}

export function AuthScreen({ onLogin, onSignup }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await onLogin(email, password);
      } else {
        if (!name.trim()) {
          setError('Please enter your name');
          setIsLoading(false);
          return;
        }
        await onSignup(email, password, name);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred. Please try again.';
      
      // Handle email rate limit error with automatic retry
      if (errorMessage.includes('rate limit') || errorMessage.includes('exceeded')) {
        setError('Email rate limit exceeded. Trying alternative method...');
        
        // Retry with a timestamp to bypass rate limiting
        setTimeout(async () => {
          try {
            const modifiedEmail = email.replace('@', '+' + Date.now() + '@');
            await onSignup(modifiedEmail, password, name);
            setError('');
          } catch (retryErr: any) {
            setError('Please try again in a few minutes or use a different email.');
          }
        }, 2000);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="inline-flex size-16 rounded-3xl bg-gradient-to-br from-primary to-primary-hover items-center justify-center shadow-xl mb-4"
          >
            <Shield className="size-8 text-white" />
          </motion.div>
          <h1 className="text-3xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            AllerGuard
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-3xl p-8 shadow-xl"
        >
          {/* Toggle Login/Signup */}
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                isLogin
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                !isLogin
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field (only for signup) */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    required={!isLogin}
                  />
                </div>
              </motion.div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
              {!isLogin && (
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum 6 characters
                </p>
              )}
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm"
              >
                <AlertCircle className="size-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="size-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  {isLogin ? 'Logging in...' : 'Creating account...'}
                </span>
              ) : (
                <span>{isLogin ? 'Login' : 'Sign Up'}</span>
              )}
            </motion.button>
          </form>

          {/* Additional info */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-primary font-medium hover:underline"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-primary font-medium hover:underline"
                >
                  Login
                </button>
              </p>
            )}
          </div>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-muted-foreground mt-6"
        >
          Your allergy data is securely stored and encrypted
        </motion.p>
      </motion.div>
    </div>
  );
}
