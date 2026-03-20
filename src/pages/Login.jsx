import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, Lock, LogIn, Eye, EyeOff, Sparkles, 
  Building2, Shield, User, AlertCircle 
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      await login(email, password)
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoCredentials = (type) => {
    if (type === 'admin') {
      setEmail('admin@system.com')
      setPassword('admin123')
    } else if (type === 'tenant') {
      setEmail('admin@zoho.com')
      setPassword('tenant123')
    } else if (type === 'user') {
      setEmail('jesli@zoho.com')
      setPassword('user123')
    }
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-sidebar flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-secondary/5 via-transparent to-primary/5 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full relative z-10"
      >
        <motion.div 
          className="card p-8 backdrop-blur-sm bg-card/95 border-border/50 shadow-2xl"
          whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
          transition={{ duration: 0.3 }}
        >
          {/* Logo and header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="inline-flex items-center justify-center mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              MultiTenant
            </h1>
            <p className="text-textLight">Welcome back! Sign in to your account</p>
          </motion.div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-sm"
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-textLight mb-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight group-focus-within:text-primary transition-colors duration-200" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10 transition-all duration-200 focus:shadow-lg"
                  placeholder="your@email.com"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-textLight mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight group-focus-within:text-primary transition-colors duration-200" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10 transition-all duration-200 focus:shadow-lg"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textLight hover:text-primary transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center gap-2 relative overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
              >
                <LogIn size={18} />
              </motion.div>
              <span>{isLoading ? 'Logging in...' : 'Login'}</span>
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
              />
            </motion.button>
          </form>

          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-textLight">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium inline-flex items-center gap-1 group">
                Register here
                <motion.span
                  initial={{ x: 0 }}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  →
                </motion.span>
              </Link>
            </p>
          </motion.div>

          {/* Demo credentials section */}
          <motion.div 
            className="mt-8 p-5 bg-sidebar rounded-xl border border-border/50 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-primary" />
              <h3 className="font-bold text-sm">Demo Credentials</h3>
            </div>
            <div className="space-y-2 text-sm">
              <motion.button
                onClick={() => fillDemoCredentials('admin')}
                className="w-full p-2 rounded-lg hover:bg-primary/10 transition-all duration-200 flex items-center justify-between group cursor-pointer"
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-primary" />
                  <span className="font-semibold">Admin:</span>
                  <span className="text-textLight">admin@system.com</span>
                </div>
                <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Click to fill
                </span>
              </motion.button>
              
              <motion.button
                onClick={() => fillDemoCredentials('tenant')}
                className="w-full p-2 rounded-lg hover:bg-primary/10 transition-all duration-200 flex items-center justify-between group cursor-pointer"
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-secondary" />
                  <span className="font-semibold">Tenant Admin:</span>
                  <span className="text-textLight">admin@zoho.com</span>
                </div>
                <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Click to fill
                </span>
              </motion.button>
              
              <motion.button
                onClick={() => fillDemoCredentials('user')}
                className="w-full p-2 rounded-lg hover:bg-primary/10 transition-all duration-200 flex items-center justify-between group cursor-pointer"
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center gap-2">
                  <User size={14} className="text-textLight" />
                  <span className="font-semibold">Regular User:</span>
                  <span className="text-textLight">jesli@zoho.com</span>
                </div>
                <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Click to fill
                </span>
              </motion.button>

              <div className="mt-4 pt-3 border-t border-border/50 text-center">
                <p className="text-xs text-textLight/80">
                  💡 <span className="font-medium text-primary">System Admin</span> has full access to all features
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.p 
          className="text-center text-textLight/60 text-xs mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Secure login powered by MultiTenant Platform
        </motion.p>
      </motion.div>
    </div>
  )
}

export default Login
