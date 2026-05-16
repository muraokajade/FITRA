"use client";

import Link from "next/link";
import LoadingLink from "@/components/LoadingLink";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { label: "Dashboard", href: "/dashboard", theme: "home" as const },
  { label: "Diet", href: "/diet/dashboard", theme: "diet" as const },
  { label: "Training", href: "/training", theme: "training" as const },
  { label: "Life", href: "/life", theme: "life" as const },
];

const clearDietTempStorage = () => {
  localStorage.removeItem("foodItems");
  localStorage.removeItem("foodItem");
  localStorage.removeItem("input");
  localStorage.removeItem("images");
  localStorage.removeItem("feedback");
  localStorage.removeItem("pendingMeal");
  localStorage.removeItem("tempMeals");
  localStorage.removeItem("viewingMealId");
  localStorage.removeItem("resultMode");
};

export default function AppHeader() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    clearDietTempStorage();
    await logout();
    setOpen(false);
    router.push("/login");
  };

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-slate-800 bg-[#05060a]/95 text-white shadow-lg shadow-black/30 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
    <Link
      href="/"
      className="group relative inline-flex items-center gap-3"
      onClick={() => setOpen(false)}
    >
      <span className="relative flex h-9 w-9 items-center justify-center rounded-2xl border border-blue-400/40 bg-blue-500/10 shadow-[0_0_24px_rgba(59,130,246,0.25)] transition group-hover:border-cyan-300/60 group-hover:bg-cyan-400/10">
        <span className="absolute inset-1 rounded-xl bg-gradient-to-br from-blue-500/30 via-cyan-400/20 to-transparent blur-sm" />
        <span className="relative text-sm font-black text-blue-200">F</span>
      </span>

      <span className="flex flex-col leading-none">
        <span className="bg-gradient-to-r from-blue-200 via-cyan-300 to-blue-500 bg-clip-text text-xl font-black tracking-[0.22em] text-transparent">
          FITRA
        </span>
        <span className="mt-1 hidden text-[9px] font-semibold tracking-[0.28em] text-slate-500 sm:block">
          AI FITNESS SYSTEM
        </span>
      </span>
    </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <LoadingLink
              key={item.href}
              href={item.href}
              theme={item.theme}
              className="rounded-full border border-slate-800 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-200"
            >
              {item.label}
            </LoadingLink>
          ))}

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/20"
          >
            Logout
          </button>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-blue-500/40 bg-blue-500/10 text-blue-100 md:hidden"
          aria-label="メニューを開く"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-800 bg-[#05060a] px-4 py-4 md:hidden">
          <div className="mx-auto max-w-6xl">
            <p className="mb-3 break-all text-xs text-slate-400">
              {user?.email ? `${user.email} さん` : "ログイン中"}
            </p>

            <nav className="grid gap-2">
              {navItems.map((item) => (
                <LoadingLink
                  key={item.href}
                  href={item.href}
                  theme={item.theme}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-blue-500/50 hover:bg-blue-500/10"
                >
                  {item.label}
                </LoadingLink>
              ))}

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-left text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}