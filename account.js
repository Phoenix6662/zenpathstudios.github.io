import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  deleteUser,
  EmailAuthProvider,
  getAuth,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const apps = {
  mindkit: {
    name: "MindKit",
    config: {
      apiKey: "AIzaSyAnIWLWEoiy3usVeGKDwGTFmBMUR8z4Vg0",
      authDomain: "mindkit-368e5.firebaseapp.com",
      projectId: "mindkit-368e5",
      storageBucket: "mindkit-368e5.firebasestorage.app",
      messagingSenderId: "737267690596",
      appId: "1:737267690596:web:6002bcf0d9b2df0fa94371",
      measurementId: "G-4LNYBMD67T"
    }
  },
  simpledbt: {
    name: "SimpleDBT",
    config: {
      apiKey: "AIzaSyCucO9rcsfoezv7Gv27U5JgFk5VhTMp7wg",
      authDomain: "simpledbt-7f204.firebaseapp.com",
      projectId: "simpledbt-7f204",
      storageBucket: "simpledbt-7f204.firebasestorage.app",
      messagingSenderId: "923056861528",
      appId: "1:923056861528:web:1c502750cc4d15d390352d",
      measurementId: "G-ER81CYEH95"
    }
  },
  compass: {
    name: "Compass",
    config: {
      apiKey: "AIzaSyBq9d-oIlSAEwOqEtbNt6LIG1r2r5RQQL0",
      authDomain: "compass-88546.firebaseapp.com",
      databaseURL: "https://compass-88546-default-rtdb.firebaseio.com",
      projectId: "compass-88546",
      storageBucket: "compass-88546.firebasestorage.app",
      messagingSenderId: "423368018097",
      appId: "1:423368018097:web:7108c6f93c1f596a137a90",
      measurementId: "G-H6YS46HG10"
    }
  }
};

const firebaseApps = {};
const authClients = {};

const appButtons = document.querySelectorAll("[data-app-choice]");
const selectedAppLabel = document.querySelector("#selected-app-label");
const authStateLabel = document.querySelector("#auth-state-label");
const loginForm = document.querySelector("#login-form");
const loginEmail = document.querySelector("#login-email");
const loginPassword = document.querySelector("#login-password");
const resetPasswordButton = document.querySelector("#reset-password-button");
const signedInPanel = document.querySelector("#signed-in-panel");
const signedInEmail = document.querySelector("#signed-in-email");
const deleteForm = document.querySelector("#delete-form");
const deletePassword = document.querySelector("#delete-password");
const deleteConfirm = document.querySelector("#delete-confirm");
const signOutButton = document.querySelector("#sign-out-button");
const accountMessage = document.querySelector("#account-message");
const requestAppSelect = document.querySelector("#request-app-select");
const requestSelectedApp = document.querySelector("#request-selected-app");

let selectedAppId = getInitialAppId();
let unsubscribeAuth = null;
let currentUser = null;

function getInitialAppId() {
  const hash = window.location.hash.replace("#", "").toLowerCase();
  return apps[hash] ? hash : "mindkit";
}

function getSelectedAuth() {
  if (!firebaseApps[selectedAppId]) {
    firebaseApps[selectedAppId] = initializeApp(apps[selectedAppId].config, selectedAppId);
    authClients[selectedAppId] = getAuth(firebaseApps[selectedAppId]);
  }

  return authClients[selectedAppId];
}

function setMessage(message, type = "neutral") {
  accountMessage.textContent = message;
  accountMessage.dataset.type = type;
}

function friendlyError(error) {
  const code = error?.code || "";

  if (code.includes("invalid-credential") || code.includes("wrong-password")) {
    return "The email or password did not match this app account.";
  }

  if (code.includes("user-not-found")) {
    return "No account was found for that email in the selected app.";
  }

  if (code.includes("too-many-requests")) {
    return "Too many attempts. Please wait a bit and try again.";
  }

  if (code.includes("requires-recent-login")) {
    return "Please sign in again, then retry account deletion.";
  }

  if (code.includes("network-request-failed")) {
    return "The request could not reach Firebase. Please check your connection and try again.";
  }

  return error?.message || "Something went wrong. Please try again.";
}

