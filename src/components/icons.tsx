import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function ShieldIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M12 3l7 3v5c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-3z"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="11" r="3" strokeWidth="1.6" />
      <path d="M8.5 16.5c1.1-1.4 2.5-2 3.5-2s2.4.6 3.5 2" strokeWidth="1.6" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="12" cy="8" r="3.2" strokeWidth="1.6" />
      <path d="M5 19c1.6-3 4.4-4.5 7-4.5s5.4 1.5 7 4.5" strokeWidth="1.6" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <rect x="5" y="10" width="14" height="10" rx="2" strokeWidth="1.6" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeWidth="1.6" />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="2.6" strokeWidth="1.6" />
    </svg>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M3 4.5l18 15" strokeWidth="1.6" />
      <path
        d="M5.5 7.5C3.6 9.1 2.5 12 2.5 12s3.5 6 9.5 6c2.2 0 4.1-.7 5.6-1.7"
        strokeWidth="1.6"
      />
      <path
        d="M9.4 6.2A9.6 9.6 0 0 1 12 6c6 0 9.5 6 9.5 6s-1.5 2.6-4.2 4.5"
        strokeWidth="1.6"
      />
      <path d="M10 10.2a3.1 3.1 0 0 0 4 4" strokeWidth="1.6" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M5 12h14" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M13 6l6 6-6 6"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="11" cy="11" r="6" strokeWidth="1.6" />
      <path d="M16 16l4.2 4.2" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function FilterIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M4 6h16" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 12h10" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10 18h4" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function EditIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M4 20h4l10-10-4-4L4 16v4z" strokeWidth="1.6" />
      <path d="M13 6l4 4" strokeWidth="1.6" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M5 7h14" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 7V5h6v2" strokeWidth="1.6" />
      <rect x="6.5" y="7" width="11" height="13" rx="2" strokeWidth="1.6" />
      <path d="M10 11v6M14 11v6" strokeWidth="1.6" />
    </svg>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M6 16h12l-1.5-2.4V10a4.5 4.5 0 1 0-9 0v3.6L6 16z"
        strokeWidth="1.6"
      />
      <path d="M10 18a2 2 0 0 0 4 0" strokeWidth="1.6" />
    </svg>
  );
}

export function UserCircleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="9" strokeWidth="1.6" />
      <circle cx="12" cy="10" r="3" strokeWidth="1.6" />
      <path d="M7.5 18c1.6-2.2 3.5-3 4.5-3s2.9.8 4.5 3" strokeWidth="1.6" />
    </svg>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <rect x="4" y="4" width="6" height="6" rx="1" strokeWidth="1.6" />
      <rect x="14" y="4" width="6" height="6" rx="1" strokeWidth="1.6" />
      <rect x="4" y="14" width="6" height="6" rx="1" strokeWidth="1.6" />
      <rect x="14" y="14" width="6" height="6" rx="1" strokeWidth="1.6" />
    </svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="9" cy="9" r="3" strokeWidth="1.6" />
      <circle cx="16.5" cy="10" r="2.5" strokeWidth="1.6" />
      <path d="M3.5 19c1.4-2.6 3.7-4 5.5-4s4.1 1.4 5.5 4" strokeWidth="1.6" />
      <path
        d="M13 17.5c.8-1.4 2.2-2.2 3.5-2.2 1.2 0 2.5.7 3.2 2.2"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M4 18V6" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 18h16" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M7 14l4-4 3 3 5-6"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"
        strokeWidth="1.6"
      />
      <path
        d="M4.5 12l1.6-.4.7-1.7-1-1.4 1.5-1.5 1.4 1 1.7-.7.4-1.6h2.2l.4 1.6 1.7.7 1.4-1 1.5 1.5-1 1.4.7 1.7 1.6.4v2.2l-1.6.4-.7 1.7 1 1.4-1.5 1.5-1.4-1-1.7.7-.4 1.6H10l-.4-1.6-1.7-.7-1.4 1-1.5-1.5 1-1.4-.7-1.7-1.6-.4V12z"
        strokeWidth="1.2"
      />
    </svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M12 4v10" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M8 10l4 4 4-4"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 20h14" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
