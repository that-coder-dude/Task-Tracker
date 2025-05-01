import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import { isLoggedIn } from './utils/auth';

const Protected = ({ children }) =>
  isLoggedIn() ? children : <Navigate to="/login" />;

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Header />
        <main className="app-content">
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/projects/:projectId" element={<Protected><ProjectDetails /></Protected>} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