function setBusy(form, isBusy) {
  form.querySelectorAll("button, input, select, textarea").forEach((field) => {
    field.disabled = isBusy;
  });
}

function updateAuthUI(user) {
  currentUser = user;
  authStateLabel.textContent = user ? "Signed in" : "Signed out";
  loginForm.hidden = Boolean(user);
  signedInPanel.hidden = !user;
  signedInEmail.textContent = user?.email || "";
  deletePassword.value = "";
  deleteConfirm.checked = false;
}

function syncRequestApp(appName) {
  requestAppSelect.value = appName;
  requestSelectedApp.value = appName;
}

function selectApp(appId, shouldUpdateHash = true) {
  selectedAppId = appId;
  const appName = apps[appId].name;

  selectedAppLabel.textContent = appName;
  appButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.appChoice === appId);
  });
  syncRequestApp(appName);
  setMessage("");

  if (shouldUpdateHash) {
    window.history.replaceState(null, "", `#${appId}`);
  }

  if (unsubscribeAuth) {
    unsubscribeAuth();
  }

  unsubscribeAuth = onAuthStateChanged(getSelectedAuth(), updateAuthUI);
}

appButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectApp(button.dataset.appChoice);
  });
});

requestAppSelect.addEventListener("change", () => {
  requestSelectedApp.value = requestAppSelect.value;
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setBusy(loginForm, true);
  setMessage("Signing in...");

  try {
    await signInWithEmailAndPassword(getSelectedAuth(), loginEmail.value.trim(), loginPassword.value);
    loginPassword.value = "";
    setMessage(`You are signed in to ${apps[selectedAppId].name}.`, "success");
  } catch (error) {
    setMessage(friendlyError(error), "error");
  } finally {
    setBusy(loginForm, false);
  }
});

resetPasswordButton.addEventListener("click", async () => {
  const email = loginEmail.value.trim();

  if (!email) {
    setMessage("Enter your email first, then request a password reset.", "error");
    loginEmail.focus();
    return;
  }

  resetPasswordButton.disabled = true;
  setMessage("Sending password reset email...");

  try {
    await sendPasswordResetEmail(getSelectedAuth(), email);
    setMessage("Password reset email sent. Check your inbox.", "success");
  } catch (error) {
    setMessage(friendlyError(error), "error");
  } finally {
    resetPasswordButton.disabled = false;
  }
});

deleteForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentUser?.email) {
    setMessage("Please sign in before deleting an account.", "error");
    return;
  }

  setBusy(deleteForm, true);
  setMessage("Confirming your password...");

  try {
    const credential = EmailAuthProvider.credential(currentUser.email, deletePassword.value);
    await reauthenticateWithCredential(currentUser, credential);
    setMessage("Deleting account...");
    await deleteUser(currentUser);
    setMessage(`Your ${apps[selectedAppId].name} authentication account has been deleted.`, "success");
  } catch (error) {
    setMessage(friendlyError(error), "error");
  } finally {
    setBusy(deleteForm, false);
  }
});

signOutButton.addEventListener("click", async () => {
  signOutButton.disabled = true;
  setMessage("Signing out...");

  try {
    await signOut(getSelectedAuth());
    setMessage("Signed out.", "success");
  } catch (error) {
    setMessage(friendlyError(error), "error");
  } finally {
    signOutButton.disabled = false;
  }
});

window.addEventListener("hashchange", () => {
  const nextAppId = getInitialAppId();
  if (nextAppId !== selectedAppId) {
    selectApp(nextAppId, false);
  }
});

selectApp(selectedAppId, false);
