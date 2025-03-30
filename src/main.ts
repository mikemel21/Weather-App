import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import myRouter from './routing'
//import getRouter from './routing'
import { initializeApp, FirebaseApp } from "firebase/app";
import { firebaseConfig } from "./firebase-config.ts";
import { getFirestore, Firestore } from "firebase/firestore";

const myapp: FirebaseApp = initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(myapp);

const app = createApp(App);
app.use(myRouter);
//app.use(getRouter);
app.mount('#app');

// createApp(App).use(myRouter).mount('#app')