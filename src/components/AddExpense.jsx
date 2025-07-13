import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'

function AddExpense({ user }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paidBy: '',
    category: 'General',
    splitType: 'equal',
    groupId: null
  })
  const [friends, setFriends] = useState([])
  const [selectedPeople, setSelectedPeople] = useState([])
  const [customSplits, setCustomSplits] = useState({})
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    const fetchFriends = async () => {
      if (!user?.id) return
      const { data, error } = await supabase
        .from('friends')
        .select('friend_id, users:friend_id(full_name, email, id)')
        .eq('user_id', user.id)
      if (error) {
        setFriends([])
        return
      }
      const realFriends = data.map(f => f.users)
      setFriends(realFriends)
      // By default, select the user and all friends
      setSelectedPeople([{ id: user.id, full_name: 'You', email: user.email }, ...realFriends])
      setFormData(prev => ({ ...prev, paidBy: user.id }))
    }
    fetchFriends()
  }, [user])

  const totalAmount = parseFloat(formData.amount) || 0

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const togglePerson = (person) => {
    if (selectedPeople.some(p => p.id === person.id)) {
      setSelectedPeople(prev => prev.filter(p => p.id !== person.id))
    } else {
      setSelectedPeople(prev => [...prev, person])
    }
  }

  const calculateEqualSplit = () => {
    if (selectedPeople.length === 0) return {}
    const splitAmount = totalAmount / selectedPeople.length
    const splits = {}
    selectedPeople.forEach(person => {
      splits[person.id] = splitAmount
    })
    return splits
  }

  const handleCustomSplitChange = (personId, amount) => {
    setCustomSplits(prev => ({
      ...prev,
      [personId]: parseFloat(amount) || 0
    }))
  }

  const getCurrentSplits = () => {
    if (formData.splitType === 'equal') {
      return calculateEqualSplit()
    }
    return customSplits
  }

  const validateForm = () => {
    if (!formData.description || !formData.amount || selectedPeople.length === 0) {
      return false
    }

    if (formData.splitType === 'custom') {
      const totalSplit = Object.values(customSplits).reduce((sum, amount) => sum + amount, 0)
      if (Math.abs(totalSplit - totalAmount) > 0.01) {
        return false
      }
    }

    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      alert('Please fill in all required fields and ensure split amounts match the total.')
      return
    }

    const splits = getCurrentSplits()
    const expense = {
      ...formData,
      amount: totalAmount,
      paidBy: formData.paidBy,
      splits: Object.entries(splits).map(([personId, amount]) => ({
        personId,
        amount: amount
      }))
    }

    console.log('New expense added:', expense)
    setShowSuccess(true)
    
    // Show success message for 2 seconds then redirect
    setTimeout(() => {
      navigate('/dashboard')
    }, 2000)
  }

  const currentSplits = getCurrentSplits()
  const totalSplit = Object.values(currentSplits).reduce((sum, amount) => sum + amount, 0)
  const difference = totalAmount - totalSplit

  return (
    <div className="container">
      <div className="header">
        <h1>Add Expense</h1>
        <p>Track a new expense and split it with friends</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
            style={{ marginRight: '20px' }}
          >
            <ArrowLeft size={16} style={{ marginRight: '8px' }} />
            Back
          </button>
          <h2>New Expense</h2>
        </div>

        {showSuccess && (
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
            ✓ Expense added successfully! Redirecting to dashboard...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              className="input"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="What was this expense for?"
            />
          </div>

          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              className="input"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              className="input"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              className="input"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
            >
              <option value="General">General</option>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Shopping">Shopping</option>
              <option value="Bills">Bills</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Paid by</label>
            <select
              className="input"
              value={formData.paidBy}
              onChange={(e) => handleInputChange('paidBy', e.target.value)}
            >
              <option value={user?.id || ''}>You</option>
              {friends.map(friend => (
                <option key={friend.id} value={friend.id}>{friend.full_name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Split with</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                type="button"
                className={selectedPeople.some(p => p.id === user?.id) ? 'btn btn-secondary' : 'btn'}
                onClick={() => togglePerson({ id: user.id, full_name: 'You', email: user.email })}
                style={{ minWidth: 80 }}
              >
                You
              </button>
              {friends.map(friend => (
                <button
                  key={friend.id}
                  type="button"
                  className={selectedPeople.some(p => p.id === friend.id) ? 'btn btn-secondary' : 'btn'}
                  onClick={() => togglePerson(friend)}
                  style={{ minWidth: 80 }}
                >
                  {friend.full_name}
                </button>
              ))}
            </div>
          </div>

          {formData.splitType === 'custom' && (
            <div className="form-group">
              <label>Custom Splits</label>
              {selectedPeople.map(person => (
                <div key={person.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ minWidth: 80 }}>{person.full_name === 'You' ? 'You' : person.full_name}</span>
                  <input
                    type="number"
                    className="input"
                    value={customSplits[person.id] || ''}
                    onChange={e => handleCustomSplitChange(person.id, e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              ))}
              <div style={{ color: Math.abs(difference) > 0.01 ? '#e53e3e' : '#38a169', fontSize: '14px', marginTop: '8px' }}>
                {Math.abs(difference) > 0.01
                  ? `Split total must match amount (${totalAmount.toFixed(2)})`
                  : 'Split matches total!'}
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Split Type</label>
            <select
              className="input"
              value={formData.splitType}
              onChange={(e) => handleInputChange('splitType', e.target.value)}
            >
              <option value="equal">Equal</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <button type="submit" className="btn" style={{ width: '100%', marginTop: '20px' }}>
            Add Expense
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddExpense 