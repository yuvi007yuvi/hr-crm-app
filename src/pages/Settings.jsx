import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
  FormGroup,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Edit as EditIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as ManagerIcon,
  Apps as ModulesIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { FormField, LoadingSpinner, Modal } from '../components/common/index.js';
import { useEmployee } from '../context/EmployeeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { USER_ROLES, MODULES, DEFAULT_MODULE_ACCESS, PAGES, DEFAULT_PAGE_ACCESS } from '../constants/index.js';
import { migrateDesignations } from '../utils/migrateDesignations.js';

const Settings = () => {
  const { employees, loading, error, fetchEmployees, updateEmployee } = useEmployee();
  const { userData, hasPermission } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [pageModalOpen, setPageModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [selectedModules, setSelectedModules] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [migrationLoading, setMigrationLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleRoleChange = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setRoleModalOpen(true);
  };

  const handleModuleAssignment = (user) => {
    setSelectedUser(user);
    setSelectedModules(user.assignedModules || DEFAULT_MODULE_ACCESS[user.role] || []);
    setModuleModalOpen(true);
  };

  const handlePageAssignment = (user) => {
    setSelectedUser(user);
    setSelectedPages(user.assignedPages || DEFAULT_PAGE_ACCESS[user.role] || []);
    setPageModalOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;

    setUpdateLoading(true);
    try {
      const result = await updateEmployee(selectedUser.id, {
        ...selectedUser,
        role: newRole,
        updatedAt: new Date().toISOString(),
        updatedBy: userData?.uid
      });

      if (result.success) {
        setSuccessMessage(`Successfully updated ${selectedUser.firstName}'s role to ${newRole}`);
        setRoleModalOpen(false);
        setSelectedUser(null);
        fetchEmployees(); // Refresh the list
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdateModules = async () => {
    if (!selectedUser) return;

    setUpdateLoading(true);
    try {
      const result = await updateEmployee(selectedUser.id, {
        ...selectedUser,
        assignedModules: selectedModules,
        updatedAt: new Date().toISOString(),
        updatedBy: userData?.uid
      });

      if (result.success) {
        setSuccessMessage(`Successfully updated ${selectedUser.firstName}'s module access`);
        setModuleModalOpen(false);
        setSelectedUser(null);
        fetchEmployees(); // Refresh the list
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating modules:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdatePages = async () => {
    if (!selectedUser) return;

    setUpdateLoading(true);
    try {
      const result = await updateEmployee(selectedUser.id, {
        ...selectedUser,
        assignedPages: selectedPages,
        updatedAt: new Date().toISOString(),
        updatedBy: userData?.uid
      });

      if (result.success) {
        setSuccessMessage(`Successfully updated ${selectedUser.firstName}'s page access`);
        setPageModalOpen(false);
        setSelectedUser(null);
        fetchEmployees(); // Refresh the list
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating pages:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleMigrateDesignations = async () => {
    setMigrationLoading(true);
    try {
      const result = await migrateDesignations();
      if (result.success) {
        setSuccessMessage(`Successfully updated designations for ${result.updatedCount} employees`);
        fetchEmployees(); // Refresh the employee list
      } else {
        setSuccessMessage(`Migration failed: ${result.error}`);
      }
      // Clear message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error during migration:', error);
      setSuccessMessage('Migration failed: ' + error.message);
      setTimeout(() => setSuccessMessage(''), 5000);
    } finally {
      setMigrationLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return <AdminIcon color="error" />;
      case USER_ROLES.MANAGER:
        return <ManagerIcon color="warning" />;
      default:
        return <PersonIcon color="primary" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return 'error';
      case USER_ROLES.MANAGER:
        return 'warning';
      default:
        return 'primary';
    }
  };

  const roleOptions = [
    { value: USER_ROLES.EMPLOYEE, label: 'Employee' },
    { value: USER_ROLES.MANAGER, label: 'Manager' },
    { value: USER_ROLES.ADMIN, label: 'Admin' }
  ];

  const getUsersByRole = (role) => {
    return getFilteredEmployees().filter(emp => emp.role === role);
  };

  const getFilteredEmployees = () => {
    // Start with base employee list based on permissions
    let filteredEmployees = [];
    
    if (hasPermission(USER_ROLES.ADMIN)) {
      filteredEmployees = employees;
    }
    // Manager can only see their team members (employees who report to them)
    else if (hasPermission(USER_ROLES.MANAGER)) {
      filteredEmployees = employees.filter(emp => 
        emp.reportingHeadId === userData?.uid || 
        emp.reportingHeadId === userData?.id ||
        emp.id === userData?.uid || 
        emp.id === userData?.id
      );
    }
    // Employees can only see themselves
    else {
      filteredEmployees = employees.filter(emp => 
        emp.id === userData?.uid || 
        emp.uid === userData?.uid
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      filteredEmployees = filteredEmployees.filter(emp =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.designation && emp.designation.toLowerCase().includes(searchTerm.toLowerCase())) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filteredEmployees;
  };

  const getEmployeesByDesignation = () => {
    const designationCount = {};
    getFilteredEmployees().forEach(emp => {
      const designation = emp.designation || 'Not Specified';
      designationCount[designation] = (designationCount[designation] || 0) + 1;
    });
    return designationCount;
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

  const getPageLabel = (pageId) => {
    const pageLabels = {
      [PAGES.DASHBOARD]: 'Dashboard',
      [PAGES.EMPLOYEE_DIRECTORY]: 'Employee Directory',
      [PAGES.ADD_EMPLOYEE]: 'Add Employee',
      [PAGES.MY_TEAM]: 'My Team',
      [PAGES.LEAVE_REQUESTS]: 'Leave Requests',
      [PAGES.APPLY_LEAVE]: 'Apply Leave',
      [PAGES.ATTENDANCE_VIEW]: 'View Attendance',
      [PAGES.MARK_ATTENDANCE]: 'Mark Attendance',
      [PAGES.ANALYTICS_REPORTS]: 'Analytics & Reports',
      [PAGES.SETTINGS_ROLES]: 'Role Management',
      [PAGES.SETTINGS_MODULES]: 'Module Assignment',
      [PAGES.SETTINGS_SYSTEM]: 'System Settings'
    };
    return pageLabels[pageId] || pageId;
  };

  const handleModuleToggle = (moduleId) => {
    setSelectedModules(prev => {
      if (prev.includes(moduleId)) {
        return prev.filter(id => id !== moduleId);
      } else {
        return [...prev, moduleId];
      }
    });
  };

  const handlePageToggle = (pageId) => {
    setSelectedPages(prev => {
      if (prev.includes(pageId)) {
        return prev.filter(id => id !== pageId);
      } else {
        return [...prev, pageId];
      }
    });
  };

  if (loading && employees.length === 0) {
    return <LoadingSpinner message="Loading settings..." />;
  }

  if (!hasPermission(USER_ROLES.MANAGER)) {
    return (
      <Box className="flex items-center justify-center min-h-96">
        <Alert severity="warning" className="max-w-md">
          <Typography variant="h6">Access Denied</Typography>
          <Typography>You don't have permission to access this page. Only managers and administrators can manage settings.</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="space-y-4">
      <Box>
        <Typography variant="h4" className="font-bold text-gray-800 mb-2">
          System Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {hasPermission(USER_ROLES.ADMIN) 
            ? 'Manage system configurations and user roles' 
            : `Manage your team members (${getFilteredEmployees().length} employees)`
          }
        </Typography>
      </Box>

      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error">
          {error}
        </Alert>
      )}

      {/* Search Bar */}
      <Card>
        <CardContent className="py-3">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search users by name, email, department, designation, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchTerm('')}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          {searchTerm && (
            <Typography variant="caption" color="text.secondary" className="mt-2 block">
              Found {getFilteredEmployees().length} user(s) matching "{searchTerm}"
            </Typography>
          )}
          
          {/* Quick Filter Buttons */}
          <Box className="flex flex-wrap gap-2 mt-3">
            <Typography variant="caption" color="text.secondary" className="mr-2 self-center">
              Quick filters:
            </Typography>
            <Button
              size="small"
              variant={searchTerm === 'admin' ? 'contained' : 'outlined'}
              onClick={() => setSearchTerm(searchTerm === 'admin' ? '' : 'admin')}
              color="error"
            >
              Admins
            </Button>
            <Button
              size="small"
              variant={searchTerm === 'manager' ? 'contained' : 'outlined'}
              onClick={() => setSearchTerm(searchTerm === 'manager' ? '' : 'manager')}
              color="warning"
            >
              Managers
            </Button>
            <Button
              size="small"
              variant={searchTerm === 'employee' ? 'contained' : 'outlined'}
              onClick={() => setSearchTerm(searchTerm === 'employee' ? '' : 'employee')}
              color="primary"
            >
              Employees
            </Button>
            <Button
              size="small"
              variant={searchTerm === 'Engineering' ? 'contained' : 'outlined'}
              onClick={() => setSearchTerm(searchTerm === 'Engineering' ? '' : 'Engineering')}
            >
              Engineering
            </Button>
            <Button
              size="small"
              variant={searchTerm === 'HR' ? 'contained' : 'outlined'}
              onClick={() => setSearchTerm(searchTerm === 'HR' ? '' : 'HR')}
            >
              HR
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab 
            icon={<SecurityIcon />} 
            label="Role Management" 
            iconPosition="start"
          />
          <Tab 
            icon={<ModulesIcon />} 
            label="Module Assignment" 
            iconPosition="start"
          />
          <Tab 
            icon={<PersonIcon />} 
            label="Page Assignment" 
            iconPosition="start"
          />
          <Tab 
            icon={<SettingsIcon />} 
            label="System Settings" 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Role Management Tab */}
      {currentTab === 0 && (
        <Grid container spacing={3}>
          {/* Role Statistics */}
          <Grid item xs={12}>
            <Typography variant="h6" className="font-semibold mb-3">
              Role Distribution
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent className="text-center">
                    <AdminIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" className="font-bold text-red-600">
                      {getUsersByRole(USER_ROLES.ADMIN).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Administrators
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent className="text-center">
                    <ManagerIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" className="font-bold text-orange-600">
                      {getUsersByRole(USER_ROLES.MANAGER).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Managers
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent className="text-center">
                    <PersonIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" className="font-bold text-blue-600">
                      {getUsersByRole(USER_ROLES.EMPLOYEE).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Employees
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Designation Statistics */}
          <Grid item xs={12}>
            <Typography variant="h6" className="font-semibold mb-3">
              Designation Distribution
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(getEmployeesByDesignation()).map(([designation, count]) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={designation}>
                  <Card>
                    <CardContent className="text-center">
                      <PersonIcon color="info" sx={{ fontSize: 32, mb: 1 }} />
                      <Typography variant="h5" className="font-bold text-blue-700">
                        {count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" className="capitalize">
                        {designation}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* User List */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box className="flex items-center justify-between mb-4">
                  <Typography variant="h6" className="font-semibold">
                    User Role Management
                  </Typography>
                  {searchTerm && (
                    <Chip
                      label={`${getFilteredEmployees().length} results`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
                <List>
                  {getFilteredEmployees().length === 0 ? (
                    <Box className="text-center py-8">
                      <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" className="mb-2">
                        {searchTerm ? 'No users found' : 'No users available'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm 
                          ? `No users match "${searchTerm}". Try a different search term.`
                          : 'No users are available for your current access level.'
                        }
                      </Typography>
                      {searchTerm && (
                        <Button
                          variant="outlined"
                          onClick={() => setSearchTerm('')}
                          className="mt-3"
                          startIcon={<ClearIcon />}
                        >
                          Clear Search
                        </Button>
                      )}
                    </Box>
                  ) : (
                    getFilteredEmployees().map((employee, index) => (
                      <ListItem
                        key={employee.id}
                        divider={index < getFilteredEmployees().length - 1}
                        sx={{ py: 2 }}
                      >
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {employee.firstName?.[0]}{employee.lastName?.[0]}
                        </Avatar>
                        <ListItemText
                          primary={
                            <Box className="flex items-center space-x-2">
                              <Typography variant="body1" className="font-medium">
                                {employee.firstName} {employee.lastName}
                              </Typography>
                              <Chip
                                icon={getRoleIcon(employee.role)}
                                label={employee.role}
                                size="small"
                                color={getRoleColor(employee.role)}
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" className="mb-2">
                                {employee.email} • {employee.department}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" className="mb-1 block">
                                Assigned Modules:
                              </Typography>
                              <Box className="flex flex-wrap gap-1">
                                {(employee.assignedModules || DEFAULT_MODULE_ACCESS[employee.role] || []).map(moduleId => (
                                  <Chip
                                    key={moduleId}
                                    label={getModuleLabel(moduleId)}
                                    size="small"
                                    color="primary"
                                    variant="filled"
                                    sx={{ fontSize: '0.7rem', height: '22px' }}
                                  />
                                ))}
                                {(!employee.assignedModules || employee.assignedModules.length === 0) && (
                                  <Typography variant="caption" color="text.secondary" className="italic">
                                    Using default modules for {employee.role}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Box className="flex space-x-1">
                            <IconButton
                              edge="end"
                              onClick={() => handleRoleChange(employee)}
                              color="primary"
                              size="small"
                              title="Change Role"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              edge="end"
                              onClick={() => handleModuleAssignment(employee)}
                              color="info"
                              size="small"
                              title="Assign Modules"
                            >
                              <ModulesIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              edge="end"
                              onClick={() => handlePageAssignment(employee)}
                              color="secondary"
                              size="small"
                              title="Assign Pages"
                            >
                              <PersonIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Module Assignment Tab */}
      {currentTab === 1 && (
        <Grid container spacing={3}>
          {/* Module Assignment Instructions */}
          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Module Assignment:</strong> Control which modules each user can access. 
                Users will only see navigation items for modules they are assigned to.
              </Typography>
            </Alert>
          </Grid>

          {/* User List for Module Assignment */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box className="flex items-center justify-between mb-4">
                  <Typography variant="h6" className="font-semibold">
                    User Module Assignment
                  </Typography>
                  {searchTerm && (
                    <Chip
                      label={`${getFilteredEmployees().length} results`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
                <List>
                  {getFilteredEmployees().map((employee, index) => (
                    <ListItem
                      key={employee.id}
                      divider={index < getFilteredEmployees().length - 1}
                      sx={{ py: 2 }}
                    >
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {employee.firstName?.[0]}{employee.lastName?.[0]}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Box className="flex items-center space-x-2">
                            <Typography variant="body1" className="font-medium">
                              {employee.firstName} {employee.lastName}
                            </Typography>
                            <Chip
                              icon={getRoleIcon(employee.role)}
                              label={employee.role}
                              size="small"
                              color={getRoleColor(employee.role)}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" className="mb-2">
                              {employee.email} • {employee.department}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" className="mb-1 block">
                              Assigned Modules:
                            </Typography>
                            <Box className="flex flex-wrap gap-1">
                              {(employee.assignedModules || DEFAULT_MODULE_ACCESS[employee.role] || []).map(moduleId => (
                                <Chip
                                  key={moduleId}
                                  label={getModuleLabel(moduleId)}
                                  size="small"
                                  color="primary"
                                  variant="filled"
                                  sx={{ fontSize: '0.7rem', height: '22px' }}
                                />
                              ))}
                              {(!employee.assignedModules || employee.assignedModules.length === 0) && (
                                <Typography variant="caption" color="text.secondary" className="italic">
                                  Using default modules for {employee.role}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleModuleAssignment(employee)}
                          startIcon={<ModulesIcon />}
                        >
                          Assign Modules
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Page Assignment Tab */}
      {currentTab === 2 && (
        <Grid container spacing={3}>
          {/* Page Assignment Instructions */}
          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Page Assignment:</strong> Control which specific pages each user can access. 
                This provides granular control beyond module-level access, allowing you to restrict access to specific functionalities.
              </Typography>
            </Alert>
          </Grid>

          {/* User List for Page Assignment */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box className="flex items-center justify-between mb-4">
                  <Typography variant="h6" className="font-semibold">
                    User Page Assignment
                  </Typography>
                  {searchTerm && (
                    <Chip
                      label={`${getFilteredEmployees().length} results`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
                <List>
                  {getFilteredEmployees().length === 0 ? (
                    <Box className="text-center py-8">
                      <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" className="mb-2">
                        {searchTerm ? 'No users found' : 'No users available'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm 
                          ? `No users match "${searchTerm}". Try a different search term.`
                          : 'No users are available for your current access level.'
                        }
                      </Typography>
                      {searchTerm && (
                        <Button
                          variant="outlined"
                          onClick={() => setSearchTerm('')}
                          className="mt-3"
                          startIcon={<ClearIcon />}
                        >
                          Clear Search
                        </Button>
                      )}
                    </Box>
                  ) : (
                    getFilteredEmployees().map((employee, index) => (
                      <ListItem
                        key={employee.id}
                        divider={index < getFilteredEmployees().length - 1}
                        sx={{ py: 2 }}
                      >
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {employee.firstName?.[0]}{employee.lastName?.[0]}
                        </Avatar>
                        <ListItemText
                          primary={
                            <Box className="flex items-center space-x-2">
                              <Typography variant="body1" className="font-medium">
                                {employee.firstName} {employee.lastName}
                              </Typography>
                              <Chip
                                icon={getRoleIcon(employee.role)}
                                label={employee.role}
                                size="small"
                                color={getRoleColor(employee.role)}
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" className="mb-2">
                                {employee.email} • {employee.department}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" className="mb-1 block">
                                Assigned Pages:
                              </Typography>
                              <Box className="flex flex-wrap gap-1">
                                {(employee.assignedPages || DEFAULT_PAGE_ACCESS[employee.role] || []).slice(0, 3).map(pageId => (
                                  <Chip
                                    key={pageId}
                                    label={getPageLabel(pageId)}
                                    size="small"
                                    color="secondary"
                                    variant="filled"
                                    sx={{ fontSize: '0.7rem', height: '22px' }}
                                  />
                                ))}
                                {(employee.assignedPages || DEFAULT_PAGE_ACCESS[employee.role] || []).length > 3 && (
                                  <Chip
                                    label={`+${(employee.assignedPages || DEFAULT_PAGE_ACCESS[employee.role] || []).length - 3} more`}
                                    size="small"
                                    color="default"
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem', height: '22px' }}
                                  />
                                )}
                                {(!employee.assignedPages || employee.assignedPages.length === 0) && (
                                  <Typography variant="caption" color="text.secondary" className="italic">
                                    Using default pages for {employee.role}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handlePageAssignment(employee)}
                            startIcon={<PersonIcon />}
                          >
                            Assign Pages
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* System Settings Tab */}
      {currentTab === 3 && (
        <Grid container spacing={3}>
          {/* Only show system settings to admins */}
          {hasPermission(USER_ROLES.ADMIN) ? (
            <>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" className="font-semibold mb-4">
                      Data Migration Tools
                    </Typography>
                    
                    <Alert severity="info" className="mb-4">
                      <Typography variant="body2">
                        <strong>Designation Migration:</strong> This tool will update all employees who don't have a designation assigned with appropriate default designations based on their role and department.
                      </Typography>
                    </Alert>
                    
                    <Box className="flex items-center space-x-4">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleMigrateDesignations}
                        disabled={migrationLoading}
                        startIcon={migrationLoading ? null : <SecurityIcon />}
                      >
                        {migrationLoading ? 'Migrating...' : 'Update Employee Designations'}
                      </Button>
                      
                      <Typography variant="body2" color="text.secondary">
                        This will assign default designations to employees who don't have one.
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" className="font-semibold mb-4">
                      System Information
                    </Typography>
                    
                    <Box className="space-y-2">
                      <Typography variant="body2">
                        <strong>Total Employees:</strong> {getFilteredEmployees().length}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Active Employees:</strong> {getFilteredEmployees().filter(emp => emp.isActive).length}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Employees with Designations:</strong> {getFilteredEmployees().filter(emp => emp.designation).length}
                      </Typography>
                      <Typography variant="body2">
                        <strong>System Version:</strong> 1.0.0
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </>
          ) : (
            <Grid item xs={12}>
              <Alert severity="warning">
                <Typography variant="h6">Access Denied</Typography>
                <Typography>Only administrators can access system settings.</Typography>
              </Alert>
            </Grid>
          )}
        </Grid>
      )}

      {/* Role Change Modal */}
      <Modal
        open={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title="Change User Role"
        primaryAction={
          <Button
            variant="contained"
            onClick={handleUpdateRole}
            disabled={updateLoading || !newRole || newRole === selectedUser?.role}
          >
            {updateLoading ? 'Updating...' : 'Update Role'}
          </Button>
        }
        secondaryAction={
          <Button onClick={() => setRoleModalOpen(false)}>
            Cancel
          </Button>
        }
      >
        {selectedUser && (
          <Box className="space-y-4">
            <Box className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
              </Avatar>
              <Box>
                <Typography variant="body1" className="font-medium">
                  {selectedUser.firstName} {selectedUser.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedUser.email}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Current Role: {selectedUser.role}
                </Typography>
              </Box>
            </Box>
            
            <FormField
              type="select"
              name="role"
              label="New Role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              options={roleOptions}
              required
            />
            
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Role Permissions:</strong><br />
                • <strong>Employee:</strong> Basic access to personal data and requests<br />
                • <strong>Manager:</strong> Can manage team members and approve requests<br />
                • <strong>Admin:</strong> Full system access including user management
              </Typography>
            </Alert>
          </Box>
        )}
      </Modal>

      {/* Module Assignment Modal */}
      <Modal
        open={moduleModalOpen}
        onClose={() => setModuleModalOpen(false)}
        title="Assign Modules"
        primaryAction={
          <Button
            variant="contained"
            onClick={handleUpdateModules}
            disabled={updateLoading}
          >
            {updateLoading ? 'Updating...' : 'Update Modules'}
          </Button>
        }
        secondaryAction={
          <Button onClick={() => setModuleModalOpen(false)}>
            Cancel
          </Button>
        }
      >
        {selectedUser && (
          <Box className="space-y-4">
            <Box className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
              </Avatar>
              <Box>
                <Typography variant="body1" className="font-medium">
                  {selectedUser.firstName} {selectedUser.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedUser.email} • {selectedUser.role}
                </Typography>
              </Box>
            </Box>
            
            <Alert severity="info">
              <Typography variant="body2">
                Select which modules this user should have access to. 
                Unchecked modules will be hidden from their navigation.
              </Typography>
            </Alert>

            <Box>
              <Typography variant="subtitle2" className="font-medium mb-2">
                Available Modules:
              </Typography>
              <FormGroup>
                {Object.values(MODULES).map(moduleId => {
                  const defaultModules = DEFAULT_MODULE_ACCESS[selectedUser.role] || [];
                  const isDefaultModule = defaultModules.includes(moduleId);
                  const isSelected = selectedModules.includes(moduleId);
                  
                  return (
                    <FormControlLabel
                      key={moduleId}
                      control={
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleModuleToggle(moduleId)}
                          color="primary"
                        />
                      }
                      label={
                        <Box className="flex items-center space-x-2">
                          <Typography variant="body2">
                            {getModuleLabel(moduleId)}
                          </Typography>
                          {isDefaultModule && (
                            <Chip
                              label="Default"
                              size="small"
                              color="info"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: '18px' }}
                            />
                          )}
                        </Box>
                      }
                    />
                  );
                })}
              </FormGroup>
            </Box>

            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Note:</strong> Removing access to essential modules like Dashboard 
                may significantly limit the user's ability to use the system effectively.
              </Typography>
            </Alert>
          </Box>
        )}
      </Modal>

      {/* Page Assignment Modal */}
      <Modal
        open={pageModalOpen}
        onClose={() => setPageModalOpen(false)}
        title="Assign Pages"
        primaryAction={
          <Button
            variant="contained"
            onClick={handleUpdatePages}
            disabled={updateLoading}
          >
            {updateLoading ? 'Updating...' : 'Update Pages'}
          </Button>
        }
        secondaryAction={
          <Button onClick={() => setPageModalOpen(false)}>
            Cancel
          </Button>
        }
      >
        {selectedUser && (
          <Box className="space-y-4">
            <Box className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
              </Avatar>
              <Box>
                <Typography variant="body1" className="font-medium">
                  {selectedUser.firstName} {selectedUser.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedUser.email} • {selectedUser.role}
                </Typography>
              </Box>
            </Box>
            
            <Alert severity="info">
              <Typography variant="body2">
                Select which pages this user should have access to. 
                Unchecked pages will be blocked or hidden from their navigation.
              </Typography>
            </Alert>

            <Box>
              <Typography variant="subtitle2" className="font-medium mb-2">
                Available Pages:
              </Typography>
              <FormGroup>
                {Object.values(PAGES).map(pageId => {
                  const defaultPages = DEFAULT_PAGE_ACCESS[selectedUser.role] || [];
                  const isDefaultPage = defaultPages.includes(pageId);
                  const isSelected = selectedPages.includes(pageId);
                  
                  return (
                    <FormControlLabel
                      key={pageId}
                      control={
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handlePageToggle(pageId)}
                          color="primary"
                        />
                      }
                      label={
                        <Box className="flex items-center space-x-2">
                          <Typography variant="body2">
                            {getPageLabel(pageId)}
                          </Typography>
                          {isDefaultPage && (
                            <Chip
                              label="Default"
                              size="small"
                              color="info"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: '18px' }}
                            />
                          )}
                        </Box>
                      }
                    />
                  );
                })}
              </FormGroup>
            </Box>

            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Note:</strong> Removing access to essential pages like Dashboard 
                may significantly limit the user's ability to use the system effectively.
                Page-level permissions override module-level permissions.
              </Typography>
            </Alert>
          </Box>
        )}
      </Modal>
    </Box>
  );
};

export default Settings;