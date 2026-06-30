const express = require('express');
const router = express.Router();
const { createMoodLog, getMyLogs, getTodayLog, getMoodStats, getWeeklySummary } = require('../controllers/mood.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticate);
router.use(authorizeRoles('user'));

router.post('/', createMoodLog);
router.get('/', getMyLogs);
router.get('/today', getTodayLog);
router.get('/stats', getMoodStats);
router.get('/weekly-summary', getWeeklySummary);

module.exports = router;
