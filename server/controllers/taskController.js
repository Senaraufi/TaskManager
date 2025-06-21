const { Task, User } = require('../models');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, category, priority, xpReward = 10 } = req.body;
    
    // Create new task
    const task = await Task.create({
      title,
      description,
      category,
      priority,
      xpReward,
      userId: req.user.id
    });
    
    // Award XP to user for creating a task
    const user = await User.findByPk(req.user.id);
    // Add XP to user
    user.xp += task.xpReward;
    
    // Check if user leveled up
    if (user.xp >= user.xpToNextLevel) {
      user.level += 1;
      user.xpToNextLevel = Math.round(user.xpToNextLevel * 1.5);
    }
    
    await user.save();
    
    res.status(201).json({
      task,
      user: {
        level: user.level,
        xp: user.xp,
        xpToNextLevel: user.xpToNextLevel
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tasks for a user
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    
    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user owns the task
    if (task.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, category, priority } = req.body;
    
    const task = await Task.findByPk(req.params.id);
    
    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user owns the task
    if (task.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Check if task is being marked as completed
    const wasCompleted = task.status !== 'completed' && status === 'completed';
    
    // Update task fields
    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;
    if (category) task.category = category;
    if (priority) task.priority = priority;
    
    // If task is being marked as completed, set completionXp
    if (wasCompleted) {
      task.completionXp = task.xpReward * 2; // Double XP for completion
    }
    
    await task.save();
    
    // If task was marked as completed, award XP
    let user = null;
    if (wasCompleted) {
      user = await User.findByPk(req.user.id);
      user.xp += task.completionXp;
      
      // Check if user leveled up
      if (user.xp >= user.xpToNextLevel) {
        user.level += 1;
        user.xpToNextLevel = Math.round(user.xpToNextLevel * 1.5);
      }
      
      await user.save();
    }
    
    res.json({
      task,
      user: wasCompleted ? {
        level: user.level,
        xp: user.xp,
        xpToNextLevel: user.xpToNextLevel
      } : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    
    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user owns the task
    if (task.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await task.destroy();
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
