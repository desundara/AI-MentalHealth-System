const { getPool, sql } = require('../config/db');
const bcrypt = require('bcryptjs');

// GET /api/user/profile
const getProfile = async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.user.id)
      .query('SELECT id, full_name, email, role, created_at FROM Users WHERE id = @id');
    if (result.recordset.length === 0)
      return res.status(404).json({ message: 'User not found' });
    res.json({ user: result.recordset[0] });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/user/profile
const updateProfile = async (req, res) => {
  const { fullName } = req.body;
  if (!fullName || fullName.trim() === '')
    return res.status(400).json({ message: 'Full name is required' });
  try {
    const pool = getPool();
    await pool.request()
      .input('id', sql.Int, req.user.id)
      .input('fullName', sql.NVarChar, fullName.trim())
      .query('UPDATE Users SET full_name = @fullName, updated_at = GETDATE() WHERE id = @id');
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/user/change-password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: 'All fields are required' });
  if (newPassword.length < 6)
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  try {
    const pool = getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.user.id)
      .query('SELECT password FROM Users WHERE id = @id');
    if (result.recordset.length === 0)
      return res.status(404).json({ message: 'User not found' });
    const isMatch = await bcrypt.compare(currentPassword, result.recordset[0].password);
    if (!isMatch)
      return res.status(401).json({ message: 'Current password is incorrect' });
    const hashed = await bcrypt.hash(newPassword, 12);
    await pool.request()
      .input('id', sql.Int, req.user.id)
      .input('password', sql.NVarChar, hashed)
      .query('UPDATE Users SET password = @password, updated_at = GETDATE() WHERE id = @id');
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('changePassword error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProfile, updateProfile, changePassword };
