require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const authRoutes      = require('./routes/auth.routes');
const moodRoutes      = require('./routes/mood.routes');
const adminRoutes     = require('./routes/admin.routes');
const counselorRoutes = require('./routes/counselor.routes');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',      authRoutes);
app.use('/api/mood',      moodRoutes);
app.use('/api/admin',     adminRoutes);
app.use('/api/counselor', counselorRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'Server is running ✅' }));
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});