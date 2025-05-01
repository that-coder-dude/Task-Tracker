const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Project = require('../models/Project');

const router = express.Router();


router.get('/', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user._id });
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/', authMiddleware, async (req, res) => {
  const { name, description } = req.body;
  try {

    const count = await Project.countDocuments({ user: req.user._id });
    if (count >= 4) {
      return res
        .status(400)
        .json({ message: 'Project limit reached (max 4 projects)' });
    }

    const project = new Project({
      name,
      description,
      user: req.user._id
    });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
