import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { dbService } from '../services/index.js';
import { useAuth } from './AuthContext.jsx';
import { LEAVE_STATUS, LEAVE_TYPES, DEFAULT_LEAVE_BALANCE } from '../constants/index.js';

// Initial state
const initialState = {
  leaves: [],
  currentLeave: null,
  leaveBalance: DEFAULT_LEAVE_BALANCE,
  loading: false,
  error: null,
  stats: {
    pending: 0,
    approved: 0,
    rejected: 0,
    byType: {}
  }
};

// Action types
const LeaveActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_LEAVES: 'SET_LEAVES',
  SET_CURRENT_LEAVE: 'SET_CURRENT_LEAVE',
  SET_LEAVE_BALANCE: 'SET_LEAVE_BALANCE',
  ADD_LEAVE: 'ADD_LEAVE',
  UPDATE_LEAVE: 'UPDATE_LEAVE',
  DELETE_LEAVE: 'DELETE_LEAVE',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_STATS: 'UPDATE_STATS'
};

// Reducer
const leaveReducer = (state, action) => {
  switch (action.type) {
    case LeaveActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case LeaveActionTypes.SET_LEAVES:
      return {
        ...state,
        leaves: action.payload,
        loading: false,
        error: null
      };
    case LeaveActionTypes.SET_CURRENT_LEAVE:
      return {
        ...state,
        currentLeave: action.payload
      };
    case LeaveActionTypes.SET_LEAVE_BALANCE:
      return {
        ...state,
        leaveBalance: action.payload
      };
    case LeaveActionTypes.ADD_LEAVE:
      return {
        ...state,
        leaves: [action.payload, ...state.leaves]
      };
    case LeaveActionTypes.UPDATE_LEAVE:
      return {
        ...state,
        leaves: state.leaves.map(leave => 
          leave.id === action.payload.id ? action.payload : leave
        ),
        currentLeave: state.currentLeave?.id === action.payload.id 
          ? action.payload 
          : state.currentLeave
      };
    case LeaveActionTypes.DELETE_LEAVE:
      return {
        ...state,
        leaves: state.leaves.filter(leave => leave.id !== action.payload),
        currentLeave: state.currentLeave?.id === action.payload 
          ? null 
          : state.currentLeave
      };
    case LeaveActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case LeaveActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    case LeaveActionTypes.UPDATE_STATS:
      return {
        ...state,
        stats: action.payload
      };
    default:
      return state;
  }
};

// Create context
const LeaveContext = createContext();

