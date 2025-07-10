-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create friends table
CREATE TABLE public.friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Create groups table
CREATE TABLE public.groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create group_members table
CREATE TABLE public.group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  paid_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expense_splits table
CREATE TABLE public.expense_splits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID REFERENCES public.expenses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(expense_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for friends
CREATE POLICY "Users can view their friends" ON public.friends
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can add friends" ON public.friends
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their friends" ON public.friends
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for groups
CREATE POLICY "Users can view groups they're members of" ON public.groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_id = groups.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create groups" ON public.groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update groups they created" ON public.groups
  FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for group_members
CREATE POLICY "Users can view group members" ON public.group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm2
      WHERE gm2.group_id = group_members.group_id AND gm2.user_id = auth.uid()
    )
  );

CREATE POLICY "Group creators can add members" ON public.group_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.groups 
      WHERE id = group_id AND created_by = auth.uid()
    )
  );

-- RLS Policies for expenses
CREATE POLICY "Users can view expenses they're involved in" ON public.expenses
  FOR SELECT USING (
    paid_by = auth.uid() OR 
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.expense_splits 
      WHERE expense_id = expenses.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create expenses" ON public.expenses
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update expenses they created" ON public.expenses
  FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for expense_splits
CREATE POLICY "Users can view expense splits they're involved in" ON public.expense_splits
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.expenses 
      WHERE id = expense_id AND (paid_by = auth.uid() OR created_by = auth.uid())
    )
  );

CREATE POLICY "Users can create expense splits" ON public.expense_splits
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.expenses 
      WHERE id = expense_id AND (paid_by = auth.uid() OR created_by = auth.uid())
    )
  );

-- Functions for balance calculation
CREATE OR REPLACE FUNCTION get_user_balance(user_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_paid DECIMAL := 0;
  total_owed DECIMAL := 0;
BEGIN
  -- Calculate total amount paid by user
  SELECT COALESCE(SUM(amount), 0) INTO total_paid
  FROM public.expenses
  WHERE paid_by = user_uuid;
  
  -- Calculate total amount owed by user
  SELECT COALESCE(SUM(amount), 0) INTO total_owed
  FROM public.expense_splits
  WHERE user_id = user_uuid;
  
  RETURN total_paid - total_owed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get balance between two users
CREATE OR REPLACE FUNCTION get_balance_between_users(user1 UUID, user2 UUID)
RETURNS DECIMAL AS $$
DECLARE
  user1_paid DECIMAL := 0;
  user1_owed DECIMAL := 0;
  user2_paid DECIMAL := 0;
  user2_owed DECIMAL := 0;
BEGIN
  -- Calculate amounts where user1 paid and user2 owes
  SELECT COALESCE(SUM(es.amount), 0) INTO user1_paid
  FROM public.expenses e
  JOIN public.expense_splits es ON e.id = es.expense_id
  WHERE e.paid_by = user1 AND es.user_id = user2;
  
  -- Calculate amounts where user2 paid and user1 owes
  SELECT COALESCE(SUM(es.amount), 0) INTO user2_paid
  FROM public.expenses e
  JOIN public.expense_splits es ON e.id = es.expense_id
  WHERE e.paid_by = user2 AND es.user_id = user1;
  
  RETURN user1_paid - user2_paid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 