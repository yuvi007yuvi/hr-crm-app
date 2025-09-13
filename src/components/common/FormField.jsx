import React from 'react';
import { 
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Switch,
  Chip,
  Box,
  Typography,
  Button
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const FormField = ({
  type = 'text',
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  disabled = false,
  options = [],
  multiple = false,
  placeholder = '',
  className = '',
  fullWidth = true,
  variant = 'outlined',
  size = 'medium',
  ...props
}) => {
  const commonProps = {
    name,
    value: value || '',
    onChange,
    onBlur,
    error: !!error,
    required,
    disabled,
    fullWidth,
    variant,
    size,
    className,
    ...props
  };

  // Props specifically for FormControl components
  const formControlProps = {
    name,
    error: !!error,
    required,
    disabled,
    fullWidth,
    variant,
    size,
    className
  };

  switch (type) {
    case 'select':
      return (
        <FormControl {...formControlProps}>
          <InputLabel>{label}</InputLabel>
          <Select
            name={name}
            label={label}
            multiple={multiple}
            value={multiple ? (value || []) : (value || '')}
            onChange={onChange}
            onBlur={onBlur}
            renderValue={multiple ? (selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((val) => (
                  <Chip key={val} label={val} size="small" />
                ))}
              </Box>
            ) : undefined}
          >
            {options.map((option) => (
              <MenuItem 
                key={option.value || option} 
                value={option.value || option}
              >
                {multiple && (
                  <Checkbox checked={(value || []).indexOf(option.value || option) > -1} />
                )}
                {option.label || option}
              </MenuItem>
            ))}
          </Select>
          {(error || helperText) && (
            <FormHelperText>{error || helperText}</FormHelperText>
          )}
        </FormControl>
      );

    case 'checkbox':
      return (
        <FormControlLabel
          control={
            <Checkbox
              {...commonProps}
              checked={!!value}
              onChange={(e) => onChange({ target: { name, value: e.target.checked } })}
            />
          }
          label={label}
          className={className}
        />
      );

    case 'switch':
      return (
        <FormControlLabel
          control={
            <Switch
              {...commonProps}
              checked={!!value}
              onChange={(e) => onChange({ target: { name, value: e.target.checked } })}
            />
          }
          label={label}
          className={className}
        />
      );

    case 'radio':
      return (
        <FormControl {...formControlProps}>
          <Typography variant="body2" className="mb-2 font-medium">
            {label} {required && <span className="text-red-500">*</span>}
          </Typography>
          <RadioGroup
            value={value || ''}
            onChange={(e) => onChange({ target: { name, value: e.target.value } })}
          >
            {options.map((option) => (
              <FormControlLabel
                key={option.value || option}
                value={option.value || option}
                control={<Radio />}
                label={option.label || option}
              />
            ))}
          </RadioGroup>
          {(error || helperText) && (
            <FormHelperText error={!!error}>{error || helperText}</FormHelperText>
          )}
        </FormControl>
      );

    case 'date':
      return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label={label}
            value={value ? new Date(value) : null}
            onChange={(date) => onChange({ target: { name, value: date?.toISOString() } })}
            slotProps={{
              textField: {
                ...commonProps,
                placeholder
              }
            }}
          />
        </LocalizationProvider>
      );

    case 'textarea':
      return (
        <TextField
          {...commonProps}
          label={label}
          placeholder={placeholder}
          multiline
          rows={4}
          helperText={error || helperText}
        />
      );

    case 'number':
      return (
        <TextField
          {...commonProps}
          label={label}
          placeholder={placeholder}
          type="number"
          helperText={error || helperText}
        />
      );

    case 'email':
      return (
        <TextField
          {...commonProps}
          label={label}
          placeholder={placeholder}
          type="email"
          helperText={error || helperText}
        />
      );

    case 'password':
      return (
        <TextField
          {...commonProps}
          label={label}
          placeholder={placeholder}
          type="password"
          helperText={error || helperText}
        />
      );

    case 'tel':
      return (
        <TextField
          {...commonProps}
          label={label}
          placeholder={placeholder}
          type="tel"
          helperText={error || helperText}
        />
      );

    default:
      return (
        <TextField
          {...commonProps}
          label={label}
          placeholder={placeholder}
          type={type}
          helperText={error || helperText}
        />
      );
  }
};

export default FormField;