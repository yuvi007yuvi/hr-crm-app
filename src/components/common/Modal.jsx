import React from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const Modal = ({
  open,
  onClose,
  title,
  children,
  primaryAction,
  secondaryAction,
  maxWidth = 'sm',
  fullWidth = true,
  showCloseButton = true,
  ...props
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }
      }}
      {...props}
    >
      {title && (
        <DialogTitle className="pb-2">
          <Box className="flex items-center justify-between">
            <Typography variant="h6" component="div" className="font-semibold">
              {title}
            </Typography>
            {showCloseButton && (
              <IconButton
                onClick={onClose}
                size="small"
                className="text-gray-500 hover:text-gray-700"
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
      )}
      
      <DialogContent className={title ? 'pt-2' : 'pt-6'}>
        {children}
      </DialogContent>
      
      {(primaryAction || secondaryAction) && (
        <DialogActions className="px-6 pb-6">
          {secondaryAction}
          {primaryAction}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default Modal;