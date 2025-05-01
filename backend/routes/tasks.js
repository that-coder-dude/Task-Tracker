const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Task = require('../models/Task');
const Project = require('../models/Project');

const router = express.Router();

// GET /api/tasks?project=<projectId> — tasks for a specific project
router.get('/', authMiddleware, async (req, res) => {
  const { project } = req.query;
  if (!project) return res.status(400).json({ message: 'Project ID required' });

  try {
    // Verify project belongs to user
    const projectDoc = await Project.findOne({ _id: project, user: req.user._id });
    if (!projectDoc) return res.status(404).json({ message: 'Project not found' });

    const tasks = await Task.find({ project });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/tasks — create a new task
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, status, project } = req.body;
  try {
    // Verify project belongs to user
    const projectDoc = await Project.findOne({ _id: project, user: req.user._id });
    if (!projectDoc) return res.status(404).json({ message: 'Project not found' });

    const task = new Task({ title, description, status, project });
    await task.save();
    // Optionally add task to project.tasks array:
    projectDoc.tasks.push(task._id);
    await projectDoc.save();

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/tasks/:id — update a task
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    // Find task and ensure it belongs to a project of this user
    const task = await Task.findById(id).populate('project');
    if (!task || String(task.project.user) !== String(req.user._id))
      return res.status(404).json({ message: 'Task not found' });

    Object.assign(task, updates);
    // If status moved to Completed, set completedAt
    if (updates.status === 'Completed' && !task.completedAt) {
      task.completedAt = Date.now();
    }
    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/tasks/:id/toggle-status — toggle task status
router.patch('/:id/toggle-status', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findById(id).populate('project');
    if (!task || String(task.project.user) !== String(req.user._id)) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Toggle logic
    if (task.status === 'Completed') {
      task.status = 'Incomplete';
      task.completedAt = null;
    } else {
      task.status = 'Completed';
      task.completedAt = Date.now();
    }

    await task.save();
    res.json(task);
  } catch (err) {
    console.error('Toggle status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/tasks/:id — delete a task
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findById(id).populate('project');
    if (!task || String(task.project.user) !== String(req.user._id)) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Remove task ID from the project's tasks array
    const project = task.project;
    project.tasks = project.tasks.filter(taskId => taskId.toString() !== id);
    await project.save();

    await task.deleteOne(); // safer than remove() in Mongoose v7+
    res.json({ message: 'Task deleted and removed from project' });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;