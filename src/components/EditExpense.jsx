import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'

function EditExpense({ expense, onSave, onClose }) {
  const [formData, setFormData] = useState({ ...expense })
  const [customSplits, setCustomSplits] = useState(() => {
    if (expense.splitType === 'custom') {
      const splits = {}
      expense.splits.forEach(s => { splits[s.personName] = s.amount })
      return splits
    }
    return {}
  })
  const [selectedPeople, setSelectedPeople] = useState(expense.splits.map(s => s.personName))

  const allPeople = ['You', 'John Doe', 'Jane Smith', 'Mike Johnson']
  const totalAmount = parseFloat(formData.amount) || 0

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const togglePerson = (personName) => {
    if (selectedPeople.includes(personName)) {
      setSelectedPeople(prev => prev.filter(name => name !== personName))
    } else {
      setSelectedPeople(prev => [...prev, personName])
    }
  }

  const calculateEqualSplit = () => {
    if (selectedPeople.length === 0) return {}
    const splitAmount = totalAmount / selectedPeople.length
    const splits = {}
    selectedPeople.forEach(personName => {
      splits[personName] = splitAmount
    })
    return splits
  }

  const handleCustomSplitChange = (personName, amount) => {
    setCustomSplits(prev => ({
      ...prev,
      [personName]: parseFloat(amount) || 0
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
    const updatedExpense = {
      ...formData,
      amount: totalAmount,
      splits: Object.entries(splits).map(([personName, amount]) => ({
        personName,
        amount: amount
      }))
    }
    onSave(updatedExpense)
  }

  const currentSplits = getCurrentSplits()
  const totalSplit = Object.values(currentSplits).reduce((sum, amount) => sum + amount, 0)
  const difference = totalAmount - totalSplit

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Edit Expense</h2>
          <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
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
              {allPeople.map(person => (
                <option key={person} value={person}>
                  {person}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Split with</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
              {allPeople.map(person => (
                <div key={person} className="friend-item">
                  <div className="friend-info">
                    <div className="friend-avatar">
                      {person.charAt(0)}
                    </div>
                    <span>{person}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedPeople.includes(person)}
                    onChange={() => togglePerson(person)}
                  />
                </div>
              ))}
            </div>
          </div>
          {selectedPeople.length > 0 && (
            <>
              <div className="form-group">
                <label>Split Type</label>
                <div className="split-options">
                  <div
                    className={`split-option ${formData.splitType === 'equal' ? 'active' : ''}`}
                    onClick={() => handleInputChange('splitType', 'equal')}
                  >
                    Equal Split
                  </div>
                  <div
                    className={`split-option ${formData.splitType === 'custom' ? 'active' : ''}`}
                    onClick={() => handleInputChange('splitType', 'custom')}
                  >
                    Custom Amounts
                  </div>
                </div>
              </div>
              {formData.splitType === 'custom' && (
                <div className="form-group">
                  <label>Custom Split Amounts</label>
                  {selectedPeople.map(personName => (
                    <div key={personName} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ flex: 1 }}>{personName}</span>
                      <input
                        type="number"
                        className="input"
                        style={{ width: '150px' }}
                        value={customSplits[personName] || ''}
                        onChange={(e) => handleCustomSplitChange(personName, e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  ))}
                  <div style={{ 
                    padding: '10px', 
                    backgroundColor: Math.abs(difference) > 0.01 ? '#ffe6e6' : '#e6ffe6',
                    borderRadius: '8px',
                    marginTop: '10px'
                  }}>
                    <strong>Total Split:</strong> ${totalSplit.toFixed(2)} | 
                    <strong>Difference:</strong> ${difference.toFixed(2)}
                    {Math.abs(difference) > 0.01 && (
                      <span style={{ color: '#dc3545', marginLeft: '10px' }}>
                        ⚠️ Split amounts don't match total
                      </span>
                    )}
                  </div>
                </div>
              )}
              {formData.splitType === 'equal' && (
                <div className="form-group">
                  <label>Split Preview</label>
                  <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    {selectedPeople.map(personName => (
                      <div key={personName} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span>{personName}</span>
                        <span>${(totalAmount / selectedPeople.length).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '30px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
              disabled={!validateForm()}
            >
              <Plus size={16} style={{ marginRight: '8px' }} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditExpense 