const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const db = require('../config/database');

// Get all events (public)
router.get('/', async (req, res) => {
  const connection = await db.promise.getConnection();
  try {
    const [events] = await connection.query(`
      SELECT e.*, u.name as created_by_name
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      ORDER BY e.event_date ASC
    `);

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  const connection = await db.promise.getConnection();
  try {
    const [events] = await connection.query(`
      SELECT e.*, u.name as created_by_name
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.id = ?
    `, [req.params.id]);

    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(events[0]);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
});

// Create event (Admin only)
router.post('/', authenticate, async (req, res) => {
  const connection = await db.promise.getConnection();
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { event_name, sport_type, event_date, venue, registration_deadline, description } = req.body;

    if (!event_name || !sport_type || !event_date || !venue || !registration_deadline) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const [result] = await connection.query(
      `INSERT INTO events (event_name, sport_type, event_date, venue, registration_deadline, description, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [event_name, sport_type, event_date, venue, registration_deadline, description || null, req.user.id]
    );

    const [newEvent] = await connection.query(
      'SELECT * FROM events WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ message: 'Event created successfully', event: newEvent[0] });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
});

// Update event (Admin only)
router.put('/:id', authenticate, async (req, res) => {
  const connection = await db.promise.getConnection();
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { event_name, sport_type, event_date, venue, registration_deadline, description } = req.body;

    await connection.query(
      `UPDATE events 
       SET event_name = ?, sport_type = ?, event_date = ?, venue = ?, registration_deadline = ?, description = ?
       WHERE id = ?`,
      [event_name, sport_type, event_date, venue, registration_deadline, description || null, req.params.id]
    );

    const [updatedEvent] = await connection.query(
      'SELECT * FROM events WHERE id = ?',
      [req.params.id]
    );

    if (updatedEvent.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event updated successfully', event: updatedEvent[0] });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
});

// Delete event (Admin only)
router.delete('/:id', authenticate, async (req, res) => {
  const connection = await db.promise.getConnection();
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const [result] = await connection.query(
      'DELETE FROM events WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
});

module.exports = router;

