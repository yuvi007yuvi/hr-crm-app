import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { dbService } from '../services/index.js';
import { useAuth } from './AuthContext.jsx';
import { COLLECTIONS } from '../constants/index.js';

// Initial state
const initialState = {
  employees: [],
  currentEmployee: null,
  loading: false,
  error: null,
  stats: {
    total: 0,
    active: 0,
    byDepartment: {}
  }
};

// Action types
const EmployeeActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_EMPLOYEES: 'SET_EMPLOYEES',
  SET_CURRENT_EMPLOYEE: 'SET_CURRENT_EMPLOYEE',
  ADD_EMPLOYEE: 'ADD_EMPLOYEE',
  UPDATE_EMPLOYEE: 'UPDATE_EMPLOYEE',
  DELETE_EMPLOYEE: 'DELETE_EMPLOYEE',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_STATS: 'UPDATE_STATS'
};

// Reducer
const employeeReducer = (state, action) => {
  switch (action.type) {
    case EmployeeActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case EmployeeActionTypes.SET_EMPLOYEES:
      return {
        ...state,
        employees: action.payload,
        loading: false,
        error: null
      };
    case EmployeeActionTypes.SET_CURRENT_EMPLOYEE:
      return {
        ...state,
        currentEmployee: action.payload
      };
    case EmployeeActionTypes.ADD_EMPLOYEE:
      return {
        ...state,
        employees: [action.payload, ...state.employees]
      };
    case EmployeeActionTypes.UPDATE_EMPLOYEE:
      return {
        ...state,
        employees: state.employees.map(emp => 
          emp.id === action.payload.id ? action.payload : emp
        ),
        currentEmployee: state.currentEmployee?.id === action.payload.id 
          ? action.payload 
          : state.currentEmployee
      };
    case EmployeeActionTypes.DELETE_EMPLOYEE:
      return {
        ...state,
        employees: state.employees.filter(emp => emp.id !== action.payload),
        currentEmployee: state.currentEmployee?.id === action.payload 
          ? null 
          : state.currentEmployee
      };
    case EmployeeActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case EmployeeActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    case EmployeeActionTypes.UPDATE_STATS:
      return {
        ...state,
        stats: action.payload
      };
    default:
      return state;
  }
};

// Create context
const EmployeeContext = createContext();

// Employee provider component
export const EmployeeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(employeeReducer, initialState);
  const { hasPermission, userData } = useAuth();

  // Actions
  const setLoading = (loading) => {
    dispatch({ type: EmployeeActionTypes.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: EmployeeActionTypes.SET_ERROR, payload: error });
  };

  const clearError = () => {
    dispatch({ type: EmployeeActionTypes.CLEAR_ERROR });
  };

  const calculateStats = useCallback((employees) => {
    const stats = {
      total: employees.length,
      active: employees.filter(emp => emp.isActive).length,
      byDepartment: {}
    };

    employees.forEach(emp => {
      if (emp.department) {
        stats.byDepartment[emp.department] = (stats.byDepartment[emp.department] || 0) + 1;
      }
    });

    dispatch({ type: EmployeeActionTypes.UPDATE_STATS, payload: stats });
  }, []);

  // Fetch all employees (registered users)
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      
      // Fetch all registered users instead of just employees collection
      const result = await dbService.users.getAll();
      
      if (result.success) {
        dispatch({ type: EmployeeActionTypes.SET_EMPLOYEES, payload: result.data });
        calculateStats(result.data);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  // Get employee by ID
  const getEmployee = async (employeeId) => {
    try {
      const result = await dbService.users.read(employeeId);
      
      if (result.success) {
        dispatch({ type: EmployeeActionTypes.SET_CURRENT_EMPLOYEE, payload: result.data });
        return result.data;
      } else {
        setError(result.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    }
  };

  // Add new employee (register as user)
  const addEmployee = async (employeeData) => {
    try {
      setLoading(true);
      clearError();
      
      // Add to users collection since we're showing all registered users
      const result = await dbService.users.create({
        ...employeeData,
        uid: null, // Will be set when user actually registers
        email: employeeData.email,
        joinDate: employeeData.hireDate, // Map hireDate to joinDate for consistency
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      if (result.success) {
        const newEmployee = { id: result.id, ...employeeData };
        dispatch({ type: EmployeeActionTypes.ADD_EMPLOYEE, payload: newEmployee });
        calculateStats([newEmployee, ...state.employees]);
        return { success: true, data: newEmployee };
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

  // Update employee (user)
  const updateEmployee = async (employeeId, employeeData) => {
    try {
      setLoading(true);
      clearError();
      
      const result = await dbService.users.update(employeeId, employeeData);
      
      if (result.success) {
        const updatedEmployee = { id: employeeId, ...employeeData };
        dispatch({ type: EmployeeActionTypes.UPDATE_EMPLOYEE, payload: updatedEmployee });
        calculateStats(state.employees.map(emp => 
          emp.id === employeeId ? updatedEmployee : emp
        ));
        return { success: true, data: updatedEmployee };
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

  // Delete employee (user)
  const deleteEmployee = async (employeeId) => {
    try {
      setLoading(true);
      clearError();
      
      const result = await dbService.users.delete(employeeId);
      
      if (result.success) {
        dispatch({ type: EmployeeActionTypes.DELETE_EMPLOYEE, payload: employeeId });
        const remainingEmployees = state.employees.filter(emp => emp.id !== employeeId);
        calculateStats(remainingEmployees);
        return { success: true };
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

  // Get employees by department
  const getEmployeesByDepartment = useCallback(async (department) => {
    try {
      const result = await dbService.getWhere(COLLECTIONS.USERS, 'department', '==', department);
      
      if (result.success) {
        return result.data;
      } else {
        setError(result.error);
        return [];
      }
    } catch (error) {
      setError(error.message);
      return [];
    }
  }, []);

  // Initialize employees data on mount
  useEffect(() => {
    if (userData && hasPermission('manager')) {
      fetchEmployees();
    }
  }, [userData, hasPermission, fetchEmployees]);

  const value = {
    ...state,
    fetchEmployees,
    getEmployee,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeesByDepartment,
    clearError
  };

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
};

// Custom hook to use employee context
export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployee must be used within an EmployeeProvider');
  }
  return context;
};