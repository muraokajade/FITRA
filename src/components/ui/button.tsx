// src/components/ui/button.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded bg-blue-600 text-white disabled:bg-gray-500",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
