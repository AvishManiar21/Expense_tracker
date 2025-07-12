import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import AddExpense from './components/AddExpense'
import Friends from './components/Friends'
import Groups from './components/Groups'
import GroupDetails from './components/GroupDetails'
import SettleUp from './components/SettleUp'
import ActivityFeed from './components/ActivityFeed'
import Login from './components/Login'
import SignUp from './components/SignUp'
import './App.css'
import { supabase, upsertUserProfile } from './lib/supabase'

// AuthRedirect component to handle redirect logic
import { useLocation, useNavigate } from 'react-router-dom'
function AuthRedirect({ isAuthenticated }) {
  const location = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/signup') {
      navigate('/login')
    }
  }, [isAuthenticated, location, navigate])
  return null
}

function App() {
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('App.jsx: onAuthStateChange', event, session)
      setIsAuthenticated(!!session)
      setUser(session?.user || null)
      if (session?.user) {
        try {
          await upsertUserProfile(session.user)
        } catch (err) {
          console.error('Profile upsert error:', err.message)
        }
      }
    })
    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])



  const handleSignOut = async () => {
    console.log('App.jsx: handleSignOut called')
    try {
      await supabase.auth.signOut()
      console.log('App.jsx: supabase.auth.signOut completed')
    } catch (err) {
      console.error('App.jsx: supabase.auth.signOut error', err)
    }
    setIsAuthenticated(false)
    setUser(null)
    console.log('App.jsx: isAuthenticated set to', false)
    console.log('App.jsx: user set to', null)
  }

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />
  }

  return (
    <Router>
      <AuthRedirect isAuthenticated={isAuthenticated} />
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Login />
            } 
          />
          <Route 
            path="/signup" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <SignUp />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard user={user} onSignOut={handleSignOut} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/add-expense" 
            element={
              <ProtectedRoute>
                <AddExpense />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/friends" 
            element={
              <ProtectedRoute>
                <Friends user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/groups" 
            element={
              <ProtectedRoute>
                <Groups user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/group/:groupId" 
            element={
              <ProtectedRoute>
                <GroupDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settle-up" 
            element={
              <ProtectedRoute>
                <SettleUp />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/activity" 
            element={
              <ProtectedRoute>
                <ActivityFeed />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to="/dashboard" replace />} 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App 