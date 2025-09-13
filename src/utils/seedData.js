import { dbService } from '../services/index.js';
import { USER_ROLES, LEAVE_TYPES, LEAVE_STATUS, ATTENDANCE_STATUS, DEPARTMENTS, DESIGNATIONS } from '../constants/index.js';

// Seed data
const seedEmployees = [
  {
    uid: 'admin-1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@hrcrm.com',
    role: USER_ROLES.ADMIN,
    department: DEPARTMENTS[3], // HR
    designation: 'HR Director',
    joinDate: '2023-01-15',
    isActive: true
  },
  {
    uid: 'manager-1',
    firstName: 'John',
    lastName: 'Manager',
    email: 'john.manager@hrcrm.com',
    role: USER_ROLES.MANAGER,
    department: DEPARTMENTS[0], // Engineering
    designation: 'Engineering Manager',
    joinDate: '2023-02-01',
    isActive: true
  },
  {
    uid: 'employee-1',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@hrcrm.com',
    role: USER_ROLES.EMPLOYEE,
    department: DEPARTMENTS[0], // Engineering
    designation: 'Senior Software Engineer',
    joinDate: '2023-03-15',
    isActive: true
  },
  {
    uid: 'employee-2',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@hrcrm.com',
    role: USER_ROLES.EMPLOYEE,
    department: DEPARTMENTS[1], // Marketing
    designation: 'Marketing Executive',
    joinDate: '2023-04-01',
    isActive: true
  },
  {
    uid: 'employee-3',
    firstName: 'Sarah',
    lastName: 'Davis',
    email: 'sarah.davis@hrcrm.com',
    role: USER_ROLES.EMPLOYEE,
    department: DEPARTMENTS[6], // Design
    designation: 'UI/UX Designer',
    joinDate: '2023-05-10',
    isActive: true
  }
];

const seedLeaves = [
  {
    employeeId: 'employee-1',
    employeeName: 'Jane Smith',
    employeeEmail: 'jane.smith@hrcrm.com',
    department: DEPARTMENTS[0],
    type: LEAVE_TYPES.SICK,
    startDate: '2024-01-15',
    endDate: '2024-01-17',
    days: 3,
    reason: 'Flu and fever',
    status: LEAVE_STATUS.APPROVED,
    appliedDate: '2024-01-10',
    reviewedBy: 'manager-1',
    reviewedDate: '2024-01-11'
  },
  {
    employeeId: 'employee-2',
    employeeName: 'Mike Johnson',
    employeeEmail: 'mike.johnson@hrcrm.com',
    department: DEPARTMENTS[1],
    type: LEAVE_TYPES.CASUAL,
    startDate: '2024-01-20',
    endDate: '2024-01-21',
    days: 2,
    reason: 'Personal work',
    status: LEAVE_STATUS.PENDING,
    appliedDate: '2024-01-18'
  },
  {
    employeeId: 'employee-3',
    employeeName: 'Sarah Davis',
    employeeEmail: 'sarah.davis@hrcrm.com',
    department: DEPARTMENTS[6],
    type: LEAVE_TYPES.EARNED,
    startDate: '2024-02-01',
    endDate: '2024-02-05',
    days: 5,
    reason: 'Family vacation',
    status: LEAVE_STATUS.APPROVED,
    appliedDate: '2024-01-25',
    reviewedBy: 'admin-1',
    reviewedDate: '2024-01-26'
  }
];

