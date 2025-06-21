const Task = require('../models/taskModel');
const User = require('../models/userModel');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority } = req.body;
    
    // Create new task
    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      user: req.user._id
    });
    
    // Award XP to user for creating a task
    const user = await User.findById(req.user._id);
    user.gainXp(task.xpReward);
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
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
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
    const task = await Task.findById(req.params.id);
    
    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user owns the task
    if (task.user.toString() !== req.user._id.toString()) {
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
    const { title, description, status, dueDate, priority } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user owns the task
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Check if task is being marked as done
    const wasCompleted = task.status !== 'done' && status === 'done';
    
    // Update task fields
    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.dueDate = dueDate || task.dueDate;
    task.priority = priority || task.priority;
    
    // If task is being marked as done, set completedAt
    if (wasCompleted) {
      task.completedAt = Date.now();
    }
    
    const updatedTask = await task.save();
    
    // If task was marked as done, award XP
    let user = null;
    if (wasCompleted) {
      user = await User.findById(req.user._id);
      user.gainXp(task.completionXp);
      await user.save();
    }
    
    res.json({
      task: updatedTask,
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
    const task = await Task.findById(req.params.id);
    
    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user owns the task
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
