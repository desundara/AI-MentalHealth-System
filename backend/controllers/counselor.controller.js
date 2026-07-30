const { getPool, sql } = require('../config/db');

// GET /api/counselor/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const pool = getPool();
    const stats = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM Users WHERE role = 'user' AND is_active = 1) AS total_users,
        (SELECT COUNT(*) FROM Alerts WHERE is_resolved = 0) AS unresolved_alerts,
        (SELECT COUNT(*) FROM Alerts WHERE risk_level = 'High' AND is_resolved = 0) AS high_risk_alerts,
        (SELECT COUNT(*) FROM MoodLogs WHERE log_date = CAST(GETDATE() AS DATE)) AS logs_today
    `);
    res.json({ stats: stats.recordset[0] });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/counselor/alerts
const getAlerts = async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT
        a.id, a.user_id, a.log_id,
        u.full_name, u.email,
        a.risk_level, a.message,
        a.is_read, a.is_resolved,
        a.created_at, a.resolve_note,
        a.summary,                          -- from Alerts (this one is fine)
        ml.mood_score, ml.stress_level, ml.anxiety_level,
        ml.symptoms, ml.notes, ml.sleep_hours,
        ai.ai_summary, ai.suggestions       -- ← changed here
      FROM Alerts a
      INNER JOIN Users u ON u.id = a.user_id
      LEFT JOIN MoodLogs ml ON ml.id = a.log_id
      LEFT JOIN AIAssessments ai ON ai.log_id = a.log_id
      WHERE a.is_resolved = 0
      ORDER BY a.created_at DESC
    `);
    res.json({ alerts: result.recordset });
  } catch (err) {
    console.error('getAlerts error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/counselor/alerts/:id/resolve
const resolveAlert = async (req, res) => {
  try {
    // Prevent req.body from being undefined
    const { note } = req.body || {};

    const pool = getPool();

    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('note', sql.NVarChar(sql.MAX), note || null)
      .query(`
        UPDATE Alerts
        SET
          is_resolved = 1,
          is_read = 1,
          resolve_note = @note
        WHERE id = @id
      `);

    // Check if alert exists
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        message: 'Alert not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Alert resolved successfully'
    });

  } catch (err) {
    console.error('resolveAlert error:', err);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// GET /api/counselor/users?search=&risk=
const getUsers = async (req, res) => {
  const { search = '', risk = '' } = req.query;
  try {
    const pool = getPool();
    const result = await pool.request()
      .input('search', sql.NVarChar, `%${search}%`)
      .query(`
        SELECT
          u.id, u.full_name, u.email, u.is_active, u.created_at,
          COUNT(ml.id) AS total_logs,
          MAX(ml.log_date) AS last_log_date,
          (SELECT TOP 1 ai.risk_level FROM MoodLogs ml2
            INNER JOIN AIAssessments ai ON ai.log_id = ml2.id
            WHERE ml2.user_id = u.id
            ORDER BY ml2.log_date DESC) AS latest_risk,
          (SELECT TOP 1 ml3.mood_score FROM MoodLogs ml3
            WHERE ml3.user_id = u.id
            ORDER BY ml3.log_date DESC) AS latest_mood
        FROM Users u
        LEFT JOIN MoodLogs ml ON ml.user_id = u.id
        WHERE u.role = 'user' AND u.is_active = 1
          AND (u.full_name LIKE @search OR u.email LIKE @search)
        GROUP BY u.id, u.full_name, u.email, u.is_active, u.created_at
        ORDER BY last_log_date DESC
      `);

    let users = result.recordset;
    if (risk) users = users.filter(u => u.latest_risk === risk);

    res.json({ users });
  } catch (err) {
    console.error('getUsers error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/counselor/users/:id/logs
const getUserLogs = async (req, res) => {
  try {
    const pool = getPool();
    const user = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`SELECT id, full_name, email FROM Users WHERE id = @id AND role = 'user'`);
    if (user.recordset.length === 0)
      return res.status(404).json({ message: 'User not found' });
    const logs = await pool.request()
    .input('userId', sql.Int, req.params.id)
    .query(`
      SELECT ml.id, ml.log_date, ml.mood_score,
        ml.sleep_hours, ml.stress_level, ml.anxiety_level,
        ml.symptoms, ml.notes,
        ai.risk_level, ai.ai_summary, ai.suggestions   -- ← changed here
      FROM MoodLogs ml
      LEFT JOIN AIAssessments ai ON ai.log_id = ml.id
      WHERE ml.user_id = @userId
      ORDER BY ml.log_date DESC
    `);
    res.json({ user: user.recordset[0], logs: logs.recordset });
  } catch (err) {
    console.error('getUserLogs error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboardStats, getAlerts, resolveAlert, getUsers, getUserLogs };