const seedAttendance = [
  // Employee 1 - Jane Smith
  {
    employeeId: 'employee-1',
    employeeName: 'Jane Smith',
    employeeEmail: 'jane.smith@hrcrm.com',
    department: DEPARTMENTS[0],
    date: '2024-01-08',
    checkIn: '2024-01-08T09:00:00Z',
    checkInTime: '09:00',
    checkOut: '2024-01-08T18:00:00Z',
    checkOutTime: '18:00',
    workingHours: 8,
    status: ATTENDANCE_STATUS.PRESENT
  },
  {
    employeeId: 'employee-1',
    employeeName: 'Jane Smith',
    employeeEmail: 'jane.smith@hrcrm.com',
    department: DEPARTMENTS[0],
    date: '2024-01-09',
    checkIn: '2024-01-09T09:15:00Z',
    checkInTime: '09:15',
    checkOut: '2024-01-09T18:00:00Z',
    checkOutTime: '18:00',
    workingHours: 7.75,
    status: ATTENDANCE_STATUS.LATE
  },
  // Employee 2 - Mike Johnson
  {
    employeeId: 'employee-2',
    employeeName: 'Mike Johnson',
    employeeEmail: 'mike.johnson@hrcrm.com',
    department: DEPARTMENTS[1],
    date: '2024-01-08',
    checkIn: '2024-01-08T08:45:00Z',
    checkInTime: '08:45',
    checkOut: '2024-01-08T17:45:00Z',
    checkOutTime: '17:45',
    workingHours: 8,
    status: ATTENDANCE_STATUS.PRESENT
  },
  {
    employeeId: 'employee-2',
    employeeName: 'Mike Johnson',
    employeeEmail: 'mike.johnson@hrcrm.com',
    department: DEPARTMENTS[1],
    date: '2024-01-09',
    checkIn: '2024-01-09T09:00:00Z',
    checkInTime: '09:00',
    checkOut: '2024-01-09T13:00:00Z',
    checkOutTime: '13:00',
    workingHours: 4,
    status: ATTENDANCE_STATUS.HALF_DAY
  },
  // Employee 3 - Sarah Davis
  {
    employeeId: 'employee-3',
    employeeName: 'Sarah Davis',
    employeeEmail: 'sarah.davis@hrcrm.com',
    department: DEPARTMENTS[6],
    date: '2024-01-08',
    checkIn: '2024-01-08T09:00:00Z',
    checkInTime: '09:00',
    checkOut: '2024-01-08T18:30:00Z',
    checkOutTime: '18:30',
    workingHours: 8.5,
    status: ATTENDANCE_STATUS.PRESENT
  }
];

export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Seed employees
    console.log('Seeding employees...');
    for (const employee of seedEmployees) {
      const result = await dbService.employees.create(employee);
      if (result.success) {
        console.log(`✓ Created employee: ${employee.firstName} ${employee.lastName}`);
      } else {
        console.error(`✗ Failed to create employee: ${employee.firstName} ${employee.lastName}`, result.error);
      }
    }

    // Seed leaves
    console.log('Seeding leave requests...');
    for (const leave of seedLeaves) {
      const result = await dbService.leaves.create(leave);
      if (result.success) {
        console.log(`✓ Created leave request for: ${leave.employeeName}`);
      } else {
        console.error(`✗ Failed to create leave request for: ${leave.employeeName}`, result.error);
      }
    }

    // Seed attendance
    console.log('Seeding attendance records...');
    for (const attendance of seedAttendance) {
      const result = await dbService.attendance.create(attendance);
      if (result.success) {
        console.log(`✓ Created attendance record for: ${attendance.employeeName} on ${attendance.date}`);
      } else {
        console.error(`✗ Failed to create attendance record for: ${attendance.employeeName}`, result.error);
      }
    }

    console.log('✓ Database seeding completed successfully!');
    return true;
  } catch (error) {
    console.error('✗ Database seeding failed:', error);
    return false;
  }
};

// Demo user credentials for testing
export const demoCredentials = {
  admin: {
    email: 'admin@hrcrm.com',
    password: 'admin123',
    role: USER_ROLES.ADMIN
  },
  manager: {
    email: 'john.manager@hrcrm.com',
    password: 'manager123',
    role: USER_ROLES.MANAGER
  },
  employee: {
    email: 'jane.smith@hrcrm.com',
    password: 'employee123',
    role: USER_ROLES.EMPLOYEE
  }
};

export default {
  seedDatabase,
  demoCredentials,
  seedEmployees,
  seedLeaves,
  seedAttendance
};