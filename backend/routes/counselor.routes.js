const express = require('express');
const router = express.Router();
const { getDashboardStats, getAlerts, resolveAlert, getUsers, getUserLogs } = require('../controllers/counselor.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticate);
router.use(authorizeRoles('counselor'));

router.get('/dashboard', getDashboardStats);
router.get('/alerts', getAlerts);
router.patch('/alerts/:id/resolve', resolveAlert);
router.get('/users', getUsers);
router.get('/users/:id/logs', getUserLogs);

module.exports = router;