const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../config/db');

// POST /api/auth/register
const register = async (req, res) => {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Only allow 'user' or 'counselor' roles
    const allowedRoles = ['user', 'counselor'];
    const userRole = allowedRoles.includes(role) ? role : 'user';

    try {
        const pool = getPool();

        // Check if email already exists
        const existing = await pool.request()
        .input('email', sql.NVarChar, email)
        .query('SELECT id FROM Users WHERE email = @email');

        if (existing.recordset.length > 0) {
        return res.status(409).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await pool.request()
        .input('fullName', sql.NVarChar, fullName)
        .input('email', sql.NVarChar, email)
        .input('password', sql.NVarChar, hashedPassword)
        .input('role', sql.NVarChar, userRole)
        .query(`
            INSERT INTO Users (full_name, email, password, role, created_at)
            VALUES (@fullName, @email, @password, @role, GETDATE())
        `);

        res.status(201).json({ message: 'Registration successful' });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error' });
    }
    };

    // POST /api/auth/login
    const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const pool = getPool();

        const result = await pool.request()
        .input('email', sql.NVarChar, email)
        .query('SELECT * FROM Users WHERE email = @email AND is_active = 1');

        if (result.recordset.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = result.recordset[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, fullName: user.full_name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
        message: 'Login successful',
        token,
        user: {
            id: user.id,
            fullName: user.full_name,
            email: user.email,
            role: user.role,
        }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
    };

    // GET /api/auth/me
    const getMe = async (req, res) => {
    try {
        const pool = getPool();

        const result = await pool.request()
        .input('id', sql.Int, req.user.id)
        .query('SELECT id, full_name, email, role, created_at FROM Users WHERE id = @id');

        if (result.recordset.length === 0) {
        return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user: result.recordset[0] });
    } catch (err) {
        console.error('GetMe error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { register, login, getMe };
