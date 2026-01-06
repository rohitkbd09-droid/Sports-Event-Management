# Database Setup Guide

## MySQL Connection Issues

If you're getting "Access denied" errors, follow these steps:

### Option 1: Set MySQL Password in .env (Recommended)

1. Open `server/.env` file
2. Set your MySQL root password:
   ```
   DB_PASSWORD=your_mysql_password
   ```

### Option 2: Configure MySQL for Passwordless Access

If you want to use MySQL without a password (less secure, only for development):

1. Open MySQL command line or MySQL Workbench
2. Run:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY '';
   FLUSH PRIVILEGES;
   ```

### Option 3: Create a New MySQL User

1. Login to MySQL as root:
   ```bash
   mysql -u root -p
   ```

2. Create a new user and database:
   ```sql
   CREATE DATABASE sports_events_db;
   CREATE USER 'sports_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON sports_events_db.* TO 'sports_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

3. Update `server/.env`:
   ```
   DB_USER=sports_user
   DB_PASSWORD=your_password
   ```

## Verify MySQL is Running

**Windows:**
```powershell
Get-Service -Name MySQL*
```

**Or check in Services:**
- Press `Win + R`, type `services.msc`
- Look for "MySQL" service
- Make sure it's running

**Start MySQL if not running:**
```powershell
Start-Service MySQL80
```
(Replace MySQL80 with your MySQL service name)

## Test Connection

You can test your MySQL connection manually:
```bash
mysql -u root -p
```

If this works, your credentials are correct.

