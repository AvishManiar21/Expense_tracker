import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Users, DollarSign, Calendar, Tag, Pencil, Trash2 } from 'lucide-react'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

function GroupDetails({ user }) {
  const navigate = useNavigate()
  const { groupId } = useParams()
  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)

  useEffect(() => {
    const fetchGroupDetails = async () => {
      setLoading(true)
      setError('')
      try {
        // Fetch group info
        const groupDoc = await getDoc(doc(db, 'groups', groupId))
        if (!groupDoc.exists()) throw new Error('Group not found')
        setGroup({ id: groupId, ...groupDoc.data() })
        // Fetch group members
        const membersQ = query(collection(db, 'group_members'), where('group_id', '==', groupId))
        const membersSnap = await getDocs(membersQ)
        const memberIds = membersSnap.docs.map(doc => doc.data().user_id)
        const memberProfiles = await Promise.all(memberIds.map(async (uid) => {
          const userDoc = await getDoc(doc(db, 'users', uid))
          return userDoc.exists() ? userDoc.data() : null
        }))
        setMembers(memberProfiles.filter(Boolean))
        // Fetch group expenses
        const expensesQ = query(collection(db, 'expenses'), where('group_id', '==', groupId))
        const expensesSnap = await getDocs(expensesQ)
        const expensesData = expensesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setExpenses(expensesData)
      } catch (err) {
        setError(err.message || 'Failed to load group details')
      } finally {
        setLoading(false)
      }
    }
    fetchGroupDetails()
  }, [groupId])

  if (error) {
    return <div className="container"><div className="header"><h1>Error</h1><p>{error}</p></div></div>
  }
  if (!group) {
    return <div className="container"><div className="header"><h1>Group not found</h1></div></div>
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const yourBalance = members.find(m => m.id === user?.id)?.balance || 0

  const getBalanceColor = (balance) => {
    if (balance > 0) return '#38a169'
    if (balance < 0) return '#e53e3e'
    return '#718096'
  }

  const getBalanceText = (balance) => {
    if (balance > 0) return `You're owed $${balance.toFixed(2)}`
    if (balance < 0) return `You owe $${Math.abs(balance).toFixed(2)}`
    return 'Settled up'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

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

  const handleEditExpense = (expense) => {
    setEditingExpense(expense)
  }

  const handleSaveEdit = (updatedExpense) => {
    // In a real app, you would update the expense in the database
    console.log('Saving edited expense:', updatedExpense)
    setEditingExpense(null)
  }

  const handleDeleteExpense = (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      // In real app, this would delete the expense from the database
      console.log('Deleted expense:', expenseId)
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>{group.avatar} {group.name}</h1>
        <p>{group.description}</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <button 
            onClick={() => navigate('/groups')}
            className="btn btn-secondary"
            style={{ marginRight: '20px' }}
          >
            <ArrowLeft size={16} style={{ marginRight: '8px' }} />
            Back to Groups
          </button>
          <h2>Group Details</h2>
        </div>

        {/* Group Summary */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f7fafc', 
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>💰</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              ${totalExpenses.toFixed(2)}
            </div>
            <div style={{ color: '#718096', fontSize: '14px' }}>
              Total Expenses
            </div>
          </div>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f7fafc', 
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>👥</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {members.length}
            </div>
            <div style={{ color: '#718096', fontSize: '14px' }}>
              Members
            </div>
          </div>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f7fafc', 
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: getBalanceColor(yourBalance)
            }}>
              ${Math.abs(yourBalance).toFixed(2)}
            </div>
            <div style={{ 
              color: getBalanceColor(yourBalance), 
              fontSize: '14px' 
            }}>
              {getBalanceText(yourBalance)}
            </div>
          </div>
        </div>

        {/* Members Section */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '16px' }}>Members</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '12px' 
          }}>
            {members.map(member => (
              <div key={member.id} className="friend-item">
                <div className="friend-info">
                  <div className="friend-avatar">
                    {member.avatar}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0' }}>{member.name}</h4>
                    <p style={{ color: '#718096', fontSize: '14px', margin: '0' }}>
                      {member.email}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: getBalanceColor(member.balance)
                  }}>
                    ${Math.abs(member.balance).toFixed(2)}
                  </div>
                  <p style={{ 
                    fontSize: '12px', 
                    color: getBalanceColor(member.balance),
                    margin: '4px 0 0 0'
                  }}>
                    {member.balance > 0 ? 'You owe them' : member.balance < 0 ? 'They owe you' : 'Settled up'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses Section */}
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px' 
          }}>
            <h3>Expenses</h3>
            <button
              onClick={() => setShowAddExpense(true)}
              className="btn"
            >
              <Plus size={16} style={{ marginRight: '8px' }} />
              Add Expense
            </button>
          </div>

          <div className="expenses-list">
            {expenses.map(expense => (
              <div key={expense.id} className="expense-item" style={{
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span>{getCategoryIcon(expense.category)}</span>
                      <span style={{ fontWeight: 'bold' }}>{expense.description}</span>
                      <span style={{ 
                        backgroundColor: '#f7fafc', 
                        padding: '2px 8px', 
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        {expense.category}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#718096', marginBottom: '8px' }}>
                      Paid by {expense.paidBy} on {formatDate(expense.date)}
                    </div>
                    <div style={{ fontSize: '14px', color: '#4a5568' }}>
                      Split: {expense.splits.map(split => (
                        <span key={split.personName} style={{ 
                          display: 'inline-block',
                          marginRight: '8px',
                          padding: '2px 6px',
                          backgroundColor: '#e2e8f0',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {split.personName}: ${split.amount.toFixed(2)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '20px', 
                      fontWeight: 'bold',
                      marginBottom: '8px'
                    }}>
                      ${expense.amount.toFixed(2)}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEditExpense(expense)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 8px' }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="btn btn-secondary"
                        style={{ 
                          padding: '6px 8px',
                          backgroundColor: '#fed7d7',
                          color: '#e53e3e'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {expenses.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#718096',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px'
            }}>
              <DollarSign size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h3>No expenses yet</h3>
              <p>Add your first expense to start tracking!</p>
              <button
                onClick={() => setShowAddExpense(true)}
                className="btn"
                style={{ marginTop: '16px' }}
              >
                <Plus size={16} style={{ marginRight: '8px' }} />
                Add First Expense
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="modal-overlay">
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Add Expense to {group.name}</h3>
              <button
                onClick={() => setShowAddExpense(false)}
                className="btn btn-secondary"
                style={{ padding: '8px' }}
              >
                ✕
              </button>
            </div>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>This would open the Add Expense form with the group pre-selected.</p>
              <button
                onClick={() => navigate('/add-expense', { state: { groupId: group.id } })}
                className="btn"
              >
                Go to Add Expense
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {editingExpense && (
        <div className="modal-overlay">
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Edit Expense</h3>
              <button
                onClick={() => setEditingExpense(null)}
                className="btn btn-secondary"
                style={{ padding: '8px' }}
              >
                ✕
              </button>
            </div>
            <EditExpenseForm 
              expense={editingExpense} 
              onSave={handleSaveEdit} 
              onCancel={() => setEditingExpense(null)} 
              members={members.map(m => m.full_name)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default GroupDetails 

function EditExpenseForm({ expense, onSave, onCancel, members }) {
  const [form, setForm] = useState({
    description: expense.description,
    amount: expense.amount,
    paidBy: expense.paidBy,
    date: expense.date,
    category: expense.category,
    splits: expense.splits.map(s => ({ ...s })),
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSplitChange = (idx, value) => {
    setForm(f => ({
      ...f,
      splits: f.splits.map((s, i) => i === idx ? { ...s, amount: parseFloat(value) || 0 } : s)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...expense, ...form })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Description</label>
        <input
          type="text"
          className="input"
          name="description"
          value={form.description}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Amount</label>
        <input
          type="number"
          className="input"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          step="0.01"
        />
      </div>
      <div className="form-group">
        <label>Paid By</label>
        <select
          className="input"
          name="paidBy"
          value={form.paidBy}
          onChange={handleChange}
        >
          {members.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Date</label>
        <input
          type="date"
          className="input"
          name="date"
          value={form.date}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Category</label>
        <input
          type="text"
          className="input"
          name="category"
          value={form.category}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Split</label>
        {form.splits.map((split, idx) => (
          <div key={split.personName} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ minWidth: '80px' }}>{split.personName}:</span>
            <input
              type="number"
              className="input"
              value={split.amount}
              onChange={e => handleSplitChange(idx, e.target.value)}
              step="0.01"
            />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn">Save</button>
      </div>
    </form>
  )
} 