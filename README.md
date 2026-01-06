# Sports Event Management System

A comprehensive web-based Sports Event Management System that allows users to register, participate in sports events, and submit feedback, while providing administrators full control over event management and participant data.

## Features

### User Module
- User registration and secure login
- View all available sports events
- Register for events
- Mark participation after event date
- Submit feedback for participated events
- View personal registrations and feedback

### Admin Module
- Admin login with secure credentials
- Create, update, and delete sports events
- View all user registrations with details
- Track event participation
- View all feedback submitted by users
- Generate comprehensive reports:
  - Total registrations
  - Event-wise participation statistics
  - Feedback summaries with average ratings

## Technology Stack

- **Frontend**: React, React Router, Bootstrap, Axios
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Setup Instructions

1. **Clone or navigate to the project directory**

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure the database**
   - Create a MySQL database (or use the default name `sports_events_db`)
   - Update the database configuration in `server/.env`:
     ```
     PORT=5000
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=sports_events_db
     JWT_SECRET=your_secret_jwt_key_change_this_in_production
     ```
   - Copy `server/.env.example` to `server/.env` and update the values

4. **Initialize the database**
   - The database tables will be created automatically when you start the server
   - A default admin user will be created:
     - Email: `admin@sports.com`
     - Password: `admin123`

5. **Start the application**
   ```bash
   npm run dev
   ```
   This will start both the backend server (port 5000) and frontend (port 3000)

   Or start them separately:
   ```bash
   # Terminal 1 - Backend
   npm run server

   # Terminal 2 - Frontend
   npm run client
   ```

## Usage

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### Default Admin Credentials
- Email: `admin@sports.com`
- Password: `admin123`

### User Registration
1. Click "Register" in the navigation
2. Fill in your details (Name, Email, Phone, Password)
3. You'll be automatically logged in after registration

### Admin Features
1. Login with admin credentials
2. Navigate to "Admin Dashboard" to see overview
3. Use "Manage Events" to create/edit/delete events
4. View "Registrations" to see all user registrations
5. Check "Feedback" to see all submitted feedback
6. Access "Reports" for analytics and statistics

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (Admin only)
- `PUT /api/events/:id` - Update event (Admin only)
- `DELETE /api/events/:id` - Delete event (Admin only)

### Registrations
- `POST /api/registrations` - Register for an event
- `GET /api/registrations/my-registrations` - Get user's registrations
- `PUT /api/registrations/:id/participate` - Mark participation

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/my-feedback` - Get user's feedback
- `GET /api/feedback/event/:event_id` - Get feedback for event (Admin)

### Admin
- `GET /api/admin/registrations` - Get all registrations
- `GET /api/admin/users` - Get all users
- `GET /api/admin/feedback` - Get all feedback
- `GET /api/admin/reports` - Get reports

## Project Structure

```
sports-event-management/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/        # React context (Auth)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/            # Database configuration
│   ├── middleware/        # Auth middleware
│   ├── routes/            # API routes
│   ├── index.js           # Server entry point
│   └── package.json
└── package.json           # Root package.json
```

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Role-based access control (Admin/User)
- Protected API routes
- Input validation

## Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## Future Enhancements

- Email notifications for event registrations
- Event reminders
- Payment integration for paid events
- Advanced filtering and search
- Export reports to PDF/Excel
- Real-time notifications
- Event calendar view

## License

This project is open source and available for educational purposes.

## Credits
Done by srinivasreddygaalla for surya

