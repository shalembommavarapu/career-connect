import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute, RoleBasedRoute } from './components/ProtectedRoute';

import { HomePage } from './pages/HomePage';
import { JobsPage } from './pages/JobsPage';
import { JobDetailsPage } from './pages/JobDetailsPage';
import { InternshipsPage } from './pages/InternshipsPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfile } from './pages/student/StudentProfile';
import { StudentApplications } from './pages/student/StudentApplications';
import { SavedJobsPage } from './pages/student/SavedJobsPage';

// Recruiter Pages
import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard';
import { PostJobPage } from './pages/recruiter/PostJobPage';
import { ManageJobsPage } from './pages/recruiter/ManageJobsPage';
import { ApplicantManagementPage } from './pages/recruiter/ApplicantManagementPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { JobModerationPage } from './pages/admin/JobModerationPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-200">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public Discovery Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/jobs" element={<JobsPage />} />
                  <Route path="/jobs/:id" element={<JobDetailsPage />} />
                  <Route path="/internships" element={<InternshipsPage />} />
                  <Route path="/companies" element={<CompaniesPage />} />
                  <Route path="/about" element={<AboutPage />} />

                  {/* Authentication */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Notifications */}
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <NotificationsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Student Portal */}
                  <Route
                    path="/student/dashboard"
                    element={
                      <RoleBasedRoute allowedRoles={['student']}>
                        <StudentDashboard />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/student/profile"
                    element={
                      <RoleBasedRoute allowedRoles={['student']}>
                        <StudentProfile />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/student/applications"
                    element={
                      <RoleBasedRoute allowedRoles={['student']}>
                        <StudentApplications />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/student/saved-jobs"
                    element={
                      <RoleBasedRoute allowedRoles={['student']}>
                        <SavedJobsPage />
                      </RoleBasedRoute>
                    }
                  />

                  {/* Recruiter Portal */}
                  <Route
                    path="/recruiter"
                    element={
                      <RoleBasedRoute allowedRoles={['recruiter', 'admin']}>
                        <RecruiterDashboard />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/recruiter/post-job"
                    element={
                      <RoleBasedRoute allowedRoles={['recruiter', 'admin']}>
                        <PostJobPage />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/recruiter/manage-jobs"
                    element={
                      <RoleBasedRoute allowedRoles={['recruiter', 'admin']}>
                        <ManageJobsPage />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/recruiter/applicants"
                    element={
                      <RoleBasedRoute allowedRoles={['recruiter', 'admin']}>
                        <ApplicantManagementPage />
                      </RoleBasedRoute>
                    }
                  />

                  {/* Admin Portal */}
                  <Route
                    path="/admin"
                    element={
                      <RoleBasedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <RoleBasedRoute allowedRoles={['admin']}>
                        <UserManagementPage />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/admin/jobs"
                    element={
                      <RoleBasedRoute allowedRoles={['admin']}>
                        <JobModerationPage />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="/admin/audit-logs"
                    element={
                      <RoleBasedRoute allowedRoles={['admin']}>
                        <AdminAuditLogsPage />
                      </RoleBasedRoute>
                    }
                  />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
