import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

// Project config (exactly as provided)
const firebaseConfig = {
  apiKey: "AIzaSyCRXyTlTe9u9bjvL6Y3eUnztesa27hkWaY",
  authDomain: "project-2118807878810546832.firebaseapp.com",
  projectId: "project-2118807878810546832",
  storageBucket: "project-2118807878810546832.firebasestorage.app",
  messagingSenderId: "519860367831",
  appId: "1:519860367831:web:488f364c2e51d27b6a5b92",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

await setPersistence(auth, browserLocalPersistence);

const $login = document.getElementById("login");
const $logout = document.getElementById("logout");
const $me = document.getElementById("me");
const $form = document.getElementById("addForm");
const $text = document.getElementById("text");
const $list = document.getElementById("list");
const $err = document.getElementById("error");

$login.addEventListener("click", async () => {
  $err.textContent = "";
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    console.error(e);
    $err.textContent = `${e.code} — ${e.message}`;
  }
});

$logout.addEventListener("click", async () => {
  $err.textContent = "";
  try {
    await signOut(auth);
  } catch (e) {
    console.error(e);
    $err.textContent = `${e.code} — ${e.message}`;
  }
});

let unsubscribe = null;

onAuthStateChanged(auth, (user) => {
  if (unsubscribe) { unsubscribe(); unsubscribe = null; }

  if (!user) {
    $me.textContent = "לא מחובר";
    $login.hidden = false;
    $logout.hidden = true;
    $form.hidden = true;
    $list.innerHTML = "";
    return;
  }

  $me.textContent = `מחובר: ${user.displayName || user.email} (uid: ${user.uid})`;
  $login.hidden = true;
  $logout.hidden = false;
  $form.hidden = false;

  // live view of latest items
  const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
  unsubscribe = onSnapshot(q, (snap) => {
    $list.innerHTML = "";
    snap.forEach((doc) => {
      const li = document.createElement("li");
      li.textContent = doc.data().content || "";
      $list.appendChild(li);
    });
  });
});

$form.addEventListener("submit", async (e) => {
  e.preventDefault();
  $err.textContent = "";
  const user = auth.currentUser;
  if (!user) return;

  try {
    await addDoc(collection(db, "messages"), {
      content: $text.value.trim(),
      userId: user.uid,
      userName: user.displayName || user.email || null,
      createdAt: serverTimestamp(),
    });
    $text.value = "";
  } catch (e) {
    console.error(e);
    $err.textContent = `${e.code} — ${e.message}`;
  }
});

// Debug: verify origin matches an Authorized domain
console.log("origin:", window.location.origin);
