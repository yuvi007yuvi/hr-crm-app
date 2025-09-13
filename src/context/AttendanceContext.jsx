import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { dbService } from '../services/index.js';
import { useAuth } from './AuthContext.jsx';
import { ATTENDANCE_STATUS, WORKING_HOURS } from '../constants/index.js';

// Initial state
const initialState = {
  attendance: [],
  currentAttendance: null,
  todayAttendance: null,
  loading: false,
  error: null,
  stats: {
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    totalHours: 0,
    averageHours: 0
  }
};

// Action types
const AttendanceActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ATTENDANCE: 'SET_ATTENDANCE',
  SET_CURRENT_ATTENDANCE: 'SET_CURRENT_ATTENDANCE',
  SET_TODAY_ATTENDANCE: 'SET_TODAY_ATTENDANCE',
  ADD_ATTENDANCE: 'ADD_ATTENDANCE',
  UPDATE_ATTENDANCE: 'UPDATE_ATTENDANCE',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_STATS: 'UPDATE_STATS'
};

// Reducer
const attendanceReducer = (state, action) => {
  switch (action.type) {
    case AttendanceActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case AttendanceActionTypes.SET_ATTENDANCE:
      return {
        ...state,
        attendance: action.payload,
        loading: false,
        error: null
      };
    case AttendanceActionTypes.SET_CURRENT_ATTENDANCE:
      return {
        ...state,
        currentAttendance: action.payload
      };
    case AttendanceActionTypes.SET_TODAY_ATTENDANCE:
      return {
        ...state,
        todayAttendance: action.payload
      };
    case AttendanceActionTypes.ADD_ATTENDANCE:
      return {
        ...state,
        attendance: [action.payload, ...state.attendance]
      };
    case AttendanceActionTypes.UPDATE_ATTENDANCE:
      return {
        ...state,
        attendance: state.attendance.map(att => 
          att.id === action.payload.id ? action.payload : att
        ),
        currentAttendance: state.currentAttendance?.id === action.payload.id 
          ? action.payload 
          : state.currentAttendance,
        todayAttendance: state.todayAttendance?.id === action.payload.id 
          ? action.payload 
          : state.todayAttendance
      };
    case AttendanceActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case AttendanceActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    case AttendanceActionTypes.UPDATE_STATS:
      return {
        ...state,
        stats: action.payload
      };
    default:
      return state;
  }
};

// Create context
const AttendanceContext = createContext();

