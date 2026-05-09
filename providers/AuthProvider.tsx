"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import type { User } from "@/types";

const IS_FIREBASE_CONFIGURED =
  typeof process !== "undefined" &&
  !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "placeholder";

const MOCK_USER: User = {
  uid: "demo-user",
  email: "demo@bibjournal.app",
  displayName: "Frimpong",
  photoURL: null,
  createdAt: new Date(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    if (!IS_FIREBASE_CONFIGURED) {
      setUser(MOCK_USER);
      setLoading(false);
      return;
    }

    // Real Firebase auth — dynamically imported so it never runs without config
    let unsub: () => void;
    import("@/lib/firebase").then(({ auth, db }) => {
      import("firebase/auth").then(({ onAuthStateChanged }) => {
        import("firebase/firestore").then(({ doc, getDoc, setDoc, serverTimestamp }) => {
          unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
              setUser(null);
              setLoading(false);
              return;
            }
            const ref = doc(db, "users", firebaseUser.uid);
            const snap = await getDoc(ref);
            if (!snap.exists()) {
              await setDoc(ref, {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                createdAt: serverTimestamp(),
              });
            }
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? "",
              displayName: firebaseUser.displayName ?? "",
              photoURL: firebaseUser.photoURL,
              createdAt: snap.exists() ? snap.data().createdAt?.toDate() : new Date(),
            } as User);
            setLoading(false);
          });
        });
      });
    });

    return () => unsub?.();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
