import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, UserPlus, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

function Friends() {
  const navigate = useNavigate()
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [newFriendName, setNewFriendName] = useState('')
  const [newFriendEmail, setNewFriendEmail] = useState('')

  // Mock friends data with balances
  const [friends, setFriends] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      balance: 45.50,
      avatar: 'J'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      balance: -22.75,
      avatar: 'J'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      balance: 0,
      avatar: 'M'
    }
  ])

  const handleAddFriend = (e) => {
    e.preventDefault()
    if (!newFriendName.trim() || !newFriendEmail.trim()) {
      alert('Please fill in both name and email')
      return
    }

    const newFriend = {
      id: Date.now(),
      name: newFriendName,
      email: newFriendEmail,
      balance: 0,
      avatar: newFriendName.charAt(0).toUpperCase()
    }

    setFriends(prev => [...prev, newFriend])
    setNewFriendName('')
    setNewFriendEmail('')
    setShowAddFriend(false)
  }

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

  return (
    <div className="container">
      <div className="header">
        <h1>Friends</h1>
        <p>Manage your friends and view balances</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
              style={{ marginRight: '20px' }}
            >
              <ArrowLeft size={16} style={{ marginRight: '8px' }} />
              Back
            </button>
            <h2>Your Friends</h2>
          </div>
          <button
            onClick={() => setShowAddFriend(true)}
            className="btn"
          >
            <UserPlus size={16} style={{ marginRight: '8px' }} />
            Add Friend
          </button>
        </div>

        {showAddFriend && (
          <div className="modal-overlay">
            <div className="modal">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Add New Friend</h3>
                <button
                  onClick={() => setShowAddFriend(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px' }}
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleAddFriend}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    className="input"
                    value={newFriendName}
                    onChange={(e) => setNewFriendName(e.target.value)}
                    placeholder="Friend's name"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="input"
                    value={newFriendEmail}
                    onChange={(e) => setNewFriendEmail(e.target.value)}
                    placeholder="friend@example.com"
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddFriend(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn">
                    <Plus size={16} style={{ marginRight: '8px' }} />
                    Add Friend
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="friends-list">
          {friends.map(friend => (
            <div key={friend.id} className="friend-item">
              <div className="friend-info">
                <div className="friend-avatar">
                  {friend.avatar}
                </div>
                <div>
                  <h4>{friend.name}</h4>
                  <p style={{ color: '#718096', fontSize: '14px' }}>{friend.email}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
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
                <p style={{ 
                  fontSize: '12px', 
                  color: getBalanceColor(friend.balance),
                  margin: '4px 0 0 0'
                }}>
                  {getBalanceText(friend.balance)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {friends.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
            <UserPlus size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3>No friends yet</h3>
            <p>Add your first friend to start splitting expenses!</p>
            <button
              onClick={() => setShowAddFriend(true)}
              className="btn"
              style={{ marginTop: '16px' }}
            >
              <UserPlus size={16} style={{ marginRight: '8px' }} />
              Add Your First Friend
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Friends 