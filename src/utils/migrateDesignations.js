import { dbService } from '../services/index.js';
import { USER_ROLES, DESIGNATIONS } from '../constants/index.js';

// Migration script to update existing employees with default designations
export const migrateDesignations = async () => {
  try {
    console.log('Starting designation migration...');
    
    // Get all employees
    const employees = await dbService.employees.getAll();
    const updates = [];
    
    for (const employee of employees) {
      // Skip if employee already has a designation
      if (employee.designation) {
        continue;
      }
      
      // Assign default designation based on role and department
      let defaultDesignation = 'Associate'; // Default fallback
      
      if (employee.role === USER_ROLES.ADMIN) {
        if (employee.department === 'HR') {
          defaultDesignation = 'HR Director';
        } else {
          defaultDesignation = 'Director';
        }
      } else if (employee.role === USER_ROLES.MANAGER) {
        switch (employee.department) {
          case 'Engineering':
            defaultDesignation = 'Engineering Manager';
            break;
          case 'Marketing':
            defaultDesignation = 'Marketing Manager';
            break;
          case 'Sales':
            defaultDesignation = 'Sales Manager';
            break;
          case 'HR':
            defaultDesignation = 'HR Manager';
            break;
          case 'Finance':
            defaultDesignation = 'Finance Manager';
            break;
          case 'Operations':
            defaultDesignation = 'Operations Manager';
            break;
          case 'Design':
            defaultDesignation = 'Design Lead';
            break;
          case 'Product':
            defaultDesignation = 'Product Manager';
            break;
          default:
            defaultDesignation = 'Manager';
        }
      } else if (employee.role === USER_ROLES.EMPLOYEE) {
        switch (employee.department) {
          case 'Engineering':
            defaultDesignation = 'Software Engineer';
            break;
          case 'Marketing':
            defaultDesignation = 'Marketing Executive';
            break;
          case 'Sales':
            defaultDesignation = 'Sales Executive';
            break;
          case 'HR':
            defaultDesignation = 'HR Executive';
            break;
          case 'Finance':
            defaultDesignation = 'Finance Executive';
            break;
          case 'Operations':
            defaultDesignation = 'Operations Executive';
            break;
          case 'Design':
            defaultDesignation = 'UI/UX Designer';
            break;
          case 'Product':
            defaultDesignation = 'Product Manager';
            break;
          default:
            defaultDesignation = 'Associate';
        }
      }
      
      // Update employee with designation
      const updateData = {
        ...employee,
        designation: defaultDesignation,
        updatedAt: new Date().toISOString(),
        updatedBy: 'system-migration'
      };
      
      updates.push({
        id: employee.id,
        data: updateData
      });
    }
    
    // Apply all updates
    for (const update of updates) {
      await dbService.employees.update(update.id, update.data);
      console.log(`Updated ${update.data.firstName} ${update.data.lastName} with designation: ${update.data.designation}`);
    }
    
    console.log(`Designation migration completed. Updated ${updates.length} employees.`);
    return { success: true, updatedCount: updates.length };
    
  } catch (error) {
    console.error('Error during designation migration:', error);
    return { success: false, error: error.message };
  }
};

// Auto-run migration on development environment
if (import.meta.env.DEV) {
  console.log('Development environment detected. Designation migration will run automatically when needed.');
}