<template>
    <div id="login">
      <section>
        <div id="loginpanel">
          <input
            id="email"
            type="text"
            v-model="u_email"
            placeholder="Enter your email"
          />
          <input
            id="email"
            type="password"
            v-model="u_pass"
            placeholder="Enter your password"
          />
          <div id="loginByEmail">
            <button :disabled="!isValidInput" @click="createAccount">
              Signup
            </button>
            <button :disabled="u_email.length === 0" @click="resetPass">
              Reset Password
            </button>
            <button :disabled="!isValidInput" @click="withEmail">Login</button>
          </div>
          <div>
            <input id="verif" type="checkbox" v-model="emailVerification" />
            <label for="verif">Send verification email</label>
          </div>
          <div id="withProvider">
            <button @click="withGMail">Google</button>
            <button @click="withGitHub">GitHub</button>
          </div>
        </div>
      </section>
      <span id="msgbox" v-show="message.length > 0">{{ message }}</span>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from "vue";
  import { useRouter } from "vue-router";
  import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GithubAuthProvider,
    sendEmailVerification,
    signOut,
    sendPasswordResetEmail,
  } from "firebase/auth";
import { DocumentReference, doc, setDoc } from "firebase/firestore";
import { db } from "../main";

  const u_email = ref("");
  const u_pass = ref("");
  const message = ref("");
  const emailVerification = ref(false);
  const auth = getAuth();
  const router = useRouter();
  
  const isValidInput = computed(
    () => u_email.value.length > 0 && u_pass.value.length > 0
  );
  
  const showMessage = (txt: string) => {
    message.value = txt;
    setTimeout(() => {
      message.value = "";
    }, 5000);
  };
  
  const createAccount = async () => {
    try {
      const cr = await createUserWithEmailAndPassword(
        auth,
        u_email.value,
        u_pass.value
      );
      if (emailVerification.value) {
        await sendEmailVerification(cr.user);
        await signOut(auth);
        showMessage(`An email verification has been sent to ${cr.user.email}`);
      } else {
        showMessage(`New account created with UID ${cr.user.uid}`);
      }
    } catch (err) {
      showMessage(`Unable to create account ${err}`);
    }
  };
  
  const resetPass = async () => {
    try {
      await sendPasswordResetEmail(auth, u_email.value);
      showMessage(`A password reset link has been sent to ${u_email.value}`);
    } catch (err) {
      showMessage(`Unable to reset password ${err}`);
    }
  };
  
  const withEmail = async () => {
    try {
      const cr = await signInWithEmailAndPassword(
        auth,
        u_email.value,
        u_pass.value
      );
      if (cr.user.emailVerified) {
        // add user to Users collection
        const userDoc: DocumentReference = doc(db, "Users", u_email.value);
        setDoc(userDoc, { email: u_email.value, user_id: auth.currentUser?.uid });
        //router.push({ path: "./Home", params: { byWayOf: "Email" } });
        router.push({ name: "Home", params: { byWayOf: "Email" } });
      } else {
        showMessage("You must first verify your email");
        await signOut(auth);
      }
    } catch (err) {
      showMessage(`Unable to login ${err}`);
    }
  };
  
  const withGMail = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider).then((result) => {
        const user: string = result.user.email || '';
        const id : string = result.user.uid;
        addUserToCollection(user, id);
      });
      router.push({ name: "Home", params: { byWayOf: "Google" } });
    } catch (err) {
      showMessage(`Unable to login with GMail ${err}`);
    }
  };
  
  const withGitHub = async () => {
    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider).then((result) => {
        const user: string = result.user.email || '';
        const id : string = result.user.uid;
        addUserToCollection(user, id);
      });
      router.push({ name: "Home", params: { byWayOf: "GitHub" } });
    } catch (err) {
      showMessage(`Unable to login with GitHub ${err}`);
    }
  };

  function addUserToCollection(user: string, id: string) {
    const userDoc: DocumentReference = doc(db, "Users", user);
    setDoc(userDoc, { email: user, user_id: id});
  }
  </script>
  
  <style scoped>
  #login {
    text-align: center;
  }
  #loginpanel {
    display: inline-flex;
    flex-direction: column;
    align-items: stretch;
    border: 1px solid hsl(210, 20%, 85%);
    padding: 2em;
    border-radius: 8px;
    width: 300px;
    background-color: hsl(210, 60%, 98%);
    box-shadow: 0px 4px 6px hsl(210, 20%, 80%);
  }
  
  section {
    margin-bottom: 1.5em;
  }
  
  #msgbox {
    font-size: 90%;
    font-style: italic;
    border-radius: 8px;
    background-color: hsl(0, 80%, 90%);
    padding: 0.5em 1em;
    border: 1px solid hsl(0, 50%, 80%);
    color: hsl(0, 50%, 50%);
  }
  
  #loginByEmail,
  #withProvider {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1em;
  }
  
  input {
    padding: 0.6em;
    border: 1px solid hsl(210, 20%, 85%);
    border-radius: 4px;
    margin-bottom: 0.5em;
    font-size: 0.9em;
    background-color: white;
  }
  
  button {
    padding: 0.5em 1em;
    border: none;
    border-radius: 4px;
    background-color: hsl(210, 80%, 60%);
    color: white;
    cursor: pointer;
    font-size: 0.9em;
    transition: background-color 0.3s;
  }
  
  button:disabled {
    background-color: hsl(210, 20%, 80%);
    cursor: not-allowed;
  }
  
  button:not(:disabled):hover {
    background-color: hsl(210, 80%, 50%);
  }
  
  label {
    font-size: 0.85em;
    color: hsl(210, 40%, 40%);
  }
  
  input[type="checkbox"] {
    margin-right: 0.5em;
  }
  
  #email {
    color: black;
  }
  </style>