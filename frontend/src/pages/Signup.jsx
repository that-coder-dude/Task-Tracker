import React, { useState } from "react";
import api from "../api";
import { saveToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import "../css/signup.css"; // 🔥 Import the CSS

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    country: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/signup", form);
      saveToken(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit} className="signup-box">
        <h2>Sign Up</h2>
        {["name", "email", "password", "country"].map((field) => (
          <div key={field}>
            <label>{field}</label>
            <input
              type={field === "password" ? "password" : "text"}
              name={field}
              value={form[field]}
              onChange={handleChange}
              required
            />
          </div>
        ))}
        <button type="submit">Sign Up</button>
        <p className="login-text">
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
}
