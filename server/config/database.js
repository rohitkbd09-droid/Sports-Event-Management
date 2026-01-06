const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sports_events_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

// Initialize database tables
const initDatabase = async () => {
  try {
    // Create database if it doesn't exist
    const mysqlPromise = require('mysql2/promise');
    const connection = await mysqlPromise.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });
    
    const dbName = process.env.DB_NAME || 'sports_events_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.end();

    // Wait a bit for database to be ready
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create tables
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_name VARCHAR(255) NOT NULL,
        sport_type VARCHAR(100) NOT NULL,
        event_date DATETIME NOT NULL,
        venue VARCHAR(255) NOT NULL,
        registration_deadline DATETIME NOT NULL,
        description TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        event_id INT NOT NULL,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        participation_status ENUM('registered', 'participated', 'absent') DEFAULT 'registered',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        UNIQUE KEY unique_registration (user_id, event_id)
      )
    `);

    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        event_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        UNIQUE KEY unique_feedback (user_id, event_id)
      )
    `);

    // Create default admin user (password: admin123)
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await promisePool.query(`
      INSERT IGNORE INTO users (name, email, phone, password, role)
      VALUES ('Admin', 'admin@sports.com', '1234567890', ?, 'admin')
    `, [hashedPassword]);

    console.log('Database tables initialized successfully');
  } catch (error) {
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('❌ MySQL Access Denied. Please check your database credentials in server/.env');
      console.error('   Make sure MySQL is running and the username/password are correct.');
      console.error('   If MySQL doesn\'t require a password, leave DB_PASSWORD empty in .env');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Cannot connect to MySQL. Please make sure MySQL server is running.');
    } else {
      console.error('Error initializing database:', error.message);
    }
    // Don't exit - let the server start anyway, tables might already exist
  }
};

initDatabase();

module.exports = pool;
module.exports.promise = promisePool;

