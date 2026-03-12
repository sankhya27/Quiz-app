import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import AdminCreateQuiz from './pages/AdminCreateQuiz';
import AdminEditQuiz from './pages/AdminEditQuiz';
import AdminQuizStats from './pages/AdminQuizStats';
import UserDashboard from './pages/UserDashboard';
import UserResults from './pages/UserResults';
import AdminStats from './pages/AdminStats';
import AdminAnnouncements from './pages/AdminAnnouncements';
import ProtectedRoute from './components/ProtectedRoute';
import NavigationGuard from './components/NavigationGuard';
import Profile from './pages/Profile';

import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';

function App() {
  return (
    <Router>
      <NavigationGuard>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin-create-quiz"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminCreateQuiz />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-edit-quiz/:quizId"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminEditQuiz />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin-quiz-stats/:quizId"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminQuizStats />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin-stats"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminStats />
            </ProtectedRoute>
          }
        />
        
        {/* User Routes */}
        <Route
          path="/admin-announcements"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminAnnouncements />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute requiredRole="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/user-results"
          element={
            <ProtectedRoute requiredRole="user">
              <UserResults />
            </ProtectedRoute>
          }
        />
      </Routes>
      </NavigationGuard>
    </Router>
  );
}

export default App;