// Leave provider component
export const LeaveProvider = ({ children }) => {
  const [state, dispatch] = useReducer(leaveReducer, initialState);
  const { userData, hasPermission } = useAuth();
  
  // Get notification context if available
  let notificationContext = null;
  try {
    notificationContext = useContext(React.createContext());
  } catch (e) {
    // Notification context not available
  }

  // Actions
  const setLoading = (loading) => {
    dispatch({ type: LeaveActionTypes.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: LeaveActionTypes.SET_ERROR, payload: error });
  };

  const clearError = () => {
    dispatch({ type: LeaveActionTypes.CLEAR_ERROR });
  };

  const calculateStats = (leaves) => {
    const stats = {
      pending: leaves.filter(leave => leave.status === LEAVE_STATUS.PENDING).length,
      approved: leaves.filter(leave => leave.status === LEAVE_STATUS.APPROVED).length,
      rejected: leaves.filter(leave => leave.status === LEAVE_STATUS.REJECTED).length,
      byType: {}
    };

    leaves.forEach(leave => {
      if (leave.type) {
        stats.byType[leave.type] = (stats.byType[leave.type] || 0) + 1;
      }
    });

    dispatch({ type: LeaveActionTypes.UPDATE_STATS, payload: stats });
  };

  const calculateLeaveBalance = (leaves, employeeId) => {
    const balance = { ...DEFAULT_LEAVE_BALANCE };
    
    // Calculate used leaves for the current year
    const currentYear = new Date().getFullYear();
    const approvedLeaves = leaves.filter(leave => 
      leave.employeeId === employeeId &&
      leave.status === LEAVE_STATUS.APPROVED &&
      new Date(leave.startDate).getFullYear() === currentYear
    );

    approvedLeaves.forEach(leave => {
      const days = calculateLeaveDays(leave.startDate, leave.endDate);
      if (balance[leave.type] !== undefined) {
        balance[leave.type] -= days;
      }
    });

    dispatch({ type: LeaveActionTypes.SET_LEAVE_BALANCE, payload: balance });
    return balance;
  };

  const calculateLeaveDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  // Check monthly leave limit (4 leaves per month)
  const checkMonthlyLeaveLimit = (employeeId, startDate) => {
    const leaveDate = new Date(startDate);
    const year = leaveDate.getFullYear();
    const month = leaveDate.getMonth();
    
    // Count leaves in the same month (including pending and approved)
    const monthlyLeaves = state.leaves.filter(leave => {
      const leaveStartDate = new Date(leave.startDate);
      return (
        leave.employeeId === employeeId &&
        leaveStartDate.getFullYear() === year &&
        leaveStartDate.getMonth() === month &&
        (leave.status === LEAVE_STATUS.PENDING || leave.status === LEAVE_STATUS.APPROVED)
      );
    });
    
    return monthlyLeaves.length < 4; // Allow only 4 leaves per month
  };

  // Fetch leaves based on user role
  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      
      let result;
      
      if (hasPermission('admin') || hasPermission('manager')) {
        // Admin and managers can see all leaves
        result = await dbService.leaves.getAll();
      } else {
        // Employees can only see their own leaves
        result = await dbService.leaves.getByEmployee(userData.uid);
      }
      
      if (result.success) {
        dispatch({ type: LeaveActionTypes.SET_LEAVES, payload: result.data });
        calculateStats(result.data);
        
        // Calculate leave balance for current user
        if (userData.uid) {
          calculateLeaveBalance(result.data, userData.uid);
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

  // Apply for leave
  const applyLeave = async (leaveData) => {
    try {
      setLoading(true);
      clearError();
      
      // Check monthly leave limit
      const canApply = checkMonthlyLeaveLimit(userData.uid, leaveData.startDate);
      if (!canApply) {
        const monthName = new Date(leaveData.startDate).toLocaleString('default', { month: 'long', year: 'numeric' });
        setError(`You have reached the maximum limit of 4 leaves for ${monthName}. Please choose a different month.`);
        return { success: false, error: `Maximum 4 leaves allowed per month. You have reached the limit for ${monthName}.` };
      }
      
      const leaveRequest = {
        ...leaveData,
        employeeId: userData.uid,
        employeeName: `${userData.firstName} ${userData.lastName}`,
        employeeEmail: userData.email,
        department: userData.department,
        employeeReportingHeadId: userData.reportingHeadId || null,
        employeeReportingHeadName: userData.reportingHeadName || null,
        status: LEAVE_STATUS.PENDING,
        appliedDate: new Date().toISOString(),
        days: calculateLeaveDays(leaveData.startDate, leaveData.endDate)
      };
      
      const result = await dbService.leaves.create(leaveRequest);
      
      if (result.success) {
        const newLeave = { id: result.id, ...leaveRequest };
        dispatch({ type: LeaveActionTypes.ADD_LEAVE, payload: newLeave });
        calculateStats([newLeave, ...state.leaves]);
        return { success: true, data: newLeave };
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

  // Update leave status (approve/reject)
  const updateLeaveStatus = async (leaveId, status, reviewerComments = '') => {
    try {
      setLoading(true);
      clearError();
      
      const updateData = {
        status,
        reviewerComments,
        reviewedBy: userData.uid,
        reviewedDate: new Date().toISOString()
      };
      
      const result = await dbService.leaves.update(leaveId, updateData);
      
      if (result.success) {
        const currentLeave = state.leaves.find(leave => leave.id === leaveId);
        const updatedLeave = { ...currentLeave, ...updateData };
        dispatch({ type: LeaveActionTypes.UPDATE_LEAVE, payload: updatedLeave });
        
        // Recalculate stats
        const updatedLeaves = state.leaves.map(leave => 
          leave.id === leaveId ? updatedLeave : leave
        );
        calculateStats(updatedLeaves);
        
        // Recalculate balance if it's approved/rejected
        if (status === LEAVE_STATUS.APPROVED || status === LEAVE_STATUS.REJECTED) {
          calculateLeaveBalance(updatedLeaves, currentLeave.employeeId);
        }
        
        return { success: true, data: updatedLeave };
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

  // Cancel leave request
  const cancelLeave = async (leaveId) => {
    try {
      setLoading(true);
      clearError();
      
      const result = await dbService.leaves.update(leaveId, {
        status: LEAVE_STATUS.CANCELLED,
        cancelledDate: new Date().toISOString()
      });
      
      if (result.success) {
        const currentLeave = state.leaves.find(leave => leave.id === leaveId);
        const updatedLeave = { 
          ...currentLeave, 
          status: LEAVE_STATUS.CANCELLED,
          cancelledDate: new Date().toISOString()
        };
        dispatch({ type: LeaveActionTypes.UPDATE_LEAVE, payload: updatedLeave });
        
        const updatedLeaves = state.leaves.map(leave => 
          leave.id === leaveId ? updatedLeave : leave
        );
        calculateStats(updatedLeaves);
        
        return { success: true, data: updatedLeave };
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

  // Get pending leaves (for managers/admin)
  const getPendingLeaves = () => {
    return state.leaves.filter(leave => leave.status === LEAVE_STATUS.PENDING);
  };

  // Get pending leaves that can be approved by current user (reporting head logic)
  const getApprovablePendingLeaves = () => {
    if (!userData) return [];
    
    const pendingLeaves = state.leaves.filter(leave => leave.status === LEAVE_STATUS.PENDING);
    
    // Admin can approve all leaves
    if (hasPermission('admin')) {
      return pendingLeaves;
    }
    
    // Managers/Reporting heads can only approve leaves of their direct reports
    if (hasPermission('manager')) {
      return pendingLeaves.filter(leave => {
        // Check if current user is the reporting head of the leave applicant
        return leave.employeeReportingHeadId === userData.uid || 
               leave.employeeReportingHeadId === userData.id;
      });
    }
    
    // Regular employees cannot approve any leaves
    return [];
  };

  // Get leaves by employee
  const getLeavesByEmployee = (employeeId) => {
    return state.leaves.filter(leave => leave.employeeId === employeeId);
  };

  // Initialize leaves data on mount
  useEffect(() => {
    if (userData) {
      fetchLeaves();
    }
  }, [userData, fetchLeaves]);

  const value = {
    ...state,
    fetchLeaves,
    applyLeave,
    updateLeaveStatus,
    cancelLeave,
    getPendingLeaves,
    getApprovablePendingLeaves,
    getLeavesByEmployee,
    calculateLeaveDays,
    checkMonthlyLeaveLimit,
    clearError
  };

  return (
    <LeaveContext.Provider value={value}>
      {children}
    </LeaveContext.Provider>
  );
};

// Custom hook to use leave context
export const useLeave = () => {
  const context = useContext(LeaveContext);
  if (!context) {
    throw new Error('useLeave must be used within a LeaveProvider');
  }
  return context;
};