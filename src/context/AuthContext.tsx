"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const clearDietTempStorage = () => {
  if (typeof window === "undefined") return;

  const exactKeys = [
    "foodItems",
    "foodItem",
    "input",
    "images",
    "feedback",
    "pendingMeal",
    "tempMeals",
    "viewingMealId",
    "resultMode",
  ];

  exactKeys.forEach((key) => {
    localStorage.removeItem(key);
  });

  const keywords = [
    "diet",
    "meal",
    "food",
    "pending",
    "temp",
    "result",
    "feedback",
    "image",
  ];

  Object.keys(localStorage).forEach((key) => {
    const lowerKey = key.toLowerCase();

    const shouldRemove = keywords.some((keyword) =>
      lowerKey.includes(keyword)
    );

    if (shouldRemove) {
      localStorage.removeItem(key);
    }
  });
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    clearDietTempStorage();
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string) => {
    clearDietTempStorage();
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    clearDietTempStorage();
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}