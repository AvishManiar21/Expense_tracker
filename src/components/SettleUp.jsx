import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, DollarSign, CheckCircle, AlertCircle } from 'lucide-react'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

function SettleUp({ user }) {
  const navigate = useNavigate()
  const [friends, setFriends] = useState([])
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [settlementAmount, setSettlementAmount] = useState('')
  const [settlementMethod, setSettlementMethod] = useState('cash')

  useEffect(() => {
    const fetchFriends = async () => {
      if (!user?.uid) return
      const friendsQ = query(collection(db, 'friends'), where('user_id', '==', user.uid))
      const friendsSnap = await getDocs(friendsQ)
      const friendIds = friendsSnap.docs.map(doc => doc.data().friend_id)
      const realFriends = await Promise.all(friendIds.map(async (fid) => {
        const userDoc = await getDoc(doc(db, 'users', fid))
        return userDoc.exists() ? { ...userDoc.data(), balance: 0 } : null
      }))
      setFriends(realFriends.filter(Boolean))
    }
    fetchFriends()
  }, [user])

  const getBalanceColor = (balance) => {
    if (balance > 0) return '#38a169'
    if (balance < 0) return '#e53e3e'
    return '#718096'
  }

  const getBalanceText = (balance) => {
    if (balance > 0) return `You owe $${balance.toFixed(2)}`
    if (balance < 0) return `You're owed $${Math.abs(balance).toFixed(2)}`
    return 'Settled up'
  }

  const handleSettleUp = (friend) => {
    setSelectedFriend(friend)
    setSettlementAmount(Math.abs(friend.balance).toString())
  }

  const handleConfirmSettlement = () => {
    if (!selectedFriend || !settlementAmount) return

    const amount = parseFloat(settlementAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    // In real app, this would create a payment record
    // and update balances accordingly
    alert(`Settled up with ${selectedFriend.full_name}: $${amount} via ${settlementMethod}`)
    setSelectedFriend(null)
    setSettlementAmount('')
    setSettlementMethod('cash')
  }

  const totalOwed = friends.reduce((sum, friend) => sum + Math.max(0, friend.balance), 0)
  const totalOwedToYou = friends.reduce((sum, friend) => sum + Math.max(0, -friend.balance), 0)

  return (
    <div className="container">
      <div className="header">
        <h1>Settle Up</h1>
        <p>Mark debts as paid and keep track of payments</p>
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
          <h2>Payment Summary</h2>
        </div>

        {/* Summary Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#e53e3e', 
            color: 'white',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>💸</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              ${totalOwed.toFixed(2)}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
              You owe others
            </div>
          </div>

          <div style={{ 
            padding: '20px', 
            backgroundColor: '#38a169', 
            color: 'white',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>💰</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              ${totalOwedToYou.toFixed(2)}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
              Others owe you
            </div>
          </div>
        </div>

        {/* Friends List */}
        <div className="friends-list">
          {friends.map(friend => (
            <div key={friend.id} className="friend-item">
              <div className="friend-info">
                <div className="friend-avatar">
                  {friend.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0' }}>{friend.full_name}</h4>
                  <p style={{ color: '#718096', fontSize: '14px', margin: '0' }}>
                    {friend.email}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  color: getBalanceColor(friend.balance),
                  fontWeight: 'bold',
                  marginBottom: '8px'
                }}>
                  <DollarSign size={16} />
                  ${Math.abs(friend.balance).toFixed(2)}
                </div>
                <div style={{ fontSize: '12px', color: getBalanceColor(friend.balance) }}>
                  {getBalanceText(friend.balance)}
                </div>
                <button
                  className="btn"
                  style={{ 
                    padding: '6px 12px', 
                    fontSize: '13px', 
                    marginTop: '8px',
                    backgroundColor: '#3182ce',
                    color: 'white'
                  }}
                  onClick={() => handleSettleUp(friend)}
                >
                  Settle Up
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Settle Up Modal */}
        {selectedFriend && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Settle Up with {selectedFriend.full_name}</h3>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  className="input"
                  value={settlementAmount}
                  onChange={e => setSettlementAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Method</label>
                <select
                  className="input"
                  value={settlementMethod}
                  onChange={e => setSettlementMethod(e.target.value)}
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="upi">UPI</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedFriend(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn"
                  onClick={handleConfirmSettlement}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SettleUp 