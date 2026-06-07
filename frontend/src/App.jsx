import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketAlertProvider } from './context/SocketAlertContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import JobListings from './pages/JobListings';
import JobDetail from './pages/JobDetail';
import EmployerDashboard from './pages/EmployerDashboard';
import SeekerDashboard from './pages/SeekerDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import TalentDirectory from './pages/TalentDirectory';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SocketAlertProvider>
            <div className="flex flex-col min-h-screen bg-transparent relative z-10">
              <Navbar />
              <main className="flex-grow flex flex-col">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/jobs" element={<JobListings />} />
                  <Route path="/jobs/:id" element={<JobDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Seeker Dashboard */}
                  <Route
                    path="/seeker-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['seeker']}>
                        <SeekerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Employer Dashboard */}
                  <Route
                    path="/employer-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['employer']}>
                        <EmployerDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Talent Directory */}
                  <Route
                    path="/talent"
                    element={
                      <ProtectedRoute allowedRoles={['employer']}>
                        <TalentDirectory />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Fallback route */}
                  <Route path="*" element={<Home />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </SocketAlertProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
