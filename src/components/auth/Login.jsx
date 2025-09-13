import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Link,
  Alert
} from '@mui/material';
import {
  Login as LoginIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FormField, LoadingSpinner } from '../common/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../constants/index.js';
import Footer from '../layout/Footer.jsx';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate(ROUTES.DASHBOARD);
    }
  };

  return (
    <Box className="min-h-screen flex flex-col bg-gray-50">
      <Container component="main" maxWidth="sm" className="flex-1 flex items-center justify-center py-12">
        <Paper 
          elevation={3} 
          className="w-full p-8 rounded-lg"
          sx={{ 
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            borderRadius: 3
          }}
        >
          <Box className="text-center mb-8">
            <Box className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <LoginIcon className="text-blue-600" fontSize="large" />
            </Box>
            <Typography component="h1" variant="h4" className="font-bold text-gray-800 mb-2">
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to your HRNova account
            </Typography>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              className="mb-4"
              onClose={clearError}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} className="space-y-4">
            <FormField
              type="email"
              name="email"
              label="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              error={formErrors.email}
              required
              autoComplete="email"
              autoFocus
            />

            <FormField
              type="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleInputChange}
              error={formErrors.password}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              className="py-3 mt-6"
              sx={{ 
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2
              }}
            >
              {loading ? <LoadingSpinner size={24} message="" /> : 'Sign In'}
            </Button>

            <Box className="text-center mt-6">
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link 
                  component={RouterLink} 
                  to={ROUTES.REGISTER}
                  className="font-medium text-blue-600 hover:text-blue-500 no-underline"
                >
                  Sign up here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
      
      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default Login;