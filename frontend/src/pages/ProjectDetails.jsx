import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import '../css/projectDetails.css';

export default function ProjectDetails() {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState('');
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });
  const [error, setError] = useState('');
  const [editTask, setEditTask] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projRes = await api.get('/projects');
        const proj = projRes.data.find(p => p._id === projectId);
        setProjectName(proj ? proj.name : '');

        const taskRes = await api.get(`/tasks?project=${projectId}`);
        setTasks(taskRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [projectId]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/tasks', { ...form, project: projectId });
      setTasks(prev => [...prev, res.data]);
      setForm({ title: '', description: '' });
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to create task');
    }
  };

  const toggleStatus = async taskId => {
    try {
      const res = await api.patch(`/tasks/${taskId}/toggle-status`);
      const updated = res.data;
      setTasks(prev => prev.map(t => (t._id === updated._id ? updated : t)));
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const deleteTask = async taskId => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const startEditing = task => {
    setEditTask({ ...task });
  };

  const handleEditChange = e => {
    setEditTask({ ...editTask, [e.target.name]: e.target.value });
  };

  const updateTask = async () => {
    try {
      const { _id, title, description, status } = editTask;
      const res = await api.put(`/tasks/${_id}`, { title, description, status });
      const updated = res.data;
      setTasks(prev => prev.map(t => (t._id === updated._id ? updated : t)));
      setEditTask(null);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  return (
    <div className="project-details-container">
      <div className="project-details-header">
        <h2>Project: {projectName}</h2>
        <Link to="/dashboard" className="back-link">← Back to Projects</Link>
      </div>

      <h3>Tasks for "{projectName}"</h3>

      <ul className="tasks-list">
        {tasks.map(task => (
          <li key={task._id} className="task-item">
            {!editTask || editTask._id !== task._id ? (
              <>
                <strong>{task.title}</strong>
                <p>{task.description}</p>
                <p>Status: {task.status}</p>
                <p>Created: {new Date(task.createdAt).toLocaleString()}</p>
                {task.completedAt && <p>Completed: {new Date(task.completedAt).toLocaleString()}</p>}
                <button onClick={() => toggleStatus(task._id)}>
                  {task.status === 'Completed' ? 'Mark as Incomplete' : 'Mark as Completed'}
                </button>
                <button onClick={() => startEditing(task)}>
                  Edit
                </button>
                <button onClick={() => deleteTask(task._id)}>
                  Delete
                </button>
              </>
            ) : (
              <div className="edit-task-box">
                <h4>Editing Task</h4>
                <input
                  name="title"
                  value={editTask.title}
                  onChange={handleEditChange}
                  placeholder="Title"
                />
                <textarea
                  name="description"
                  value={editTask.description}
                  onChange={handleEditChange}
                  placeholder="Description"
                />
                <select name="status" value={editTask.status} onChange={handleEditChange}>
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <button onClick={updateTask}>Save</button>
                <button onClick={() => setEditTask(null)}>Cancel</button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="create-task-form">
        <h3>Create New Task</h3>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="description">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Create Task</button>
        </form>
      </div>
    </div>
  );
}
