import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  History, 
  LogOut,
  Settings,
  UserCircle,
  ChevronRight,
  Menu,
  X,
  Shield,
  Briefcase,
  User,
  ChevronDown,
  Sparkles,
  Bell,
  HelpCircle
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [expandedSections, setExpandedSections] = useState(['main'])

  const getNavItems = () => {
    switch(user?.role) {
      case 'admin':
        return {
          main: [
            { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', badge: null },
            { path: '/admin/tenants', icon: Building2, label: 'Tenants', badge: null },
            { path: '/admin/users', icon: Users, label: 'Users', badge: null },
          ],
          analytics: [
            { path: '/admin/audit-logs', icon: History, label: 'Audit Logs', badge: 'New' },
          ]
        }
      case 'tenant':
        return {
          main: [
            { path: '/tenant', icon: LayoutDashboard, label: 'Dashboard', badge: null },
            { path: '/tenant/users', icon: Users, label: 'Team Members', badge: null },
          ],
          settings: [
            { path: '/tenant/settings', icon: Settings, label: 'Settings', badge: null },
          ]
        }
      case 'user':
        return {
          main: [
            { path: '/user', icon: LayoutDashboard, label: 'Dashboard', badge: null }
          ]
        }
      default:
        return {}
    }
  }

  const navSections = getNavItems()

  const getRoleIcon = () => {
    switch(user?.role) {
      case 'admin': return <Shield className="text-primary" size={24} />
      case 'tenant': return <Briefcase className="text-secondary" size={24} />
      case 'user': return <User className="text-textLight" size={24} />
      default: return <UserCircle size={24} />
    }
  }

  const getRoleBadge = () => {
    switch(user?.role) {
      case 'admin': return 'bg-primary/10 text-primary border-primary/20'
      case 'tenant': return 'bg-secondary/10 text-secondary border-secondary/20'
      case 'user': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
    // Navigation will be handled by logout function
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const navItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    })
  }

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile Toggle Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClose}
        className="fixed top-4 left-4 z-50 md:hidden bg-sidebar border border-border rounded-lg p-2 shadow-lg"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </motion.button>

      <motion.aside 
        initial={false}
        animate={{ 
          x: isOpen ? 0 : -280,
          transition: { type: "spring", stiffness: 300, damping: 30 }
        }}
        className={`
          fixed top-0 left-0 z-50
          w-72 bg-gradient-to-b from-sidebar to-sidebar/95
          border-r border-border/50
          min-h-screen flex flex-col
          shadow-2xl
          md:translate-x-0
        `}
      >
        {/* Header with Gradient */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-50" />
          <div className="relative p-6 border-b border-border/50">
            <motion.div 
              className="flex items-center justify-between mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg"
                >
                  <Building2 className="w-5 h-5 text-white" />
                </motion.div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  MultiTenant
                </h1>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="hidden md:block text-textLight hover:text-primary transition-colors"
              >
                <Bell size={18} />
              </motion.button>
            </motion.div>

            {/* User Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-4 p-3 bg-white/5 rounded-xl border border-border/50 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center border-2 border-primary/30">
                    {getRoleIcon()}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-sidebar ${getRoleBadge().split(' ')[0]}`} />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text truncate">{user?.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getRoleBadge()}`}>
                      {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                    </span>
                    <span className="text-xs text-textLight/60 truncate">{user?.email}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
          {Object.entries(navSections).map(([section, items], sectionIndex) => (
            <motion.div
              key={section}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + sectionIndex * 0.05 }}
              className="mb-6"
            >
              <motion.button
                onClick={() => toggleSection(section)}
                className="w-full flex items-center justify-between px-3 py-2 mb-2 text-xs font-semibold text-textLight uppercase tracking-wider"
                whileHover={{ x: 4 }}
              >
                <span>{section}</span>
                <motion.div
                  animate={{ rotate: expandedSections.includes(section) ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={14} />
                </motion.div>
              </motion.button>
              
              <AnimatePresence>
                {expandedSections.includes(section) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {items.map((item, index) => (
                      <motion.div
                        key={item.path}
                        custom={index}
                        variants={navItemVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <NavLink
                          to={item.path}
                          onClick={() => {
                            if (window.innerWidth < 768) onClose()
                          }}
                          className={({ isActive }) => `
                            group relative flex items-center gap-3 px-4 py-3 rounded-xl mb-1
                            transition-all duration-300 overflow-hidden
                            ${isActive 
                              ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary shadow-sm' 
                              : 'text-textLight hover:bg-white/5 hover:text-text'
                            }
                          `}
                        >
                          {({ isActive }) => (
                            <>
                              {/* Active Indicator */}
                              {isActive && (
                                <motion.div
                                  layoutId="activeNav"
                                  className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                              )}
                              
                              <item.icon size={20} className="relative z-10" />
                              <span className="flex-1 relative z-10 font-medium">{item.label}</span>
                              
                              {item.badge && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="relative z-10 px-2 py-0.5 text-xs font-semibold bg-primary text-white rounded-full"
                                >
                                  {item.badge}
                                </motion.span>
                              )}
                              
                              {isActive && (
                                <ChevronRight size={16} className="relative z-10" />
                              )}

                              {/* Hover Effect */}
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"
                                initial={{ x: '-100%' }}
                                whileHover={{ x: 0 }}
                                transition={{ duration: 0.3 }}
                              />
                            </>
                          )}
                        </NavLink>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 pt-4 border-t border-border/50"
          >
            <p className="text-xs font-semibold text-textLight uppercase tracking-wider px-3 mb-3">
              Quick Actions
            </p>
            <div className="space-y-1">
              <NavLink
                to="/help"
                onClick={() => {
                  if (window.innerWidth < 768) onClose()
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-textLight hover:bg-white/5 hover:text-text transition-all duration-300 group"
              >
                <HelpCircle size={20} className="group-hover:rotate-12 transition-transform" />
                <span>Help & Support</span>
              </NavLink>
            </div>
          </motion.div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border/50">
          <motion.button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-textLight hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 group"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={isLoggingOut ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 1, repeat: isLoggingOut ? Infinity : 0 }}
              >
                <LogOut size={20} />
              </motion.div>
              <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </div>
            <Sparkles size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
          
          {/* Version Info */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-xs text-textLight/40 mt-4"
          >
            Version 2.0.0
          </motion.p>
        </div>
      </motion.aside>
    </>
  )
}

export default Sidebar
