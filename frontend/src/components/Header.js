import React from 'react';
import { Link } from 'react-router-dom';
import '../css/header.css';

export default function Header() {
  return (
    <header className="app-header">
      <Link to="/dashboard" className="app-title">Task Tracker</Link>
    </header>
  );
}
