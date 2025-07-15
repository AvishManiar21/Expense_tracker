import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, UserPlus, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { collection, query, where, getDocs, addDoc, getDoc, doc } from 'firebase/firestore'
import { db } from '../lib/firebase'

function Friends({ user }) {
  const navigate = useNavigate()
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [newFriendEmail, setNewFriendEmail] = useState('')
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')

  useEffect(() => {
    const fetchFriends = async () => {
      if (!user?.uid) return
      setLoading(true)
      setError('')
      try {
        // Get all friend relationships for this user
        const q = query(collection(db, 'friends'), where('user_id', '==', user.uid))
        const querySnapshot = await getDocs(q)
        const friendIds = querySnapshot.docs.map(doc => doc.data().friend_id)
        // Fetch user profiles for each friend
        const friendProfiles = await Promise.all(friendIds.map(async (fid) => {
          const userDoc = await getDoc(doc(db, 'users', fid))
          return userDoc.exists() ? userDoc.data() : null
        }))
        setFriends(friendProfiles.filter(Boolean))
      } catch (err) {
        setError(err.message || 'Failed to load friends')
      } finally {
        setLoading(false)
      }
    }
    fetchFriends()
  }, [user?.uid])

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!newFriendEmail.trim()) {
      alert('Please enter an email');
      return;
    }
    setAddSuccess('');
    try {
      // Check if already a friend
      if (friends.some(f => f.email.toLowerCase() === newFriendEmail.trim().toLowerCase())) {
        alert('This user is already your friend.');
        return;
      }
      // Find the friend user by email
      const q = query(collection(db, 'users'), where('email', '==', newFriendEmail.trim().toLowerCase()))
      const querySnapshot = await getDocs(q)
      if (querySnapshot.empty) {
        alert('User not found. Please ask your friend to sign up first.');
        return;
      }
      const friendUser = querySnapshot.docs[0].data()
      const friendId = querySnapshot.docs[0].id
      // Add friend relationship
      await addDoc(collection(db, 'friends'), {
        user_id: user.uid,
        friend_id: friendId
      })
      // Refresh friends list
      setFriends([...friends, friendUser])
      setNewFriendEmail('');
      setShowAddFriend(false);
      setAddSuccess('Friend added successfully!');
    } catch (err) {
      alert(err.message || 'Failed to add friend');
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
                    <><Plus size={16} style={{ marginRight: '8px' }} />Add Friend</>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {addSuccess && (
          <div style={{ textAlign: 'center', color: '#38a169', margin: '16px 0' }}>{addSuccess}</div>
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
        {!error && (
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