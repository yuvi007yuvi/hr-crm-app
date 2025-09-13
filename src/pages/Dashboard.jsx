import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  AccessTime as AccessTimeIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { Card } from '../components/common/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useEmployee } from '../context/EmployeeContext.jsx';
import { useLeave } from '../context/LeaveContext.jsx';
import { useAttendance } from '../context/AttendanceContext.jsx';
import { USER_ROLES, LEAVE_STATUS, ATTENDANCE_STATUS } from '../constants/index.js';

const StatCard = ({ title, value, icon, color, trend, description }) => (
  <Card className="h-full">
    <Box className="flex items-center justify-between">
      <Box>
        <Typography variant="body2" color="text.secondary" className="font-medium">
          {title}
        </Typography>
        <Typography variant="h4" className="font-bold my-1" color={color}>
          {value}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
        {trend && (
          <Box className="flex items-center mt-2">
            <TrendingUpIcon fontSize="small" className="text-green-500 mr-1" />
            <Typography variant="body2" className="text-green-500 font-medium">
              {trend}
            </Typography>
          </Box>
        )}
      </Box>
      <Avatar
        sx={{
          bgcolor: `${color}.light`,
          color: `${color}.main`,
          width: 56,
          height: 56
        }}
      >
        {icon}
      </Avatar>
    </Box>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { userData, hasPermission } = useAuth();
  const { stats: employeeStats, fetchEmployees } = useEmployee();
  const { stats: leaveStats, leaves, getPendingLeaves, getApprovablePendingLeaves, leaveBalance } = useLeave();
  const { stats: attendanceStats, todayAttendance, checkIn, checkOut, canCheckInToday, canCheckOutToday } = useAttendance();

  useEffect(() => {
    // Fetch data on component mount
    if (hasPermission(USER_ROLES.MANAGER)) {
      fetchEmployees();
    }
  }, [hasPermission, fetchEmployees]);

  const handleCheckIn = async () => {
    await checkIn();
  };

  const handleCheckOut = async () => {
    await checkOut();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const pendingLeaves = getApprovablePendingLeaves();
  const userLeaves = leaves.filter(leave => leave.employeeId === userData?.uid);
  const recentLeaves = userLeaves.slice(0, 3);

  return (
    <Box className="space-y-4">
      {/* Welcome Section */}
      <Paper 
        className="p-4 mb-6 bg-gradient-to-r from-blue-500 to-purple-600" 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Box className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <Box className="flex items-center space-x-4 mb-4 sm:mb-0">
            <Avatar 
              sx={{ 
                width: 64, 
                height: 64, 
                bgcolor: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}
            >
              {userData?.firstName?.[0]}{userData?.lastName?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h4" className="font-bold mb-1">
                {getGreeting()}, {userData?.firstName}! 👋
              </Typography>
              <Box className="flex items-center space-x-2 mb-2">
                <Typography variant="h6" className="opacity-90">
                  {userData?.firstName} {userData?.lastName}
                </Typography>
                <Chip
                  label={userData?.role}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 'bold',
                    textTransform: 'capitalize'
                  }}
                />
              </Box>
              <Typography variant="body1" className="opacity-80">
                {userData?.department} Department • {userData?.email}
              </Typography>
            </Box>
          </Box>
          <Box className="text-right">
            <Typography variant="body2" className="opacity-80 mb-1">
              Today's Date
            </Typography>
            <Typography variant="h6" className="font-semibold">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Quick Actions */}
      <Card title="Quick Actions" className="mb-4">
        <Box className="flex flex-wrap gap-3">
          {canCheckInToday() && (
            <Button
              variant="contained"
              startIcon={<AccessTimeIcon />}
              onClick={handleCheckIn}
              className="bg-green-600 hover:bg-green-700"
            >
              Check In
            </Button>
          )}
          {canCheckOutToday() && (
            <Button
              variant="contained"
              startIcon={<AccessTimeIcon />}
              onClick={handleCheckOut}
              className="bg-red-600 hover:bg-red-700"
            >
              Check Out
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<EventNoteIcon />}
            onClick={() => navigate('/leave-requests/apply')}
          >
            Apply Leave
          </Button>
          {hasPermission(USER_ROLES.MANAGER) && (
            <Button
              variant="outlined"
              startIcon={<PeopleIcon />}
              onClick={() => navigate('/employees')}
            >
              Manage Employees
            </Button>
          )}
        </Box>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3}>
        {hasPermission(USER_ROLES.MANAGER) && (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Total Employees"
                value={employeeStats.total}
                icon={<PeopleIcon />}
                color="primary"
                description={`${employeeStats.active} active`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Pending Leaves"
                value={pendingLeaves.length}
                icon={<ScheduleIcon />}
                color="warning"
                description="Need approval"
              />
            </Grid>
          </>
        )}
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="My Leave Balance"
            value={`${Object.values(leaveBalance).reduce((a, b) => a + b, 0)}`}
            icon={<EventNoteIcon />}
            color="success"
            description="Days remaining"
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Attendance Rate"
            value={`${Math.round((attendanceStats.present / (attendanceStats.present + attendanceStats.absent) * 100) || 0)}%`}
            icon={<TrendingUpIcon />}
            color="info"
            description="This month"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Today's Status */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card title="Today's Status">
            {todayAttendance ? (
              <Box className="space-y-4">
                <Box className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <Box className="flex items-center">
                    <CheckCircleIcon className="text-green-500 mr-2" />
                    <Box>
                      <Typography variant="body2" className="font-medium">
                        Checked In
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {todayAttendance.checkInTime}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={todayAttendance.status}
                    color={todayAttendance.status === ATTENDANCE_STATUS.PRESENT ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
                
                {todayAttendance.checkOut && (
                  <Box className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <Box className="flex items-center">
                      <AccessTimeIcon className="text-blue-500 mr-2" />
                      <Box>
                        <Typography variant="body2" className="font-medium">
                          Checked Out
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {todayAttendance.checkOutTime}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" className="font-medium">
                      {todayAttendance.workingHours}h
                    </Typography>
                  </Box>
                )}
                
                {!todayAttendance.checkOut && (
                  <Box className="p-3 bg-yellow-50 rounded-lg">
                    <Typography variant="body2" color="text.secondary">
                      Remember to check out at the end of your day
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Box className="text-center py-8">
                <AccessTimeIcon className="text-gray-400 mb-2" fontSize="large" />
                <Typography variant="body2" color="text.secondary">
                  No attendance record for today
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Leave Balance */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card title="Leave Balance">
            <Box className="space-y-3">
              {Object.entries(leaveBalance).map(([type, days]) => (
                <Box key={type}>
                  <Box className="flex justify-between items-center mb-1">
                    <Typography variant="body2" className="font-medium capitalize">
                      {type.replace('_', ' ')} Leave
                    </Typography>
                    <Typography variant="body2" className="font-medium">
                      {days} days
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.max(0, (days / 20) * 100)}
                    className="h-2 rounded-full"
                    color={days > 10 ? 'success' : days > 5 ? 'warning' : 'error'}
                  />
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>

        {/* Recent Leave Requests */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card title="My Recent Leave Requests">
            {recentLeaves.length > 0 ? (
              <List>
                {recentLeaves.map((leave, index) => (
                  <React.Fragment key={leave.id}>
                    <ListItem alignItems="flex-start" className="px-0">
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          width: 32, 
                          height: 32, 
                          bgcolor: leave.status === LEAVE_STATUS.APPROVED ? 'success.light' : 
                                   leave.status === LEAVE_STATUS.REJECTED ? 'error.light' : 'warning.light'
                        }}>
                          {leave.status === LEAVE_STATUS.APPROVED ? <CheckCircleIcon sx={{ color: 'success.main' }} /> :
                           leave.status === LEAVE_STATUS.REJECTED ? <CancelIcon sx={{ color: 'error.main' }} /> :
                           <ScheduleIcon sx={{ color: 'warning.main' }} />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${leave.type} Leave`}
                        secondary={
                          <Box component="div">
                            <Typography component="span" variant="body2" color="text.secondary" display="block">
                              {leave.days} days • {leave.status}
                            </Typography>
                            <Typography component="span" variant="caption" color="text.secondary" display="block">
                              {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItem>
                    {index < recentLeaves.length - 1 && <Divider variant="inset" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box className="text-center py-8">
                <EventNoteIcon className="text-gray-400 mb-2" fontSize="large" />
                <Typography variant="body2" color="text.secondary">
                  No recent leave requests
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Pending Leave Requests (Manager/Admin only) */}
        {hasPermission(USER_ROLES.MANAGER) && pendingLeaves.length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card 
              title="Pending Leave Requests" 
              subtitle={`${pendingLeaves.length} requests need your approval`}
            >
              <List className="max-h-64 overflow-y-auto">
                {pendingLeaves.slice(0, 5).map((leave, index) => (
                  <React.Fragment key={leave.id}>
                    <ListItem alignItems="flex-start" className="px-0">
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'warning.light' }}>
                          <ScheduleIcon sx={{ color: 'warning.main' }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={leave.employeeName}
                        secondary={
                          <Box component="div">
                            <Typography component="span" variant="body2" color="text.secondary" display="block">
                              {leave.type} leave • {leave.days} days
                            </Typography>
                            <Typography component="span" variant="caption" color="text.secondary" display="block">
                              {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItem>
                    {index < Math.min(pendingLeaves.length, 5) - 1 && <Divider variant="inset" />}
                  </React.Fragment>
                ))}
              </List>
              {pendingLeaves.length > 5 && (
                <Box className="mt-2 text-center">
                  <Button size="small" color="primary" href="/leave-requests">
                    View All ({pendingLeaves.length})
                  </Button>
                </Box>
              )}
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;