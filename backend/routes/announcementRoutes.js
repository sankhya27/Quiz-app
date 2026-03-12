const express = require('express');
const router = express.Router();
const { 
  createAnnouncement, 
  getAnnouncements, 
  markAsRead 
} = require('../controllers/announcementController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, admin, createAnnouncement);
router.get('/', protect, getAnnouncements);
router.put('/:id/read', protect, markAsRead);

module.exports = router;
