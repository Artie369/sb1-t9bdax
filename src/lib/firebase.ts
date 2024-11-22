import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import { toast } from 'react-hot-toast';

const firebaseConfig = {
  apiKey: "AIzaSyAj45okA16HL8XDdlBfaw-Jdis-WEe3KJo",
  authDomain: "sfvbedwa.firebaseapp.com",
  projectId: "sfvbedwa",
  storageBucket: "sfvbedwa.firebasestorage.app",
  messagingSenderId: "556384153571",
  appId: "1:556384153571:web:a9853c1cf4dbf4505c3ad6",
  measurementId: "G-4VYC9SQC1S",
  databaseURL: "https://sfvbedwa-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const rtdb = getDatabase(app);

// Helper function to handle Firebase errors
export const handleFirebaseError = (error: any): string => {
  console.error('Firebase error:', error);

  // Common Firebase error codes
  const errorMessages: Record<string, string> = {
    'auth/invalid-credential': 'Invalid email or password',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Invalid password',
    'auth/email-already-in-use': 'Email already registered',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/invalid-email': 'Invalid email format',
    'permission-denied': 'You do not have permission to perform this action',
    'not-found': 'The requested resource was not found',
    'already-exists': 'This resource already exists'
  };

  if (error?.code) {
    const errorCode = error.code.replace('auth/', '').replace('firestore/', '');
    const message = errorMessages[errorCode] || error.message;
    toast.error(message);
    return message;
  }

  const defaultMessage = 'An unexpected error occurred';
  toast.error(defaultMessage);
  return defaultMessage;
};

export { app, auth, db, rtdb, storage };