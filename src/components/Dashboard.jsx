import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, User, DollarSign, TrendingUp, TrendingDown, Calendar, Tag, Pencil } from 'lucide-react'
import ExpenseDetails from './ExpenseDetails'
import EditExpense from './EditExpense'
import { supabase } from '../lib/supabase'

function Dashboard({ user, onSignOut }) {
  const navigate = useNavigate()
  const [showDetailedBalances, setShowDetailedBalances] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [editingExpense, setEditingExpense] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [friends, setFriends] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        // Fetch groups where user is a member
        const { data: groupMembers, error: groupMembersError } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', user?.id)
        if (groupMembersError) throw groupMembersError
        const groupIds = groupMembers.map(gm => gm.group_id)
        // Fetch group details
        let groupData = []
        if (groupIds.length > 0) {
          const { data: groupsData, error: groupsError } = await supabase
            .from('groups')
            .select('*')
            .in('id', groupIds)
          if (groupsError) throw groupsError
          groupData = groupsData
        }
        setGroups(groupData)
        // Fetch friends (users who are friends with the user)
        const { data: friendsData, error: friendsError } = await supabase
          .from('friends')
          .select('friend_id, users:friend_id(full_name, email, id)')
          .eq('user_id', user?.id)
        if (friendsError) throw friendsError
        setFriends(friendsData.map(f => f.users))
        // Fetch expenses where user is involved (paid_by or in expense_splits)
        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('*')
          .or(`paid_by.eq.${user?.id},expense_splits.user_id.eq.${user?.id}`)
        if (expensesError) throw expensesError
        setExpenses(expensesData)
      } catch (err) {
        setError(err.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) fetchData()
  }, [user?.id])

  const totalBalance = friends.reduce((sum, friend) => sum + friend.balance, 0)

  const getBalanceColor = (balance) => {
    if (balance > 0) return '#38a169'
    if (balance < 0) return '#e53e3e'
    return '#718096'
  }

  const getBalanceIcon = (balance) => {
    if (balance > 0) return <TrendingUp size={16} />
    if (balance < 0) return <TrendingDown size={16} />
    return <DollarSign size={16} />
  }

  const getBalanceText = (balance) => {
    if (balance > 0) return `You owe $${balance.toFixed(2)}`
    if (balance < 0) return `You're owed $${Math.abs(balance).toFixed(2)}`
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

  // Handlers for modals
  const handleExpenseClick = (expense) => {
    setSelectedExpense(expense)
  }
  const handleEditClick = (expense) => {
    setEditingExpense(expense)
  }
  const handleCloseDetails = () => setSelectedExpense(null)
  const handleCloseEdit = () => setEditingExpense(null)
  const handleSaveEdit = (updatedExpense) => {
    setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e))
    setEditingExpense(null)
  }

  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState('')

  return (
    <div className="container">
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>💰 Expense Tracker</h1>
          <p>Welcome back, {user?.name || 'User'}!</p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={async () => {
            setSigningOut(true)
            setSignOutError('')
            console.log('Sign out button clicked')
            try {
              await onSignOut()
              console.log('Sign out successful')
              navigate('/login')
            } catch (err) {
              setSignOutError(err.message || 'Sign out failed')
              console.error('Sign out error:', err)
            } finally {
              setSigningOut(false)
            }
          }}
          style={{ height: 40 }}
          disabled={signingOut}
        >
          {signingOut ? 'Signing Out...' : 'Sign Out'}
        </button>
      </div>
      {signOutError && (
        <div className="error-message" style={{ color: 'red', marginBottom: 16 }}>{signOutError}</div>
      )}

      {/* Expense Details Modal */}
      {selectedExpense && (
        <ExpenseDetails expense={selectedExpense} onClose={handleCloseDetails} />
      )}
      {/* Edit Expense Modal */}
      {editingExpense && (
        <EditExpense expense={editingExpense} onSave={handleSaveEdit} onClose={handleCloseEdit} />
      )}

      {/* Balance Overview */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Balance Overview</h2>
          <button
            onClick={() => setShowDetailedBalances(!showDetailedBalances)}
            className="btn btn-secondary"
          >
            {showDetailedBalances ? 'Hide' : 'Show'} Details
          </button>
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f7fafc', 
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>💰</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: getBalanceColor(totalBalance) }}>
              ${Math.abs(totalBalance).toFixed(2)}
            </div>
            <div style={{ color: '#718096', fontSize: '14px' }}>
              {totalBalance > 0 ? 'You owe' : totalBalance < 0 ? 'You\'re owed' : 'All settled'}
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
              {friends.length}
            </div>
            <div style={{ color: '#718096', fontSize: '14px' }}>
              Friends
            </div>
          </div>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f7fafc', 
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏠</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {groups.length}
            </div>
            <div style={{ color: '#718096', fontSize: '14px' }}>
              Groups
            </div>
          </div>
        </div>
        {showDetailedBalances && (
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '12px',
            marginTop: '20px'
          }}>
            <h3 style={{ marginBottom: '16px' }}>Detailed Balance Breakdown</h3>
            {expenses.map(expense => (
              <div key={expense.id} style={{ 
                padding: '12px', 
                borderBottom: '1px solid #e2e8f0',
                marginBottom: '12px',
                cursor: 'pointer'
              }} onClick={() => handleExpenseClick(expense)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{getCategoryIcon(expense.category)}</span>
                    <span style={{ fontWeight: 'bold' }}>{expense.description}</span>
                  </div>
                  <span style={{ fontWeight: 'bold' }}>${expense.amount.toFixed(2)}</span>
                </div>
                <div style={{ fontSize: '14px', color: '#718096', marginBottom: '8px' }}>
                  Paid by {expense.paidBy} on {formatDate(expense.date)}
                </div>
                <div style={{ fontSize: '14px', color: '#4a5568' }}>
                  {expense.splits.map(split => (
                    <span key={split.personName} style={{ 
                      display: 'inline-block',
                      marginRight: '12px',
                      padding: '4px 8px',
                      backgroundColor: '#e2e8f0',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {split.personName}: ${split.amount.toFixed(2)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2>Quick Actions</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px' 
        }}>
          <button
            onClick={() => navigate('/add-expense')}
            className="btn"
            style={{ 
              padding: '20px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={24} />
            <span>Add Expense</span>
          </button>
          <button
            onClick={() => navigate('/friends')}
            className="btn btn-secondary"
            style={{ 
              padding: '20px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <User size={24} />
            <span>Manage Friends</span>
          </button>
          <button
            onClick={() => navigate('/groups')}
            className="btn btn-secondary"
            style={{ 
              padding: '20px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Users size={24} />
            <span>Manage Groups</span>
          </button>
          <button
            onClick={() => navigate('/settle-up')}
            className="btn btn-secondary"
            style={{ 
              padding: '20px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <DollarSign size={24} />
            <span>Settle Up</span>
          </button>
          <button
            onClick={() => navigate('/activity')}
            className="btn btn-secondary"
            style={{ 
              padding: '20px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Calendar size={24} />
            <span>Activity Feed</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2>Recent Activity</h2>
        <div className="expenses-list">
          {expenses.slice(0, 5).map(expense => (
            <div key={expense.id} className="expense-item" style={{ cursor: 'pointer' }}>
              <div className="expense-info" onClick={() => handleExpenseClick(expense)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{getCategoryIcon(expense.category)}</span>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0' }}>{expense.description}</h4>
                    <p style={{ 
                      color: '#718096', 
                      fontSize: '14px', 
                      margin: '0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <Calendar size={12} />
                      {formatDate(expense.date)}
                      <span style={{ margin: '0 8px' }}>•</span>
                      <Tag size={12} />
                      {expense.category}
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
                  ${expense.amount.toFixed(2)}
                </div>
                <div style={{ fontSize: '12px', color: '#718096' }}>
                  Paid by {expense.paidBy}
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '13px', marginTop: '4px' }}
                  onClick={(e) => { e.stopPropagation(); handleEditClick(expense) }}
                >
                  <Pencil size={14} style={{ marginRight: '6px' }} /> Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Friends Summary */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Friends</h2>
          <button
            onClick={() => navigate('/friends')}
            className="btn btn-secondary"
          >
            View All
          </button>
        </div>
        <div className="friends-list">
          {friends.slice(0, 3).map(friend => (
            <div key={friend.name} className="friend-item">
              <div className="friend-info">
                <div className="friend-avatar">
                  {friend.avatar}
                </div>
                <span>{friend.name}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                color: getBalanceColor(friend.balance),
                fontWeight: 'bold'
              }}>
                {getBalanceIcon(friend.balance)}
                ${Math.abs(friend.balance).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Groups Summary */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Groups</h2>
          <button
            onClick={() => navigate('/groups')}
            className="btn btn-secondary"
          >
            View All
          </button>
        </div>
        <div className="groups-list">
          {groups.slice(0, 3).map(group => (
            <div key={group.name} className="group-item" style={{ 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px', 
              padding: '16px',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '20px' }}>{group.avatar}</div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0' }}>{group.name}</h4>
                    <p style={{ color: '#718096', fontSize: '14px', margin: '0' }}>
                      Total: ${group.totalExpenses.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div style={{ 
                  color: getBalanceColor(group.yourBalance),
                  fontWeight: 'bold'
                }}>
                  ${Math.abs(group.yourBalance).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard 