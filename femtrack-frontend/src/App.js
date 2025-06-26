// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthPage from './pages/Auth';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Changed the path for AuthPage from "/auth" to "/login" */}
          <Route path="/login" element={<AuthPage />} />

          {/* Redirect root ("/") to "/login" instead of "/auth" */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected routes */}
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />

          {/* Add more routes as needed */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;