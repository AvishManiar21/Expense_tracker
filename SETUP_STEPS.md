# 🚀 Complete Setup Guide

## Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up/Login** with your GitHub account
3. **Create a new project:**
   - Click "New Project"
   - Choose your organization
   - Enter project name: `expense-tracker`
   - Enter database password (save this!)
   - Choose region closest to you
   - Click "Create new project"

## Step 2: Get Your API Keys

1. **Go to Settings > API** in your Supabase dashboard
2. **Copy these values:**
   - **Project URL** (looks like: `https://your-project.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

## Step 3: Configure Environment Variables

1. **Edit the `.env` file** in your project root:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## Step 4: Set Up Database Schema

1. **Go to SQL Editor** in your Supabase dashboard
2. **Copy the entire content** from `supabase/schema.sql`
3. **Paste and run** the SQL in the editor
4. **Click "Run"** to create all tables and functions

## Step 5: Configure Authentication

1. **Go to Authentication > Settings** in Supabase dashboard
2. **Enable Email Auth:**
   - Enable "Enable email confirmations"
   - Set redirect URL to: `http://localhost:3000/dashboard`

3. **Enable Google OAuth (Optional):**
   - Go to Authentication > Providers
   - Enable Google
   - Add your Google OAuth credentials

## Step 6: Enable the Backend

Once Supabase is set up, uncomment the Supabase imports:

1. **In `src/contexts/AuthContext.jsx`:**
   - Uncomment line 2: `import { supabase, getCurrentUser, upsertUserProfile } from '../lib/supabase'`
   - Replace the mock implementations with real ones

2. **In `src/components/Dashboard.jsx`:**
   - Uncomment line 7: `import { getExpenses, getFriends, getGroups, getUserBalance } from '../services/supabaseService'`
   - Replace mock data with real API calls

## Step 7: Test the Setup

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Visit http://localhost:3000**
3. **Try signing up** with a new account
4. **Check the database** to see if user was created

## 🎯 What You'll Get

✅ **Multi-user authentication**  
✅ **Real-time data sync**  
✅ **Secure data access**  
✅ **Friend relationships**  
✅ **Group management**  
✅ **Automatic balance calculation**  

## 🚨 Troubleshooting

### Common Issues:

1. **"Invalid API key" error:**
   - Check your `.env` file has correct values
   - Restart the dev server after changing `.env`

2. **"Table doesn't exist" error:**
   - Make sure you ran the SQL schema
   - Check the SQL editor for any errors

3. **Authentication not working:**
   - Verify redirect URLs in Supabase settings
   - Check browser console for errors

4. **CORS errors:**
   - Add `http://localhost:3000` to allowed origins in Supabase

## 📱 Next Steps

Once everything is working:

1. **Deploy to Vercel** for public access
2. **Add more features** like expense categories
3. **Implement real-time notifications**
4. **Add payment tracking**

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [React + Supabase Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security) 