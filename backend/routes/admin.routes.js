const express = require('express');
const router = express.Router();
const { getCounselors, createCounselor, toggleCounselor, getUsers } = require('../controllers/admin.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticate);
router.use(authorizeRoles('superadmin'));

router.get('/counselors', getCounselors);
router.post('/counselors', createCounselor);
router.patch('/counselors/:id/toggle', toggleCounselor);
router.get('/users', getUsers);

module.exports = router;
