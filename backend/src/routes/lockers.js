const express = require('express');
const router = express.Router();
const lockerController = require('../controllers/lockerController');

// Define routes
const { requireAdmin, requireAuth } = require('../middleware/adminAuth');

// Public routes
router.get('/status', lockerController.getLockerStatus);

// Protected routes (Student)
router.post('/assign', lockerController.assignLocker);
router.post('/return', lockerController.returnLocker);
router.get('/my-assignment', lockerController.getMyAssignment);
router.post('/add-item', lockerController.addItem);
router.post('/add-items', lockerController.addItems);

// Protected routes (Admin)
router.get('/status-admin', requireAdmin, lockerController.getLockerStatusAdmin);

module.exports = router;
