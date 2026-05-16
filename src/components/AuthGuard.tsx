"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#05060a] text-white">
        <div className="text-center">
          <p className="text-sm tracking-[0.25em] text-blue-300">
            FITRA LOADING
          </p>
          <p className="mt-3 text-xs text-slate-400">
            認証状態を確認しています。
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}