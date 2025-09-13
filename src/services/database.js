import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase.config.js';
import { COLLECTIONS } from '../constants/index.js';

export const dbService = {
  // Generic CRUD operations
  async create(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, success: true };
    } catch (error) {
      console.error(`Create ${collectionName} error:`, error);
      return { error: error.message, success: false };
    }
  },

  async read(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { data: { id: docSnap.id, ...docSnap.data() }, success: true };
      } else {
        return { error: 'Document not found', success: false };
      }
    } catch (error) {
      console.error(`Read ${collectionName} error:`, error);
      return { error: error.message, success: false };
    }
  },

  async update(collectionName, docId, data) {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error(`Update ${collectionName} error:`, error);
      return { error: error.message, success: false };
    }
  },

  async delete(collectionName, docId) {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      return { success: true };
    } catch (error) {
      console.error(`Delete ${collectionName} error:`, error);
      return { error: error.message, success: false };
    }
  },

  async getAll(collectionName, orderByField = 'createdAt', orderDirection = 'desc') {
    try {
      const q = query(
        collection(db, collectionName), 
        orderBy(orderByField, orderDirection)
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { data, success: true };
    } catch (error) {
      console.error(`Get all ${collectionName} error:`, error);
      return { error: error.message, success: false };
    }
  },

  async getWhere(collectionName, field, operator, value) {
    try {
      const q = query(collection(db, collectionName), where(field, operator, value));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { data, success: true };
    } catch (error) {
      console.error(`Get where ${collectionName} error:`, error);
      return { error: error.message, success: false };
    }
  },

  // Real-time listener
  onSnapshot(collectionName, callback, constraints = []) {
    let q = collection(db, collectionName);
    
    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }
    
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    });
  },

  // Employee specific operations
  employees: {
    async getAll() {
      return dbService.getAll(COLLECTIONS.EMPLOYEES);
    },

    async getByDepartment(department) {
      return dbService.getWhere(COLLECTIONS.EMPLOYEES, 'department', '==', department);
    },

    async create(employeeData) {
      return dbService.create(COLLECTIONS.EMPLOYEES, employeeData);
    },

    async update(employeeId, employeeData) {
      return dbService.update(COLLECTIONS.EMPLOYEES, employeeId, employeeData);
    },

    async delete(employeeId) {
      return dbService.delete(COLLECTIONS.EMPLOYEES, employeeId);
    }
  },

  // Leave specific operations
  leaves: {
    async getAll() {
      return dbService.getAll(COLLECTIONS.LEAVES);
    },

    async getByEmployee(employeeId) {
      return dbService.getWhere(COLLECTIONS.LEAVES, 'employeeId', '==', employeeId);
    },

    async getByStatus(status) {
      return dbService.getWhere(COLLECTIONS.LEAVES, 'status', '==', status);
    },

    async create(leaveData) {
      return dbService.create(COLLECTIONS.LEAVES, leaveData);
    },

    async update(leaveId, leaveData) {
      return dbService.update(COLLECTIONS.LEAVES, leaveId, leaveData);
    },

    async delete(leaveId) {
      return dbService.delete(COLLECTIONS.LEAVES, leaveId);
    }
  },

  // Attendance specific operations
  attendance: {
    async getAll() {
      return dbService.getAll(COLLECTIONS.ATTENDANCE);
    },

    async getByEmployee(employeeId) {
      return dbService.getWhere(COLLECTIONS.ATTENDANCE, 'employeeId', '==', employeeId);
    },

    async getByDate(date) {
      return dbService.getWhere(COLLECTIONS.ATTENDANCE, 'date', '==', date);
    },

    async create(attendanceData) {
      return dbService.create(COLLECTIONS.ATTENDANCE, attendanceData);
    },

    async update(attendanceId, attendanceData) {
      return dbService.update(COLLECTIONS.ATTENDANCE, attendanceId, attendanceData);
    },

    async delete(attendanceId) {
      return dbService.delete(COLLECTIONS.ATTENDANCE, attendanceId);
    }
  },

  // Users specific operations
  users: {
    async getAll() {
      return dbService.getAll(COLLECTIONS.USERS);
    },

    async getByRole(role) {
      return dbService.getWhere(COLLECTIONS.USERS, 'role', '==', role);
    },

    async create(userData) {
      return dbService.create(COLLECTIONS.USERS, userData);
    },

    async update(userId, userData) {
      return dbService.update(COLLECTIONS.USERS, userId, userData);
    },

    async delete(userId) {
      return dbService.delete(COLLECTIONS.USERS, userId);
    }
  }
};