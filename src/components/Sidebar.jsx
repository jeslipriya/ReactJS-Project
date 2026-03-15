import logo from '../assets/logo.png'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  History, 
  LogOut,
  Settings,
  UserCircle,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Sidebar = () => {
  const { user, logout } = useAuth()

  const getNavItems = () => {
    switch(user?.role) {
      case 'admin':
        return [
          { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/admin/tenants', icon: Building2, label: 'Tenants' },
          { path: '/admin/users', icon: Users, label: 'Users' },
          { path: '/admin/audit-logs', icon: History, label: 'Audit Logs' },
        ]
      case 'tenant':
        return [
          { path: '/tenant', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/tenant/users', icon: Users, label: 'Team Members' },
          { path: '/tenant/settings', icon: Settings, label: 'Settings' },
        ]
      case 'user':
        return [
          { path: '/user', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/user/profile', icon: UserCircle, label: 'Profile' },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  return (
    <motion.aside 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-64 bg-sidebar border-r border-border min-h-screen p-6 flex flex-col"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">MultiTenant</h1>
        <p className="text-sm text-textLight mt-1">Welcome back, {user?.name}</p>
      </div>

      <nav className="flex-1">
        {navItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-300
              ${isActive 
                ? 'bg-primary text-white shadow-soft' 
                : 'text-textLight hover:bg-border/50 hover:text-text'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight size={16} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={logout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-textLight hover:bg-border/50 hover:text-text transition-all duration-300 mt-auto"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </motion.aside>
  )
}

export default Sidebar
