import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, User, DollarSign, TrendingUp, TrendingDown, Calendar, Tag, Pencil } from 'lucide-react'
import ExpenseDetails from './ExpenseDetails'
import EditExpense from './EditExpense'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

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
        // Fetch group memberships for this user
        const groupMembersQ = query(collection(db, 'group_members'), where('user_id', '==', user?.uid))
        const groupMembersSnap = await getDocs(groupMembersQ)
        const groupIds = groupMembersSnap.docs.map(doc => doc.data().group_id)
        let groupData = []
        if (groupIds.length > 0) {
          // Fetch group details
          const groupDocs = await Promise.all(groupIds.map(async (gid) => {
            const gdoc = await getDoc(doc(db, 'groups', gid))
            return gdoc.exists() ? { id: gid, ...gdoc.data() } : null
          }))
          groupData = groupDocs.filter(Boolean)
        }
        setGroups(groupData)
        // Fetch friends
        const friendsQ = query(collection(db, 'friends'), where('user_id', '==', user?.uid))
        const friendsSnap = await getDocs(friendsQ)
        const friendIds = friendsSnap.docs.map(doc => doc.data().friend_id)
        const friendProfiles = await Promise.all(friendIds.map(async (fid) => {
          const userDoc = await getDoc(doc(db, 'users', fid))
          return userDoc.exists() ? userDoc.data() : null
        }))
        setFriends(friendProfiles.filter(Boolean))
        // Fetch expenses (for now, fetch all expenses where paid_by == user.uid)
        const expensesQ = query(collection(db, 'expenses'), where('paid_by', '==', user?.uid))
        const expensesSnap = await getDocs(expensesQ)
        const expensesData = expensesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setExpenses(expensesData)
      } catch (err) {
        setError(err.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    if (user?.uid) fetchData()
  }, [user?.uid])

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
    if (typeof balance !== 'number' || isNaN(balance)) return 'Settled up';
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
      <div className="header dashboard-header-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: '1.5rem', margin: 0, wordBreak: 'break-word' }}>💰 Expense Tracker</h1>
          <p style={{ fontSize: '1rem', margin: 0, color: '#4a5568' }}>Welcome back, {user?.name || 'User'}!</p>
        </div>
        <button
          className="btn btn-secondary signout-btn-mobile"
          onClick={async () => {
            setSigningOut(true)
            setSignOutError('')
            try {
              await onSignOut()
              navigate('/login', { replace: true })
            } catch (err) {
              setSignOutError(err.message || 'Sign out failed')
            } finally {
              setSigningOut(false)
            }
          }}
          style={{ height: 48, fontSize: 18, minWidth: 120, borderRadius: 10, padding: '0 24px', marginTop: 8 }}
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
              ${Number.isFinite(Math.abs(totalBalance)) ? Math.abs(totalBalance).toFixed(2) : '0.00'}
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
                  <span style={{ fontWeight: 'bold' }}>${Number.isFinite(expense.amount) ? expense.amount.toFixed(2) : '0.00'}</span>
                </div>
                <div style={{ fontSize: '14px', color: '#718096', marginBottom: '8px' }}>
                  Paid by {expense.paidBy} on {formatDate(expense.date)}
                </div>
                <div style={{ fontSize: '14px', color: '#4a5568' }}>
                  {expense.splits.map((split, idx) => (
                    <span key={split.personName + idx} style={{ 
                      display: 'inline-block',
                      marginRight: '12px',
                      padding: '4px 8px',
                      backgroundColor: '#e2e8f0',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {split.personName}: ${Number.isFinite(split.amount) ? split.amount.toFixed(2) : '0.00'}
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
                  ${Number.isFinite(expense.amount) ? expense.amount.toFixed(2) : '0.00'}
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
          {friends.slice(0, 3).map((friend, idx) => (
            <div key={friend.id || friend.uid || (friend.name + idx)} className="friend-item">
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
                ${Number.isFinite(Math.abs(friend.balance)) ? Math.abs(friend.balance).toFixed(2) : '0.00'}
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
          {groups.slice(0, 3).map((group, idx) => (
            <div key={group.id || (group.name + idx)} className="group-item" style={{ 
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
                      Total: ${Number.isFinite(group.totalExpenses) ? group.totalExpenses.toFixed(2) : '0.00'}
                    </p>
                  </div>
                </div>
                <div style={{ 
                  color: getBalanceColor(group.yourBalance),
                  fontWeight: 'bold'
                }}>
                  ${Number.isFinite(Math.abs(group.yourBalance)) ? Math.abs(group.yourBalance).toFixed(2) : '0.00'}
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