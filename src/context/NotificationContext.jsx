import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  soundEnabled: true
};

// Action types
const NotificationActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  DELETE_NOTIFICATION: 'DELETE_NOTIFICATION',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_UNREAD_COUNT: 'UPDATE_UNREAD_COUNT',
  TOGGLE_SOUND: 'TOGGLE_SOUND'
};

// Notification types
export const NOTIFICATION_TYPES = {
  LEAVE_REQUEST: 'leave_request',
  LEAVE_APPROVED: 'leave_approved',
  LEAVE_REJECTED: 'leave_rejected',
  ATTENDANCE_REMINDER: 'attendance_reminder',
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
  TASK_ASSIGNED: 'task_assigned',
  BIRTHDAY: 'birthday',
  POLICY_UPDATE: 'policy_update'
};

// Notification priorities
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case NotificationActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case NotificationActionTypes.SET_NOTIFICATIONS:
      const unreadCount = action.payload.filter(notif => !notif.isRead).length;
      return {
        ...state,
        notifications: action.payload,
        unreadCount,
        loading: false,
        error: null
      };
    case NotificationActionTypes.ADD_NOTIFICATION:
      const newNotifications = [action.payload, ...state.notifications];
      const newUnreadCount = newNotifications.filter(notif => !notif.isRead).length;
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newUnreadCount
      };
    case NotificationActionTypes.MARK_AS_READ:
      const updatedNotifications = state.notifications.map(notif =>
        notif.id === action.payload ? { ...notif, isRead: true } : notif
      );
      const updatedUnreadCount = updatedNotifications.filter(notif => !notif.isRead).length;
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedUnreadCount
      };
    case NotificationActionTypes.MARK_ALL_AS_READ:
      const allReadNotifications = state.notifications.map(notif => ({ ...notif, isRead: true }));
      return {
        ...state,
        notifications: allReadNotifications,
        unreadCount: 0
      };
    case NotificationActionTypes.DELETE_NOTIFICATION:
      const filteredNotifications = state.notifications.filter(notif => notif.id !== action.payload);
      const filteredUnreadCount = filteredNotifications.filter(notif => !notif.isRead).length;
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredUnreadCount
      };
    case NotificationActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case NotificationActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    case NotificationActionTypes.UPDATE_UNREAD_COUNT:
      return {
        ...state,
        unreadCount: action.payload
      };
    case NotificationActionTypes.TOGGLE_SOUND:
      return {
        ...state,
        soundEnabled: action.payload
      };
    default:
      return state;
  }
};

