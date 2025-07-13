import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, TrendingUp, Users, CreditCard } from 'lucide-react'
import { supabase, upsertUserProfile } from '../lib/supabase'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('') // Clear error when user types
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })
      if (error) throw error
      // Upsert user profile after successful login
      if (data.user) {
        try {
          await upsertUserProfile(data.user)
        } catch (upsertError) {
          // Ignore RLS errors, show friendly message for others
          if (!upsertError.message?.includes('row-level security policy')) {
            setError(upsertError.message || 'An error occurred. Please try again.')
            setIsLoading(false)
            return
          }
        }
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-background-pattern"></div>
      </div>
      
      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <TrendingUp size={32} className="logo-icon" />
              <h1>ExpenseTracker</h1>
            </div>
            <h2>Welcome back</h2>
            <p>Sign in to manage your expenses and split bills with friends</p>
          </div>

          {error && (
            <div className="error-message login-error">
              <div className="error-icon">⚠️</div>
              <div className="error-text">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="login-input"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle login-password-toggle"
                  disabled={isLoading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="login-link">
                Create account
              </Link>
            </p>
          </div>
        </div>

        <div className="login-features">
          <div className="feature-item">
            <div className="feature-icon">
              <TrendingUp size={24} />
            </div>
            <div className="feature-content">
              <h3>Track Expenses</h3>
              <p>Monitor your spending with detailed analytics and insights</p>
            </div>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <Users size={24} />
            </div>
            <div className="feature-content">
              <h3>Split Bills</h3>
              <p>Easily split expenses with friends and family</p>
            </div>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <CreditCard size={24} />
            </div>
            <div className="feature-content">
              <h3>Smart Categories</h3>
              <p>Organize expenses with intelligent categorization</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login 