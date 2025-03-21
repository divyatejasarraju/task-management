import Task from '../models/taskModel.js';
import isHoliday from '../utils/isHoliday.js';

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  const { title, description, priority, dueDate } = req.body;

  try {
    // Check if dueDate is a holiday
    const holiday = await isHoliday(dueDate);
    if (holiday) {
      return res.status(400).json({ message: 'Cannot create tasks on public holidays' });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      user: req.user._id
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tasks for a user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { priority, startDate, endDate, completed } = req.query;
    
    // Build filter object
    const filter = { user: req.user._id };
    
    if (priority) {
      filter.priority = priority;
    }
    
    if (startDate && endDate) {
      filter.dueDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      filter.dueDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      filter.dueDate = { $lte: new Date(endDate) };
    }
    
    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }

    const tasks = await Task.find(filter).sort({ dueDate: 1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    // Make sure task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Make sure the logged in user is the task owner
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    // Make sure task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Make sure the logged in user is the task owner
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Track changes for undo feature
    const changes = [];
    
    // Check each field that is being updated
    const { title, description, priority, dueDate, completed } = req.body;
    
    if (title !== undefined && title !== task.title) {
      changes.push({ field: 'title', oldValue: task.title, newValue: title });
      task.title = title;
    }
    
    if (description !== undefined && description !== task.description) {
      changes.push({ field: 'description', oldValue: task.description, newValue: description });
      task.description = description;
    }
    
    if (priority !== undefined && priority !== task.priority) {
      changes.push({ field: 'priority', oldValue: task.priority, newValue: priority });
      task.priority = priority;
    }
    
    if (dueDate !== undefined) {
      const newDueDate = new Date(dueDate);
      if (newDueDate.getTime() !== new Date(task.dueDate).getTime()) {
        // Check if new dueDate is a holiday
        const holiday = await isHoliday(dueDate);
        if (holiday) {
          return res.status(400).json({ message: 'Cannot set due date to a public holiday' });
        }
        changes.push({ field: 'dueDate', oldValue: task.dueDate, newValue: newDueDate });
        task.dueDate = newDueDate;
      }
    }
    
    if (completed !== undefined && completed !== task.completed) {
      changes.push({ field: 'completed', oldValue: task.completed, newValue: completed });
      task.completed = completed;
    }
    
    // Save changes to the changes array for undo functionality
    if (changes.length > 0) {
      task.changes.push(...changes);
      await task.save();
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin/Validator
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    // Make sure task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user is admin/validator or task owner
    if (req.user.role !== 'admin' && req.user.role !== 'validator' && 
        task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this task' });
    }
    
    await task.deleteOne();
    
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Undo last change to a task
// @route   POST /api/tasks/:id/undo
// @access  Private
const undoTaskChange = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    // Make sure task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Make sure the logged in user is the task owner
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Get the last change
    if (task.changes.length === 0) {
      return res.status(400).json({ message: 'No changes to undo' });
    }
    
    const lastChange = task.changes.pop();
    
    // Revert the change
    task[lastChange.field] = lastChange.oldValue;
    
    await task.save();
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all task changes history
// @route   GET /api/tasks/:id/history
// @access  Private
const getTaskHistory = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    // Make sure task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Make sure the logged in user is the task owner
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    res.json(task.changes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { 
  createTask, 
  getTasks, 
  getTaskById, 
  updateTask, 
  deleteTask, 
  undoTaskChange, 
  getTaskHistory 
};
