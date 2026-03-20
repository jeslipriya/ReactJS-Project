import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()

  const handleSubmit = (e) => {
    e.preventDefault()
    login(email, password)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">MultiTenant</h1>
            <p className="text-textLight">Welcome back! Please login to your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-textLight mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-textLight mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <LogIn size={18} />
              <span>Login</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-textLight">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Register here
              </Link>
            </p>
          </div>

          <div className="mt-8 p-4 bg-sidebar rounded-xl border border-border">
            <h3 className="font-bold mb-2">Demo Credentials</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">Admin:</span> admin@system.com / admin123</p>
              <p><span className="font-semibold">Tenant:</span> admin@zoho.com / tenant123</p>
              <p><span className="font-semibold">User:</span> jesli@zoho.com / user123</p>

              <div className="mt-6 text-center">
                <p className="text-textLight text-sm">Login as <span className="font-semibold">System Admin</span> to explore all features of this platform </p>    
              </div>
            </div>  
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
