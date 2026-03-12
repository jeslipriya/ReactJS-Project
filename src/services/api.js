import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: 'https://reactjs-project-q3cc.onrender.com',
  timeout: 10000,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again.')
    } else if (!error.response) {
      toast.error('Network error. Please check your connection.')
    } else {
      toast.error(error.response.data?.message || 'An error occurred')
    }
    return Promise.reject(error)
  }
)

export default api