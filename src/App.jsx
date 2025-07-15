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
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './lib/firebase'

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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setIsAuthenticated(!!firebaseUser)
      setUser(firebaseUser)
    })
    return () => unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error('Sign out error:', err)
    }
    setIsAuthenticated(false)
    setUser(null)
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
            path="/groups/:groupId" 
            element={
              <ProtectedRoute>
                <GroupDetails user={user} />
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
                <ActivityFeed user={user} />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App 