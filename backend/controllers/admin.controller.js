const bcrypt = require('bcryptjs');
const { getPool, sql } = require('../config/db');

// GET /api/admin/counselors — list all counselors
const getCounselors = async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
        .query(`SELECT id, full_name, email, is_active, created_at
                FROM Users WHERE role = 'counselor' ORDER BY created_at DESC`);
        res.json({ counselors: result.recordset });
    } catch (err) {
        console.error('getCounselors error:', err);
        res.status(500).json({ message: 'Server error' });
    }
    };

    // POST /api/admin/counselors — create counselor
    const createCounselor = async (req, res) => {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password)
        return res.status(400).json({ message: 'All fields are required' });
    if (password.length < 6)
        return res.status(400).json({ message: 'Password must be at least 6 characters' });

    try {
        const pool = getPool();
        const existing = await pool.request()
        .input('email', sql.NVarChar, email)
        .query('SELECT id FROM Users WHERE email = @email');
        if (existing.recordset.length > 0)
        return res.status(409).json({ message: 'Email already registered' });

        const hashed = await bcrypt.hash(password, 12);
        await pool.request()
        .input('fullName', sql.NVarChar, fullName)
        .input('email', sql.NVarChar, email)
        .input('password', sql.NVarChar, hashed)
        .query(`INSERT INTO Users (full_name, email, password, role)
                VALUES (@fullName, @email, @password, 'counselor')`);

        res.status(201).json({ message: 'Counselor created successfully' });
    } catch (err) {
        console.error('createCounselor error:', err);
        res.status(500).json({ message: 'Server error' });
    }
    };

    // PATCH /api/admin/counselors/:id/toggle — activate/deactivate
    const toggleCounselor = async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .query(`UPDATE Users SET is_active = 1 - is_active, updated_at = GETDATE()
                WHERE id = @id AND role = 'counselor';
                SELECT is_active FROM Users WHERE id = @id`);
        const updated = result.recordset[0];
        if (!updated) return res.status(404).json({ message: 'Counselor not found' });
        res.json({ message: `Counselor ${updated.is_active ? 'activated' : 'deactivated'}`, is_active: updated.is_active });
    } catch (err) {
        console.error('toggleCounselor error:', err);
        res.status(500).json({ message: 'Server error' });
    }
    };

    // GET /api/admin/users — list all users
    const getUsers = async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
        .query(`SELECT u.id, u.full_name, u.email, u.is_active, u.created_at,
                    COUNT(ml.id) AS total_logs,
                    MAX(ml.log_date) AS last_log_date
                FROM Users u
                LEFT JOIN MoodLogs ml ON ml.user_id = u.id
                WHERE u.role = 'user'
                GROUP BY u.id, u.full_name, u.email, u.is_active, u.created_at
                ORDER BY u.created_at DESC`);
        res.json({ users: result.recordset });
    } catch (err) {
        console.error('getUsers error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getCounselors, createCounselor, toggleCounselor, getUsers };
