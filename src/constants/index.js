// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee'
};

// System Modules
export const MODULES = {
  DASHBOARD: 'dashboard',
  EMPLOYEE_MANAGEMENT: 'employee_management',
  LEAVE_MANAGEMENT: 'leave_management',
  ATTENDANCE: 'attendance',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings'
};

// System Pages (granular page-level access)
export const PAGES = {
  DASHBOARD: 'dashboard',
  EMPLOYEE_DIRECTORY: 'employee_directory',
  ADD_EMPLOYEE: 'add_employee',
  MY_TEAM: 'my_team',
  LEAVE_REQUESTS: 'leave_requests',
  APPLY_LEAVE: 'apply_leave',
  ATTENDANCE_VIEW: 'attendance_view',
  MARK_ATTENDANCE: 'mark_attendance',
  ANALYTICS_REPORTS: 'analytics_reports',
  SETTINGS_ROLES: 'settings_roles',
  SETTINGS_MODULES: 'settings_modules',
  SETTINGS_SYSTEM: 'settings_system'
};

// Default Module Access by Role
export const DEFAULT_MODULE_ACCESS = {
  [USER_ROLES.ADMIN]: [
    MODULES.DASHBOARD,
    MODULES.EMPLOYEE_MANAGEMENT,
    MODULES.LEAVE_MANAGEMENT,
    MODULES.ATTENDANCE,
    MODULES.ANALYTICS,
    MODULES.SETTINGS
  ],
  [USER_ROLES.MANAGER]: [
    MODULES.DASHBOARD,
    MODULES.EMPLOYEE_MANAGEMENT,
    MODULES.LEAVE_MANAGEMENT,
    MODULES.ATTENDANCE,
    MODULES.ANALYTICS
  ],
  [USER_ROLES.EMPLOYEE]: [
    MODULES.DASHBOARD,
    MODULES.LEAVE_MANAGEMENT,
    MODULES.ATTENDANCE
  ]
};

// Default Page Access by Role (granular page-level permissions)
export const DEFAULT_PAGE_ACCESS = {
  [USER_ROLES.ADMIN]: [
    PAGES.DASHBOARD,
    PAGES.EMPLOYEE_DIRECTORY,
    PAGES.ADD_EMPLOYEE,
    PAGES.MY_TEAM,
    PAGES.LEAVE_REQUESTS,
    PAGES.APPLY_LEAVE,
    PAGES.ATTENDANCE_VIEW,
    PAGES.MARK_ATTENDANCE,
    PAGES.ANALYTICS_REPORTS,
    PAGES.SETTINGS_ROLES,
    PAGES.SETTINGS_MODULES,
    PAGES.SETTINGS_SYSTEM
  ],
  [USER_ROLES.MANAGER]: [
    PAGES.DASHBOARD,
    PAGES.EMPLOYEE_DIRECTORY,
    PAGES.ADD_EMPLOYEE,
    PAGES.MY_TEAM,
    PAGES.LEAVE_REQUESTS,
    PAGES.APPLY_LEAVE,
    PAGES.ATTENDANCE_VIEW,
    PAGES.MARK_ATTENDANCE,
    PAGES.ANALYTICS_REPORTS,
    PAGES.SETTINGS_ROLES,
    PAGES.SETTINGS_MODULES
  ],
  [USER_ROLES.EMPLOYEE]: [
    PAGES.DASHBOARD,
    PAGES.LEAVE_REQUESTS,
    PAGES.APPLY_LEAVE,
    PAGES.ATTENDANCE_VIEW,
    PAGES.MARK_ATTENDANCE
  ]
};

// Leave Types
export const LEAVE_TYPES = {
  SICK: 'sick',
  CASUAL: 'casual',
  EARNED: 'earned',
  MATERNITY: 'maternity',
  PATERNITY: 'paternity'
};

// Leave Status
export const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half_day'
};

// Routes
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  EMPLOYEES: '/employees',
  MY_TEAM: '/my-team',
  LEAVE_REQUESTS: '/leave-requests',
  ATTENDANCE: '/attendance',
  ANALYTICS: '/analytics',
  PROFILE: '/profile'
};

// Firebase Collections
export const COLLECTIONS = {
  USERS: 'users',
  EMPLOYEES: 'employees',
  LEAVES: 'leaves',
  ATTENDANCE: 'attendance',
  DEPARTMENTS: 'departments'
};

// Default Leave Balances (in days)
export const DEFAULT_LEAVE_BALANCE = {
  [LEAVE_TYPES.SICK]: 0,
  [LEAVE_TYPES.CASUAL]: 0,
  [LEAVE_TYPES.EARNED]: 0
};

// Departments
export const DEPARTMENTS = [
  'Engineering',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Design',
  'Product'
];

// Designations
export const DESIGNATIONS = [
  'Software Engineer',
  'Senior Software Engineer',
  'Lead Software Engineer',
  'Engineering Manager',
  'Product Manager',
  'Senior Product Manager',
  'Marketing Manager',
  'Marketing Executive',
  'Sales Manager',
  'Sales Executive',
  'HR Manager',
  'HR Executive',
  'Finance Manager',
  'Finance Executive',
  'Operations Manager',
  'Operations Executive',
  'UI/UX Designer',
  'Senior Designer',
  'Design Lead',
  'Data Analyst',
  'Business Analyst',
  'Project Manager',
  'Team Lead',
  'Associate',
  'Senior Associate',
  'Director',
  'Vice President',
  'CEO',
  'CTO',
  'COO'
];

// Working Hours
export const WORKING_HOURS = {
  START: '09:00',
  END: '18:00',
  LUNCH_START: '13:00',
  LUNCH_END: '14:00',
  FULL_DAY_HOURS: 8,
  HALF_DAY_HOURS: 4
};