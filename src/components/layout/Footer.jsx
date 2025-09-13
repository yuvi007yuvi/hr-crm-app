import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { Favorite as HeartIcon } from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box 
      component="footer" 
      className="mt-auto bg-white border-t border-gray-200"
      sx={{ 
        borderTop: 1, 
        borderColor: 'divider',
        backgroundColor: 'background.paper'
      }}
    >
      <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Divider sx={{ mb: 2 }} />
        <Box className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          {/* Copyright */}
          <Typography 
            variant="body2" 
            color="text.secondary"
            className="text-center sm:text-left"
          >
            © {currentYear} HRNova. All rights reserved.
          </Typography>
          
          {/* Made with love by YUVRAJ */}
          <Box className="flex items-center space-x-1">
            <Typography 
              variant="body2" 
              color="text.secondary"
              className="text-center"
            >
              Made with
            </Typography>
            <HeartIcon 
              className="heartbeat"
              sx={{ 
                color: '#e91e63', 
                fontSize: 16
              }} 
            />
            <Typography 
              variant="body2" 
              color="text.secondary"
              className="text-center"
            >
              by
            </Typography>
            <Typography 
              variant="body2" 
              className="font-semibold text-blue-600"
              sx={{ 
                color: 'primary.main',
                fontWeight: 600
              }}
            >
              YUVRAJ
            </Typography>
          </Box>
        </Box>
        
        {/* Additional Info */}
        <Box className="mt-2 text-center">
          <Typography 
            variant="caption" 
            color="text.secondary"
            className="text-xs"
          >
            Next-Generation Human Resources Management System
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;