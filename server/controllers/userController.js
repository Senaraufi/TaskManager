const { User } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ 
      where: {
        [sequelize.Op.or]: [{ email }, { username }]
      }
    });
    
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.level,
        xp: user.xp,
        xpToNextLevel: user.xpToNextLevel,
        token: generateToken(user.id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.level,
        xp: user.xp,
        xpToNextLevel: user.xpToNextLevel,
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (user) {
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.level,
        xp: user.xp,
        xpToNextLevel: user.xpToNextLevel
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leaderboard (top users by level)
// @route   GET /api/users/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['username', 'level', 'xp'],
      order: [
        ['level', 'DESC'],
        ['xp', 'DESC']
      ],
      limit: 10
    });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
