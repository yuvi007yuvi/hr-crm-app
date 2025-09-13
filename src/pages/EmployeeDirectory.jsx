import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { Table, Card, LoadingSpinner, Alert, FormField, Modal, UserAutocomplete } from '../components/common/index.js';
import { useEmployee } from '../context/EmployeeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { USER_ROLES, DEPARTMENTS, DESIGNATIONS } from '../constants/index.js';

const EmployeeDirectory = () => {
  const { employees, loading, error, fetchEmployees, deleteEmployee, addEmployee, updateEmployee } = useEmployee();
  const { hasPermission, userData } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [employeeForm, setEmployeeForm] = useState({
    firstName: '',
    lastName: '',
    fatherName: '',
    email: '',
    phoneNumber: '',
    aadharNumber: '',
    address: '',
    zone: '',
    ward: '',
    department: '',
    designation: '',
    reportingHead: null, // Changed to object for autocomplete
    shift: '',
    birthDate: '',
    hireDate: new Date().toISOString().split('T')[0],
    isActive: true
  });

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleDeleteEmployee = async (employee) => {
    if (window.confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`)) {
      await deleteEmployee(employee.id);
    }
  };

  const handleAddEmployee = async () => {
    const result = await addEmployee({
      ...employeeForm,
      role: USER_ROLES.EMPLOYEE, // Always set as employee
      employeeId: `EMP-${Date.now()}`, // Auto-generate employee ID
      joinDate: employeeForm.hireDate, // Map hireDate to joinDate for consistency
      reportingHeadId: employeeForm.reportingHead?.id || employeeForm.reportingHead?.uid || null,
      reportingHeadName: employeeForm.reportingHead?.label || null,
      createdOn: new Date().toISOString(),
      registeredBy: userData?.uid
    });
    if (result.success) {
      setAddModalOpen(false);
      resetForm();
    }
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setEmployeeForm({
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      fatherName: employee.fatherName || '',
      email: employee.email || '',
      phoneNumber: employee.phoneNumber || '',
      aadharNumber: employee.aadharNumber || '',
      address: employee.address || '',
      zone: employee.zone || '',
      ward: employee.ward || '',
      department: employee.department || '',
      designation: employee.designation || '',
      reportingHead: employee.reportingHeadId || employee.reportingHead || null,
      shift: employee.shift || '',
      birthDate: employee.birthDate || '',
      hireDate: employee.hireDate || employee.joinDate || '',
      isActive: employee.isActive !== undefined ? employee.isActive : true
    });
    setIsEditing(true);
    setEditModalOpen(true);
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;
    
    const result = await updateEmployee(selectedEmployee.id, {
      ...employeeForm,
      reportingHeadId: employeeForm.reportingHead?.id || employeeForm.reportingHead?.uid || null,
      reportingHeadName: employeeForm.reportingHead?.label || null,
      updatedAt: new Date().toISOString(),
      updatedBy: userData?.uid
    });
    
    if (result.success) {
      setEditModalOpen(false);
      setIsEditing(false);
      setSelectedEmployee(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setEmployeeForm({
      firstName: '',
      lastName: '',
      fatherName: '',
      email: '',
      phoneNumber: '',
      aadharNumber: '',
      address: '',
      zone: '',
      ward: '',
      department: '',
      designation: '',
      reportingHead: null,
      shift: '',
      birthDate: '',
      hireDate: new Date().toISOString().split('T')[0],
      isActive: true
    });
  };

  const columns = [
    {
      id: 'employeeId',
      label: 'Employee ID',
      render: (employee) => (
        <Typography variant="body2" className="font-mono text-sm">
          {employee.employeeId || 'N/A'}
        </Typography>
      ),
      minWidth: 120
    },
    {
      id: 'avatar',
      label: '',
      render: (employee) => (
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {employee.firstName?.[0]}{employee.lastName?.[0]}
        </Avatar>
      ),
      minWidth: 60
    },
    {
      id: 'name',
      label: 'Name',
      render: (employee) => (
        <Box>
          <Typography variant="body2" className="font-medium">
            {employee.firstName} {employee.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {employee.email}
          </Typography>
        </Box>
      ),
      minWidth: 200
    },
    {
      id: 'fatherName',
      label: 'Father Name',
      render: (employee) => (
        <Typography variant="body2">
          {employee.fatherName || 'N/A'}
        </Typography>
      ),
      minWidth: 150
    },
    {
      id: 'contact',
      label: 'Contact',
      render: (employee) => (
        <Box>
          <Typography variant="body2" className="font-medium">
            {employee.phoneNumber || 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {employee.aadharNumber || 'N/A'}
          </Typography>
        </Box>
      ),
      minWidth: 150
    },
    {
      id: 'location',
      label: 'Location',
      render: (employee) => (
        <Box>
          <Typography variant="body2" className="font-medium">
            Zone: {employee.zone || 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Ward: {employee.ward || 'N/A'}
          </Typography>
        </Box>
      ),
      minWidth: 120
    },
    {
      id: 'department',
      label: 'Department',
      render: (employee) => (
        <Chip 
          label={employee.department} 
          size="small" 
          variant="outlined"
          color="primary"
        />
      ),
      minWidth: 120
    },
    {
      id: 'designation',
      label: 'Designation',
      render: (employee) => (
        <Typography variant="body2">
          {employee.designation || 'N/A'}
        </Typography>
      ),
      minWidth: 120
    },
    {
      id: 'reportingHead',
      label: 'Reporting Head',
      render: (employee) => (
        <Typography variant="body2">
          {employee.reportingHeadName || employee.reportingHead || 'N/A'}
        </Typography>
      ),
      minWidth: 150
    },
    {
      id: 'role',
      label: 'Role',
      render: (employee) => (
        <Chip 
          label={employee.role} 
          size="small" 
          variant="filled"
          color={employee.role === USER_ROLES.ADMIN ? 'error' : 
                 employee.role === USER_ROLES.MANAGER ? 'warning' : 'default'}
        />
      ),
      minWidth: 100
    },
    {
      id: 'shift',
      label: 'Shift',
      render: (employee) => (
        <Typography variant="body2">
          {employee.shift || 'N/A'}
        </Typography>
      ),
      minWidth: 100
    },
    {
      id: 'hireDate',
      label: 'Hire Date',
      render: (employee) => {
        const date = employee.hireDate || employee.joinDate;
        return date ? new Date(date).toLocaleDateString() : 'N/A';
      },
      minWidth: 100
    },
    {
      id: 'status',
      label: 'Status',
      render: (employee) => (
        <Chip 
          label={employee.isActive ? 'Active' : 'Inactive'} 
          size="small" 
          color={employee.isActive ? 'success' : 'default'}
        />
      ),
      minWidth: 80
    }
  ];

  const actions = [
    {
      label: 'Edit',
      icon: <EditIcon />,
      onClick: handleEditEmployee,
      disabled: (employee) => !hasPermission(USER_ROLES.MANAGER)
    },
    {
      label: 'Delete',
      icon: <DeleteIcon />,
      onClick: handleDeleteEmployee,
      disabled: (employee) => !hasPermission(USER_ROLES.ADMIN)
    }
  ];

  if (loading && employees.length === 0) {
    return <LoadingSpinner message="Loading employees..." />;
  }

  return (
    <Box className="space-y-4">
      <Box className="flex justify-between items-center">
        <Box>
          <Typography variant="h4" className="font-bold text-gray-800">
            Employee Directory
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your team members
          </Typography>
        </Box>
        {hasPermission(USER_ROLES.MANAGER) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddModalOpen(true)}
          >
            Add Employee
          </Button>
        )}
      </Box>

      {error && (
        <Alert type="error" message={error} dismissible />
      )}

      <Card>
        <Table
          columns={columns}
          data={employees}
          loading={loading}
          actions={actions}
          emptyMessage="No employees found"
        />
      </Card>

      {/* Add Employee Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          resetForm();
        }}
        title="Add New Employee"
        maxWidth="md"
        primaryAction={
          <Button variant="contained" onClick={handleAddEmployee}>
            Add Employee
          </Button>
        }
        secondaryAction={
          <Button onClick={() => {
            setAddModalOpen(false);
            resetForm();
          }}>
            Cancel
          </Button>
        }
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormField
              type="text"
              name="firstName"
              label="First Name"
              value={employeeForm.firstName}
              onChange={(e) => setEmployeeForm({ ...employeeForm, firstName: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="text"
              name="lastName"
              label="Last Name"
              value={employeeForm.lastName}
              onChange={(e) => setEmployeeForm({ ...employeeForm, lastName: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="text"
              name="fatherName"
              label="Father Name"
              value={employeeForm.fatherName}
              onChange={(e) => setEmployeeForm({ ...employeeForm, fatherName: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="email"
              name="email"
              label="Email Address"
              value={employeeForm.email}
              onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="tel"
              name="phoneNumber"
              label="Phone Number"
              value={employeeForm.phoneNumber}
              onChange={(e) => setEmployeeForm({ ...employeeForm, phoneNumber: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="text"
              name="aadharNumber"
              label="Aadhar Number"
              value={employeeForm.aadharNumber}
              onChange={(e) => setEmployeeForm({ ...employeeForm, aadharNumber: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <FormField
              type="textarea"
              name="address"
              label="Address"
              value={employeeForm.address}
              onChange={(e) => setEmployeeForm({ ...employeeForm, address: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="text"
              name="zone"
              label="Zone"
              value={employeeForm.zone}
              onChange={(e) => setEmployeeForm({ ...employeeForm, zone: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="text"
              name="ward"
              label="Ward"
              value={employeeForm.ward}
              onChange={(e) => setEmployeeForm({ ...employeeForm, ward: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="select"
              name="department"
              label="Department"
              value={employeeForm.department}
              onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
              options={DEPARTMENTS.map(dept => ({ value: dept, label: dept }))}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="select"
              name="designation"
              label="Designation"
              value={employeeForm.designation}
              onChange={(e) => setEmployeeForm({ ...employeeForm, designation: e.target.value })}
              options={DESIGNATIONS.map(designation => ({ value: designation, label: designation }))}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <UserAutocomplete
              value={employeeForm.reportingHead}
              onChange={(newValue) => setEmployeeForm({ ...employeeForm, reportingHead: newValue })}
              label="Reporting Head"
              includeRoles={[USER_ROLES.MANAGER, USER_ROLES.ADMIN]}
              placeholder="Search and select reporting head..."
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="select"
              name="shift"
              label="Shift"
              value={employeeForm.shift}
              onChange={(e) => setEmployeeForm({ ...employeeForm, shift: e.target.value })}
              options={[
                { value: 'Morning', label: 'Morning (9:00 AM - 6:00 PM)' },
                { value: 'Evening', label: 'Evening (2:00 PM - 11:00 PM)' },
                { value: 'Night', label: 'Night (11:00 PM - 8:00 AM)' },
                { value: 'Flexible', label: 'Flexible' }
              ]}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="date"
              name="birthDate"
              label="Birth Date"
              value={employeeForm.birthDate}
              onChange={(e) => setEmployeeForm({ ...employeeForm, birthDate: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="date"
              name="hireDate"
              label="Hire Date"
              value={employeeForm.hireDate}
              onChange={(e) => setEmployeeForm({ ...employeeForm, hireDate: e.target.value })}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormField
              type="switch"
              name="isActive"
              label="Active Status"
              value={employeeForm.isActive}
              onChange={(e) => setEmployeeForm({ ...employeeForm, isActive: e.target.value })}
            />
          </Grid>
        </Grid>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setIsEditing(false);
          setSelectedEmployee(null);
          resetForm();
        }}
        title="Edit Employee"
        maxWidth="md"
        primaryAction={
          <Button variant="contained" onClick={handleUpdateEmployee}>
            Update Employee
          </Button>
        }
        secondaryAction={
          <Button onClick={() => {
            setEditModalOpen(false);
            setIsEditing(false);
            setSelectedEmployee(null);
            resetForm();
          }}>
            Cancel
          </Button>
        }
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormField
              type="text"
              name="firstName"
              label="First Name"
              value={employeeForm.firstName}
              onChange={(e) => setEmployeeForm({ ...employeeForm, firstName: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="text"
              name="lastName"
              label="Last Name"
              value={employeeForm.lastName}
              onChange={(e) => setEmployeeForm({ ...employeeForm, lastName: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="text"
              name="fatherName"
              label="Father Name"
              value={employeeForm.fatherName}
              onChange={(e) => setEmployeeForm({ ...employeeForm, fatherName: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="email"
              name="email"
              label="Email Address"
              value={employeeForm.email}
              onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
              required
              disabled={isEditing} // Disable email editing to prevent auth conflicts
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="tel"
              name="phoneNumber"
              label="Phone Number"
              value={employeeForm.phoneNumber}
              onChange={(e) => setEmployeeForm({ ...employeeForm, phoneNumber: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="text"
              name="aadharNumber"
              label="Aadhar Number"
              value={employeeForm.aadharNumber}
              onChange={(e) => setEmployeeForm({ ...employeeForm, aadharNumber: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <FormField
              type="textarea"
              name="address"
              label="Address"
              value={employeeForm.address}
              onChange={(e) => setEmployeeForm({ ...employeeForm, address: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="text"
              name="zone"
              label="Zone"
              value={employeeForm.zone}
              onChange={(e) => setEmployeeForm({ ...employeeForm, zone: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="text"
              name="ward"
              label="Ward"
              value={employeeForm.ward}
              onChange={(e) => setEmployeeForm({ ...employeeForm, ward: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="select"
              name="department"
              label="Department"
              value={employeeForm.department}
              onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
              options={DEPARTMENTS.map(dept => ({ value: dept, label: dept }))}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="select"
              name="designation"
              label="Designation"
              value={employeeForm.designation}
              onChange={(e) => setEmployeeForm({ ...employeeForm, designation: e.target.value })}
              options={DESIGNATIONS.map(designation => ({ value: designation, label: designation }))}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <UserAutocomplete
              value={employeeForm.reportingHead}
              onChange={(newValue) => setEmployeeForm({ ...employeeForm, reportingHead: newValue })}
              label="Reporting Head"
              includeRoles={[USER_ROLES.MANAGER, USER_ROLES.ADMIN]}
              placeholder="Search and select reporting head..."
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="select"
              name="shift"
              label="Shift"
              value={employeeForm.shift}
              onChange={(e) => setEmployeeForm({ ...employeeForm, shift: e.target.value })}
              options={[
                { value: 'Morning', label: 'Morning (9:00 AM - 6:00 PM)' },
                { value: 'Evening', label: 'Evening (2:00 PM - 11:00 PM)' },
                { value: 'Night', label: 'Night (11:00 PM - 8:00 AM)' },
                { value: 'Flexible', label: 'Flexible' }
              ]}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="date"
              name="birthDate"
              label="Birth Date"
              value={employeeForm.birthDate}
              onChange={(e) => setEmployeeForm({ ...employeeForm, birthDate: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="date"
              name="hireDate"
              label="Hire Date"
              value={employeeForm.hireDate}
              onChange={(e) => setEmployeeForm({ ...employeeForm, hireDate: e.target.value })}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormField
              type="switch"
              name="isActive"
              label="Active Status"
              value={employeeForm.isActive}
              onChange={(e) => setEmployeeForm({ ...employeeForm, isActive: e.target.value })}
            />
          </Grid>
        </Grid>
      </Modal>
    </Box>
  );
};

export default EmployeeDirectory;