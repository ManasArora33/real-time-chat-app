const User = require('../models/User');

/**
 * Fetch all users except the currently logged-in user.
 * @desc    Get all users for chat list
 * @route   GET /api/users
 * @access  Private
 */
const getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    
    // Base query: Always exclude the currently logged-in user
    let query = { _id: { $ne: req.user._id } };

    // If a search term is provided, add regex filtering to the query
    if (search) {
      query.username = { $regex: search, $options: 'i' };
    }

    const users = await User.find(query).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers };
