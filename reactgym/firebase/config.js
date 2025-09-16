// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';

import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyATMosG7lqdXI5t5zsBnkVDYYdP3Q3CXyg",
  authDomain: "reactgym-3a6a9.firebaseapp.com",
  projectId: "reactgym-3a6a9",
  storageBucket: "reactgym-3a6a9.firebasestorage.app",
  messagingSenderId: "137596921738",
  appId: "1:137596921738:web:acc821a32632c983ff4a73",
  measurementId: "G-6M4E5ST4L2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Sử dụng getFirestore để khởi tạo Firestore
const db = getFirestore(app);

export { db };