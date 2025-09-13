import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/index.js';
import { USER_ROLES } from '../constants/index.js';

// Initial state
const initialState = {
  user: null,
  userData: null,
  loading: true,
  error: null,
  isAuthenticated: false
};

// Action types
const AuthActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_USER_DATA: 'SET_USER_DATA',
  SET_ERROR: 'SET_ERROR',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case AuthActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
        error: null
      };
    case AuthActionTypes.SET_USER_DATA:
      return {
        ...state,
        userData: action.payload
      };
    case AuthActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case AuthActionTypes.LOGOUT:
      return {
        ...initialState,
        loading: false
      };
    case AuthActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Actions
  const setLoading = (loading) => {
    dispatch({ type: AuthActionTypes.SET_LOADING, payload: loading });
  };

  const setUser = (user) => {
    dispatch({ type: AuthActionTypes.SET_USER, payload: user });
  };

  const setUserData = (userData) => {
    dispatch({ type: AuthActionTypes.SET_USER_DATA, payload: userData });
  };

  const setError = (error) => {
    dispatch({ type: AuthActionTypes.SET_ERROR, payload: error });
  };

  const clearError = () => {
    dispatch({ type: AuthActionTypes.CLEAR_ERROR });
  };

  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: AuthActionTypes.LOGOUT });
    } catch (error) {
      setError(error.message);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      clearError();
      
      const result = await authService.login(email, password);
      
      if (result.success) {
        setUser(result.user);
        // Fetch user data
        const userDataResult = await authService.getCurrentUserData(result.user.uid);
        if (userDataResult.success) {
          setUserData(userDataResult.data);
        }
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

  const register = async (email, password, userData) => {
    try {
      setLoading(true);
      clearError();
      
      const result = await authService.register(email, password, userData);
      
      if (result.success) {
        setUser(result.user);
        setUserData({
          uid: result.user.uid,
          email: result.user.email,
          ...userData,
          role: userData.role || USER_ROLES.EMPLOYEE
        });
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

  // Check if user has specific role
  const hasRole = (role) => {
    return state.userData?.role === role;
  };

  // Check if user has permission (admin has all permissions)
  const hasPermission = (requiredRole) => {
    const userRole = state.userData?.role;
    if (userRole === USER_ROLES.ADMIN) return true;
    if (requiredRole === USER_ROLES.MANAGER) {
      return [USER_ROLES.MANAGER, USER_ROLES.ADMIN].includes(userRole);
    }
    return userRole === requiredRole;
  };

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (user) => {
      if (user) {
        setUser(user);
        // Fetch user data
        const userDataResult = await authService.getCurrentUserData(user.uid);
        if (userDataResult.success) {
          setUserData(userDataResult.data);
        }
      } else {
        dispatch({ type: AuthActionTypes.LOGOUT });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
    hasRole,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};