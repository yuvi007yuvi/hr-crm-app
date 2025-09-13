import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Link,
  Alert,
  Grid
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FormField, LoadingSpinner } from '../common/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES, USER_ROLES, DEPARTMENTS } from '../../constants/index.js';
import Footer from '../layout/Footer.jsx';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    role: USER_ROLES.EMPLOYEE
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
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
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
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.department) {
      errors.department = 'Department is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const userData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      department: formData.department,
      role: formData.role
    };

    const result = await register(formData.email, formData.password, userData);
    
    if (result.success) {
      navigate(ROUTES.DASHBOARD);
    }
  };

  const departmentOptions = DEPARTMENTS.map(dept => ({
    value: dept,
    label: dept
  }));

  const roleOptions = [
    { value: USER_ROLES.EMPLOYEE, label: 'Employee' },
    { value: USER_ROLES.MANAGER, label: 'Manager' }
  ];

  return (
    <Box className="min-h-screen flex flex-col bg-gray-50">
      <Container component="main" maxWidth="md" className="flex-1 flex items-center justify-center py-12">
        <Paper 
          elevation={3} 
          className="w-full p-8 rounded-lg"
          sx={{ 
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            borderRadius: 3
          }}
        >
        <Box className="text-center mb-8">
          <Box className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <PersonAddIcon className="text-green-600" fontSize="large" />
          </Box>
          <Typography component="h1" variant="h4" className="font-bold text-gray-800 mb-2">
            Create Account
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Join the HR CRM platform
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
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField
                type="text"
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                error={formErrors.firstName}
                required
                autoComplete="given-name"
                autoFocus
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField
                type="text"
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                error={formErrors.lastName}
                required
                autoComplete="family-name"
              />
            </Grid>
          </Grid>

          <FormField
            type="email"
            name="email"
            label="Email Address"
            value={formData.email}
            onChange={handleInputChange}
            error={formErrors.email}
            required
            autoComplete="email"
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField
                type="password"
                name="password"
                label="Password"
                value={formData.password}
                onChange={handleInputChange}
                error={formErrors.password}
                required
                autoComplete="new-password"
                helperText="Must be at least 6 characters"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField
                type="password"
                name="confirmPassword"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={formErrors.confirmPassword}
                required
                autoComplete="new-password"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField
                type="select"
                name="department"
                label="Department"
                value={formData.department}
                onChange={handleInputChange}
                error={formErrors.department}
                options={departmentOptions}
                required
                placeholder="Select your department"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField
                type="select"
                name="role"
                label="Role"
                value={formData.role}
                onChange={handleInputChange}
                error={formErrors.role}
                options={roleOptions}
                required
              />
            </Grid>
          </Grid>

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
            {loading ? <LoadingSpinner size={24} message="" /> : 'Create Account'}
          </Button>

          <Box className="text-center mt-6">
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link 
                component={RouterLink} 
                to={ROUTES.LOGIN}
                className="font-medium text-blue-600 hover:text-blue-500 no-underline"
              >
                Sign in here
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

export default Register;