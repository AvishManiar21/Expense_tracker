import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { supabase, upsertUserProfile } from '../lib/supabase'

function SignUp({ onSignUp }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('') // Clear error when user types
  }

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields')
      return false
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.name } }
      })
      if (error) throw error
      // Do NOT upsert user profile here. Upsert should happen after authentication (e.g., after login or in dashboard loader).
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Create Account</h1>
            <p>Sign up to start tracking your expenses</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <User size={16} />
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <div className="input-with-icon">
                <Mail size={16} />
                <input
                  type="email"
                  className="input"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-with-icon">
                <Lock size={16} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="input"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn"
              disabled={isLoading}
              style={{ width: '100%', marginTop: '20px' }}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="link">
                Sign in
              </Link>
            </p>
          </div>

          <div style={{ 
            marginTop: '30px', 
            padding: '15px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            fontSize: '14px',
            color: '#718096'
          }}>
            <strong>Note:</strong> This is a demo app. You can use any email and password to sign up.
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp 