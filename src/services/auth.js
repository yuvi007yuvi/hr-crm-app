import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { auth, db } from './firebase.config.js';
import { USER_ROLES, COLLECTIONS } from '../constants/index.js';

// Auth functions
export const authService = {
  // Register with email and password
  async register(email, password, userData) {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile
      await updateProfile(user, {
        displayName: `${userData.firstName} ${userData.lastName}`
      });

      // Create user document in Firestore
      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
        uid: user.uid,
        email: user.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || USER_ROLES.EMPLOYEE,
        department: userData.department,
        joinDate: new Date().toISOString(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return { user, success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { error: error.message, success: false };
    }
  },

  // Login with email and password
  async login(email, password) {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return { user, success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { error: error.message, success: false };
    }
  },

  // Logout
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { error: error.message, success: false };
    }
  },

  // Get current user data
  async getCurrentUserData(uid) {
    try {
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
      if (userDoc.exists()) {
        return { data: userDoc.data(), success: true };
      } else {
        return { error: 'User not found', success: false };
      }
    } catch (error) {
      console.error('Get user data error:', error);
      return { error: error.message, success: false };
    }
  },

  // Update user profile
  async updateProfile(uid, profileData) {
    try {
      // Update Firestore document
      await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
        ...profileData,
        updatedAt: new Date().toISOString()
      });
      
      // Update Firebase Auth profile if name or email changed
      if (profileData.firstName || profileData.lastName) {
        const user = auth.currentUser;
        if (user) {
          await updateProfile(user, {
            displayName: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim()
          });
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: error.message, success: false };
    }
  },

  // Update password
  async updatePassword(currentPassword, newPassword) {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { error: 'No user logged in', success: false };
      }
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await firebaseUpdatePassword(user, newPassword);
      
      return { success: true };
    } catch (error) {
      console.error('Update password error:', error);
      return { error: error.message, success: false };
    }
  },

  // Auth state observer
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }
};