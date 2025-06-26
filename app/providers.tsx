'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import Loading from '../components/Loading'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'finance-tracker-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      try {
        const storedTheme = localStorage.getItem(storageKey) as Theme
        if (storedTheme && ['dark', 'light', 'system'].includes(storedTheme)) {
          setTheme(storedTheme)
        }
      } catch (error) {
        console.warn('Failed to load theme from localStorage:', error)
      }
    }
  }, [storageKey])

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return
    
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme, mounted])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, theme)
        } catch (error) {
          console.warn('Failed to save theme to localStorage:', error)
        }
      }
      setTheme(theme)
    },
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <ThemeProviderContext.Provider {...props} value={value}>
        {children}
      </ThemeProviderContext.Provider>
    )
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}

// Auth Context
type User = {
  id: string
  email: string
  name: string
  role: string
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if user is logged in on mount
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      if (typeof window === 'undefined') {
        setLoading(false)
        return
      }
      
      const token = localStorage.getItem('token')
      if (token) {
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          try {
            localStorage.removeItem('token')
          } catch (error) {
            console.warn('Failed to remove token from localStorage:', error)
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const { token, user } = await response.json()
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('token', token)
          } catch (error) {
            console.warn('Failed to save token to localStorage:', error)
          }
        }
        setUser(user)
        return true
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, otpVerified: true }),
      })

      if (response.ok) {
        const { token, user } = await response.json()
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('token', token)
          } catch (error) {
            console.warn('Failed to save token to localStorage:', error)
          }
        }
        setUser(user)
        return true
      }
      return false
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('token')
      } catch (error) {
        console.warn('Failed to remove token from localStorage:', error)
      }
    }
    setUser(null)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <AuthContext.Provider value={{ user: null, login, register, logout, loading: true }}>
        <div className="min-h-screen flex items-center justify-center">
          <Loading size="lg" text="Initializing..." />
        </div>
      </AuthContext.Provider>
    )
  }

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <AuthContext.Provider value={{ user, login, register, logout, loading }}>
        <div className="min-h-screen flex items-center justify-center">
          <Loading size="lg" text="Checking authentication..." />
        </div>
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="finance-tracker-theme">
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}