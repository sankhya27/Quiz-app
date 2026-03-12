const Announcement = require('../models/Announcement');

// Create Announcement (Admin only)
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, targetRoles } = req.body;
    const announcement = new Announcement({
      title,
      content,
      targetRoles: targetRoles || ['user'],
      author: req.user._id
    });

    await announcement.save();
    res.status(201).json({ message: 'Announcement posted successfully', announcement });
  } catch (error) {
    res.status(500).json({ message: 'Error posting announcement', error: error.message });
  }
};

// Get Announcements for current user
const getAnnouncements = async (req, res) => {
  try {
    const userRole = req.user.isAdmin ? 'admin' : 'user';
    const announcements = await Announcement.find({
      targetRoles: userRole
    }).sort({ createdAt: -1 }).populate('author', 'name');

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcements', error: error.message });
  }
};

// Mark announcement as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Announcement.findByIdAndUpdate(id, {
      $addToSet: { isReadBy: req.user._id }
    });
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating announcement', error: error.message });
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  markAsRead
};
