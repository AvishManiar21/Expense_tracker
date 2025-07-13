import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, UserPlus, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { supabase } from '../lib/supabase'

function Friends({ user }) {
  const navigate = useNavigate()
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [newFriendName, setNewFriendName] = useState('')
  const [newFriendEmail, setNewFriendEmail] = useState('')
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchFriends = async () => {
      if (!user?.id) return
      
      setLoading(true)
      setError('')
      
      try {
        const { data, error } = await supabase
          .from('friends')
          .select('friend_id, users:friend_id(full_name, email, id)')
          .eq('user_id', user.id)
        
        if (error) throw error
        
        setFriends(data.map(f => f.users))
      } catch (err) {
        setError(err.message || 'Failed to load friends')
      } finally {
        setLoading(false)
      }
    }

    fetchFriends()
  }, [user?.id])

  const handleAddFriend = async (e) => {
    e.preventDefault()
    if (!newFriendName.trim() || !newFriendEmail.trim()) {
      alert('Please fill in both name and email')
      return
    }

    try {
      // First, find or create the friend user
      const { data: friendUser, error: userError } = await supabase
        .from('users')
        .select('id, full_name, email')
        .eq('email', newFriendEmail)
        .single()

      if (userError && userError.code !== 'PGRST116') {
        throw userError
      }

      let friendId
      if (!friendUser) {
        alert('User not found. Please ask your friend to sign up first.');
        return;
      } else {
        friendId = friendUser.id;
      }

      // Add friend relationship
      const { error: friendError } = await supabase
        .from('friends')
        .insert([{
          user_id: user.id,
          friend_id: friendId
        }])

      if (friendError) throw friendError

      // Refresh friends list
      const { data: updatedFriends, error: fetchError } = await supabase
        .from('friends')
        .select('friend_id, users:friend_id(full_name, email, id)')
        .eq('user_id', user.id)

      if (fetchError) throw fetchError

      setFriends(updatedFriends.map(f => f.users))
      setNewFriendName('')
      setNewFriendEmail('')
      setShowAddFriend(false)
    } catch (err) {
      alert(err.message || 'Failed to add friend')
    }
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

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              border: '3px solid #e2e8f0',
              borderTop: '3px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            Loading friends...
          </div>
        )}

        {error && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#fee', 
            color: '#c53030', 
            borderRadius: '8px', 
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {friends.length > 0 ? (
              <div className="friends-list">
                {friends.map(friend => (
                  <div key={friend.id} className="friend-item">
                    <div className="friend-info">
                      <div className="friend-avatar">
                        {friend.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h4>{friend.full_name || 'Unknown User'}</h4>
                        <p style={{ color: '#718096', fontSize: '14px' }}>{friend.email}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        color: '#718096',
                        fontWeight: 'bold'
                      }}>
                        <DollarSign size={16} />
                        $0.00
                      </div>
                      <p style={{ 
                        fontSize: '12px', 
                        color: '#718096',
                        margin: '4px 0 0 0'
                      }}>
                        No expenses yet
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
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
          </>
        )}
      </div>
    </div>
  )
}

export default Friends 