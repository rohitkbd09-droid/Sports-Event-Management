const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/database');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registrations');
const feedbackRoutes = require('./routes/feedback');
const adminRoutes = require('./routes/admin');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
db.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('❌ MySQL Access Denied. Please check your database credentials in server/.env');
      console.error('   Current settings:');
      console.error(`   DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
      console.error(`   DB_USER: ${process.env.DB_USER || 'root'}`);
      console.error(`   DB_PASSWORD: ${process.env.DB_PASSWORD ? '***' : '(empty)'}`);
      console.error('   Make sure MySQL is running and credentials are correct.');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('❌ Cannot connect to MySQL. Please make sure MySQL server is running.');
    } else {
      console.error('❌ Database connection error:', err.message);
    }
  } else {
    console.log('✅ Database connected successfully');
    connection.release();
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

