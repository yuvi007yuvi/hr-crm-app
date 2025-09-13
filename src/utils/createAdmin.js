import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase.config.js';
import { USER_ROLES, COLLECTIONS } from '../constants/index.js';

/**
 * Utility function to update a user's role to admin
 * This should be run manually or through Firebase Console
 * 
 * @param {string} userId - The UID of the user to make admin
 */
export const makeUserAdmin = async (userId) => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      role: USER_ROLES.ADMIN,
      updatedAt: new Date().toISOString()
    });
    console.log(`User ${userId} has been made an admin`);
    return { success: true };
  } catch (error) {
    console.error('Error making user admin:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Instructions for creating an admin account:
 * 
 * 1. Register a new account through the normal registration form
 * 2. Note down the user ID from Firebase Console or browser dev tools
 * 3. Run this function with the user ID to make them admin
 * 4. Or manually update the role in Firebase Console
 */