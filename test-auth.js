import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDpXIaHTcvamaoKXrl657nU3zFm9Nh389A",
  authDomain: "eyalamrami-1d69e.firebaseapp.com",
  projectId: "eyalamrami-1d69e",
  storageBucket: "eyalamrami-1d69e.firebasestorage.app",
  messagingSenderId: "990847614280",
  appId: "1:990847614280:web:431b7f340e07bd7f3b477d",
  measurementId: "G-P7YM9RTHK6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

signInWithEmailAndPassword(auth, 'orel895@gmail.com', '123456')
  .then((userCredential) => {
    console.log('✅ Login successful!');
    console.log('User:', userCredential.user.email);
    console.log('UID:', userCredential.user.uid);
  })
  .catch((error) => {
    console.error('❌ Login failed!');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  });
