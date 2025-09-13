import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Collapse,
  Avatar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  AccessTime as AccessTimeIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  Groups as TeamsIcon,
  AccountBox as ProfileIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { USER_ROLES, ROUTES, MODULES, DEFAULT_MODULE_ACCESS, PAGES } from '../../constants/index.js';
import { hasPageAccess, hasModulePageAccess } from '../../utils/pageAccess.js';

const drawerWidth = 280;

const Sidebar = ({ open, onClose, variant = 'temporary' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, hasPermission } = useAuth();
  const [expandedItems, setExpandedItems] = React.useState({});

  const handleItemClick = (path) => {
    navigate(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  const handleExpandClick = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const isActive = (path) => location.pathname === path;

  // Check if user has access to a module
  const hasModuleAccess = (moduleId) => {
    // Get user's assigned modules or fallback to default for their role
    const userModules = userData?.assignedModules || DEFAULT_MODULE_ACCESS[userData?.role] || [];
    return userModules.includes(moduleId);
  };

  // Check if user has access to a specific page
  const checkPageAccess = (pageId) => {
    return hasPageAccess(userData, pageId);
  };

  // Check if user has access to any page in a module
  const checkModulePageAccess = (moduleId) => {
    return hasModulePageAccess(userData, moduleId);
  };

  // Navigation items based on user role and assigned modules
  const getNavigationItems = () => {
    const baseItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <DashboardIcon />,
        path: ROUTES.DASHBOARD,
        moduleId: MODULES.DASHBOARD,
        pageId: PAGES.DASHBOARD,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE]
      }
    ];

    const adminManagerItems = [
      {
        id: 'employees',
        label: 'Employee Management',
        icon: <PeopleIcon />,
        moduleId: MODULES.EMPLOYEE_MANAGEMENT,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
        children: [
          {
            id: 'employee-directory',
            label: 'Employee Directory',
            icon: <PersonIcon />,
            path: ROUTES.EMPLOYEES,
            pageId: PAGES.EMPLOYEE_DIRECTORY
          },
          {
            id: 'my-team',
            label: 'My Team',
            icon: <TeamsIcon />,
            path: ROUTES.MY_TEAM,
            pageId: PAGES.MY_TEAM,
            roles: [USER_ROLES.MANAGER] // Only managers see My Team
          },
          {
            id: 'add-employee',
            label: 'Add Employee',
            icon: <PersonIcon />,
            path: `${ROUTES.EMPLOYEES}/add`,
            pageId: PAGES.ADD_EMPLOYEE
          }
        ]
      }
    ];

    const commonItems = [
      {
        id: 'leave',
        label: 'Leave Management',
        icon: <EventNoteIcon />,
        moduleId: MODULES.LEAVE_MANAGEMENT,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE],
        children: [
          {
            id: 'my-leaves',
            label: hasPermission(USER_ROLES.ADMIN) || hasPermission(USER_ROLES.MANAGER) ? 'All Leave Requests' : 'My Leaves',
            icon: <AssignmentIcon />,
            path: ROUTES.LEAVE_REQUESTS,
            pageId: PAGES.LEAVE_REQUESTS
          },
          {
            id: 'apply-leave',
            label: 'Apply Leave',
            icon: <EventNoteIcon />,
            path: `${ROUTES.LEAVE_REQUESTS}/apply`,
            pageId: PAGES.APPLY_LEAVE
          }
        ]
      },
      {
        id: 'attendance',
        label: 'Attendance',
        icon: <AccessTimeIcon />,
        moduleId: MODULES.ATTENDANCE,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE],
        children: [
          {
            id: 'my-attendance',
            label: hasPermission(USER_ROLES.ADMIN) || hasPermission(USER_ROLES.MANAGER) ? 'All Attendance' : 'My Attendance',
            icon: <TimelineIcon />,
            path: ROUTES.ATTENDANCE,
            pageId: PAGES.ATTENDANCE_VIEW
          },
          {
            id: 'mark-attendance',
            label: 'Mark Attendance',
            icon: <AccessTimeIcon />,
            path: `${ROUTES.ATTENDANCE}/mark`,
            pageId: PAGES.MARK_ATTENDANCE,
            roles: [USER_ROLES.EMPLOYEE] // Only employees can mark attendance
          }
        ]
      }
    ];

    const analyticsItems = [
      {
        id: 'analytics',
        label: 'Analytics & Reports',
        icon: <AnalyticsIcon />,
        path: ROUTES.ANALYTICS,
        moduleId: MODULES.ANALYTICS,
        pageId: PAGES.ANALYTICS_REPORTS,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER]
      }
    ];

    const settingsItems = [
      {
        id: 'settings',
        label: 'Settings',
        icon: <SettingsIcon />,
        path: '/settings',
        moduleId: MODULES.SETTINGS,
        pageId: PAGES.SETTINGS_ROLES, // Default to role management page
        roles: [USER_ROLES.ADMIN]
      }
    ];

    const profileItems = [
      {
        id: 'profile',
        label: 'My Profile',
        icon: <ProfileIcon />,
        path: ROUTES.PROFILE,
        pageId: PAGES.PROFILE,
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE]
      }
    ];

    // Helper function to filter items by role, module, and page access
    const filterItems = (items) => {
      return items.filter(item => {
        // Check role access
        if (item.roles && !item.roles.includes(userData?.role)) {
          return false;
        }
        
        // Check module access
        if (item.moduleId && !hasModuleAccess(item.moduleId)) {
          return false;
        }
        
        // Check page access (if pageId is specified)
        if (item.pageId && !checkPageAccess(item.pageId)) {
          return false;
        }
        
        // For items with children, check if any children are accessible
        if (item.children) {
          const filteredChildren = filterItems(item.children);
          return filteredChildren.length > 0;
        }
        
        return true;
      }).map(item => {
        // If item has children, return it with filtered children
        if (item.children) {
          return {
            ...item,
            children: filterItems(item.children)
          };
        }
        return item;
      });
    };
    
    // Combine items based on user role, module, and page access
    let items = [];
    
    // Add base items
    items = filterItems(baseItems);
    
    // Add admin/manager items if user has permission
    if (hasPermission(USER_ROLES.MANAGER)) {
      items = [...items, ...filterItems(adminManagerItems)];
    }
    
    // Add common items
    items = [...items, ...filterItems(commonItems)];
    
    // Add analytics items if user has permission
    if (hasPermission(USER_ROLES.MANAGER)) {
      items = [...items, ...filterItems(analyticsItems)];
    }
    
    // Add settings items if user has permission
    if (hasPermission(USER_ROLES.ADMIN)) {
      items = [...items, ...filterItems(settingsItems)];
    }
    
    // Add profile items for all users
    items = [...items, ...filterItems(profileItems)];
    
    return items;
  };

  const renderNavigationItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.id];
    const active = item.path && isActive(item.path);

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding sx={{ pl: level * 2 }}>
          <ListItemButton
            onClick={() => {
              if (hasChildren) {
                handleExpandClick(item.id);
              } else if (item.path) {
                handleItemClick(item.path);
              }
            }}
            selected={active}
            sx={{
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '& .MuiListItemIcon-root': {
                  color: 'primary.contrastText',
                }
              },
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: active ? 'inherit' : 'text.secondary'
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: active ? 600 : 400
              }}
            />
            {hasChildren && (
              isExpanded ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>
        
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children
                .filter(child => !child.roles || child.roles.includes(userData?.role))
                .map(child => renderNavigationItem(child, level + 1))
              }
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawer = (
    <Box className="h-full flex flex-col bg-white">
      {/* Logo/Brand Section */}
      <Box className="p-4 border-b border-gray-200 flex-shrink-0">
        <Box className="flex items-center space-x-3">
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main',
              width: 40,
              height: 40
            }}
          >
            HR
          </Avatar>
          <Box>
            <Typography variant="h6" className="font-bold text-gray-800">
              HR CRM
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Human Resources
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* User Info */}
      <Box className="p-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
        <Box className="flex items-center space-x-3">
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main',
              width: 36,
              height: 36
            }}
          >
            {userData?.firstName?.[0]}{userData?.lastName?.[0]}
          </Avatar>
          <Box className="flex-1 min-w-0">
            <Typography variant="body2" className="font-medium text-gray-800 truncate">
              {userData?.firstName} {userData?.lastName}
            </Typography>
            <Typography variant="caption" className="text-gray-600 capitalize">
              {userData?.role} • {userData?.department}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation - Scrollable Area */}
      <Box 
        className="flex-1 py-2"
        sx={{
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: '10px',
            '&:hover': {
              background: '#a8a8a8',
            },
          },
          // Firefox
          scrollbarWidth: 'thin',
          scrollbarColor: '#c1c1c1 #f1f1f1',
        }}
      >
        <List sx={{ px: 1 }}>
          {getNavigationItems().map(item => renderNavigationItem(item))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          height: '100vh',
          paddingTop: '80px', // Add top padding to avoid header overlap
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;