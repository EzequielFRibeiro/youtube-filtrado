const router = require('express').Router();
const { uploadVideo, getAllVideos, getVideoById, updateVideo, deleteVideo, getTrending } = require('../controllers/videoController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getAllVideos);
router.get('/trending', optionalAuth, getTrending);
router.get('/:id', optionalAuth, getVideoById);
router.post('/', authMiddleware, uploadVideo);
router.put('/:id', authMiddleware, updateVideo);
router.delete('/:id', authMiddleware, deleteVideo);

module.exports = router;
