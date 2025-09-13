import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Chip,
  Grid,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Login as CheckInIcon,
  Logout as CheckOutIcon,
  AccessTime as AccessTimeIcon,
  Today as TodayIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { Table, Card, LoadingSpinner, Alert } from '../components/common/index.js';
import { useAttendance } from '../context/AttendanceContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useEmployee } from '../context/EmployeeContext.jsx';
import { ATTENDANCE_STATUS, USER_ROLES } from '../constants/index.js';

const Attendance = () => {
  const { 
    attendance, 
    loading, 
    error, 
    fetchAttendance, 
    checkIn, 
    checkOut,
    todayAttendance,
    canCheckInToday,
    canCheckOutToday,
    stats
  } = useAttendance();
  const { hasPermission, userData } = useAuth();
  const { employees, fetchEmployees } = useEmployee();
  
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState('all'); // 'all' or specific employee ID

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, [fetchAttendance, fetchEmployees]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleEmployeeChange = (event) => {
    setSelectedEmployee(event.target.value);
  };

  const handleCheckIn = async () => {
    await checkIn();
  };

  const handleCheckOut = async () => {
    await checkOut();
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getAttendanceForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const allRecords = getAllRecordsWithMissing();
    const filteredRecords = allRecords.filter(att => {
      // Apply same filtering logic as main attendance view
      if (!hasPermission(USER_ROLES.MANAGER)) {
        return att.employeeId === userData?.uid;
      } else {
        const accessibleEmployees = getAccessibleEmployees();
        const accessibleEmployeeIds = accessibleEmployees.map(emp => emp.id || emp.uid);
        return accessibleEmployeeIds.includes(att.employeeId) || att.employeeId === userData?.uid;
      }
    }).filter(att => {
      if (selectedEmployee !== 'all') {
        return att.employeeId === selectedEmployee;
      }
      return true;
    });
    
    return filteredRecords.find(att => att.date === dateStr);
  };

  const getStatusColor = (status, isMissing = false) => {
    if (isMissing) {
      return '#9e9e9e'; // Gray for missing
    }
    switch (status) {
      case ATTENDANCE_STATUS.PRESENT:
        return '#4caf50'; // Green
      case ATTENDANCE_STATUS.LATE:
        return '#ff9800'; // Orange
      case ATTENDANCE_STATUS.HALF_DAY:
        return '#2196f3'; // Blue
      case ATTENDANCE_STATUS.ABSENT:
        return '#f44336'; // Red
      default:
        return '#e0e0e0'; // Light gray
    }
  };

  const handlePreviousMonth = () => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToCurrentMonth = () => {
    setSelectedMonth(new Date());
  };

  const getMonthlyStats = () => {
    const allRecords = getAllRecordsWithMissing();
    const filteredRecords = allRecords.filter(att => {
      // Apply same filtering logic as main attendance view
      if (!hasPermission(USER_ROLES.MANAGER)) {
        return att.employeeId === userData?.uid;
      } else {
        const accessibleEmployees = getAccessibleEmployees();
        const accessibleEmployeeIds = accessibleEmployees.map(emp => emp.id || emp.uid);
        return accessibleEmployeeIds.includes(att.employeeId) || att.employeeId === userData?.uid;
      }
    }).filter(att => {
      if (selectedEmployee !== 'all') {
        return att.employeeId === selectedEmployee;
      }
      return true;
    });
    
    const monthAttendance = filteredRecords.filter(att => {
      const attDate = new Date(att.date);
      return attDate.getMonth() === selectedMonth.getMonth() && 
             attDate.getFullYear() === selectedMonth.getFullYear();
    });
    
    return {
      total: monthAttendance.filter(att => !att.isMissing).length,
      present: monthAttendance.filter(att => att.status === ATTENDANCE_STATUS.PRESENT).length,
      late: monthAttendance.filter(att => att.status === ATTENDANCE_STATUS.LATE).length,
      halfDay: monthAttendance.filter(att => att.status === ATTENDANCE_STATUS.HALF_DAY).length,
      absent: monthAttendance.filter(att => att.status === ATTENDANCE_STATUS.ABSENT).length,
      missing: monthAttendance.filter(att => att.isMissing).length,
      totalHours: monthAttendance.reduce((sum, att) => sum + (att.workingHours || 0), 0)
    };
  };

  const renderCalendarView = () => {
    const today = new Date();
    const daysInMonth = getDaysInMonth(selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedMonth);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <Box key={`empty-${i}`} className="h-16 border border-gray-200">
        </Box>
      );
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
      const attendance = getAttendanceForDate(date);
      const isToday = date.toDateString() === today.toDateString();
      const isFuture = date > today;
      
      days.push(
        <Box
          key={day}
          className={`h-16 border border-gray-200 p-1 ${
            isToday ? 'ring-2 ring-blue-500' : ''
          } ${
            isFuture ? 'bg-gray-50' : 'bg-white'
          }`}
          sx={{ position: 'relative' }}
        >
          <Typography 
            variant="caption" 
            className={`font-medium ${
              isToday ? 'text-blue-600' : 'text-gray-700'
            }`}
          >
            {day}
          </Typography>
          
          {attendance && (
            <Box className="mt-1">
              <Tooltip 
                title={`${attendance.employeeName} - ${attendance.isMissing ? 'Missing/Absent' : attendance.status} - ${attendance.checkInTime || 'No check-in'} to ${attendance.checkOutTime || 'No check-out'}`}
                arrow
              >
                <Box
                  className={`w-full h-4 rounded text-xs text-white flex items-center justify-center cursor-pointer ${
                    attendance.isMissing ? 'border border-gray-400 border-dashed' : ''
                  }`}
                  sx={{ 
                    backgroundColor: getStatusColor(attendance.status, attendance.isMissing),
                    fontSize: '0.6rem',
                    color: attendance.isMissing ? '#666' : 'white'
                  }}
                >
                  {hasPermission(USER_ROLES.MANAGER) 
                    ? attendance.employeeName.split(' ')[0] 
                    : attendance.isMissing ? 'M' : attendance.status.charAt(0).toUpperCase()
                  }
                </Box>
              </Tooltip>
              
              {attendance.workingHours && !attendance.isMissing && (
                <Typography 
                  variant="caption" 
                  className="text-gray-600 text-xs block mt-1"
                  sx={{ fontSize: '0.6rem' }}
                >
                  {attendance.workingHours}h
                </Typography>
              )}
            </Box>
          )}
          
          {!attendance && !isFuture && (
            <Box className="mt-1">
              <Box
                className="w-full h-4 rounded flex items-center justify-center"
                sx={{ backgroundColor: '#f5f5f5' }}
              >
                <Typography 
                  variant="caption" 
                  sx={{ fontSize: '0.6rem', color: '#999' }}
                >
                  -
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      );
    }
    
    return (
      <Box>
        {/* Calendar Header with Stats */}
        <Box className="flex items-center justify-between mb-4">
          <Box className="flex items-center space-x-2">
            <IconButton onClick={handlePreviousMonth} size="small">
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h6" className="font-semibold min-w-48 text-center">
              {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Typography>
            <IconButton onClick={handleNextMonth} size="small">
              <ChevronRightIcon />
            </IconButton>
            <Button 
              size="small" 
              variant="outlined" 
              onClick={goToCurrentMonth}
              startIcon={<TodayIcon />}
            >
              Today
            </Button>
          </Box>
          
          <Box className="flex items-center space-x-4">
            <Box className="flex items-center space-x-2">
              <Box className="w-3 h-3 rounded" sx={{ backgroundColor: getStatusColor(ATTENDANCE_STATUS.PRESENT) }}></Box>
              <Typography variant="caption">Present</Typography>
            </Box>
            <Box className="flex items-center space-x-2">
              <Box className="w-3 h-3 rounded" sx={{ backgroundColor: getStatusColor(ATTENDANCE_STATUS.LATE) }}></Box>
              <Typography variant="caption">Late</Typography>
            </Box>
            <Box className="flex items-center space-x-2">
              <Box className="w-3 h-3 rounded" sx={{ backgroundColor: getStatusColor(ATTENDANCE_STATUS.HALF_DAY) }}></Box>
              <Typography variant="caption">Half Day</Typography>
            </Box>
            <Box className="flex items-center space-x-2">
              <Box className="w-3 h-3 rounded" sx={{ backgroundColor: getStatusColor(ATTENDANCE_STATUS.ABSENT) }}></Box>
              <Typography variant="caption">Absent</Typography>
            </Box>
            <Box className="flex items-center space-x-2">
              <Box className="w-3 h-3 rounded border border-gray-400 border-dashed" sx={{ backgroundColor: getStatusColor('MISSING', true) }}></Box>
              <Typography variant="caption">Missing</Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Monthly Statistics */}
        {(() => {
          const monthStats = getMonthlyStats();
          return monthStats.total > 0 && (
            <Box className="mb-4 p-3 bg-blue-50 rounded-lg">
              <Typography variant="subtitle2" className="font-semibold text-blue-800 mb-2">
                Monthly Summary for {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box className="text-center">
                    <Typography variant="h5" className="font-bold text-green-600">
                      {monthStats.present}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Present Days
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box className="text-center">
                    <Typography variant="h5" className="font-bold text-orange-600">
                      {monthStats.late}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Late Days
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={2}>
                  <Box className="text-center">
                    <Typography variant="h5" className="font-bold text-red-600">
                      {monthStats.absent}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Absent Days
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={2}>
                  <Box className="text-center">
                    <Typography variant="h5" className="font-bold text-gray-600">
                      {monthStats.missing}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Missing Days
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={2}>
                  <Box className="text-center">
                    <Typography variant="h5" className="font-bold text-blue-600">
                      {monthStats.totalHours.toFixed(1)}h
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Hours
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          );
        })()}
        
        {/* Calendar Grid */}
        <Box className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Box 
              key={day} 
              className="bg-gray-100 p-2 text-center border-b border-gray-200"
            >
              <Typography variant="caption" className="font-semibold text-gray-700">
                {day}
              </Typography>
            </Box>
          ))}
          
          {/* Calendar days */}
          {days}
        </Box>
        
        {/* Calendar Legend */}
        <Box className="mt-4 p-3 bg-gray-50 rounded-lg">
          <Typography variant="caption" className="font-semibold text-gray-700 block mb-2">
            Calendar Legend:
          </Typography>
          <Box className="grid grid-cols-2 gap-2 text-sm">
            <Typography variant="caption" color="text.secondary">
              • Click dates to view detailed attendance info
            </Typography>
            <Typography variant="caption" color="text.secondary">
              • Blue border indicates today's date
            </Typography>
            <Typography variant="caption" color="text.secondary">
              • {hasPermission(USER_ROLES.MANAGER) ? 'Employee names' : 'Status indicators'} shown on attendance days
            </Typography>
            <Typography variant="caption" color="text.secondary">
              • Dashed border indicates missing attendance records
            </Typography>
            <Typography variant="caption" color="text.secondary">
              • Working hours displayed below attendance status
            </Typography>
            <Typography variant="caption" color="text.secondary">
              • Missing days are calculated for last 30 working days
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  const getFilteredAttendance = () => {
    let filteredAttendance;
    
    // For Missing tab, get all records including missing ones
    if (currentTab === 4) {
      filteredAttendance = getAllRecordsWithMissing();
    } else {
      filteredAttendance = attendance;
    }
    
    // Filter by user permissions first
    if (!hasPermission(USER_ROLES.MANAGER)) {
      // Employees see only their attendance
      filteredAttendance = filteredAttendance.filter(att => att.employeeId === userData?.uid);
    } else {
      // Managers can see team attendance, but filter by accessible employees
      const accessibleEmployees = getAccessibleEmployees();
      const accessibleEmployeeIds = accessibleEmployees.map(emp => emp.id || emp.uid);
      filteredAttendance = filteredAttendance.filter(att => 
        accessibleEmployeeIds.includes(att.employeeId) || att.employeeId === userData?.uid
      );
    }
    
    // Filter by selected employee
    if (selectedEmployee !== 'all') {
      filteredAttendance = filteredAttendance.filter(att => att.employeeId === selectedEmployee);
    }

    // Filter by tab status
    switch (currentTab) {
      case 0: // All
        return filteredAttendance.filter(att => !att.isMissing);
      case 1: // Present
        return filteredAttendance.filter(att => att.status === ATTENDANCE_STATUS.PRESENT);
      case 2: // Late
        return filteredAttendance.filter(att => att.status === ATTENDANCE_STATUS.LATE);
      case 3: // Absent
        return filteredAttendance.filter(att => att.status === ATTENDANCE_STATUS.ABSENT);
      case 4: // Missing
        return filteredAttendance.filter(att => att.isMissing);
      default:
        return filteredAttendance.filter(att => !att.isMissing);
    }
  };

  // Get employees that current user can view
  const getAccessibleEmployees = () => {
    if (hasPermission(USER_ROLES.ADMIN)) {
      return employees;
    } else if (hasPermission(USER_ROLES.MANAGER)) {
      // Managers can see their team members + themselves
      return employees.filter(emp => 
        emp.reportingHeadId === userData?.uid || 
        emp.reportingHeadId === userData?.id ||
        emp.id === userData?.uid || 
        emp.uid === userData?.uid
      );
    } else {
      // Employees can only see themselves
      return employees.filter(emp => 
        emp.id === userData?.uid || 
        emp.uid === userData?.uid
      );
    }
  };

  // Get missing attendance records (dates without attendance)
  const getMissingAttendanceRecords = () => {
    const accessibleEmployees = getAccessibleEmployees();
    const missingRecords = [];
    const today = new Date();
    
    // Get last 30 working days (excluding weekends and holidays)
    for (let i = 1; i <= 45; i++) { // Check more days to get 30 working days
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (date.getDay() === 0 || date.getDay() === 6) {
        continue;
      }
      
      const dateStr = date.toISOString().split('T')[0];
      
      // Check each accessible employee
      accessibleEmployees.forEach(employee => {
        const employeeId = employee.id || employee.uid;
        
        // Skip if employee joined after this date
        if (employee.joinDate && new Date(employee.joinDate) > date) {
          return;
        }
        
        // Skip if employee left before this date
        if (employee.lastWorkingDay && new Date(employee.lastWorkingDay) < date) {
          return;
        }
        
        // Check if attendance record exists for this date
        const hasAttendance = attendance.some(att => 
          att.employeeId === employeeId && att.date === dateStr
        );
        
        if (!hasAttendance) {
          missingRecords.push({
            id: `missing-${employeeId}-${dateStr}`,
            employeeId,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            employeeEmail: employee.email,
            department: employee.department,
            designation: employee.designation,
            date: dateStr,
            checkInTime: null,
            checkOutTime: null,
            workingHours: 0,
            status: 'MISSING',
            isMissing: true
          });
        }
      });
    }
    
    // Return only the most recent missing records (limit to reasonable number)
    return missingRecords
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 100); // Limit to 100 most recent missing records
  };

  // Get all records including missing ones
  const getAllRecordsWithMissing = () => {
    const regularAttendance = attendance;
    const missingRecords = getMissingAttendanceRecords();
    
    return [...regularAttendance, ...missingRecords].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
  };

  const columns = [
    {
      id: 'employee',
      label: 'Employee',
      render: (record) => (
        <Box>
          <Typography variant="body2" className="font-medium">
            {record.employeeName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {record.department}
          </Typography>
        </Box>
      ),
      minWidth: 150
    },
    {
      id: 'date',
      label: 'Date',
      render: (record) => new Date(record.date).toLocaleDateString(),
      minWidth: 100
    },
    {
      id: 'checkIn',
      label: 'Check In',
      render: (record) => record.checkInTime || '-',
      minWidth: 100
    },
    {
      id: 'checkOut',
      label: 'Check Out',
      render: (record) => record.checkOutTime || '-',
      minWidth: 100
    },
    {
      id: 'workingHours',
      label: 'Hours',
      render: (record) => record.workingHours ? `${record.workingHours}h` : '-',
      minWidth: 80
    },
    {
      id: 'status',
      label: 'Status',
      render: (record) => (
        <Chip 
          label={record.isMissing ? 'Missing/Absent' : record.status} 
          size="small" 
          color={
            record.isMissing ? 'error' :
            record.status === ATTENDANCE_STATUS.PRESENT ? 'success' :
            record.status === ATTENDANCE_STATUS.LATE ? 'warning' :
            record.status === ATTENDANCE_STATUS.HALF_DAY ? 'info' :
            'error'
          }
          variant={record.isMissing ? 'outlined' : 'filled'}
        />
      ),
      minWidth: 100
    }
  ];

  if (loading && attendance.length === 0) {
    return <LoadingSpinner message="Loading attendance records..." />;
  }

  return (
    <Box className="space-y-4">
      <Box className="flex justify-between items-center">
        <Box>
          <Typography variant="h4" className="font-bold text-gray-800">
            Attendance Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {hasPermission(USER_ROLES.MANAGER) ? 'Team attendance overview' : 'Your attendance records'}
          </Typography>
        </Box>
        
        {/* Employee Filter Dropdown */}
        {hasPermission(USER_ROLES.MANAGER) && getAccessibleEmployees().length > 1 && (
          <Box className="min-w-64">
            <FormControl fullWidth size="small">
              <InputLabel>View Attendance For</InputLabel>
              <Select
                value={selectedEmployee}
                label="View Attendance For"
                onChange={handleEmployeeChange}
              >
                <MenuItem value="all">
                  <Box className="flex items-center space-x-2">
                    <Typography>All Team Members</Typography>
                    <Chip 
                      size="small" 
                      label={getAccessibleEmployees().length} 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                </MenuItem>
                {getAccessibleEmployees().map((employee) => (
                  <MenuItem key={employee.id || employee.uid} value={employee.id || employee.uid}>
                    <Box className="flex items-center justify-between w-full">
                      <Typography>
                        {employee.firstName} {employee.lastName}
                      </Typography>
                      <Box className="flex items-center space-x-1 ml-2">
                        <Chip 
                          size="small" 
                          label={employee.department} 
                          variant="outlined" 
                          sx={{ fontSize: '0.7rem', height: '20px' }}
                        />
                        <Chip 
                          size="small" 
                          label={employee.designation || 'N/A'} 
                          color="secondary"
                          variant="outlined" 
                          sx={{ fontSize: '0.7rem', height: '20px' }}
                        />
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </Box>

      {/* Selected Employee Info */}
      {hasPermission(USER_ROLES.MANAGER) && selectedEmployee !== 'all' && (() => {
        const employee = getAccessibleEmployees().find(emp => (emp.id || emp.uid) === selectedEmployee);
        return employee && (
          <Card>
            <Box className="flex items-center justify-between">
              <Box className="flex items-center space-x-3">
                <Box className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Typography variant="body1" className="font-semibold text-blue-600">
                    {employee.firstName?.[0]}{employee.lastName?.[0]}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" className="font-semibold">
                    {employee.firstName} {employee.lastName}
                  </Typography>
                  <Box className="flex items-center space-x-2">
                    <Typography variant="body2" color="text.secondary">
                      {employee.department}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • {employee.designation || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => setSelectedEmployee('all')}
              >
                View All Team
              </Button>
            </Box>
          </Card>
        );
      })()}

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card title={`Today's Status${selectedEmployee !== 'all' && hasPermission(USER_ROLES.MANAGER) ? ` - ${getAccessibleEmployees().find(emp => (emp.id || emp.uid) === selectedEmployee)?.firstName || 'Employee'}` : ''}`}>
            {(() => {
              // Get today's attendance for selected employee or current user
              let relevantTodayAttendance = todayAttendance;
              
              if (hasPermission(USER_ROLES.MANAGER) && selectedEmployee !== 'all') {
                // Find today's attendance for selected employee
                const today = new Date().toISOString().split('T')[0];
                relevantTodayAttendance = attendance.find(att => 
                  att.employeeId === selectedEmployee && att.date === today
                );
              }
              
              return relevantTodayAttendance ? (
                <Box className="space-y-3">
                  <Box className="flex items-center justify-between">
                    <Typography variant="body2">Check In</Typography>
                    <Typography variant="body2" className="font-medium">
                      {relevantTodayAttendance.checkInTime || '-'}
                    </Typography>
                  </Box>
                  <Box className="flex items-center justify-between">
                    <Typography variant="body2">Check Out</Typography>
                    <Typography variant="body2" className="font-medium">
                      {relevantTodayAttendance.checkOutTime || '-'}
                    </Typography>
                  </Box>
                  <Box className="flex items-center justify-between">
                    <Typography variant="body2">Working Hours</Typography>
                    <Typography variant="body2" className="font-medium">
                      {relevantTodayAttendance.workingHours ? `${relevantTodayAttendance.workingHours}h` : '-'}
                    </Typography>
                  </Box>
                  <Box className="flex items-center justify-between">
                    <Typography variant="body2">Status</Typography>
                    <Chip 
                      label={relevantTodayAttendance.status} 
                      size="small" 
                      color={
                        relevantTodayAttendance.status === ATTENDANCE_STATUS.PRESENT ? 'success' :
                        relevantTodayAttendance.status === ATTENDANCE_STATUS.LATE ? 'warning' :
                        'info'
                      }
                    />
                  </Box>
                </Box>
              ) : (
                <Box className="text-center py-4">
                  <AccessTimeIcon className="text-gray-400 mb-2" fontSize="large" />
                  <Typography variant="body2" color="text.secondary">
                    No attendance record for today
                  </Typography>
                </Box>
              );
            })()
            }
          </Card>
        </Grid>

        {/* Quick Actions - Only show for current user's own attendance */}
        {(selectedEmployee === 'all' || selectedEmployee === userData?.uid || !hasPermission(USER_ROLES.MANAGER)) && (
          <Grid item xs={12} md={4}>
            <Card title="Quick Actions">
              <Box className="space-y-3">
                {canCheckInToday() && (
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<CheckInIcon />}
                    onClick={handleCheckIn}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Check In
                  </Button>
                )}
                {canCheckOutToday() && (
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<CheckOutIcon />}
                    onClick={handleCheckOut}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Check Out
                  </Button>
                )}
                {!canCheckInToday() && !canCheckOutToday() && (
                  <Box className="text-center py-4">
                    <TodayIcon className="text-gray-400 mb-2" fontSize="large" />
                    <Typography variant="body2" color="text.secondary">
                      {todayAttendance?.checkOut ? 'Already checked out' : 'No actions available'}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
        )}

        <Grid item xs={12} md={4}>
          <Card title={`This Month's Stats${selectedEmployee !== 'all' && hasPermission(USER_ROLES.MANAGER) ? ` - ${getAccessibleEmployees().find(emp => (emp.id || emp.uid) === selectedEmployee)?.firstName || 'Employee'}` : ''}`}>
            <Box className="space-y-3">
              {(() => {
                // Calculate stats for selected employee or current user
                let relevantStats = stats;
                
                if (hasPermission(USER_ROLES.MANAGER) && selectedEmployee !== 'all') {
                  // Calculate stats for selected employee
                  const currentMonth = new Date().getMonth();
                  const currentYear = new Date().getFullYear();
                  const employeeAttendance = attendance.filter(att => 
                    att.employeeId === selectedEmployee &&
                    new Date(att.date).getMonth() === currentMonth &&
                    new Date(att.date).getFullYear() === currentYear
                  );
                  
                  relevantStats = {
                    present: employeeAttendance.filter(att => att.status === ATTENDANCE_STATUS.PRESENT).length,
                    late: employeeAttendance.filter(att => att.status === ATTENDANCE_STATUS.LATE).length,
                    absent: employeeAttendance.filter(att => att.status === ATTENDANCE_STATUS.ABSENT).length,
                    halfDay: employeeAttendance.filter(att => att.status === ATTENDANCE_STATUS.HALF_DAY).length,
                    averageHours: employeeAttendance.length > 0 
                      ? employeeAttendance.reduce((sum, att) => sum + (att.workingHours || 0), 0) / employeeAttendance.length 
                      : 0
                  };
                }
                
                return (
                  <>
                    <Box className="flex items-center justify-between">
                      <Typography variant="body2">Present Days</Typography>
                      <Typography variant="body2" className="font-medium text-green-600">
                        {relevantStats.present}
                      </Typography>
                    </Box>
                    <Box className="flex items-center justify-between">
                      <Typography variant="body2">Late Days</Typography>
                      <Typography variant="body2" className="font-medium text-orange-600">
                        {relevantStats.late}
                      </Typography>
                    </Box>
                    <Box className="flex items-center justify-between">
                      <Typography variant="body2">Absent Days</Typography>
                      <Typography variant="body2" className="font-medium text-red-600">
                        {relevantStats.absent}
                      </Typography>
                    </Box>
                    <Box className="flex items-center justify-between">
                      <Typography variant="body2">Avg Hours/Day</Typography>
                      <Typography variant="body2" className="font-medium">
                        {relevantStats.averageHours.toFixed(1)}h
                      </Typography>
                    </Box>
                  </>
                );
              })()
              }
            </Box>
          </Card>
        </Grid>
      </Grid>

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
            <Tab label={(
              <Badge 
                badgeContent={getFilteredAttendance().length} 
                color="primary" 
                showZero={false}
                invisible={currentTab !== 0}
              >
                All Records
              </Badge>
            )} />
            <Tab label={(
              <Badge 
                badgeContent={attendance.filter(att => att.status === ATTENDANCE_STATUS.PRESENT && (selectedEmployee === 'all' || att.employeeId === selectedEmployee)).length} 
                color="success" 
                showZero={false}
                invisible={currentTab !== 1}
              >
                Present
              </Badge>
            )} />
            <Tab label={(
              <Badge 
                badgeContent={attendance.filter(att => att.status === ATTENDANCE_STATUS.LATE && (selectedEmployee === 'all' || att.employeeId === selectedEmployee)).length} 
                color="warning" 
                showZero={false}
                invisible={currentTab !== 2}
              >
                Late
              </Badge>
            )} />
            <Tab label={(
              <Badge 
                badgeContent={attendance.filter(att => att.status === ATTENDANCE_STATUS.ABSENT && (selectedEmployee === 'all' || att.employeeId === selectedEmployee)).length} 
                color="error" 
                showZero={false}
                invisible={currentTab !== 3}
              >
                Absent
              </Badge>
            )} />
            <Tab label={(
              <Badge 
                badgeContent={getMissingAttendanceRecords().filter(att => selectedEmployee === 'all' || att.employeeId === selectedEmployee).length} 
                color="secondary" 
                showZero={false}
                invisible={currentTab !== 4}
              >
                Missing
              </Badge>
            )} />
            <Tab 
              icon={<CalendarIcon />}
              label="Calendar View" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Content based on selected tab */}
        {currentTab === 5 ? (
          // Calendar View
          renderCalendarView()
        ) : (
          // Table View
          <Table
            columns={columns}
            data={getFilteredAttendance()}
            loading={loading}
            emptyMessage={currentTab === 4 ? "No missing attendance records found" : "No attendance records found"}
            pagination
            rowsPerPage={10}
          />
        )}
      </Card>
    </Box>
  );
};

export default Attendance;