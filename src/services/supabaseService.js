import { supabase } from '../lib/supabase'

// Expense operations
export const getExpenses = async () => {
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      expense_splits (
        *,
        user_id
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const createExpense = async (expenseData) => {
  const { data: { user } } = await supabase.auth.getUser();
  // Always set created_by to the current user's id
  const { data: expense, error: expenseError } = await supabase
    .from('expenses')
    .insert({ ...expenseData, created_by: user.id })
    .select()
    .single()

  if (expenseError) throw expenseError

  // Create expense splits
  if (expenseData.splits && expenseData.splits.length > 0) {
    const splits = expenseData.splits.map(split => ({
      expense_id: expense.id,
      user_id: split.personId, // This should be the correct user for each split
      amount: split.amount
    }))

    const { error: splitsError } = await supabase
      .from('expense_splits')
      .insert(splits)

    if (splitsError) throw splitsError
  }

  return expense
}

// Friend operations
export const getFriends = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('friends')
    .select(`
      *,
      friend:users!friends_friend_id_fkey (
        id,
        full_name,
        email
      )
    `)
    .eq('user_id', user.id)

  if (error) throw error
  return data.map(friend => friend.friend)
}

export const addFriend = async (friendEmail) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  // Find user by email
  const { data: friendUser, error: findError } = await supabase
    .from('users')
    .select('id, full_name, email')
    .eq('email', friendEmail)
    .single()

  if (findError) throw new Error('User not found')

  // Add friend relationship
  const { error } = await supabase
    .from('friends')
    .insert({
      user_id: user.id, // Always set to current user
      friend_id: friendUser.id
    })

  if (error) throw error
  return friendUser
}

// Group operations
export const getGroups = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      group_members (
        user_id,
        users (
          id,
          full_name,
          email
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const createGroup = async (groupData) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert({
      name: groupData.name,
      description: groupData.description,
      created_by: user.id // Always set to current user
    })
    .select()
    .single()

  if (groupError) throw groupError

  // Add group members
  if (groupData.members && groupData.members.length > 0) {
    const members = groupData.members.map(memberId => ({
      group_id: group.id,
      user_id: memberId // Each member's user_id
    }))

    const { error: membersError } = await supabase
      .from('group_members')
      .insert(members)

    if (membersError) throw membersError
  }

  return group
}

// Balance calculations
export const getUserBalance = async (userId) => {
  const { data, error } = await supabase
    .rpc('get_user_balance', { user_uuid: userId })

  if (error) throw error
  return data || 0
}

export const getBalanceBetweenUsers = async (user1Id, user2Id) => {
  const { data, error } = await supabase
    .rpc('get_balance_between_users', { user1: user1Id, user2: user2Id })

  if (error) throw error
  return data || 0
}

// User operations
export const searchUsers = async (searchTerm) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email')
    .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    .neq('id', user.id)
    .limit(10)

  if (error) throw error
  return data
}

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
} 