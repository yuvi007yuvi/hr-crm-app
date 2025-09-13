import React from 'react';
import { 
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  Box,
  Skeleton,
  Checkbox,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon,
  KeyboardArrowUp,
  KeyboardArrowDown
} from '@mui/icons-material';

const Table = ({
  columns = [],
  data = [],
  loading = false,
  pagination = false,
  page = 0,
  rowsPerPage = 10,
  totalRows = 0,
  onPageChange,
  onRowsPerPageChange,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  sortable = false,
  sortBy = '',
  sortOrder = 'asc',
  onSort,
  actions = [],
  emptyMessage = "No data available",
  className = '',
  ...props
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = React.useState(null);

  const handleActionClick = (event, rowIndex) => {
    setAnchorEl(event.currentTarget);
    setSelectedRowIndex(rowIndex);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedRowIndex(null);
  };

  const handleActionItemClick = (action, row) => {
    if (!row || !action.onClick) return;
    action.onClick(row);
    handleActionClose();
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = data.map((row, index) => index);
      onSelectionChange(allIds);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (event, rowIndex) => {
    const selectedIndex = selectedRows.indexOf(rowIndex);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedRows, rowIndex);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedRows.slice(1));
    } else if (selectedIndex === selectedRows.length - 1) {
      newSelected = newSelected.concat(selectedRows.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedRows.slice(0, selectedIndex),
        selectedRows.slice(selectedIndex + 1)
      );
    }

    onSelectionChange(newSelected);
  };

  const handleSort = (column) => {
    if (!sortable || !column.sortable) return;
    
    const isAsc = sortBy === column.id && sortOrder === 'asc';
    onSort(column.id, isAsc ? 'desc' : 'asc');
  };

  const isSelected = (rowIndex) => selectedRows.indexOf(rowIndex) !== -1;

  const renderSkeleton = () => (
    Array.from({ length: rowsPerPage }).map((_, index) => (
      <TableRow key={index}>
        {selectable && (
          <TableCell padding="checkbox">
            <Skeleton variant="rectangular" width={20} height={20} />
          </TableCell>
        )}
        {columns.map((column) => (
          <TableCell key={column.id}>
            <Skeleton variant="text" />
          </TableCell>
        ))}
        {actions.length > 0 && (
          <TableCell>
            <Skeleton variant="circular" width={24} height={24} />
          </TableCell>
        )}
      </TableRow>
    ))
  );

  return (
    <Box className={className}>
      <TableContainer component={Paper} elevation={0}>
        <MuiTable {...props}>
          <TableHead>
            <TableRow className="bg-gray-50">
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
                    checked={data.length > 0 && selectedRows.length === data.length}
                    onChange={handleSelectAll}
                    color="primary"
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                  className={`font-semibold text-gray-700 ${
                    sortable && column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => handleSort(column)}
                >
                  <Box className="flex items-center">
                    {column.label}
                    {sortable && column.sortable && sortBy === column.id && (
                      <Box className="ml-1">
                        {sortOrder === 'asc' ? (
                          <KeyboardArrowUp fontSize="small" />
                        ) : (
                          <KeyboardArrowDown fontSize="small" />
                        )}
                      </Box>
                    )}
                  </Box>
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell align="center" className="font-semibold text-gray-700">
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              renderSkeleton()
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                  align="center"
                  className="py-8"
                >
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => {
                const isItemSelected = isSelected(index);
                return (
                  <TableRow
                    hover
                    key={row.id || index}
                    selected={isItemSelected}
                    className={isItemSelected ? 'bg-blue-50' : ''}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          onChange={(event) => handleSelectRow(event, index)}
                          color="primary"
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.id} align={column.align || 'left'}>
                        {column.render ? column.render(row, index) : row[column.id]}
                      </TableCell>
                    ))}
                    {actions.length > 0 && (
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(event) => handleActionClick(event, index)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </MuiTable>
        
        <Menu
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleActionClose}
        >
          {actions.map((action, index) => {
            const rowData = data[selectedRowIndex];
            const isDisabled = !rowData || (action.disabled && action.disabled(rowData));
            
            return (
              <MenuItem
                key={index}
                onClick={() => handleActionItemClick(action, rowData)}
                disabled={isDisabled}
              >
                {action.icon && <Box className="mr-2">{action.icon}</Box>}
                {action.label}
              </MenuItem>
            );
          })}
        </Menu>
      </TableContainer>
      
      {pagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalRows || data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      )}
    </Box>
  );
};

export default Table;