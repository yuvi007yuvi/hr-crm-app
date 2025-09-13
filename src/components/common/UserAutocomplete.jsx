import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Avatar,
  Box,
  Typography,
  Chip
} from '@mui/material';
import { useEmployee } from '../../context/EmployeeContext.jsx';
import { USER_ROLES } from '../../constants/index.js';

const UserAutocomplete = ({ 
  value, 
  onChange, 
  label = "Select User", 
  required = false,
  disabled = false,
  excludeRoles = [],
  includeRoles = [],
  placeholder = "Search and select user...",
  ...props 
}) => {
  const { employees } = useEmployee();
  const [options, setOptions] = useState([]);

  useEffect(() => {
    // Filter employees based on role requirements
    let filteredEmployees = employees.filter(emp => emp.isActive);

    // Exclude specific roles if specified
    if (excludeRoles.length > 0) {
      filteredEmployees = filteredEmployees.filter(emp => !excludeRoles.includes(emp.role));
    }

    // Include only specific roles if specified
    if (includeRoles.length > 0) {
      filteredEmployees = filteredEmployees.filter(emp => includeRoles.includes(emp.role));
    }

    // Transform to options format
    const userOptions = filteredEmployees.map(emp => ({
      id: emp.id,
      uid: emp.uid,
      label: `${emp.firstName} ${emp.lastName}`,
      email: emp.email,
      department: emp.department,
      designation: emp.designation,
      role: emp.role,
      firstName: emp.firstName,
      lastName: emp.lastName
    }));

    setOptions(userOptions);
  }, [employees, excludeRoles, includeRoles]);

  const handleChange = (event, newValue) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  const getSelectedOption = () => {
    if (!value) return null;
    
    // If value is a string (employee ID), find the matching option
    if (typeof value === 'string') {
      return options.find(option => option.id === value || option.uid === value) || null;
    }
    
    // If value is already an object, return it
    return value;
  };

  return (
    <Autocomplete
      options={options}
      value={getSelectedOption()}
      onChange={handleChange}
      getOptionLabel={(option) => option?.label || ''}
      isOptionEqualToValue={(option, value) => {
        if (!option || !value) return false;
        return option.id === value.id || option.uid === value.uid;
      }}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          placeholder={placeholder}
          variant="outlined"
          fullWidth
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props} className="flex items-center space-x-3 p-2">
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            {option.firstName?.[0]}{option.lastName?.[0]}
          </Avatar>
          <Box className="flex-1">
            <Typography variant="body2" className="font-medium">
              {option.label}
            </Typography>
            <Box className="flex items-center space-x-2 mt-1">
              <Typography variant="caption" color="text.secondary">
                {option.email}
              </Typography>
              <Chip
                label={option.role}
                size="small"
                variant="outlined"
                sx={{ height: 16, fontSize: '0.65rem' }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {option.designation} • {option.department}
            </Typography>
          </Box>
        </Box>
      )}
      noOptionsText="No users found"
      {...props}
    />
  );
};

export default UserAutocomplete;