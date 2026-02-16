const express = require('express');
const router = express.Router();
const { getAllLockers, forceReleaseLocker, updateLockerStatus } = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/adminAuth');

// Apply middleware to all routes in this router
router.use(requireAuth);
router.use(requireAdmin);

router.get('/check', (req, res) => {
    res.json({ isAdmin: true, email: req.userEmail });
});

router.get('/lockers', getAllLockers);
router.post('/lockers/release', forceReleaseLocker);
router.put('/lockers/:id', updateLockerStatus);

module.exports = router;
