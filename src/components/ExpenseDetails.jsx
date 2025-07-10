import React from 'react'
import { X, Calendar, Tag } from 'lucide-react'

function ExpenseDetails({ expense, onClose }) {
  if (!expense) return null

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Food': return '🍽️'
      case 'Transport': return '🚗'
      case 'Entertainment': return '🎬'
      case 'Shopping': return '🛍️'
      case 'Bills': return '📄'
      default: return '💰'
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {getCategoryIcon(expense.category)} {expense.description}
          </h2>
          <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div style={{ marginBottom: '16px', color: '#718096', fontSize: '15px' }}>
          <Calendar size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          {expense.date} &nbsp;|&nbsp;
          <Tag size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          {expense.category}
        </div>
        <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '12px' }}>
          Total: ${expense.amount.toFixed(2)}
        </div>
        <div style={{ marginBottom: '12px' }}>
          <span style={{ color: '#4a5568' }}>Paid by:</span> <strong>{expense.paidBy}</strong>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <span style={{ color: '#4a5568' }}>Split:</span>
          <ul style={{ margin: '8px 0 0 0', padding: 0, listStyle: 'none' }}>
            {expense.splits.map(split => (
              <li key={split.personName} style={{ marginBottom: '4px' }}>
                {split.personName}: <strong>${split.amount.toFixed(2)}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ExpenseDetails 