// Attendance provider component
export const AttendanceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(attendanceReducer, initialState);
  const { userData, hasPermission } = useAuth();

  // Actions
  const setLoading = (loading) => {
    dispatch({ type: AttendanceActionTypes.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: AttendanceActionTypes.SET_ERROR, payload: error });
  };

  const clearError = () => {
    dispatch({ type: AttendanceActionTypes.CLEAR_ERROR });
  };

  // Utility functions
  const formatTime = (date) => {
    return date.toTimeString().slice(0, 5); // HH:MM format
  };

  const calculateWorkingHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    
    const checkInTime = new Date(checkIn);
    const checkOutTime = new Date(checkOut);
    const diffMs = checkOutTime - checkInTime;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    // Subtract lunch break (1 hour) if worked more than 4 hours
    return diffHours > 4 ? Math.max(0, diffHours - 1) : diffHours;
  };

  const determineAttendanceStatus = (checkInTime, workingHours) => {
    const checkInHour = new Date(checkInTime).getHours();
    const workStartHour = parseInt(WORKING_HOURS.START.split(':')[0]);
    
    if (workingHours >= WORKING_HOURS.FULL_DAY_HOURS) {
      return checkInHour > workStartHour ? ATTENDANCE_STATUS.LATE : ATTENDANCE_STATUS.PRESENT;
    } else if (workingHours >= WORKING_HOURS.HALF_DAY_HOURS) {
      return ATTENDANCE_STATUS.HALF_DAY;
    } else {
      return ATTENDANCE_STATUS.ABSENT;
    }
  };

  const calculateStats = (attendance, employeeId = null) => {
    let relevantAttendance = attendance;
    
    // If employeeId is provided, filter for that employee
    if (employeeId) {
      relevantAttendance = attendance.filter(att => att.employeeId === employeeId);
    }

    const stats = {
      present: relevantAttendance.filter(att => att.status === ATTENDANCE_STATUS.PRESENT).length,
      absent: relevantAttendance.filter(att => att.status === ATTENDANCE_STATUS.ABSENT).length,
      late: relevantAttendance.filter(att => att.status === ATTENDANCE_STATUS.LATE).length,
      halfDay: relevantAttendance.filter(att => att.status === ATTENDANCE_STATUS.HALF_DAY).length,
      totalHours: 0,
      averageHours: 0
    };

    // Calculate total and average hours
    const workingDays = relevantAttendance.filter(att => 
      att.status !== ATTENDANCE_STATUS.ABSENT && att.workingHours > 0
    );
    
    stats.totalHours = workingDays.reduce((total, att) => total + att.workingHours, 0);
    stats.averageHours = workingDays.length > 0 ? stats.totalHours / workingDays.length : 0;

    dispatch({ type: AttendanceActionTypes.UPDATE_STATS, payload: stats });
    return stats;
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Fetch attendance based on user role
  const fetchAttendance = useCallback(async (employeeId = null, startDate = null, endDate = null) => {
    try {
      setLoading(true);
      clearError();
      
      let result;
      
      if (hasPermission('admin') || hasPermission('manager')) {
        // Admin and managers can see all attendance
        if (employeeId) {
          result = await dbService.attendance.getByEmployee(employeeId);
        } else {
          result = await dbService.attendance.getAll();
        }
      } else {
        // Employees can only see their own attendance
        result = await dbService.attendance.getByEmployee(userData.uid);
      }
      
      if (result.success) {
        let attendanceData = result.data;
        
        // Filter by date range if provided
        if (startDate && endDate) {
          attendanceData = attendanceData.filter(att => {
            const attDate = att.date;
            return attDate >= startDate && attDate <= endDate;
          });
        }
        
        dispatch({ type: AttendanceActionTypes.SET_ATTENDANCE, payload: attendanceData });
        calculateStats(attendanceData, employeeId || userData.uid);
        
        // Set today's attendance if exists
        const todayDate = getTodayDate();
        const todayAtt = attendanceData.find(att => 
          att.date === todayDate && att.employeeId === (employeeId || userData.uid)
        );
        if (todayAtt) {
          dispatch({ type: AttendanceActionTypes.SET_TODAY_ATTENDANCE, payload: todayAtt });
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [hasPermission, userData]);

  // Check in
  const checkIn = async () => {
    try {
      setLoading(true);
      clearError();
      
      const now = new Date();
      const todayDate = getTodayDate();
      
      // Check if already checked in today
      const existingAttendance = state.attendance.find(att => 
        att.date === todayDate && att.employeeId === userData.uid
      );
      
      if (existingAttendance && existingAttendance.checkIn) {
        setError('Already checked in today');
        return { success: false, error: 'Already checked in today' };
      }
      
      const attendanceData = {
        employeeId: userData.uid,
        employeeName: `${userData.firstName} ${userData.lastName}`,
        employeeEmail: userData.email,
        department: userData.department,
        date: todayDate,
        checkIn: now.toISOString(),
        checkInTime: formatTime(now),
        status: ATTENDANCE_STATUS.PRESENT,
        workingHours: 0
      };
      
      let result;
      if (existingAttendance) {
        // Update existing record
        result = await dbService.attendance.update(existingAttendance.id, {
          checkIn: attendanceData.checkIn,
          checkInTime: attendanceData.checkInTime,
          status: attendanceData.status
        });
        if (result.success) {
          const updatedAttendance = { ...existingAttendance, ...attendanceData };
          dispatch({ type: AttendanceActionTypes.UPDATE_ATTENDANCE, payload: updatedAttendance });
          dispatch({ type: AttendanceActionTypes.SET_TODAY_ATTENDANCE, payload: updatedAttendance });
          return { success: true, data: updatedAttendance };
        }
      } else {
        // Create new record
        result = await dbService.attendance.create(attendanceData);
        if (result.success) {
          const newAttendance = { id: result.id, ...attendanceData };
          dispatch({ type: AttendanceActionTypes.ADD_ATTENDANCE, payload: newAttendance });
          dispatch({ type: AttendanceActionTypes.SET_TODAY_ATTENDANCE, payload: newAttendance });
          return { success: true, data: newAttendance };
        }
      }
      
      if (!result.success) {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Check out
  const checkOut = async () => {
    try {
      setLoading(true);
      clearError();
      
      const now = new Date();
      const todayDate = getTodayDate();
      
      // Find today's attendance record
      const todayAttendance = state.attendance.find(att => 
        att.date === todayDate && att.employeeId === userData.uid
      );
      
      if (!todayAttendance || !todayAttendance.checkIn) {
        setError('Please check in first');
        return { success: false, error: 'Please check in first' };
      }
      
      if (todayAttendance.checkOut) {
        setError('Already checked out today');
        return { success: false, error: 'Already checked out today' };
      }
      
      const workingHours = calculateWorkingHours(todayAttendance.checkIn, now.toISOString());
      const status = determineAttendanceStatus(todayAttendance.checkIn, workingHours);
      
      const updateData = {
        checkOut: now.toISOString(),
        checkOutTime: formatTime(now),
        workingHours: Math.round(workingHours * 100) / 100, // Round to 2 decimal places
        status
      };
      
      const result = await dbService.attendance.update(todayAttendance.id, updateData);
      
      if (result.success) {
        const updatedAttendance = { ...todayAttendance, ...updateData };
        dispatch({ type: AttendanceActionTypes.UPDATE_ATTENDANCE, payload: updatedAttendance });
        dispatch({ type: AttendanceActionTypes.SET_TODAY_ATTENDANCE, payload: updatedAttendance });
        
        // Recalculate stats
        const updatedAttendanceList = state.attendance.map(att => 
          att.id === todayAttendance.id ? updatedAttendance : att
        );
        calculateStats(updatedAttendanceList, userData.uid);
        
        return { success: true, data: updatedAttendance };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get attendance by date range
  const getAttendanceByDateRange = (startDate, endDate, employeeId = null) => {
    let relevantAttendance = state.attendance;
    
    if (employeeId) {
      relevantAttendance = relevantAttendance.filter(att => att.employeeId === employeeId);
    }
    
    return relevantAttendance.filter(att => {
      const attDate = att.date;
      return attDate >= startDate && attDate <= endDate;
    });
  };

  // Get monthly attendance
  const getMonthlyAttendance = (year, month, employeeId = null) => {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;
    return getAttendanceByDateRange(startDate, endDate, employeeId);
  };

  // Check if user is checked in today
  const isCheckedInToday = () => {
    return state.todayAttendance?.checkIn && !state.todayAttendance?.checkOut;
  };

  // Check if user can check in today
  const canCheckInToday = () => {
    return !state.todayAttendance?.checkIn;
  };

  // Check if user can check out today
  const canCheckOutToday = () => {
    return state.todayAttendance?.checkIn && !state.todayAttendance?.checkOut;
  };

  // Initialize attendance data on mount
  useEffect(() => {
    if (userData) {
      fetchAttendance();
    }
  }, [userData, fetchAttendance]);

  const value = {
    ...state,
    fetchAttendance,
    checkIn,
    checkOut,
    getAttendanceByDateRange,
    getMonthlyAttendance,
    isCheckedInToday,
    canCheckInToday,
    canCheckOutToday,
    calculateWorkingHours,
    clearError
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};

// Custom hook to use attendance context
export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};