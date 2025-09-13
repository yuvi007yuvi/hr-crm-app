import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import { Card } from '../components/common/index.js';
import { useEmployee } from '../context/EmployeeContext.jsx';
import { useLeave } from '../context/LeaveContext.jsx';
import { useAttendance } from '../context/AttendanceContext.jsx';

const Analytics = () => {
  const { employees, stats: employeeStats = {} } = useEmployee();
  const { leaves = [], stats: leaveStats = {} } = useLeave();
  const { attendance = [], stats: attendanceStats = {} } = useAttendance();
  
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    // Data is already loaded through context
  }, []);

  // Chart data
  const departmentData = Object.entries(employeeStats.byDepartment || {}).map(([dept, count]) => ({
    name: dept,
    employees: count
  }));

  const leaveTypeData = Object.entries(leaveStats.byType || {}).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count
  }));

  // TODO: Replace mock with real trend data
  const attendanceTrendData = [
    { month: 'Jan', present: 85, absent: 15, late: 5 },
    { month: 'Feb', present: 88, absent: 12, late: 3 },
    { month: 'Mar', present: 90, absent: 10, late: 4 },
    { month: 'Apr', present: 87, absent: 13, late: 6 },
    { month: 'May', present: 92, absent: 8, late: 2 },
    { month: 'Jun', present: 89, absent: 11, late: 5 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const StatCard = ({ title, value, icon, color, change }) => (
    <Card className="h-full">
      <Box className="flex items-center justify-between">
        <Box>
          <Typography variant="body2" color="text.secondary" className="font-medium">
            {title}
          </Typography>
          <Typography 
            variant="h4" 
            className="font-bold my-1"
            sx={{ color: (theme) => theme.palette[color]?.main || theme.palette.text.primary }}
          >
            {value}
          </Typography>
          {change !== undefined && (
            <Box className="flex items-center">
              <TrendingUpIcon 
                fontSize="small" 
                className={change > 0 ? 'text-green-500' : 'text-red-500'} 
              />
              <Typography 
                variant="body2" 
                className={`ml-1 font-medium ${change > 0 ? 'text-green-500' : 'text-red-500'}`}
              >
                {change > 0 ? '+' : ''}{change}%
              </Typography>
            </Box>
          )}
        </Box>
        <Paper
          sx={(theme) => ({
            p: 2,
            backgroundColor: theme.palette[color]?.light || theme.palette.grey[100],
            color: theme.palette[color]?.main || theme.palette.text.primary,
          })}
          elevation={0}
        >
          {icon}
        </Paper>
      </Box>
    </Card>
  );

  // Attendance rate calculation with division by zero guard
  const totalAttendance = (attendanceStats.present || 0) + (attendanceStats.absent || 0);
  const attendanceRate = totalAttendance > 0 
    ? Math.round((attendanceStats.present / totalAttendance) * 100) 
    : 0;

  return (
    <Box className="space-y-4">
      <Box className="flex justify-between items-center">
        <Box>
          <Typography variant="h4" className="font-bold text-gray-800">
            Analytics & Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Insights into your team's performance
          </Typography>
        </Box>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Period</InputLabel>
          <Select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            label="Period"
          >
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
            <MenuItem value="quarter">This Quarter</MenuItem>
            <MenuItem value="year">This Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Employees"
            value={employeeStats.total || 0}
            icon={<PeopleIcon />}
            color="primary"
            change={5.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Employees"
            value={employeeStats.active || 0}
            icon={<PeopleIcon />}
            color="success"
            change={2.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Leaves"
            value={leaveStats.pending || 0}
            icon={<EventNoteIcon />}
            color="warning"
            change={-1.5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Attendance Rate"
            value={`${attendanceRate}%`}
            icon={<AccessTimeIcon />}
            color="info"
            change={3.2}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Department Distribution */}
        <Grid item xs={12} md={6}>
          <Card title="Employee Distribution by Department">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="employees" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Leave Types Distribution */}
        <Grid item xs={12} md={6}>
          <Card title="Leave Requests by Type">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leaveTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {leaveTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Attendance Trend */}
        <Grid item xs={12}>
          <Card title="Attendance Trends Over Time">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="present" stroke="#4caf50" strokeWidth={2} name="Present" />
                <Line type="monotone" dataKey="absent" stroke="#f44336" strokeWidth={2} name="Absent" />
                <Line type="monotone" dataKey="late" stroke="#ff9800" strokeWidth={2} name="Late" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Summary Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card title="Leave Summary" className="h-full">
            <Box className="space-y-3">
              <Box className="flex justify-between items-center">
                <Typography variant="body2">Total Requests</Typography>
                <Typography variant="h6" className="font-bold">
                  {leaves.length}
                </Typography>
              </Box>
              <Box className="flex justify-between items-center">
                <Typography variant="body2">Approved</Typography>
                <Typography variant="body2" className="font-medium text-green-600">
                  {leaveStats.approved || 0}
                </Typography>
              </Box>
              <Box className="flex justify-between items-center">
                <Typography variant="body2">Pending</Typography>
                <Typography variant="body2" className="font-medium text-orange-600">
                  {leaveStats.pending || 0}
                </Typography>
              </Box>
              <Box className="flex justify-between items-center">
                <Typography variant="body2">Rejected</Typography>
                <Typography variant="body2" className="font-medium text-red-600">
                  {leaveStats.rejected || 0}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card title="Attendance Summary" className="h-full">
            <Box className="space-y-3">
              <Box className="flex justify-between items-center">
                <Typography variant="body2">Total Records</Typography>
                <Typography variant="h6" className="font-bold">
                  {attendance.length}
                </Typography>
              </Box>
              <Box className="flex justify-between items-center">
                <Typography variant="body2">Present</Typography>
                <Typography variant="body2" className="font-medium text-green-600">
                  {attendanceStats.present || 0}
                </Typography>
              </Box>
              <Box className="flex justify-between items-center">
                <Typography variant="body2">Late</Typography>
                <Typography variant="body2" className="font-medium text-orange-600">
                  {attendanceStats.late || 0}
                </Typography>
              </Box>
              <Box className="flex justify-between items-center">
                <Typography variant="body2">Absent</Typography>
                <Typography variant="body2" className="font-medium text-red-600">
                  {attendanceStats.absent || 0}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card title="Team Performance" className="h-full">
            <Box className="space-y-3">
              <Box className="flex justify-between items-center">
                <Typography variant="body2">Avg Working Hours</Typography>
                <Typography variant="h6" className="font-bold">
                  {attendanceStats?.averageHours ? `${attendanceStats.averageHours.toFixed(1)}h` : 'N/A'}
                </Typography>
              </Box>
              <Box className="flex justify-between items-center">
                <Typography variant="body2">Productivity Score</Typography>
                <Typography variant="body2" className="font-medium text-blue-600">
                  92%
                </Typography>
              </Box>
              <Box className="flex justify-between items-center">
                <Typography variant="body2">Team Satisfaction</Typography>
                <Typography variant="body2" className="font-medium text-green-600">
                  4.8/5
                </Typography>
              </Box>
              <Box className="flex justify-between items-center">
                <Typography variant="body2">Active Projects</Typography>
                <Typography variant="body2" className="font-medium">
                  12
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
