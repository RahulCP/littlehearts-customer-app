import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "./firebase";

const LS_TOKEN = "illolam_auth_token";
const LS_USER = "illolam_user";

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const res = await signInWithPopup(auth, provider);

  const user = res.user;
  const idToken = await user.getIdToken();

  const profile = {
    uid: user.uid,
    email: user.email,
    name: user.displayName,
    photoUrl: user.photoURL,
  };

  localStorage.setItem(LS_TOKEN, idToken);
  localStorage.setItem(LS_USER, JSON.stringify(profile));

  return { idToken, profile };
}

export function getAuthToken() {
  return localStorage.getItem(LS_TOKEN);
}

export function getAuthUser() {
  try {
    return JSON.parse(localStorage.getItem(LS_USER) || "null");
  } catch {
    return null;
  }
}

export async function logout() {
  await signOut(auth);
  localStorage.removeItem(LS_TOKEN);
  localStorage.removeItem(LS_USER);
}
