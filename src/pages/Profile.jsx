import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Grid,
  Paper,
  Chip,
  Button,
  Divider,
  IconButton,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Work as WorkIcon,
  AccountCircle as AccountIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Download as DownloadIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';
import { useEmployee } from '../context/EmployeeContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { Modal, FormField, LoadingSpinner } from '../components/common/index.js';
import { USER_ROLES, DEPARTMENTS, DESIGNATIONS } from '../constants/index.js';

const Profile = () => {
  const { userData, user, updateProfile, updatePassword } = useAuth();
  const { employees, updateEmployee } = useEmployee();
  const { soundEnabled, toggleNotificationSound } = useNotification();
  const [currentTab, setCurrentTab] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get full employee details
  const employeeDetails = employees.find(emp => 
    emp.id === userData?.uid || emp.uid === userData?.uid
  ) || userData;

  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    department: '',
    designation: '',
    dateOfBirth: '',
    joiningDate: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (employeeDetails) {
      setEditForm({
        firstName: employeeDetails.firstName || '',
        lastName: employeeDetails.lastName || '',
        email: employeeDetails.email || '',
        phone: employeeDetails.phone || '',
        address: employeeDetails.address || '',
        emergencyContact: employeeDetails.emergencyContact || '',
        department: employeeDetails.department || '',
        designation: employeeDetails.designation || '',
        dateOfBirth: employeeDetails.dateOfBirth || '',
        joiningDate: employeeDetails.joiningDate || ''
      });
    }
  }, [employeeDetails]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordFormChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Update employee details
      if (employeeDetails.id) {
        await updateEmployee(employeeDetails.id, editForm);
      }
      
      // Update auth profile if email or name changed
      const authUpdate = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email
      };
      
      await updateProfile(authUpdate);
      
      setSuccess('Profile updated successfully!');
      setEditModalOpen(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error('New passwords do not match');
      }
      
      if (passwordForm.newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      const result = await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      if (result.success) {
        setSuccess('Password changed successfully!');
        setPasswordModalOpen(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        throw new Error(result.error);
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const calculateExperience = () => {
    if (!employeeDetails?.joiningDate) return 'N/A';
    
    const joinDate = new Date(employeeDetails.joiningDate);
    const today = new Date();
    const diffTime = Math.abs(today - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
    }
    return `${months} month${months > 1 ? 's' : ''}`;
  };

  const getInitials = () => {
    const firstName = employeeDetails?.firstName || '';
    const lastName = employeeDetails?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN: return 'error';
      case USER_ROLES.MANAGER: return 'warning';
      case USER_ROLES.EMPLOYEE: return 'primary';
      default: return 'default';
    }
  };

  const exportProfileData = () => {
    const profileData = {
      personalInfo: {
        name: `${employeeDetails?.firstName} ${employeeDetails?.lastName}`,
        email: employeeDetails?.email,
        phone: employeeDetails?.phone,
        address: employeeDetails?.address,
        dateOfBirth: employeeDetails?.dateOfBirth,
        emergencyContact: employeeDetails?.emergencyContact
      },
      workInfo: {
        employeeId: employeeDetails?.employeeId,
        department: employeeDetails?.department,
        designation: employeeDetails?.designation,
        role: employeeDetails?.role,
        joiningDate: employeeDetails?.joiningDate,
        reportingHead: employeeDetails?.reportingHeadName,
        experience: calculateExperience()
      },
      preferences: {
        notificationSounds: soundEnabled
      }
    };

    const dataStr = JSON.stringify(profileData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `profile_${employeeDetails?.firstName}_${employeeDetails?.lastName}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!employeeDetails) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  return (
    <Box className="space-y-6">
      {/* Header Section */}
      <Box className="flex justify-between items-start">
        <Box>
          <Typography variant="h4" className="font-bold text-gray-800">
            My Profile
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage your personal information
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={exportProfileData}
        >
          Export Profile
        </Button>
      </Box>

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Profile Header Card */}
      <Card>
        <CardContent>
          <Box className="flex items-center space-x-4">
            <Avatar
              sx={{ 
                width: 100, 
                height: 100, 
                bgcolor: 'primary.main',
                fontSize: '2rem'
              }}
            >
              {getInitials()}
            </Avatar>
            <Box className="flex-grow">
              <Box className="flex items-center space-x-3 mb-2">
                <Typography variant="h5" className="font-bold">
                  {employeeDetails.firstName} {employeeDetails.lastName}
                </Typography>
                <Chip
                  label={employeeDetails.role}
                  color={getRoleColor(employeeDetails.role)}
                  size="small"
                  className="capitalize"
                />
                <Chip
                  label={employeeDetails.department}
                  variant="outlined"
                  size="small"
                />
              </Box>
              <Typography variant="h6" color="text.secondary" className="mb-1">
                {employeeDetails.designation}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Employee ID: {employeeDetails.employeeId || 'Not assigned'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Experience: {calculateExperience()}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setEditModalOpen(true)}
            >
              Edit Profile
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <Paper>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<PersonIcon />} label="Personal Info" />
          <Tab icon={<WorkIcon />} label="Work Info" />
          <Tab icon={<SecurityIcon />} label="Security" />
          <Tab icon={<SettingsIcon />} label="Preferences" />
        </Tabs>

        <Box className="p-6">
          {/* Personal Information Tab */}
          {currentTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email Address"
                      secondary={employeeDetails.email || 'Not provided'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone Number"
                      secondary={employeeDetails.phone || 'Not provided'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Date of Birth"
                      secondary={employeeDetails.dateOfBirth ? 
                        new Date(employeeDetails.dateOfBirth).toLocaleDateString() : 
                        'Not provided'
                      }
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Address"
                      secondary={employeeDetails.address || 'Not provided'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Emergency Contact"
                      secondary={employeeDetails.emergencyContact || 'Not provided'}
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          )}

          {/* Work Information Tab */}
          {currentTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <BusinessIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Department"
                      secondary={employeeDetails.department || 'Not assigned'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <WorkIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Designation"
                      secondary={employeeDetails.designation || 'Not assigned'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AccountIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Role"
                      secondary={
                        <Chip
                          label={employeeDetails.role}
                          color={getRoleColor(employeeDetails.role)}
                          size="small"
                          className="capitalize"
                        />
                      }
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Joining Date"
                      secondary={employeeDetails.joiningDate ? 
                        new Date(employeeDetails.joiningDate).toLocaleDateString() : 
                        'Not provided'
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Reporting Head"
                      secondary={employeeDetails.reportingHeadName || 'Not assigned'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <WorkIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Experience"
                      secondary={calculateExperience()}
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          )}

          {/* Security Tab */}
          {currentTab === 2 && (
            <Box className="space-y-4">
              <Card variant="outlined">
                <CardContent>
                  <Box className="flex justify-between items-center">
                    <Box>
                      <Typography variant="h6" className="mb-1">
                        Password
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Last updated: {user?.metadata?.lastPasswordChange || 'Unknown'}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      onClick={() => setPasswordModalOpen(true)}
                    >
                      Change Password
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" className="mb-2">
                    Account Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Account Created"
                        secondary={user?.metadata?.creationTime ? 
                          new Date(user.metadata.creationTime).toLocaleDateString() : 
                          'Unknown'
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Last Sign In"
                        secondary={user?.metadata?.lastSignInTime ? 
                          new Date(user.metadata.lastSignInTime).toLocaleDateString() : 
                          'Unknown'
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Email Verified"
                        secondary={
                          <Chip
                            label={user?.emailVerified ? 'Verified' : 'Not Verified'}
                            color={user?.emailVerified ? 'success' : 'warning'}
                            size="small"
                          />
                        }
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Preferences Tab */}
          {currentTab === 3 && (
            <Box className="space-y-4">
              <Card variant="outlined">
                <CardContent>
                  <Box className="flex justify-between items-center">
                    <Box>
                      <Typography variant="h6" className="mb-1">
                        Notification Sounds
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Play sounds when you receive notifications
                      </Typography>
                    </Box>
                    <Button
                      variant={soundEnabled ? 'contained' : 'outlined'}
                      onClick={() => toggleNotificationSound(!soundEnabled)}
                    >
                      {soundEnabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" className="mb-2">
                    Data Export
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="mb-3">
                    Download your profile data in JSON format
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={exportProfileData}
                  >
                    Export Profile Data
                  </Button>
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Edit Profile Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Profile"
        maxWidth="md"
      >
        <Box className="space-y-4">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormField
                label="First Name"
                value={editForm.firstName}
                onChange={(e) => handleEditFormChange('firstName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormField
                label="Last Name"
                value={editForm.lastName}
                onChange={(e) => handleEditFormChange('lastName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormField
                label="Email"
                type="email"
                value={editForm.email}
                onChange={(e) => handleEditFormChange('email', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormField
                label="Phone"
                value={editForm.phone}
                onChange={(e) => handleEditFormChange('phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormField
                label="Address"
                value={editForm.address}
                onChange={(e) => handleEditFormChange('address', e.target.value)}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormField
                label="Emergency Contact"
                value={editForm.emergencyContact}
                onChange={(e) => handleEditFormChange('emergencyContact', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormField
                label="Date of Birth"
                type="date"
                value={editForm.dateOfBirth}
                onChange={(e) => handleEditFormChange('dateOfBirth', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormField
                label="Department"
                select
                value={editForm.department}
                onChange={(e) => handleEditFormChange('department', e.target.value)}
                options={DEPARTMENTS.map(dept => ({ value: dept, label: dept }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormField
                label="Designation"
                select
                value={editForm.designation}
                onChange={(e) => handleEditFormChange('designation', e.target.value)}
                options={DESIGNATIONS.map(designation => ({ value: designation, label: designation }))}
              />
            </Grid>
          </Grid>

          <Box className="flex justify-end space-x-2 pt-4">
            <Button onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdateProfile}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Change Password"
        maxWidth="sm"
      >
        <Box className="space-y-4">
          <FormField
            label="Current Password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => handlePasswordFormChange('currentPassword', e.target.value)}
            required
          />
          <FormField
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => handlePasswordFormChange('newPassword', e.target.value)}
            required
            helperText="Must be at least 6 characters long"
          />
          <FormField
            label="Confirm New Password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => handlePasswordFormChange('confirmPassword', e.target.value)}
            required
          />

          {error && (
            <Alert severity="error">{error}</Alert>
          )}

          <Box className="flex justify-end space-x-2 pt-4">
            <Button onClick={() => setPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleChangePassword}
              disabled={loading}
            >
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Profile;