# Quick Start Guide

## Prerequisites
- Node.js installed (v14+)
- MySQL installed and running
- npm or yarn package manager

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Configure Database
1. Make sure MySQL is running
2. Create a `.env` file in the `server` folder (copy from `.env.example`)
3. Update the database credentials in `server/.env`:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=sports_events_db
   ```

### 3. Start the Application
```bash
npm run dev
```

This will:
- Start the backend server on http://localhost:5000
- Start the frontend on http://localhost:3000
- Automatically create database tables
- Create default admin user

### 4. Access the Application
- Open your browser and go to: http://localhost:3000
- Default Admin Login:
  - Email: `admin@sports.com`
  - Password: `admin123`

## First Steps

1. **As Admin:**
   - Login with admin credentials
   - Go to "Manage Events" and create some events
   - View registrations and feedback as users register

2. **As User:**
   - Register a new account
   - Browse events on the home page
   - Register for events
   - After event date, mark participation
   - Submit feedback for participated events

## Troubleshooting

### Database Connection Error
- Make sure MySQL is running
- Check database credentials in `server/.env`
- Ensure the database exists (or let the app create it)

### Port Already in Use
- Change PORT in `server/.env` if 5000 is taken
- React app will automatically use next available port if 3000 is taken

### Module Not Found Errors
- Run `npm run install-all` again
- Delete `node_modules` folders and reinstall

## Need Help?
Check the main README.md for detailed documentation.

