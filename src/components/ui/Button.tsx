"use client";

import React from "react";
import { useTheme } from "@/src/context/ThemeContext";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = "primary",
  icon,
  className = "",
  ...props
}: ButtonProps) {
  const { palette } = useTheme();

  if (variant === "outline") {
    return (
      <button
        {...props}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition shadow-xs hover:opacity-80 active:scale-95 ${className}`}
        style={{ borderColor: palette.primary, color: palette.primary }}
      >
        {icon}
        <span>{children}</span>
      </button>
    );
  }

  return (
    <button
      {...props}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition hover:opacity-90 active:scale-95 ${className}`}
      style={{ backgroundColor: palette.primary }}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