// Create context
const NotificationContext = createContext();

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { userData } = useAuth();

  // Audio notification system
  const playNotificationSound = useCallback((notificationType = 'default', priority = 'medium') => {
    if (!state.soundEnabled) return;
    
    try {
      // Create audio context for different notification sounds
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Different frequencies and patterns for different notification types
      const soundConfig = {
        [NOTIFICATION_TYPES.LEAVE_REQUEST]: { frequency: 800, duration: 200, pattern: [1, 0.5, 1] },
        [NOTIFICATION_TYPES.LEAVE_APPROVED]: { frequency: 600, duration: 300, pattern: [1, 1, 1] },
        [NOTIFICATION_TYPES.LEAVE_REJECTED]: { frequency: 400, duration: 400, pattern: [1] },
        [NOTIFICATION_TYPES.ATTENDANCE_REMINDER]: { frequency: 500, duration: 150, pattern: [1, 0.3, 1] },
        [NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT]: { frequency: 700, duration: 250, pattern: [1, 0.7, 1, 0.7, 1] },
        [NOTIFICATION_TYPES.TASK_ASSIGNED]: { frequency: 650, duration: 200, pattern: [1, 0.5, 1, 0.5, 1] },
        [NOTIFICATION_TYPES.BIRTHDAY]: { frequency: 800, duration: 300, pattern: [1, 0.8, 1, 0.8, 1, 0.8, 1] },
        [NOTIFICATION_TYPES.POLICY_UPDATE]: { frequency: 550, duration: 350, pattern: [1, 1] },
        default: { frequency: 600, duration: 200, pattern: [1, 0.5, 1] }
      };
      
      const config = soundConfig[notificationType] || soundConfig.default;
      
      // Adjust volume based on priority
      const volumeMap = {
        [NOTIFICATION_PRIORITIES.LOW]: 0.3,
        [NOTIFICATION_PRIORITIES.MEDIUM]: 0.5,
        [NOTIFICATION_PRIORITIES.HIGH]: 0.7,
        [NOTIFICATION_PRIORITIES.URGENT]: 0.9
      };
      
      const volume = volumeMap[priority] || 0.5;
      
      // Play sound pattern
      config.pattern.forEach((intensity, index) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(config.frequency, audioContext.currentTime);
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(volume * intensity, audioContext.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + config.duration / 1000);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + config.duration / 1000);
        }, index * (config.duration + 50));
      });
      
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }, [state.soundEnabled]);

  // Alternative fallback sound using HTML5 Audio (for browsers that don't support Web Audio API)
  const playFallbackSound = useCallback(() => {
    if (!state.soundEnabled) return;
    
    try {
      // Create a simple beep sound using data URI
      const audioData = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmomBzx+zO/ZhDkHG2W+7+OZSA0PVqzn77BdGAg+ltryxHkpBSl+zPLaizsIGGS57+OSUQwKUKXh8bllHgg2jdT0z4IxBSF0xe7glEoODlOq5O+zYBoGPJPY88p9KwUme8rx3I4+CRZiturqpVITC0ml4PK8aygEOIXV8tGAMgQfe8rx3Y9ACRVhtuPpn1UQDEql4PG9ayoFN4nU9c2CMgUhdMPu45ZMDg5UqOPyvmwqBjiO0/XOgTMEInfE7eCRTw4OUarm7K5fGgg7k9byx3opBSh+y/DbjDwIF2G56+mjUhELR6Lh8L5sKgU2jdT0zn81BSJ0w+3jlUsODlOq4/G9aisFOozT9c6ANAMhdsPt4JROEBE';
      const audio = new Audio(audioData);
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Silently fail if audio cannot be played
      });
    } catch (error) {
      console.warn('Could not play fallback notification sound:', error);
    }
  }, [state.soundEnabled]);

  // Actions
  const setLoading = (loading) => {
    dispatch({ type: NotificationActionTypes.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: NotificationActionTypes.SET_ERROR, payload: error });
  };

  const clearError = () => {
    dispatch({ type: NotificationActionTypes.CLEAR_ERROR });
  };

  // Create notification
  const createNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...notification,
      createdAt: new Date().toISOString(),
      isRead: false,
      userId: notification.userId || userData?.uid
    };
    
    dispatch({ type: NotificationActionTypes.ADD_NOTIFICATION, payload: newNotification });
    
    // Play notification sound for new notifications (not for loaded notifications)
    if (notification.playSound !== false) {
      setTimeout(() => {
        playNotificationSound(notification.type, notification.priority);
      }, 100);
    }
    
    return newNotification;
  }, [userData, playNotificationSound]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    dispatch({ type: NotificationActionTypes.MARK_AS_READ, payload: notificationId });
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    dispatch({ type: NotificationActionTypes.MARK_ALL_AS_READ });
  }, []);

  // Delete notification
  const deleteNotification = useCallback((notificationId) => {
    dispatch({ type: NotificationActionTypes.DELETE_NOTIFICATION, payload: notificationId });
  }, []);

  // Toggle notification sound
  const toggleNotificationSound = useCallback((enabled) => {
    dispatch({ type: NotificationActionTypes.TOGGLE_SOUND, payload: enabled });
    
    // Save sound preference to localStorage
    if (userData) {
      try {
        localStorage.setItem(`notification_sound_${userData.uid}`, JSON.stringify(enabled));
      } catch (error) {
        console.error('Error saving sound preference:', error);
      }
    }
    
    // Play test sound when enabling
    if (enabled) {
      setTimeout(() => {
        playNotificationSound('default', NOTIFICATION_PRIORITIES.MEDIUM);
      }, 200);
    }
  }, [userData, playNotificationSound]);

  // Get notifications for current user
  const getUserNotifications = useCallback(() => {
    return state.notifications.filter(notif => 
      notif.userId === userData?.uid || 
      notif.userId === userData?.id ||
      notif.isGlobal
    );
  }, [state.notifications, userData]);

  // Create system notifications based on events
  const createLeaveRequestNotification = useCallback((leaveRequest, managerId) => {
    if (!managerId) return;
    
    return createNotification({
      type: NOTIFICATION_TYPES.LEAVE_REQUEST,
      title: 'New Leave Request',
      message: `${leaveRequest.employeeName} has submitted a leave request for ${leaveRequest.days} days`,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      userId: managerId,
      data: {
        leaveId: leaveRequest.id,
        employeeId: leaveRequest.employeeId,
        employeeName: leaveRequest.employeeName,
        type: leaveRequest.type,
        days: leaveRequest.days,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate
      },
      actionUrl: '/leave-requests'
    });
  }, [createNotification]);

  const createLeaveStatusNotification = useCallback((leaveRequest, status) => {
    const isApproved = status === 'approved';
    
    return createNotification({
      type: isApproved ? NOTIFICATION_TYPES.LEAVE_APPROVED : NOTIFICATION_TYPES.LEAVE_REJECTED,
      title: `Leave Request ${isApproved ? 'Approved' : 'Rejected'}`,
      message: `Your ${leaveRequest.type} leave request for ${leaveRequest.days} days has been ${status}`,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      userId: leaveRequest.employeeId,
      data: {
        leaveId: leaveRequest.id,
        type: leaveRequest.type,
        days: leaveRequest.days,
        status
      },
      actionUrl: '/leave-requests'
    });
  }, [createNotification]);

  const createAttendanceReminderNotification = useCallback((userId) => {
    return createNotification({
      type: NOTIFICATION_TYPES.ATTENDANCE_REMINDER,
      title: 'Attendance Reminder',
      message: 'Don\'t forget to mark your attendance for today',
      priority: NOTIFICATION_PRIORITIES.LOW,
      userId,
      actionUrl: '/attendance'
    });
  }, [createNotification]);

  const createSystemAnnouncementNotification = useCallback((announcement) => {
    return createNotification({
      type: NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT,
      title: 'System Announcement',
      message: announcement.message,
      priority: announcement.priority || NOTIFICATION_PRIORITIES.MEDIUM,
      isGlobal: true,
      data: announcement.data,
      actionUrl: announcement.actionUrl
    });
  }, [createNotification]);

  const createWelcomeNotification = useCallback((userRole) => {
    const roleMessages = {
      admin: 'Welcome to HR CRM! You have full administrative access to manage employees, leaves, and system settings.',
      manager: 'Welcome to HR CRM! You can manage your team, review leave requests, and access analytics.',
      employee: 'Welcome to HR CRM! You can mark attendance, apply for leaves, and view your profile.'
    };
    
    return createNotification({
      type: NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT,
      title: 'Welcome to HR CRM',
      message: roleMessages[userRole] || roleMessages.employee,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      actionUrl: '/dashboard'
    });
  }, [createNotification]);

  // Create test notification for sound testing
  const createTestNotification = useCallback(() => {
    const testTypes = [
      { type: NOTIFICATION_TYPES.LEAVE_REQUEST, title: 'Test Leave Request', message: 'This is a test notification for leave request sound' },
      { type: NOTIFICATION_TYPES.LEAVE_APPROVED, title: 'Test Leave Approved', message: 'This is a test notification for approved leave sound' },
      { type: NOTIFICATION_TYPES.ATTENDANCE_REMINDER, title: 'Test Attendance Reminder', message: 'This is a test notification for attendance reminder sound' },
      { type: NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT, title: 'Test System Announcement', message: 'This is a test notification for system announcement sound' }
    ];
    
    const randomTest = testTypes[Math.floor(Math.random() * testTypes.length)];
    
    return createNotification({
      ...randomTest,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      actionUrl: '/dashboard'
    });
  }, [createNotification]);

  // Initialize user notifications from localStorage if available
  const initializeNotifications = useCallback(() => {
    if (!userData) return;
    
    try {
      // Load notifications
      const storedNotifications = localStorage.getItem(`notifications_${userData.uid}`);
      if (storedNotifications) {
        const notifications = JSON.parse(storedNotifications);
        // Don't play sound for loaded notifications
        const notificationsWithoutSound = notifications.map(notif => ({ ...notif, playSound: false }));
        dispatch({ type: NotificationActionTypes.SET_NOTIFICATIONS, payload: notificationsWithoutSound });
      }
      
      // Load sound preference
      const soundPreference = localStorage.getItem(`notification_sound_${userData.uid}`);
      if (soundPreference !== null) {
        const enabled = JSON.parse(soundPreference);
        dispatch({ type: NotificationActionTypes.TOGGLE_SOUND, payload: enabled });
      }
    } catch (error) {
      console.error('Error loading notifications from localStorage:', error);
    }
  }, [userData]);

  // Initialize notifications and save to localStorage when notifications change
  useEffect(() => {
    if (userData) {
      initializeNotifications();
      
      // Check if this is a first-time user (no notifications in localStorage)
      const hasExistingNotifications = localStorage.getItem(`notifications_${userData.uid}`);
      if (!hasExistingNotifications) {
        // Create welcome notification for new users
        setTimeout(() => {
          createWelcomeNotification(userData.role);
        }, 1000);
      }
    }
  }, [userData, initializeNotifications, createWelcomeNotification]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (userData && state.notifications.length > 0) {
      try {
        localStorage.setItem(`notifications_${userData.uid}`, JSON.stringify(state.notifications));
      } catch (error) {
        console.error('Error saving notifications to localStorage:', error);
      }
    }
  }, [userData, state.notifications]);

  const value = {
    ...state,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUserNotifications,
    createLeaveRequestNotification,
    createLeaveStatusNotification,
    createAttendanceReminderNotification,
    createSystemAnnouncementNotification,
    createWelcomeNotification,
    createTestNotification,
    toggleNotificationSound,
    playNotificationSound: playFallbackSound,
    clearError
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};