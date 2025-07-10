# 💰 Expense Tracker

A modern, Splitwise-like expense tracker built with React. Track expenses, split bills with friends, and manage balances with a beautiful, responsive interface.

## ✨ Features

- **📊 Dashboard Overview** - See your balance and recent activity at a glance
- **👥 Friend Management** - Add and manage friends with individual balance tracking
- **💰 Expense Tracking** - Add expenses with categories and detailed descriptions
- **⚖️ Smart Splitting** - Split expenses equally or with custom amounts
- **📱 Responsive Design** - Works perfectly on desktop and mobile devices
- **💾 Local Storage** - Your data is saved locally in your browser
- **🎨 Modern UI** - Beautiful gradient design with smooth animations

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- Supabase account (free)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase backend:**
   - Follow the complete setup guide in `SUPABASE_SETUP.md`
   - Create a Supabase project
   - Run the database schema
   - Configure environment variables

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000` to see the app in action!

## 📱 How to Use

### Adding Friends
1. Click "Manage Friends" from the dashboard
2. Click "Add Friend" and enter their name
3. Friends will appear in your friends list with their current balance

### Adding Expenses
1. Click "Add Expense" from the dashboard
2. Fill in the expense details:
   - **Description**: What the expense was for
   - **Amount**: The total cost
   - **Date**: When the expense occurred
   - **Category**: Choose from predefined categories
   - **Paid by**: Who paid for this expense
   - **Split with**: Select who should split this expense
3. Choose split type:
   - **Equal Split**: Automatically divides the amount equally
   - **Custom Amounts**: Manually specify how much each person pays
4. Click "Add Expense" to save

### Viewing Balances
- **Dashboard**: See your personal balance and recent expenses
- **Balances Tab**: View all friends' balances
- **Friends Page**: Detailed view of each friend's balance

### Creating Groups
1. Click "Groups" from the dashboard
2. Click "Create Group"
3. Add group name, description, and select members
4. Groups help organize expenses with specific people

## 🛠️ Built With

- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Vite** - Fast build tool and dev server
- **Supabase** - Backend as a Service (Database, Auth, Real-time)
- **Lucide React** - Beautiful icons
- **Date-fns** - Date formatting utilities
- **CSS3** - Custom styling with gradients and animations

## 📁 Project Structure

```
src/
├── components/
│   ├── Dashboard.jsx      # Main dashboard with overview
│   ├── AddExpense.jsx     # Expense creation form
│   ├── Friends.jsx        # Friend management
│   └── Groups.jsx         # Group management
├── App.jsx               # Main app with routing and state
├── main.jsx              # React entry point
└── index.css             # Global styles
```

## 🎯 Key Features Explained

### Multi-User Authentication
- **Email/Password** - Traditional signup and login
- **Google OAuth** - One-click sign in with Google
- **Secure Sessions** - JWT-based authentication with Supabase

### Real-Time Data Sync
- **Live Updates** - Changes appear instantly across all users
- **Offline Support** - Works even when temporarily offline
- **Conflict Resolution** - Handles simultaneous edits gracefully

### Balance Calculation
The app automatically calculates balances by:
1. Adding the full expense amount to who paid
2. Subtracting each person's share from their balance
3. Positive balance = you're owed money
4. Negative balance = you owe money

### Smart Splitting
- **Equal Split**: Automatically divides the total by the number of people
- **Custom Split**: Manually specify amounts, with validation to ensure they add up to the total

### Data Security
- **Row Level Security (RLS)** - Users can only access their own data
- **Friend Relationships** - Share expenses only with approved friends
- **Encrypted Storage** - All data is encrypted at rest

## 🎨 Design Features

- **Gradient Background**: Beautiful purple gradient theme
- **Card-based Layout**: Clean, organized information display
- **Responsive Design**: Works on all screen sizes
- **Smooth Animations**: Hover effects and transitions
- **Color-coded Balances**: Green for positive, red for negative balances

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Adding New Features

The app is built with a modular component structure, making it easy to add new features:

1. Create new components in `src/components/`
2. Add routes in `App.jsx`
3. Update state management as needed
4. Add styles to `index.css`

## 🤝 Contributing

Feel free to fork this project and add your own features! Some ideas:
- Export expenses to CSV
- Multiple currency support
- Expense categories with icons
- Recurring expenses
- Payment tracking

## 📄 License

This project is open source and available under the MIT License.

---

**Happy expense tracking! 💰** "# Expense_tracker" 
