import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Users, DollarSign } from 'lucide-react'
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

function Groups({ user }) {
  const navigate = useNavigate()
  const [showAddGroup, setShowAddGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [selectedFriends, setSelectedFriends] = useState([])
  const [groups, setGroups] = useState([])
  const [availableFriends, setAvailableFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return
      setLoading(true)
      setError('')
      try {
        // Fetch group memberships for this user
        const groupMembersQ = query(collection(db, 'group_members'), where('user_id', '==', user.uid))
        const groupMembersSnap = await getDocs(groupMembersQ)
        const groupIds = groupMembersSnap.docs.map(doc => doc.data().group_id)
        let groupsData = []
        if (groupIds.length > 0) {
          // Fetch group details
          const groupDocs = await Promise.all(groupIds.map(async (gid) => {
            const gdoc = await getDoc(doc(db, 'groups', gid))
            return gdoc.exists() ? { id: gid, ...gdoc.data() } : null
          }))
          groupsData = groupDocs.filter(Boolean)
        }
        setGroups(groupsData)
        // Fetch available friends
        const friendsQ = query(collection(db, 'friends'), where('user_id', '==', user.uid))
        const friendsSnap = await getDocs(friendsQ)
        const friendIds = friendsSnap.docs.map(doc => doc.data().friend_id)
        const friendProfiles = await Promise.all(friendIds.map(async (fid) => {
          const userDoc = await getDoc(doc(db, 'users', fid))
          return userDoc.exists() ? userDoc.data() : null
        }))
        setAvailableFriends(friendProfiles.filter(Boolean))
      } catch (err) {
        setError(err.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user?.uid])

  const handleAddGroup = async (e) => {
    e.preventDefault()
    if (!newGroupName.trim() || selectedFriends.length === 0) {
      alert('Please enter a group name and select at least one member')
      return
    }

    try {
      // Create the group
      const newGroupRef = await addDoc(collection(db, 'groups'), {
        name: newGroupName,
        created_by: user.uid // Always set!
      })

      // Add current user as member
      await addDoc(collection(db, 'group_members'), {
        group_id: newGroupRef.id,
        user_id: user.uid // Always set!
      })

      // Add selected friends as members
      const memberInserts = selectedFriends.map(friendId => ({
        group_id: newGroupRef.id,
        user_id: friendId // Always set!
      }))
      for (const member of memberInserts) {
        await addDoc(collection(db, 'group_members'), member)
      }

      // Refresh groups list
      const groupMembersQ = query(collection(db, 'group_members'), where('user_id', '==', user.uid))
      const groupMembersSnap = await getDocs(groupMembersQ)
      const groupIds = groupMembersSnap.docs.map(doc => doc.data().group_id)

      let groupsData = []
      if (groupIds.length > 0) {
        const groupDocs = await Promise.all(groupIds.map(async (gid) => {
          const gdoc = await getDoc(doc(db, 'groups', gid))
          return gdoc.exists() ? { id: gid, ...gdoc.data() } : null
        }))
        groupsData = groupDocs.filter(Boolean)
      }
      setGroups(groupsData)

      setNewGroupName('')
      setSelectedFriends([])
      setShowAddGroup(false)
    } catch (err) {
      alert(err.message || 'Failed to create group')
    }
  }

  const toggleFriend = (friendId) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(prev => prev.filter(id => id !== friendId))
    } else {
      setSelectedFriends(prev => [...prev, friendId])
    }
  }

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

  return (
    <div className="container">
      <div className="header">
        <h1>Groups</h1>
        <p>Manage expense groups and track group balances</p>
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
            <h2>Your Groups</h2>
          </div>
          <button
            onClick={() => setShowAddGroup(true)}
            className="btn"
          >
            <Plus size={16} style={{ marginRight: '8px' }} />
            Create Group
          </button>
        </div>

        {showAddGroup && (
          <div className="modal-overlay">
            <div className="modal">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Create New Group</h3>
                <button
                  onClick={() => setShowAddGroup(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px' }}
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleAddGroup}>
                <div className="form-group">
                  <label>Group Name</label>
                  <input
                    type="text"
                    className="input"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g., Apartment, Vacation"
                  />
                </div>
                <div className="form-group">
                  <label>Add Members</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                    {availableFriends.map(friend => (
                      <div key={friend.id} className="friend-item">
                        <div className="friend-info">
                          <div className="friend-avatar">
                            {friend.full_name?.charAt(0) || 'U'}
                          </div>
                          <span>{friend.full_name || 'Unknown User'}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedFriends.includes(friend.id)}
                          onChange={() => toggleFriend(friend.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddGroup(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn">
                    <Plus size={16} style={{ marginRight: '8px' }} />
                    Create Group
                  </button>
                </div>
              </form>
            </div>
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

        {!error && (
          <div className="groups-list">
            {groups.map(group => (
              <div 
                key={group.id} 
                className="group-item" 
                onClick={() => navigate(`/group/${group.id}`)}
                style={{ 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '12px', 
                  padding: '20px', 
                  marginBottom: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  hover: {
                    backgroundColor: '#f7fafc',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      fontSize: '24px', 
                      width: '48px', 
                      height: '48px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: '#f7fafc',
                      borderRadius: '12px'
                    }}>
                      👥
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0' }}>{group.name}</h3>
                      <p style={{ 
                        color: '#718096', 
                        fontSize: '14px', 
                        margin: '0 0 8px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <Users size={14} />
                        Group
                      </p>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        color: '#718096',
                        fontSize: '14px'
                      }}>
                        <DollarSign size={14} />
                        Total: $0.00
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#718096'
                    }}>
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
              </div>
            ))}
          </div>
        )}

        {groups.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
            <Users size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3>No groups yet</h3>
            <p>Create your first group to organize expenses!</p>
            <button
              onClick={() => setShowAddGroup(true)}
              className="btn"
              style={{ marginTop: '16px' }}
            >
              <Plus size={16} style={{ marginRight: '8px' }} />
              Create Your First Group
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Groups