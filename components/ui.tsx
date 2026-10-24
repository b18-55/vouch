"use client";
// 'use client' is required here because this file contains interactive elements 
// (like buttons and input fields) that rely on React state and browser events.

import Link from "next/link";
import type { ReactNode } from "react";

// ==========================================
// 1. ICON SYSTEM
// ==========================================
export type IconName =
  | "arrow" | "back" | "bell" | "briefcase" | "check" | "chevron"
  | "clock" | "close" | "edit" | "home" | "location" | "lock"
  | "mail" | "plus" | "profile" | "search" | "settings" | "spark" | "wallet";

const iconPaths: Record<IconName, ReactNode> = {
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  back: <path d="m15 18-6-6 6-6" />,
  bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />,
  briefcase: <path d="M9 7V5h6v2m-12 4h18M5 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm5 4v2h4v-2" />,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  edit: <path d="m4 16-1 5 5-1L19 9l-4-4L4 16Zm9-9 4 4" />,
  home: <path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-9Z" />,
  location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m16 16 5 5" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
  spark: <path d="m12 3 1.3 4.2L17 9l-3.7 1.8L12 15l-1.3-4.2L7 9l3.7-1.8L12 3ZM5 15l.7 2.3L8 18.5l-2.3 1.2L5 22l-.7-2.3L2 18.5l2.3-1.2L5 15Zm14-2 .7 2.3 2.3 1.2-2.3 1.2L19 20l-.7-2.3-2.3-1.2 2.3-1.2L19 13Z" />,
  wallet: <><path d="M4 6h14a2 2 0 0 1 2 2v11H4a2 2 0 0 1-2-2V6a3 3 0 0 1 3-3h12" /><path d="M16 11h6v5h-6a2.5 2.5 0 0 1 0-5Z" /></>,
};

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg aria-hidden="true" className="shrink-0" fill="none" height={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width={size}>
      {iconPaths[name]}
    </svg>
  );
}

// ==========================================
// 2. BUTTON COMPONENT
// ==========================================
type ButtonProps = {
  children: ReactNode;
  className?: string;
  icon?: IconName;
  kind?: "primary" | "secondary" | "ghost";
  onClick?: () => void;
  type?: "button" | "submit";
  href?: string;
  disabled?: boolean;
};

export function Button({ children, className = "", icon, kind = "primary", onClick, type = "button", href, disabled = false }: ButtonProps) {
  // FIX: Added dark mode classes to secondary and ghost buttons
  const styles =
    kind === "primary"
      ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
      : kind === "secondary"
        ? "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800";
        
  const classes = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 ${styles} ${className}`;
  
  const content = (
    <>
      {children}
      {icon && <Icon name={icon} size={18} />}
    </>
  );

  if (href) {
    return (
      <Link className={classes} href={href}>
        {content}
      </Link>
    );
  }
  
  return (
    <button className={classes} disabled={disabled} onClick={onClick} type={type}>
      {content}
    </button>
  );
}

// ==========================================
// 3. PAGE TITLE COMPONENT
// ==========================================
export function PageTitle({ eyebrow, title, text, action }: { eyebrow?: string; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
          {title}
        </h1>
        {text && (
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            {text}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}

// ==========================================
// 4. FORM FIELD COMPONENT
// ==========================================
type FieldProps = {
  icon?: IconName;
  label: string;
  placeholder: string;
  type?: string;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  maxLength?: number;
};

export function Field({ icon, label, placeholder, type = "text", value, onChange, name, maxLength }: FieldProps) {
  return (
    <label className="block">
      {/* FIX: Added dark:text-slate-200 to the label */}
      <span className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200">{label}</span>
      <span className="relative block">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            <Icon name={icon} size={18} />
          </span>
        )}
        {/* FIX: Added dark mode background, text, and border colors to the input */}
        <input
          className={`h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50 ${icon ? "pl-11" : ""}`}
          maxLength={maxLength}
          name={name}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          placeholder={placeholder}
          type={type}
          value={value}
        />
      </span>
    </label>
  );
}