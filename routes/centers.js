const express = require('express');
const db = require('../config/database');
const { optionalAuth, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get centers (optional filters by city/state)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { city, state, limit = 100, offset = 0 } = req.query;
    let query = `SELECT id, name, address, city, state, country, website_url, maps_url, latitude, longitude
                 FROM centers WHERE is_active = 1`;
    const params = [];

    if (city) {
      query += ' AND LOWER(city) = ?';
      params.push(String(city).toLowerCase());
    }
    if (state) {
      query += ' AND LOWER(state) = ?';
      params.push(String(state).toLowerCase());
    }

    query += ' ORDER BY city, name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, params);
    res.json({ centers: result.rows });
  } catch (error) {
    console.error('Error fetching centers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create center (admin/auth later; for now keep behind auth)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, address, city, state, country = 'India', websiteUrl, mapsUrl, latitude = null, longitude = null } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    await db.query(
      `INSERT INTO centers (name, address, city, state, country, website_url, maps_url, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, address || null, city || null, state || null, country, websiteUrl || null, mapsUrl || null, latitude, longitude]
    );

    res.status(201).json({ message: 'Center created' });
  } catch (error) {
    console.error('Error creating center:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update center
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, city, state, country, websiteUrl, mapsUrl, latitude, longitude, isActive } = req.body;

    const updates = [];
    const params = [];

    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (address !== undefined) { updates.push('address = ?'); params.push(address); }
    if (city !== undefined) { updates.push('city = ?'); params.push(city); }
    if (state !== undefined) { updates.push('state = ?'); params.push(state); }
    if (country !== undefined) { updates.push('country = ?'); params.push(country); }
    if (websiteUrl !== undefined) { updates.push('website_url = ?'); params.push(websiteUrl); }
    if (mapsUrl !== undefined) { updates.push('maps_url = ?'); params.push(mapsUrl); }
    if (latitude !== undefined) { updates.push('latitude = ?'); params.push(latitude); }
    if (longitude !== undefined) { updates.push('longitude = ?'); params.push(longitude); }
    if (isActive !== undefined) { updates.push('is_active = ?'); params.push(isActive ? 1 : 0); }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    params.push(id);
    await db.query(`UPDATE centers SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, params);

    res.json({ message: 'Center updated' });
  } catch (error) {
    console.error('Error updating center:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete center (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE centers SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    res.json({ message: 'Center deactivated' });
  } catch (error) {
    console.error('Error deleting center:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


