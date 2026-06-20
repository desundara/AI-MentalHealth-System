const { getPool, sql } = require('../config/db');
const { assessMood } = require('../utils/openai.util');

// POST /api/mood — create mood log + AI assessment
const createMoodLog = async (req, res) => {
    const { mood_score, sleep_hours, stress_level, anxiety_level, symptoms, notes } = req.body;
    const userId = req.user.id;

    if (!mood_score || mood_score < 1 || mood_score > 10)
        return res.status(400).json({ message: 'Mood score must be between 1 and 10' });

    try {
        const pool = getPool();

        // Check if already logged today
        const existing = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`SELECT id FROM MoodLogs
                WHERE user_id = @userId AND log_date = CAST(GETDATE() AS DATE)`);
        if (existing.recordset.length > 0)
        return res.status(409).json({ message: 'You have already logged your mood today' });

        // Insert mood log
        const logResult = await pool.request()
        .input('userId', sql.Int, userId)
        .input('mood_score', sql.Int, mood_score)
        .input('sleep_hours', sql.Decimal(4,1), sleep_hours || null)
        .input('stress_level', sql.Int, stress_level || null)
        .input('anxiety_level', sql.Int, anxiety_level || null)
        .input('symptoms', sql.NVarChar, symptoms || null)
        .input('notes', sql.NVarChar, notes || null)
        .query(`INSERT INTO MoodLogs (user_id, mood_score, sleep_hours, stress_level, anxiety_level, symptoms, notes)
                OUTPUT INSERTED.id
                VALUES (@userId, @mood_score, @sleep_hours, @stress_level, @anxiety_level, @symptoms, @notes)`);

        const logId = logResult.recordset[0].id;

        // AI Assessment
        const assessment = await assessMood({ mood_score, sleep_hours, stress_level, anxiety_level, symptoms, notes });

        // Save AI assessment
        await pool.request()
        .input('logId', sql.Int, logId)
        .input('userId', sql.Int, userId)
        .input('risk_level', sql.NVarChar, assessment.risk_level)
        .input('ai_summary', sql.NVarChar, assessment.summary)
        .input('suggestions', sql.NVarChar, assessment.suggestions)
        .query(`INSERT INTO AIAssessments (log_id, user_id, risk_level, ai_summary, suggestions)
                VALUES (@logId, @userId, @risk_level, @ai_summary, @suggestions)`);

        // Create alert if High risk
        if (assessment.risk_level === 'High') {
        await pool.request()
            .input('userId', sql.Int, userId)
            .input('logId', sql.Int, logId)
            .input('risk_level', sql.NVarChar, assessment.risk_level)
            .input('message', sql.NVarChar, `User ${req.user.fullName} has been flagged as HIGH risk. Immediate attention recommended.`)
            .query(`INSERT INTO Alerts (user_id, log_id, risk_level, message)
                    VALUES (@userId, @logId, @risk_level, @message)`);
        }

        res.status(201).json({
        message: 'Mood logged successfully',
        log_id: logId,
        assessment
        });
    } catch (err) {
        console.error('createMoodLog error:', err);
        res.status(500).json({ message: 'Server error' });
    }
    };

    // GET /api/mood — get current user's mood logs
    const getMyLogs = async (req, res) => {
    const userId = req.user.id;
    try {
        const pool = getPool();
        const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`SELECT ml.*, ai.risk_level, ai.ai_summary, ai.suggestions
                FROM MoodLogs ml
                LEFT JOIN AIAssessments ai ON ai.log_id = ml.id
                WHERE ml.user_id = @userId
                ORDER BY ml.log_date DESC`);
        res.json({ logs: result.recordset });
    } catch (err) {
        console.error('getMyLogs error:', err);
        res.status(500).json({ message: 'Server error' });
    }
    };

    // GET /api/mood/today — check if logged today
    const getTodayLog = async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
        .input('userId', sql.Int, req.user.id)
        .query(`SELECT ml.*, ai.risk_level, ai.ai_summary, ai.suggestions
                FROM MoodLogs ml
                LEFT JOIN AIAssessments ai ON ai.log_id = ml.id
                WHERE ml.user_id = @userId AND ml.log_date = CAST(GETDATE() AS DATE)`);
        res.json({ log: result.recordset[0] || null });
    } catch (err) {
        console.error('getTodayLog error:', err);
        res.status(500).json({ message: 'Server error' });
    }
    };

    // GET /api/mood/stats — mood trend data for charts
    const getMoodStats = async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
        .input('userId', sql.Int, req.user.id)
        .query(`SELECT TOP 30
                    ml.log_date, ml.mood_score, ml.stress_level,
                    ml.sleep_hours, ml.anxiety_level, ai.risk_level
                FROM MoodLogs ml
                LEFT JOIN AIAssessments ai ON ai.log_id = ml.id
                WHERE ml.user_id = @userId
                ORDER BY ml.log_date DESC`);
        res.json({ stats: result.recordset.reverse() });
    } catch (err) {
        console.error('getMoodStats error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createMoodLog, getMyLogs, getTodayLog, getMoodStats };
