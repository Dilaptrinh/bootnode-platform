import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react'
import axios from 'axios'
import authService from '../api/authService'
import userService from '../api/userService'
import {
  setAccessToken,
  clearAccessToken,
  clearRefreshToken,
} from '../api/tokenStorage'
import { API_BASE_URL } from '../config'

const AuthContext = createContext()

const initialUser = () => {
  try {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(initialUser)
  const [initializing, setInitializing] = useState(true)
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    const initAuth = async () => {
      try {
        const res = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {}, { withCredentials: true })
        const auth = res.data.data
        setAccessToken(auth.accessToken)
      } catch {
        clearAccessToken()
        clearRefreshToken()
        localStorage.removeItem('user')
        setUser(null)
        setInitializing(false)
        return
      }
      try {
        const profileRes = await userService.getProfile()
        const userData = profileRes.data.data
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
      } catch {
        clearAccessToken()
        localStorage.removeItem('user')
        setUser(null)
      } finally {
        setInitializing(false)
      }
    }
    initAuth()
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      clearAccessToken()
    }
    clearAccessToken()
    clearRefreshToken()
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const value = useMemo(() => ({
    user,
    setUser,
    initializing,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
    isSuperAdmin: user?.role === 'SUPER_ADMIN',
  }), [user, setUser, initializing, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
