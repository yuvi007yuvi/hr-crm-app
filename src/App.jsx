import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Context Providers
import { 
  AuthProvider, 
  EmployeeProvider, 
  LeaveProvider, 
  AttendanceProvider,
  NotificationProvider 
} from './context/index.js';

// Components
import { Login, Register, ProtectedRoute } from './components/auth/index.js';
import { Layout } from './components/layout/index.js';

// Pages
import Dashboard from './pages/Dashboard.jsx';
import EmployeeDirectory from './pages/EmployeeDirectory.jsx'; 
import MyTeam from './pages/MyTeam.jsx';
import LeaveRequests from './pages/LeaveRequests.jsx';
import Attendance from './pages/Attendance.jsx';
import Analytics from './pages/Analytics.jsx';
import Settings from './pages/Settings.jsx';
import Profile from './pages/Profile.jsx';

// Constants
import { ROUTES, USER_ROLES } from './constants/index.js';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'Fira Sans',
      'Droid Sans',
      'Helvetica Neue',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 12,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
        },
      },
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <NotificationProvider>
            <EmployeeProvider>
              <LeaveProvider>
                <AttendanceProvider>
                <Router>
                  <Routes>
                    {/* Public Routes */}
                    <Route path={ROUTES.LOGIN} element={<Login />} />
                    <Route path={ROUTES.REGISTER} element={<Register />} />
                    
                    {/* Protected Routes */}
                    <Route 
                      path={ROUTES.DASHBOARD} 
                      element={
                        <ProtectedRoute>
                          <Layout title="HRNova Dashboard">
                            <Dashboard />
                          </Layout>
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path={ROUTES.EMPLOYEES} 
                      element={
                        <ProtectedRoute requiredRole={USER_ROLES.MANAGER}>
                          <Layout title="HRNova - Employee Directory">
                            <EmployeeDirectory />
                          </Layout>
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* My Team Route */}
                    <Route 
                      path={ROUTES.MY_TEAM} 
                      element={
                        <ProtectedRoute requiredRole={USER_ROLES.MANAGER}>
                          <Layout title="HRNova - My Team">
                            <MyTeam />
                          </Layout>
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Add Employee Route */}
                    <Route 
                      path={`${ROUTES.EMPLOYEES}/add`} 
                      element={
                        <ProtectedRoute requiredRole={USER_ROLES.MANAGER}>
                          <Layout title="HRNova - Add Employee">
                            <EmployeeDirectory />
                          </Layout>
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path={ROUTES.LEAVE_REQUESTS} 
                      element={
                        <ProtectedRoute>
                          <Layout title="HRNova - Leave Management">
                            <LeaveRequests />
                          </Layout>
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Apply Leave Route */}
                    <Route 
                      path={`${ROUTES.LEAVE_REQUESTS}/apply`} 
                      element={
                        <ProtectedRoute>
                          <Layout title="HRNova - Apply Leave">
                            <LeaveRequests />
                          </Layout>
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path={ROUTES.ATTENDANCE} 
                      element={
                        <ProtectedRoute>
                          <Layout title="HRNova - Attendance">
                            <Attendance />
                          </Layout>
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Mark Attendance Route */}
                    <Route 
                      path={`${ROUTES.ATTENDANCE}/mark`} 
                      element={
                        <ProtectedRoute>
                          <Layout title="HRNova - Mark Attendance">
                            <Attendance />
                          </Layout>
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path={ROUTES.ANALYTICS} 
                      element={
                        <ProtectedRoute requiredRole={USER_ROLES.MANAGER}>
                          <Layout title="HRNova - Analytics & Reports">
                            <Analytics />
                          </Layout>
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Settings Route */}
                    <Route 
                      path="/settings" 
                      element={
                        <ProtectedRoute requiredRole={USER_ROLES.MANAGER}>
                          <Layout title="HRNova - Settings">
                            <Settings />
                          </Layout>
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Profile Route */}
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <Layout title="HRNova - My Profile">
                            <Profile />
                          </Layout>
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Default redirect */}
                    <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                    
                    {/* 404 - Not found */}
                    <Route 
                      path="*" 
                      element={
                        <Layout title="HRNova - Page Not Found">
                          <div className="text-center py-16">
                            <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                            <p className="text-gray-600 mb-8">Page not found</p>
                            <button 
                              onClick={() => window.history.back()}
                              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                            >
                              Go Back
                            </button>
                          </div>
                        </Layout>
                      } 
                    />
                  </Routes>
                </Router>
                </AttendanceProvider>
              </LeaveProvider>
            </EmployeeProvider>
          </NotificationProvider>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;