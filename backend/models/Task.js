const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Incomplete', 'Completed'],
    default: 'Incomplete'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project', 
    required: true
  }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
