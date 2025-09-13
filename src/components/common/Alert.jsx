import React from 'react';
import { 
  Alert as MuiAlert,
  AlertTitle,
  Box,
  IconButton,
  Collapse
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const Alert = ({
  type = 'info',
  title,
  message,
  children,
  dismissible = false,
  onClose,
  open = true,
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = React.useState(open);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  // Remove dismissible from props to avoid passing it to DOM
  const { dismissible: _, ...alertProps } = props;

  return (
    <Collapse in={isOpen}>
      <MuiAlert
        severity={type}
        className={className}
        action={
          dismissible && (
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          )
        }
        {...alertProps}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message && <Box>{message}</Box>}
        {children}
      </MuiAlert>
    </Collapse>
  );
};

export default Alert;