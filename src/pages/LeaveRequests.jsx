import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Chip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { Table, Card, LoadingSpinner, Alert, FormField, Modal } from '../components/common/index.js';
import { useLeave } from '../context/LeaveContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { LEAVE_STATUS, LEAVE_TYPES, USER_ROLES } from '../constants/index.js';

const LeaveRequests = () => {
  const { 
    leaves, 
    loading, 
    error, 
    fetchLeaves, 
    applyLeave, 
    updateLeaveStatus, 
    cancelLeave,
    getApprovablePendingLeaves,
    leaveBalance,
    checkMonthlyLeaveLimit 
  } = useLeave();
  const { hasPermission, userData } = useAuth();
  const { createLeaveRequestNotification, createLeaveStatusNotification } = useNotification();
  
  const [currentTab, setCurrentTab] = useState(0);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  
  const [leaveForm, setLeaveForm] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleApplyLeave = async () => {
    // Validate monthly limit before applying
    if (leaveForm.startDate) {
      const canApply = checkMonthlyLeaveLimit(userData?.uid, leaveForm.startDate);
      if (!canApply) {
        const monthName = new Date(leaveForm.startDate).toLocaleString('default', { month: 'long', year: 'numeric' });
        return; // Error will be shown from context
      }
    }
    
    const result = await applyLeave(leaveForm);
    if (result.success) {
      // Create notification for reporting head
      if (userData?.reportingHeadId) {
        createLeaveRequestNotification(result.data, userData.reportingHeadId);
      }
      
      setApplyModalOpen(false);
      setLeaveForm({ type: '', startDate: '', endDate: '', reason: '' });
    }
  };

  // Get monthly leave count for current user
  const getMonthlyLeaveCount = (date) => {
    if (!date || !userData?.uid) return 0;
    
    const targetDate = new Date(date);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    
    const userLeaves = leaves.filter(leave => leave.employeeId === userData.uid);
    
    return userLeaves.filter(leave => {
      const leaveStartDate = new Date(leave.startDate);
      return (
        leaveStartDate.getFullYear() === year &&
        leaveStartDate.getMonth() === month &&
        (leave.status === LEAVE_STATUS.PENDING || leave.status === LEAVE_STATUS.APPROVED)
      );
    }).length;
  };

  const handleApproveLeave = async () => {
    if (selectedLeave) {
      const result = await updateLeaveStatus(selectedLeave.id, LEAVE_STATUS.APPROVED);
      if (result.success) {
        // Create notification for employee
        createLeaveStatusNotification(selectedLeave, 'approved');
      }
      setReviewModalOpen(false);
      setSelectedLeave(null);
    }
  };

  const handleRejectLeave = async () => {
    if (selectedLeave) {
      const result = await updateLeaveStatus(selectedLeave.id, LEAVE_STATUS.REJECTED);
      if (result.success) {
        // Create notification for employee
        createLeaveStatusNotification(selectedLeave, 'rejected');
      }
      setReviewModalOpen(false);
      setSelectedLeave(null);
    }
  };

  const getFilteredLeaves = () => {
    let filteredLeaves = leaves;
    
    if (!hasPermission(USER_ROLES.MANAGER)) {
      // Employees see only their leaves
      filteredLeaves = leaves.filter(leave => leave.employeeId === userData?.uid);
    } else {
      // Managers see leaves they can approve (their direct reports) plus their own
      const approvableLeaves = getApprovablePendingLeaves();
      const ownLeaves = leaves.filter(leave => leave.employeeId === userData?.uid);
      const approvedRejectedLeaves = leaves.filter(leave => 
        leave.status !== LEAVE_STATUS.PENDING && 
        (leave.employeeReportingHeadId === userData?.uid || leave.employeeReportingHeadId === userData?.id)
      );
      
      // Combine approvable pending leaves, own leaves, and previously reviewed leaves
      const leaveIds = new Set();
      filteredLeaves = [...approvableLeaves, ...ownLeaves, ...approvedRejectedLeaves]
        .filter(leave => {
          if (leaveIds.has(leave.id)) return false;
          leaveIds.add(leave.id);
          return true;
        });
    }

    switch (currentTab) {
      case 0: // All
        return filteredLeaves;
      case 1: // Pending
        return filteredLeaves.filter(leave => leave.status === LEAVE_STATUS.PENDING);
      case 2: // Approved
        return filteredLeaves.filter(leave => leave.status === LEAVE_STATUS.APPROVED);
      case 3: // Rejected
        return filteredLeaves.filter(leave => leave.status === LEAVE_STATUS.REJECTED);
      default:
        return filteredLeaves;
    }
  };

  const columns = [
    {
      id: 'employee',
      label: 'Employee',
      render: (leave) => (
        <Box>
          <Typography variant="body2" className="font-medium">
            {leave.employeeName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {leave.department}
          </Typography>
        </Box>
      ),
      minWidth: 150
    },
    {
      id: 'type',
      label: 'Type',
      render: (leave) => (
        <Chip 
          label={leave.type} 
          size="small" 
          variant="outlined"
          color="primary"
        />
      ),
      minWidth: 100
    },
    {
      id: 'duration',
      label: 'Duration',
      render: (leave) => (
        <Box>
          <Typography variant="body2">
            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {leave.days} days
          </Typography>
        </Box>
      ),
      minWidth: 150
    },
    {
      id: 'reportingHead',
      label: 'Reporting Head',
      render: (leave) => (
        <Typography variant="body2" color="text.secondary">
          {leave.employeeReportingHeadName || 'N/A'}
        </Typography>
      ),
      minWidth: 120
    },
    {
      id: 'status',
      label: 'Status',
      render: (leave) => (
        <Chip 
          label={leave.status} 
          size="small" 
          color={
            leave.status === LEAVE_STATUS.APPROVED ? 'success' :
            leave.status === LEAVE_STATUS.REJECTED ? 'error' :
            leave.status === LEAVE_STATUS.PENDING ? 'warning' : 'default'
          }
        />
      ),
      minWidth: 100
    },
    {
      id: 'appliedDate',
      label: 'Applied',
      render: (leave) => new Date(leave.appliedDate).toLocaleDateString(),
      minWidth: 100
    }
  ];

  const actions = [];
  
  if (hasPermission(USER_ROLES.MANAGER)) {
    actions.push(
      {
        label: 'Review',
        icon: <ScheduleIcon />,
        onClick: (leave) => {
          setSelectedLeave(leave);
          setReviewModalOpen(true);
        },
        disabled: (leave) => {
          if (!leave || leave.status !== LEAVE_STATUS.PENDING) return true;
          
          // Check if current user is authorized to approve this leave
          const approvableLeaves = getApprovablePendingLeaves();
          return !approvableLeaves.some(approvable => approvable.id === leave.id);
        }
      }
    );
  } else {
    actions.push(
      {
        label: 'Cancel',
        icon: <CancelIcon />,
        onClick: (leave) => cancelLeave(leave.id),
        disabled: (leave) => !leave || leave.status !== LEAVE_STATUS.PENDING
      }
    );
  }

  const leaveTypeOptions = Object.values(LEAVE_TYPES).map(type => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1)
  }));

  if (loading && leaves.length === 0) {
    return <LoadingSpinner message="Loading leave requests..." />;
  }

  return (
    <Box className="space-y-4">
      <Box className="flex justify-between items-center">
        <Box>
          <Typography variant="h4" className="font-bold text-gray-800">
            Leave Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {hasPermission(USER_ROLES.MANAGER) ? 'Manage team leave requests' : 'Your leave requests'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setApplyModalOpen(true)}
        >
          Apply Leave
        </Button>
      </Box>

      {/* Leave Balance (for employees) */}
      {!hasPermission(USER_ROLES.MANAGER) && (
        <Grid container spacing={2}>
          {Object.entries(leaveBalance).map(([type, days]) => (
            <Grid item xs={12} sm={4} key={type}>
              <Card>
                <Box className="text-center">
                  <Typography variant="h4" className="font-bold text-blue-600">
                    {days}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="capitalize">
                    {type.replace('_', ' ')} Days
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {error && (
        <Alert type="error" message={error} dismissible />
      )}

      <Card>
        <Box className="border-b border-gray-200">
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Requests" />
            <Tab label="Pending" />
            <Tab label="Approved" />
            <Tab label="Rejected" />
          </Tabs>
        </Box>

        <Table
          columns={columns}
          data={getFilteredLeaves()}
          loading={loading}
          actions={actions}
          emptyMessage="No leave requests found"
        />
      </Card>

      {/* Apply Leave Modal */}
      <Modal
        open={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="Apply for Leave"
        primaryAction={
          <Button 
            variant="contained" 
            onClick={handleApplyLeave}
            disabled={leaveForm.startDate && getMonthlyLeaveCount(leaveForm.startDate) >= 4}
          >
            Submit Request
          </Button>
        }
        secondaryAction={
          <Button onClick={() => setApplyModalOpen(false)}>
            Cancel
          </Button>
        }
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormField
              type="select"
              name="type"
              label="Leave Type"
              value={leaveForm.type}
              onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
              options={leaveTypeOptions}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="date"
              name="startDate"
              label="Start Date"
              value={leaveForm.startDate}
              onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
              required
            />
            {leaveForm.startDate && (
              <Typography variant="caption" color={getMonthlyLeaveCount(leaveForm.startDate) >= 4 ? "error" : "text.secondary"} className="mt-1 block">
                Monthly leaves: {getMonthlyLeaveCount(leaveForm.startDate)}/4
                {getMonthlyLeaveCount(leaveForm.startDate) >= 4 && " (Limit reached!)"}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="date"
              name="endDate"
              label="End Date"
              value={leaveForm.endDate}
              onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <FormField
              type="textarea"
              name="reason"
              label="Reason"
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              placeholder="Please provide a reason for your leave..."
              required
            />
          </Grid>
        </Grid>
      </Modal>

      {/* Review Leave Modal */}
      {hasPermission(USER_ROLES.MANAGER) && (
        <Modal
          open={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title="Review Leave Request"
          primaryAction={
            <Box className="space-x-2">
              <Button 
                variant="contained" 
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={handleApproveLeave}
              >
                Approve
              </Button>
              <Button 
                variant="contained" 
                color="error"
                startIcon={<CancelIcon />}
                onClick={handleRejectLeave}
              >
                Reject
              </Button>
            </Box>
          }
          secondaryAction={
            <Button onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
          }
        >
          {selectedLeave && (
            <Box className="space-y-4">
              <Box>
                <Typography variant="subtitle2" className="font-medium">Employee</Typography>
                <Typography variant="body2">{selectedLeave.employeeName}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" className="font-medium">Leave Type</Typography>
                <Typography variant="body2" className="capitalize">{selectedLeave.type}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" className="font-medium">Duration</Typography>
                <Typography variant="body2">
                  {new Date(selectedLeave.startDate).toLocaleDateString()} - {new Date(selectedLeave.endDate).toLocaleDateString()} ({selectedLeave.days} days)
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" className="font-medium">Reason</Typography>
                <Typography variant="body2">{selectedLeave.reason}</Typography>
              </Box>
            </Box>
          )}
        </Modal>
      )}
    </Box>
  );
};

export default LeaveRequests;