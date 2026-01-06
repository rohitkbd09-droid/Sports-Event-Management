const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const db = require('../config/database');

// Register for an event
router.post('/', authenticate, async (req, res) => {
  try {
    const { event_id } = req.body;
    const user_id = req.user.id;

    if (!event_id) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    // Check if event exists and registration deadline hasn't passed
    const [events] = await db.promise.query(
      'SELECT * FROM events WHERE id = ?',
      [event_id]
    );

    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const event = events[0];
    const now = new Date();
    const deadline = new Date(event.registration_deadline);

    if (now > deadline) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    // Check if already registered
    const [existing] = await db.promise.query(
      'SELECT * FROM registrations WHERE user_id = ? AND event_id = ?',
      [user_id, event_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Register
    await db.promise.query(
      'INSERT INTO registrations (user_id, event_id) VALUES (?, ?)',
      [user_id, event_id]
    );

    res.status(201).json({ message: 'Successfully registered for the event' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's registrations
router.get('/my-registrations', authenticate, async (req, res) => {
  try {
    const user_id = req.user.id;

    const [registrations] = await db.promise.query(`
      SELECT r.*, e.event_name, e.sport_type, e.event_date, e.venue, e.registration_deadline
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.user_id = ?
      ORDER BY e.event_date ASC
    `, [user_id]);

    res.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark participation
router.put('/:id/participate', authenticate, async (req, res) => {
  try {
    const registration_id = req.params.id;
    const user_id = req.user.id;

    // Verify ownership
    const [registrations] = await db.promise.query(
      'SELECT * FROM registrations WHERE id = ? AND user_id = ?',
      [registration_id, user_id]
    );

    if (registrations.length === 0) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    await db.promise.query(
      'UPDATE registrations SET participation_status = ? WHERE id = ?',
      ['participated', registration_id]
    );

    res.json({ message: 'Participation marked successfully' });
  } catch (error) {
    console.error('Error updating participation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

