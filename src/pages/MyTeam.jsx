import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  TextField,
  InputAdornment,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  People as PeopleIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { Table, LoadingSpinner } from '../components/common/index.js';
import { useEmployee } from '../context/EmployeeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { USER_ROLES, DEPARTMENTS, MODULES, DEFAULT_MODULE_ACCESS } from '../constants/index.js';

const MyTeam = () => {
  const { employees, loading, error, fetchEmployees } = useEmployee();
  const { userData, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Filter team members (employees who report to current manager)
  const getTeamMembers = () => {
    if (!hasPermission(USER_ROLES.MANAGER)) {
      return [];
    }

    return employees.filter(emp => 
      emp.reportingHeadId === userData?.uid || 
      emp.reportingHeadId === userData?.id
    );
  };

  // Apply search and department filters
  const getFilteredTeamMembers = () => {
    let teamMembers = getTeamMembers();

    // Apply search filter
    if (searchTerm) {
      teamMembers = teamMembers.filter(emp =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.designation && emp.designation.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply department filter
    if (departmentFilter) {
      teamMembers = teamMembers.filter(emp => emp.department === departmentFilter);
    }

    return teamMembers;
  };

  // Get team statistics
  const getTeamStats = () => {
    const teamMembers = getTeamMembers();
    const activeMembers = teamMembers.filter(emp => emp.isActive);
    
    const byDepartment = {};
    const byRole = {};
    
    teamMembers.forEach(emp => {
      byDepartment[emp.department] = (byDepartment[emp.department] || 0) + 1;
      byRole[emp.role] = (byRole[emp.role] || 0) + 1;
    });

    return {
      total: teamMembers.length,
      active: activeMembers.length,
      byDepartment,
      byRole
    };
  };

  const handleMenuClick = (event, employee) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(employee);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEmployee(null);
  };

  const handleViewProfile = () => {
    // TODO: Navigate to employee profile page
    console.log('View profile:', selectedEmployee);
    handleMenuClose();
  };

  const handleEditEmployee = () => {
    // TODO: Navigate to edit employee page
    console.log('Edit employee:', selectedEmployee);
    handleMenuClose();
  };

  const getModuleLabel = (moduleId) => {
    const moduleLabels = {
      [MODULES.DASHBOARD]: 'Dashboard',
      [MODULES.EMPLOYEE_MANAGEMENT]: 'Employee Management',
      [MODULES.LEAVE_MANAGEMENT]: 'Leave Management',
      [MODULES.ATTENDANCE]: 'Attendance',
      [MODULES.ANALYTICS]: 'Analytics & Reports',
      [MODULES.SETTINGS]: 'Settings'
    };
    return moduleLabels[moduleId] || moduleId;
  };

  const teamStats = getTeamStats();
  const filteredTeamMembers = getFilteredTeamMembers();

  if (loading && employees.length === 0) {
    return <LoadingSpinner message="Loading your team..." />;
  }

  if (!hasPermission(USER_ROLES.MANAGER)) {
    return (
      <Box className="flex items-center justify-center min-h-96">
        <Alert severity="warning" className="max-w-md">
          <Typography variant="h6">Access Denied</Typography>
          <Typography>Only managers can access the team management page.</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="space-y-4">
      {/* Header */}
      <Box>
        <Typography variant="h4" className="font-bold text-gray-800 mb-2">
          My Team
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and view your team members ({teamStats.total} employees)
        </Typography>
      </Box>

      {error && (
        <Alert severity="error">
          {error}
        </Alert>
      )}

      {/* Team Statistics */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent className="text-center">
              <PeopleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" className="font-bold text-blue-600">
                {teamStats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Team Members
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent className="text-center">
              <PersonIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" className="font-bold text-green-600">
                {teamStats.active}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Members
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent className="text-center">
              <BusinessIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" className="font-bold text-orange-600">
                {Object.keys(teamStats.byDepartment).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Departments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent className="text-center">
              <AssignmentIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" className="font-bold text-blue-700">
                {teamStats.byRole[USER_ROLES.EMPLOYEE] || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Employees
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Card>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Filter by Department"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchTerm('');
                  setDepartmentFilter('');
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Team Members List */}
      <Card>
        <CardContent>
          <Typography variant="h6" className="font-semibold mb-4">
            Team Members ({filteredTeamMembers.length})
          </Typography>
          
          {filteredTeamMembers.length === 0 ? (
            <Box className="text-center py-8">
              <PeopleIcon className="text-gray-400 mb-2" fontSize="large" />
              <Typography variant="body2" color="text.secondary">
                {getTeamMembers().length === 0 
                  ? "No team members found. Employees need to be assigned to you as their reporting head."
                  : "No team members match your search criteria."
                }
              </Typography>
            </Box>
          ) : (
            <List>
              {filteredTeamMembers.map((employee, index) => (
                <React.Fragment key={employee.id}>
                  <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: employee.isActive ? 'primary.main' : 'grey.400',
                          width: 48,
                          height: 48
                        }}
                      >
                        {employee.firstName?.[0]}{employee.lastName?.[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box className="flex items-center space-x-2 mb-1">
                          <Typography variant="body1" className="font-medium">
                            {employee.firstName} {employee.lastName}
                          </Typography>
                          <Chip
                            label={employee.role}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          {!employee.isActive && (
                            <Chip
                              label="Inactive"
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box className="space-y-2">
                          <Box className="flex items-center space-x-4 text-sm text-gray-600">
                            <Box className="flex items-center space-x-1">
                              <EmailIcon fontSize="small" />
                              <Typography variant="body2">{employee.email}</Typography>
                            </Box>
                            {employee.phoneNumber && (
                              <Box className="flex items-center space-x-1">
                                <PhoneIcon fontSize="small" />
                                <Typography variant="body2">{employee.phoneNumber}</Typography>
                              </Box>
                            )}
                          </Box>
                          <Box className="flex items-center space-x-4 text-sm text-gray-600">
                            <Typography variant="body2">
                              <strong>Department:</strong> {employee.department}
                            </Typography>
                            {employee.designation && (
                              <Typography variant="body2">
                                <strong>Designation:</strong> {employee.designation}
                              </Typography>
                            )}
                          </Box>
                          {employee.assignedModules && employee.assignedModules.length > 0 && (
                            <Box>
                              <Typography variant="caption" color="text.secondary" className="block mb-1">
                                Assigned Modules:
                              </Typography>
                              <Box className="flex flex-wrap gap-1">
                                {employee.assignedModules.map(moduleId => (
                                  <Chip
                                    key={moduleId}
                                    label={getModuleLabel(moduleId)}
                                    size="small"
                                    variant="outlined"
                                    color="info"
                                    sx={{ fontSize: '0.7rem', height: '20px' }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={(e) => handleMenuClick(e, employee)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < filteredTeamMembers.length - 1 && <Divider variant="inset" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewProfile}>
          <ViewIcon sx={{ mr: 1 }} />
          View Profile
        </MenuItem>
        <MenuItem onClick={handleEditEmployee}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Employee
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default MyTeam;