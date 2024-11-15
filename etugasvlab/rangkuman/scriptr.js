import { firebaseConfig } from "../logreg/config.js";
// Firebase Auth dan Firestore Initialization
const firebaseApp = firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "/logreg";
  }
});