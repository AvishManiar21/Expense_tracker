import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Filter, DollarSign, Plus, Minus, Users, Calendar } from 'lucide-react'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

function ActivityFeed({ user }) {
  const navigate = useNavigate()
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedFriend, setSelectedFriend] = useState('all')
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [friends, setFriends] = useState([])
  const [groups, setGroups] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return
      setLoading(true)
      setError('')
      try {
        // Fetch friends
        const friendsQ = query(collection(db, 'friends'), where('user_id', '==', user.uid))
        const friendsSnap = await getDocs(friendsQ)
        const friendIds = friendsSnap.docs.map(doc => doc.data().friend_id)
        const realFriends = await Promise.all(friendIds.map(async (fid) => {
          const userDoc = await getDoc(doc(db, 'users', fid))
          return userDoc.exists() ? userDoc.data() : null
        }))
        setFriends(realFriends.filter(Boolean))
        // Fetch groups
        const groupMembersQ = query(collection(db, 'group_members'), where('user_id', '==', user.uid))
        const groupMembersSnap = await getDocs(groupMembersQ)
        const groupIds = groupMembersSnap.docs.map(doc => doc.data().group_id)
        let groupList = []
        if (groupIds.length > 0) {
          const groupDocs = await Promise.all(groupIds.map(async (gid) => {
            const gdoc = await getDoc(doc(db, 'groups', gid))
            return gdoc.exists() ? { id: gid, ...gdoc.data() } : null
          }))
          groupList = groupDocs.filter(Boolean)
        }
        setGroups(groupList)
        // Fetch activities (for now, fetch all expenses where paid_by == user.uid)
        const expensesQ = query(collection(db, 'expenses'), where('paid_by', '==', user.uid))
        const expensesSnap = await getDocs(expensesQ)
        const activitiesData = expensesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setActivities(activitiesData)
      } catch (err) {
        setError(err.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user?.uid])

  const getActivityIcon = (type) => {
    switch (type) {
      case 'expense_added':
        return <Plus size={16} style={{ color: '#38a169' }} />
      case 'expense_edited':
        return <DollarSign size={16} style={{ color: '#3182ce' }} />
      case 'settlement':
        return <Minus size={16} style={{ color: '#e53e3e' }} />
      default:
        return <DollarSign size={16} />
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'expense_added':
        return '#38a169'
      case 'expense_edited':
        return '#3182ce'
      case 'settlement':
        return '#e53e3e'
      default:
        return '#718096'
    }
  }

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'expense_added':
        return `${activity.paidBy} paid $${activity.amount.toFixed(2)} for ${activity.description}`
      case 'expense_edited':
        return `${activity.description} was updated to $${activity.amount.toFixed(2)}`
      case 'settlement':
        return `${activity.paidBy} settled up $${activity.amount.toFixed(2)} via ${activity.paymentMethod}`
      default:
        return activity.description
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    })
  }

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = selectedFilter === 'all' || activity.type === selectedFilter
    const matchesFriend = selectedFriend === 'all' || 
      activity.friends.includes(selectedFriend) || 
      activity.paidBy === selectedFriend
    return matchesFilter && matchesFriend
  })

  return (
    <div className="container">
      <div className="header">
        <h1>Activity Feed</h1>
        <p>Track all your expense activities and settlements</p>
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
          <h2>Recent Activity</h2>
        </div>

        {/* Filters */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          marginBottom: '20px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} />
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Filter:</span>
          </div>
          
          <select
            className="input"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '120px' }}
          >
            <option value="all">All Activities</option>
            <option value="expense_added">Expenses Added</option>
            <option value="expense_edited">Expenses Edited</option>
            <option value="settlement">Settlements</option>
          </select>

          <select
            className="input"
            value={selectedFriend}
            onChange={(e) => setSelectedFriend(e.target.value)}
            style={{ width: 'auto', minWidth: '120px' }}
          >
            <option value="all">All People</option>
            {friends.map(friend => (
              <option key={friend.id} value={friend.full_name}>{friend.full_name}</option>
            ))}
          </select>
        </div>

        {/* Activity List */}
        <div className="activity-list">
          {/* Remove loading spinner, just show error or activities */}
          {error ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
              Error: {error}
            </div>
          ) : filteredActivities.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#718096',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px'
            }}>
              <Calendar size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h3>No activities found</h3>
              <p>Try adjusting your filters or add some expenses to see activity here.</p>
            </div>
          ) : (
            filteredActivities.map(activity => (
              <div key={activity.id} className="activity-item" style={{
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                transition: 'all 0.2s ease'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: getActivityColor(activity.type) + '20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {getActivityIcon(activity.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <div>
                      <p style={{ 
                        margin: '0 0 4px 0', 
                        fontWeight: '500',
                        color: getActivityColor(activity.type)
                      }}>
                        {getActivityText(activity)}
                      </p>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        fontSize: '13px',
                        color: '#718096'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} />
                          {formatDate(activity.date)} at {formatTime(activity.date)}
                        </span>
                        {activity.category && (
                          <span style={{ 
                            backgroundColor: '#f7fafc', 
                            padding: '2px 8px', 
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}>
                            {activity.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ 
                      fontWeight: 'bold',
                      color: getActivityColor(activity.type),
                      fontSize: '16px'
                    }}>
                      ${activity.amount.toFixed(2)}
                    </div>
                  </div>

                  {activity.friends && activity.friends.length > 0 && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      fontSize: '13px',
                      color: '#718096'
                    }}>
                      <Users size={12} />
                      <span>Split with: {activity.friends.join(', ')}</span>
                    </div>
                  )}

                  {activity.group && (
                    <div style={{ 
                      fontSize: '13px', 
                      color: '#718096',
                      marginTop: '4px'
                    }}>
                      Group: {activity.group}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Activity Summary */}
        <div style={{ 
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#f7fafc',
          borderRadius: '12px'
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>Activity Summary</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '15px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#38a169' }}>
                {activities.filter(a => a.type === 'expense_added').length}
              </div>
              <div style={{ fontSize: '12px', color: '#718096' }}>Expenses Added</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3182ce' }}>
                {activities.filter(a => a.type === 'expense_edited').length}
              </div>
              <div style={{ fontSize: '12px', color: '#718096' }}>Expenses Edited</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e53e3e' }}>
                {activities.filter(a => a.type === 'settlement').length}
              </div>
              <div style={{ fontSize: '12px', color: '#718096' }}>Settlements</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                ${activities.reduce((sum, a) => sum + a.amount, 0).toFixed(2)}
              </div>
              <div style={{ fontSize: '12px', color: '#718096' }}>Total Amount</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActivityFeed 