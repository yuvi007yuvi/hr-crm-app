import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';

const Layout = ({ children, title }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box className="flex h-screen bg-gray-50">
      {/* Header */}
      <Header onMenuClick={handleSidebarToggle} title={title} />

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={handleSidebarToggle}
        variant={isMobile ? 'temporary' : 'persistent'}
      />

      {/* Main Content */}
      <Box
        component="main"
        className="flex-1 flex flex-col"
        sx={{
          marginLeft: !isMobile && sidebarOpen ? '25px' : 0, // ✅ works only for desktop
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          minHeight: '100vh',
          overflow: 'hidden',
        }}
      >



        {/* Toolbar spacer for header */}
        <Box sx={{ height: '64px', flexShrink: 0 }} />

        {/* Page content - Scrollable */}
        <Box
          className="flex-1 p-4"
          sx={{
            overflow: 'auto',
            height: 'calc(100vh - 64px)', // Full height minus header
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
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;