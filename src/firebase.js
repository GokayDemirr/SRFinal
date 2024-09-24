// firebase.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyARvnar7VqAimBw1GUqOesp7qcDNgE-Rck",
  authDomain: "sr-design-admin-panel.firebaseapp.com",
  projectId: "sr-design-admin-panel",
  storageBucket: "sr-design-admin-panel.appspot.com",
  messagingSenderId: "370848344097",
  appId: "1:370848344097:web:7ddac3b4e809ca3fd69b60",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore'u başlat ve dışa aktar
const firestore = getFirestore(app);

export default firestore;
