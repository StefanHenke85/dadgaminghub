import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
import AdminDashboard from './components/AdminDashboard'
import ProfileEdit from './components/ProfileEdit'
import UserProfile from './components/UserProfile'
import Sessions from './components/Sessions'
import SessionCalendar from './components/SessionCalendar'
import Chat from './components/Chat'
import Friends from './components/Friends'
import Statistics from './components/Statistics'
import Privacy from './components/Privacy'
import Imprint from './components/Imprint'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Navigation />
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Profile routes */}
            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute>
                  <Navigation />
                  <ProfileEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:userId"
              element={
                <ProtectedRoute>
                  <Navigation />
                  <UserProfile />
                </ProtectedRoute>
              }
            />

            {/* Sessions routes */}
            <Route
              path="/sessions"
              element={
                <ProtectedRoute>
                  <Navigation />
                  <Sessions />
                </ProtectedRoute>
              }
            />

            {/* Session Calendar */}
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <Navigation />
                  <SessionCalendar />
                </ProtectedRoute>
              }
            />

            {/* Chat routes */}
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Navigation />
                  <Chat />
                </ProtectedRoute>
              }
            />

            {/* Friends routes */}
            <Route
              path="/friends"
              element={
                <ProtectedRoute>
                  <Navigation />
                  <Friends />
                </ProtectedRoute>
              }
            />

            {/* Statistics routes */}
            <Route
              path="/statistics"
              element={
                <ProtectedRoute>
                  <Navigation />
                  <Statistics />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Navigation />
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Legal pages - Public */}
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/imprint" element={<Imprint />} />

            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)