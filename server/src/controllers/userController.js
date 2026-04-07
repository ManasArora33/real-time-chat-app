const User = require('../models/User');

/**
 * Fetch all users except the currently logged-in user.
 * @desc    Get all users for chat list
 * @route   GET /api/users
 * @access  Private
 */
const getUsers = async (req, res) => {
  try {
    // req.user._id is available because we use the 'protect' middleware
    const users = await User.find({ _id: { $ne: req.user._id } });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers };
