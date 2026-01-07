const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const db = require('../config/database');

// Get all registrations (Admin only)
router.get('/registrations', authenticate, isAdmin, async (req, res) => {
  const connection = await db.promise.getConnection();
  try {
    const [registrations] = await connection.query(`
      SELECT r.*, u.name as user_name, u.email as user_email, u.phone as user_phone,
             e.event_name, e.sport_type, e.event_date, e.venue
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      JOIN events e ON r.event_id = e.id
      ORDER BY r.registered_at DESC
    `);

    res.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
});

// Get all users (Admin only)
router.get('/users', authenticate, isAdmin, async (req, res) => {
  const connection = await db.promise.getConnection();
  try {
    const [users] = await connection.query(
      'SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
    );

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
});

// Get all feedback (Admin only)
router.get('/feedback', authenticate, isAdmin, async (req, res) => {
  const connection = await db.promise.getConnection();
  try {
    const [feedback] = await connection.query(`
      SELECT f.*, u.name as user_name, u.email as user_email,
             e.event_name, e.sport_type, e.event_date
      FROM feedback f
      JOIN users u ON f.user_id = u.id
      JOIN events e ON f.event_id = e.id
      ORDER BY f.submitted_at DESC
    `);

    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
});

// Get reports (Admin only)
router.get('/reports', authenticate, isAdmin, async (req, res) => {
  const connection = await db.promise.getConnection();
  try {
    // Total registrations
    const [totalRegistrations] = await connection.query(
      'SELECT COUNT(*) as total FROM registrations'
    );

    // Event-wise participation
    const [eventParticipation] = await connection.query(`
      SELECT 
        e.id,
        e.event_name,
        e.sport_type,
        COUNT(r.id) as total_registrations,
        SUM(CASE WHEN r.participation_status = 'participated' THEN 1 ELSE 0 END) as total_participated,
        SUM(CASE WHEN r.participation_status = 'absent' THEN 1 ELSE 0 END) as total_absent
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      GROUP BY e.id, e.event_name, e.sport_type
      ORDER BY e.event_date DESC
    `);

    // Feedback summary
    const [feedbackSummary] = await connection.query(`
      SELECT 
        e.id,
        e.event_name,
        COUNT(f.id) as total_feedback,
        AVG(f.rating) as average_rating
      FROM events e
      LEFT JOIN feedback f ON e.id = f.event_id
      GROUP BY e.id, e.event_name
      ORDER BY e.event_date DESC
    `);

    res.json({
      totalRegistrations: totalRegistrations[0].total,
      eventParticipation,
      feedbackSummary
    });
  } catch (error) {
    console.error('Error generating reports:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
});

module.exports = router;

