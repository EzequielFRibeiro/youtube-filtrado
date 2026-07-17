const router = require('express').Router();
const { getProfile, updateProfile, getWatchHistory, deleteAccount } = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

router.get('/profile/:id', getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.get('/history', authMiddleware, getWatchHistory);
router.delete('/account', authMiddleware, deleteAccount);

module.exports = router;
