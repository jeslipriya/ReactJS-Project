import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

const StatsCard = ({ title, value, icon: Icon, color = "primary", trend = null, subtitle = null }) => {
  const getColorClasses = () => {
    switch(color) {
      case 'primary': return 'text-primary bg-primary/10'
      case 'green': return 'text-green-600 bg-green-100'
      case 'blue': return 'text-blue-600 bg-blue-100'
      case 'yellow': return 'text-yellow-600 bg-yellow-100'
      case 'purple': return 'text-purple-600 bg-purple-100'
      default: return 'text-primary bg-primary/10'
    }
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="stat-card group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-xl ${getColorClasses()}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      
      <h3 className="text-2xl font-bold text-text mb-1">{value}</h3>
      <p className="text-textLight text-sm">{title}</p>
      {subtitle && (
        <p className="text-xs text-textLight mt-2">{subtitle}</p>
      )}
    </motion.div>
  )
}

export default StatsCard