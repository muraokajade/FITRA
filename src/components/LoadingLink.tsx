"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Theme = "home" | "training" | "diet" | "life";

type Props = {
  href: string;
  theme: Theme;
  children: React.ReactNode;
  className?: string;
};

const config = {
  home: {
    label: "FITRA",
    main: "FITRA AI analyzing...",
    sub: "Training / Diet / Life を統合解析中",
    color: "text-blue-300",
    ring: "border-blue-400",
    glow: "bg-blue-500/25",
  },
  training: {
    label: "TRAINING AI",
    main: "Training AI analyzing...",
    sub: "筋力・重量・ボリュームを解析中",
    color: "text-red-300",
    ring: "border-red-400",
    glow: "bg-red-500/25",
  },
  diet: {
    label: "DIET AI",
    main: "Diet AI analyzing...",
    sub: "栄養・PFC・食事傾向を解析中",
    color: "text-orange-300",
    ring: "border-orange-400",
    glow: "bg-orange-500/25",
  },
  life: {
    label: "LIFE AI",
    main: "Life AI analyzing...",
    sub: "睡眠・疲労・ストレスを解析中",
    color: "text-emerald-300",
    ring: "border-emerald-400",
    glow: "bg-emerald-500/25",
  },
};

export default function LoadingLink({
  href,
  theme,
  children,
  className,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const c = config[theme];

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (loading) return;

    if (pathname === href) {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setLoading(true);

    timerRef.current = setTimeout(() => {
      router.push(href);
    }, 900);
  };

  return (
    <>
      <a href={href} onClick={handleClick} className={className}>
        {children}
      </a>

      {loading &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#05060a] text-white">
            <div
              className={`absolute h-[420px] w-[420px] rounded-full ${c.glow} blur-3xl`}
            />

            <div className="relative flex h-64 w-64 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-white/10" />

              <div
                className={`absolute inset-0 animate-spin rounded-full border-t-2 ${c.ring} border-r-2 border-r-transparent`}
              />

              <div
                className={`absolute inset-6 animate-[spin_1.6s_linear_infinite_reverse] rounded-full border-b-2 ${c.ring} border-l-2 border-l-transparent opacity-70`}
              />

              <div className="relative z-10 flex h-36 w-36 flex-col items-center justify-center rounded-full border border-white/10 bg-[#05060a]/90 shadow-[0_0_40px_rgba(255,255,255,0.12)]">
                <p className="text-[10px] tracking-[0.25em] text-slate-400">
                  {c.label}
                </p>

                <p className={`mt-2 text-lg font-black ${c.color}`}>
                  SCANNING
                </p>

                <p className="mt-1 text-[10px] text-slate-500">AI SYSTEM</p>
              </div>
            </div>

            <div className="absolute bottom-20 space-y-2 text-center">
              <p className={`animate-pulse text-sm font-semibold ${c.color}`}>
                {c.main}
              </p>
              <p className="text-xs text-slate-400">{c.sub}</p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}