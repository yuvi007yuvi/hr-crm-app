import React from 'react';
import { 
  CircularProgress, 
  Box, 
  Typography, 
  Backdrop 
} from '@mui/material';

const LoadingSpinner = ({ 
  size = 40, 
  message = 'Loading...', 
  fullScreen = false,
  overlay = false,
  className = '' 
}) => {
  const spinner = (
    <Box 
      className={`flex flex-col items-center justify-center ${className}`}
      sx={{ p: fullScreen ? 4 : 2 }}
    >
      <CircularProgress size={size} color="primary" />
      {message && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          className="mt-2 text-center"
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}
        open={true}
      >
        {spinner}
      </Backdrop>
    );
  }

  if (overlay) {
    return (
      <Box
        className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10"
      >
        {spinner}
      </Box>
    );
  }

  return spinner;
};

export default LoadingSpinner;