import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

function SignUp() {
  const navigate = useNavigate()
  const { signUp, signInWithGoogle } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const validatePassword = (password) => {
    const minLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    
    return { minLength, hasUpperCase, hasLowerCase, hasNumber }
  }

  const passwordValidation = validatePassword(formData.password)
  const isPasswordValid = Object.values(passwordValidation).every(Boolean)
  const passwordsMatch = formData.password === formData.confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!isPasswordValid) {
      setError('Password does not meet requirements')
      setLoading(false)
      return
    }

    if (!passwordsMatch) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      await signUp(formData.email, formData.password, formData.fullName)
      setSuccess('Account created successfully! Please check your email to verify your account.')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')

    try {
      await signInWithGoogle()
    } catch (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Create Account</h1>
        <p>Join the expense tracker community</p>
      </div>

      <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#fee', 
              color: '#c53030', 
              borderRadius: '8px', 
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {success && (
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#f0fff4', 
              color: '#38a169', 
              borderRadius: '8px', 
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          <div className="form-group">
            <label>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#666'
              }} />
              <input
                type="text"
                className="input"
                style={{ paddingLeft: '40px' }}
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#666'
              }} />
              <input
                type="email"
                className="input"
                style={{ paddingLeft: '40px' }}
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#666'
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            
            {/* Password requirements */}
            <div style={{ marginTop: '8px', fontSize: '0.9rem' }}>
              <div style={{ 
                color: passwordValidation.minLength ? '#38a169' : '#666',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginBottom: '2px'
              }}>
                {passwordValidation.minLength ? <CheckCircle size={12} /> : '○'} At least 8 characters
              </div>
              <div style={{ 
                color: passwordValidation.hasUpperCase ? '#38a169' : '#666',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginBottom: '2px'
              }}>
                {passwordValidation.hasUpperCase ? <CheckCircle size={12} /> : '○'} One uppercase letter
              </div>
              <div style={{ 
                color: passwordValidation.hasLowerCase ? '#38a169' : '#666',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginBottom: '2px'
              }}>
                {passwordValidation.hasLowerCase ? <CheckCircle size={12} /> : '○'} One lowercase letter
              </div>
              <div style={{ 
                color: passwordValidation.hasNumber ? '#38a169' : '#666',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {passwordValidation.hasNumber ? <CheckCircle size={12} /> : '○'} One number
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#666'
              }} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="input"
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            
            {formData.confirmPassword && !passwordsMatch && (
              <div style={{ color: '#c53030', fontSize: '0.9rem', marginTop: '4px' }}>
                Passwords do not match
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn"
            style={{ width: '100%', marginBottom: '15px' }}
            disabled={loading || !isPasswordValid || !passwordsMatch}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="btn btn-secondary"
            style={{ width: '100%', marginBottom: '20px' }}
            disabled={loading}
          >
            Continue with Google
          </button>

          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#667eea', textDecoration: 'none' }}>
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignUp 