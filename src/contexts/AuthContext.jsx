import React, { createContext, useContext, useEffect, useState } from 'react'
// import { supabase, getCurrentUser, upsertUserProfile } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Temporary: Set a mock user for demo
    setUser({ id: '1', email: 'demo@example.com' })
    setUserProfile({ id: '1', full_name: 'Demo User', email: 'demo@example.com' })
    setLoading(false)
  }, [])

  const loadUserProfile = async (userId) => {
    // Temporary mock implementation
    setUserProfile({ id: userId, full_name: 'Demo User', email: 'demo@example.com' })
  }

  const signUp = async (email, password, fullName) => {
    // Temporary mock implementation
    console.log('Sign up:', email, fullName)
    return { user: { id: '1', email } }
  }

  const signIn = async (email, password) => {
    // Temporary mock implementation
    console.log('Sign in:', email)
    return { user: { id: '1', email } }
  }

  const signOut = async () => {
    // Temporary mock implementation
    console.log('Sign out')
    setUser(null)
    setUserProfile(null)
  }

  const signInWithGoogle = async () => {
    // Temporary mock implementation
    console.log('Google sign in')
    return { user: { id: '1', email: 'demo@example.com' } }
  }

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 