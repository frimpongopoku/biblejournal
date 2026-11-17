import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutUser() {
  // Don't leave the journal's key on this device after signing out.
  const uid = auth.currentUser?.uid;
  if (uid) await import("@/lib/vault").then((v) => v.forgetVaultHere(uid));
  await signOut(auth);
}
