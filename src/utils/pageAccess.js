import { DEFAULT_PAGE_ACCESS, PAGES } from '../constants/index.js';

/**
 * Check if a user has access to a specific page
 * @param {Object} userData - User data object
 * @param {string} pageId - Page identifier from PAGES constant
 * @returns {boolean} - True if user has access, false otherwise
 */
export const hasPageAccess = (userData, pageId) => {
  if (!userData || !pageId) return false;
  
  // Get user's assigned pages or fallback to default for their role
  const userPages = userData.assignedPages || DEFAULT_PAGE_ACCESS[userData.role] || [];
  
  return userPages.includes(pageId);
};

/**
 * Get all pages a user has access to
 * @param {Object} userData - User data object
 * @returns {Array} - Array of page IDs the user can access
 */
export const getUserPages = (userData) => {
  if (!userData) return [];
  
  return userData.assignedPages || DEFAULT_PAGE_ACCESS[userData.role] || [];
};

/**
 * Filter navigation items based on user's page access
 * @param {Array} navigationItems - Array of navigation items
 * @param {Object} userData - User data object
 * @returns {Array} - Filtered navigation items
 */
export const filterNavigationByPageAccess = (navigationItems, userData) => {
  if (!userData || !navigationItems) return [];
  
  const userPages = getUserPages(userData);
  
  return navigationItems.filter(item => {
    // If item has pageId, check page access
    if (item.pageId) {
      return userPages.includes(item.pageId);
    }
    
    // If item has children, filter them recursively
    if (item.children) {
      const filteredChildren = filterNavigationByPageAccess(item.children, userData);
      return filteredChildren.length > 0;
    }
    
    // If no pageId specified, allow access (for parent items without specific pages)
    return true;
  }).map(item => {
    // If item has children, return it with filtered children
    if (item.children) {
      return {
        ...item,
        children: filterNavigationByPageAccess(item.children, userData)
      };
    }
    
    return item;
  });
};

/**
 * Check if user can access any page within a module
 * @param {Object} userData - User data object
 * @param {string} moduleId - Module identifier
 * @returns {boolean} - True if user has access to at least one page in the module
 */
export const hasModulePageAccess = (userData, moduleId) => {
  if (!userData) return false;
  
  const userPages = getUserPages(userData);
  
  // Define which pages belong to which modules
  const modulePages = {
    dashboard: [PAGES.DASHBOARD],
    employee_management: [PAGES.EMPLOYEE_DIRECTORY, PAGES.ADD_EMPLOYEE, PAGES.MY_TEAM],
    leave_management: [PAGES.LEAVE_REQUESTS, PAGES.APPLY_LEAVE],
    attendance: [PAGES.ATTENDANCE_VIEW, PAGES.MARK_ATTENDANCE],
    analytics: [PAGES.ANALYTICS_REPORTS],
    settings: [PAGES.SETTINGS_ROLES, PAGES.SETTINGS_MODULES, PAGES.SETTINGS_SYSTEM]
  };
  
  const pagesInModule = modulePages[moduleId] || [];
  
  // Check if user has access to at least one page in the module
  return pagesInModule.some(pageId => userPages.includes(pageId));
};

/**
 * Get page access summary for display
 * @param {Object} userData - User data object
 * @returns {Object} - Summary of page access
 */
export const getPageAccessSummary = (userData) => {
  if (!userData) return { total: 0, assigned: 0, percentage: 0 };
  
  const totalPages = Object.values(PAGES).length;
  const userPages = getUserPages(userData);
  const assignedCount = userPages.length;
  const percentage = Math.round((assignedCount / totalPages) * 100);
  
  return {
    total: totalPages,
    assigned: assignedCount,
    percentage
  };
};