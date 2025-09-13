import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Button,
  Divider,
  Chip,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  EventNote as LeaveIcon,
  AccessTime as AttendanceIcon,
  Announcement as AnnouncementIcon,
  Clear as ClearIcon,
  MarkEmailRead as MarkReadIcon,
  VolumeUp as SoundOnIcon,
  VolumeOff as SoundOffIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotification, NOTIFICATION_TYPES } from '../../context/NotificationContext.jsx';

const Header = ({ onMenuClick, title = 'HR CRM' }) => {
  const { user, userData, logout } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    getUserNotifications,
    soundEnabled,
    toggleNotificationSound,
    playNotificationSound,
    createTestNotification
  } = useNotification();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = async () => {
    await logout();
    handleMenuClose();
  };

  const handleNotificationAction = (notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      // Navigate to the action URL
      window.location.href = notification.actionUrl;
    }
    handleNotificationClose();
  };

  const handleDeleteNotification = (notificationId, event) => {
    event.stopPropagation();
    deleteNotification(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleToggleSound = () => {
    toggleNotificationSound(!soundEnabled);
  };

  const handleTestSound = () => {
    playNotificationSound();
  };

  const handleCreateTestNotification = () => {
    createTestNotification();
    handleNotificationClose();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.LEAVE_REQUEST:
      case NOTIFICATION_TYPES.LEAVE_APPROVED:
      case NOTIFICATION_TYPES.LEAVE_REJECTED:
        return <LeaveIcon fontSize="small" />;
      case NOTIFICATION_TYPES.ATTENDANCE_REMINDER:
        return <AttendanceIcon fontSize="small" />;
      case NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT:
        return <AnnouncementIcon fontSize="small" />;
      default:
        return <NotificationsIcon fontSize="small" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.LEAVE_APPROVED:
        return 'success';
      case NOTIFICATION_TYPES.LEAVE_REJECTED:
        return 'error';
      case NOTIFICATION_TYPES.LEAVE_REQUEST:
        return 'warning';
      case NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT:
        return 'info';
      default:
        return 'default';
    }
  };

  const formatNotificationTime = (createdAt) => {
    const now = new Date();
    const notificationTime = new Date(createdAt);
    const diffInMinutes = Math.floor((now - notificationTime) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return notificationTime.toLocaleDateString();
  };

  const userNotifications = getUserNotifications();
  const recentNotifications = userNotifications.slice(0, 5);

  const isMenuOpen = Boolean(anchorEl);
  const isNotificationOpen = Boolean(notificationAnchor);

  return (
    <AppBar 
      position="fixed" 
      className="bg-white shadow-sm"
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'white',
        color: 'text.primary'
      }}
      elevation={1}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
          className="mr-2 text-gray-700"
        >
          <MenuIcon />
        </IconButton>
        
        <Typography 
          variant="h6" 
          noWrap 
          className="flex-grow font-bold text-gray-800"
        >
          {title}
        </Typography>

        <Box className="flex items-center space-x-2">
          {/* Notifications */}
          <IconButton
            size="large"
            aria-label="show notifications"
            color="inherit"
            onClick={handleNotificationClick}
            className="text-gray-700"
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Profile */}
          <Box className="flex items-center space-x-3">
            {/* User Info - Always visible on larger screens, compact on mobile */}
            <Box className="text-right">
              <Box className="flex items-center space-x-2">
                <Typography variant="body2" className="font-medium text-gray-800 hidden sm:block">
                  {userData?.firstName} {userData?.lastName}
                </Typography>
                <Typography variant="body2" className="font-medium text-gray-800 sm:hidden">
                  {userData?.firstName}
                </Typography>
                <Chip
                  label={userData?.role}
                  size="small"
                  color={userData?.role === 'admin' ? 'error' : userData?.role === 'manager' ? 'warning' : 'primary'}
                  variant="outlined"
                  className="text-xs capitalize"
                />
              </Box>
              <Typography variant="caption" className="text-gray-600 hidden md:block">
                {userData?.department}
              </Typography>
            </Box>
            
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar 
                sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                className="text-sm"
              >
                {userData?.firstName?.[0]}{userData?.lastName?.[0]}
              </Avatar>
            </IconButton>
          </Box>
        </Box>
      </Toolbar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={isMenuOpen}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: 2
          }
        }}
      >
        <Box className="px-4 py-3">
          <Box className="flex items-center space-x-2 mb-1">
            <Typography variant="subtitle2" className="font-medium">
              {userData?.firstName} {userData?.lastName}
            </Typography>
            <Chip
              label={userData?.role}
              size="small"
              color={userData?.role === 'admin' ? 'error' : userData?.role === 'manager' ? 'warning' : 'primary'}
              className="text-xs capitalize"
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {userData?.email}
          </Typography>
          <Typography variant="caption" color="text.secondary" className="block mt-1">
            {userData?.department} Department
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleMenuClose} className="py-2">
          <AccountCircle className="mr-2" fontSize="small" />
          Profile
        </MenuItem>
        <MenuItem onClick={handleMenuClose} className="py-2">
          <SettingsIcon className="mr-2" fontSize="small" />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} className="py-2 text-red-600">
          <LogoutIcon className="mr-2" fontSize="small" />
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={isNotificationOpen}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 320,
            maxWidth: 400,
            maxHeight: 480,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: 2
          }
        }}
      >
        <Box className="px-4 py-3 flex items-center justify-between">
          <Typography variant="h6" className="font-semibold">
            Notifications
          </Typography>
          <Box className="flex items-center space-x-1">
            <IconButton 
              size="small" 
              onClick={handleToggleSound}
              color={soundEnabled ? 'primary' : 'default'}
              title={soundEnabled ? 'Disable notification sounds' : 'Enable notification sounds'}
            >
              {soundEnabled ? <SoundOnIcon fontSize="small" /> : <SoundOffIcon fontSize="small" />}
            </IconButton>
            {unreadCount > 0 && (
              <Button 
                size="small" 
                color="primary"
                onClick={handleMarkAllAsRead}
                startIcon={<MarkReadIcon />}
              >
                Mark all read
              </Button>
            )}
          </Box>
        </Box>
        <Divider />
        
        {recentNotifications.length === 0 ? (
          <Box className="px-4 py-8 text-center">
            <NotificationsIcon className="text-gray-400 mb-2" fontSize="large" />
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {recentNotifications.map((notification) => (
              <MenuItem 
                key={notification.id}
                onClick={() => handleNotificationAction(notification)}
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  py: 2,
                  px: 3,
                  bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                  '&:hover': {
                    bgcolor: 'action.selected'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Chip
                    icon={getNotificationIcon(notification.type)}
                    size="small"
                    color={getNotificationColor(notification.type)}
                    variant="outlined"
                    sx={{ width: 32, height: 32, '& .MuiChip-icon': { fontSize: 16 } }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box className="flex items-start justify-between">
                      <Typography 
                        variant="body2" 
                        className={`font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}
                        sx={{ flex: 1, mr: 1 }}
                      >
                        {notification.title}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => handleDeleteNotification(notification.id, e)}
                        sx={{ 
                          opacity: 0.6,
                          '&:hover': { opacity: 1 },
                          ml: 1
                        }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 0.5
                        }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatNotificationTime(notification.createdAt)}
                      </Typography>
                    </Box>
                  }
                />
              </MenuItem>
            ))}
          </Box>
        )}
        
        {userNotifications.length > 5 && (
          <>
            <Divider />
            <Box className="px-4 py-2">
              <Button 
                size="small" 
                color="primary" 
                onClick={handleNotificationClose}
                fullWidth
              >
                View All Notifications ({userNotifications.length})
              </Button>
            </Box>
          </>
        )}
        
        {/* Sound Testing Section - Only show for development/testing */}
        {userData?.role === 'admin' && (
          <>
            <Divider />
            <Box className="px-4 py-2 bg-gray-50">
              <Typography variant="caption" color="text.secondary" className="block mb-1">
                Sound Test (Admin Only)
              </Typography>
              <Box className="flex space-x-1">
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={handleTestSound}
                  sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 1 }}
                >
                  Test Sound
                </Button>
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={handleCreateTestNotification}
                  sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 1 }}
                >
                  Test Notification
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Menu>
    </AppBar>
  );
};

export default Header;