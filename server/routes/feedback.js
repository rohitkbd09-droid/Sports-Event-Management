const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const db = require('../config/database');

// Submit feedback
router.post('/', authenticate, async (req, res) => {
  try {
    const { event_id, rating, comment } = req.body;
    const user_id = req.user.id;

    if (!event_id || !rating) {
      return res.status(400).json({ message: 'Event ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if user participated in the event
    const [registrations] = await db.promise.query(
      'SELECT * FROM registrations WHERE user_id = ? AND event_id = ? AND participation_status = ?',
      [user_id, event_id, 'participated']
    );

    if (registrations.length === 0) {
      return res.status(400).json({ message: 'You must participate in the event before submitting feedback' });
    }

    // Check if feedback already exists
    const [existing] = await db.promise.query(
      'SELECT * FROM feedback WHERE user_id = ? AND event_id = ?',
      [user_id, event_id]
    );

    if (existing.length > 0) {
      // Update existing feedback
      await db.promise.query(
        'UPDATE feedback SET rating = ?, comment = ? WHERE user_id = ? AND event_id = ?',
        [rating, comment || null, user_id, event_id]
      );
      return res.json({ message: 'Feedback updated successfully' });
    }

    // Create new feedback
    await db.promise.query(
      'INSERT INTO feedback (user_id, event_id, rating, comment) VALUES (?, ?, ?, ?)',
      [user_id, event_id, rating, comment || null]
    );

    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's feedback
router.get('/my-feedback', authenticate, async (req, res) => {
  try {
    const user_id = req.user.id;

    const [feedback] = await db.promise.query(`
      SELECT f.*, e.event_name, e.sport_type, e.event_date
      FROM feedback f
      JOIN events e ON f.event_id = e.id
      WHERE f.user_id = ?
      ORDER BY f.submitted_at DESC
    `, [user_id]);

    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get feedback for a specific event (Admin)
router.get('/event/:event_id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const [feedback] = await db.promise.query(`
      SELECT f.*, u.name as user_name, u.email as user_email, e.event_name
      FROM feedback f
      JOIN users u ON f.user_id = u.id
      JOIN events e ON f.event_id = e.id
      WHERE f.event_id = ?
      ORDER BY f.submitted_at DESC
    `, [req.params.event_id]);

    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

