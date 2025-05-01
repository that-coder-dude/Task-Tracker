import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import "../css/dashboard.css"; // Import the CSS file

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/projects", form);
      setProjects((prev) => [...prev, res.data]);
      setForm({ name: "", description: "" });
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Error creating project");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove JWT token from localStorage
    navigate("/login"); // Redirect to the login page
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Your Projects</h2>
        <button
          onClick={handleLogout}
          className="logout-btn"
        >
          Logout
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        {error && <p className="error-text">{error}</p>}
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Project Name"
          required
          className="input-field"
        />
        <input
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          required
          className="input-field"
        />
        <button type="submit" className="submit-btn">
          Add Project
        </button>
      </form>

      <ul className="projects-list">
        {projects.map((p) => (
          <li key={p._id} className="project-item">
            <Link to={`/projects/${p._id}`} className="project-link">
              {p.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
