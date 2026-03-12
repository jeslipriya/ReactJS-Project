import { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { createAuditLog } from '../services/auditLogService'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await axios.get(`http://localhost:5000/users?email=${email}&password=${password}`)
      const users = response.data
      
      if (users.length > 0) {
        const userData = users[0]
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        
        await createAuditLog({
          action: 'LOGIN',
          user: userData.name,
          role: userData.role,
          details: `User logged in successfully`,
          timestamp: new Date().toISOString()
        })
        
        toast.success(`Welcome back, ${userData.name}!`)
        
        // Redirect based on role
        switch(userData.role) {
          case 'admin':
            navigate('/admin')
            break
          case 'tenant':
            navigate('/tenant')
            break
          case 'user':
            navigate('/user')
            break
          default:
            navigate('/')
        }
      } else {
        toast.error('Invalid email or password')
      }
    } catch (error) {
      toast.error('Login failed. Please try again.')
    }
  }

  const register = async (userData) => {
    try {
      // Check if user exists
      const existingUser = await axios.get(`http://localhost:5000/users?email=${userData.email}`)
      if (existingUser.data.length > 0) {
        toast.error('User already exists')
        return
      }

      // Create new user
      const newUser = {
        ...userData,
        id: Date.now().toString(),
        joinedAt: new Date().toISOString().split('T')[0],
        status: 'active',
        avatar: `https://ui-avatars.com/api/?name=${userData.name}&background=7A5C4D&color=fff`
      }

      const response = await axios.post('http://localhost:5000/users', newUser)
      
      // Update tenant users count if applicable
      if (userData.tenantId) {
        const tenant = await axios.get(`http://localhost:5000/tenants/${userData.tenantId}`)
        await axios.patch(`http://localhost:5000/tenants/${userData.tenantId}`, {
          usersCount: tenant.data.usersCount + 1
        })
      }

      await createAuditLog({
        action: 'REGISTER',
        user: userData.name,
        role: userData.role,
        details: `New user registered`,
        timestamp: new Date().toISOString()
      })

      toast.success('Registration successful! Please login.')
      navigate('/login')
    } catch (error) {
      toast.error('Registration failed. Please try again.')
    }
  }

  const logout = async () => {
    if (user) {
      await createAuditLog({
        action: 'LOGOUT',
        user: user.name,
        role: user.role,
        details: `User logged out`,
        timestamp: new Date().toISOString()
      })
    }
    
    setUser(null)
    localStorage.removeItem('user')
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  )
}