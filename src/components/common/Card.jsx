import React from 'react';
import { 
  Card as MuiCard, 
  CardContent, 
  CardActions, 
  CardHeader,
  Typography,
  IconButton,
  Box 
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

const Card = ({ 
  title, 
  subtitle, 
  children, 
  actions, 
  headerAction,
  className = '',
  sx = {},
  elevation = 1,
  ...props 
}) => {
  return (
    <MuiCard 
      elevation={elevation}
      className={`${className}`}
      sx={{ 
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        ...sx 
      }}
      {...props}
    >
      {(title || headerAction) && (
        <CardHeader
          title={title && (
            <Typography variant="h6" component="div" className="font-semibold">
              {title}
            </Typography>
          )}
          subheader={subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
          action={headerAction}
          className="pb-2"
        />
      )}
      
      <CardContent className={title ? 'pt-0' : ''}>
        {children}
      </CardContent>
      
      {actions && (
        <CardActions className="pt-0">
          {actions}
        </CardActions>
      )}
    </MuiCard>
  );
};

export default Card;