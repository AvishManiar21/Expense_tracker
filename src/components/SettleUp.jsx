import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, DollarSign, CheckCircle, AlertCircle } from 'lucide-react'

function SettleUp() {
  const navigate = useNavigate()
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [settlementAmount, setSettlementAmount] = useState('')
  const [settlementMethod, setSettlementMethod] = useState('cash')

  // Mock friends with balances
  const [friends, setFriends] = useState([
    {
      id: 1,
      name: 'John Doe',
      balance: 45.50,
      avatar: 'J',
      email: 'john@example.com'
    },
    {
      id: 2,
      name: 'Jane Smith',
      balance: -22.75,
      avatar: 'J',
      email: 'jane@example.com'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      balance: 0,
      avatar: 'M',
      email: 'mike@example.com'
    }
  ])

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

    // Update friend balance (mock)
    setFriends(prev => prev.map(friend => 
      friend.id === selectedFriend.id 
        ? { ...friend, balance: 0 }
        : friend
    ))

    // In real app, this would create a payment record
    console.log(`Settled up with ${selectedFriend.name}: $${amount} via ${settlementMethod}`)
    
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
                  {friend.avatar}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0' }}>{friend.name}</h4>
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
                {friend.balance !== 0 && (
                  <button
                    className="btn"
                    style={{ 
                      padding: '6px 12px', 
                      fontSize: '13px', 
                      marginTop: '8px',
                      backgroundColor: friend.balance > 0 ? '#e53e3e' : '#38a169'
                    }}
                    onClick={() => handleSettleUp(friend)}
                  >
                    Settle Up
                  </button>
                )}
                {friend.balance === 0 && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    color: '#38a169',
                    fontSize: '12px',
                    marginTop: '8px'
                  }}>
                    <CheckCircle size={12} />
                    Settled
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {friends.every(friend => friend.balance === 0) && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#718096',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            marginTop: '20px'
          }}>
            <CheckCircle size={48} style={{ marginBottom: '16px', color: '#38a169' }} />
            <h3>All settled up!</h3>
            <p>Everyone is square. No outstanding balances.</p>
          </div>
        )}
      </div>

      {/* Settlement Modal */}
      {selectedFriend && (
        <div className="modal-overlay">
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Settle Up with {selectedFriend.name}</h3>
              <button
                onClick={() => setSelectedFriend(null)}
                className="btn btn-secondary"
                style={{ padding: '8px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                padding: '15px', 
                backgroundColor: getBalanceColor(selectedFriend.balance) === '#e53e3e' ? '#fed7d7' : '#c6f6d5',
                borderRadius: '8px',
                marginBottom: '15px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  {selectedFriend.balance > 0 ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                  <strong>
                    {selectedFriend.balance > 0 
                      ? `You owe ${selectedFriend.name} $${selectedFriend.balance.toFixed(2)}`
                      : `${selectedFriend.name} owes you $${Math.abs(selectedFriend.balance).toFixed(2)}`
                    }
                  </strong>
                </div>
                <p style={{ margin: '0', fontSize: '14px', color: '#4a5568' }}>
                  {selectedFriend.balance > 0 
                    ? 'Mark this debt as paid to settle up.'
                    : 'Mark this payment as received to settle up.'
                  }
                </p>
              </div>
            </div>

            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                className="input"
                value={settlementAmount}
                onChange={(e) => setSettlementAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                max={Math.abs(selectedFriend.balance)}
              />
            </div>

            <div className="form-group">
              <label>Payment Method</label>
              <select
                className="input"
                value={settlementMethod}
                onChange={(e) => setSettlementMethod(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="venmo">Venmo</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedFriend(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                onClick={handleConfirmSettlement}
                style={{ 
                  backgroundColor: selectedFriend.balance > 0 ? '#e53e3e' : '#38a169'
                }}
              >
                Confirm Settlement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettleUp 