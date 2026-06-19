"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  BellIcon,
  ChartIcon,
  GridIcon,
  SearchIcon,
  SettingsIcon,
  UserCircleIcon,
  UsersIcon,
} from "@/components/icons";

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <GridIcon className="icon-sm" aria-hidden="true" />,
  },
  {
    label: "Partners",
    href: "/partners",
    icon: <UsersIcon className="icon-sm" aria-hidden="true" />,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: <ChartIcon className="icon-sm" aria-hidden="true" />,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <SettingsIcon className="icon-sm" aria-hidden="true" />,
  },
];

type DashboardLayoutProps = {
  children: ReactNode;
  /** Optional CTA button in the sidebar */
  sidebarCta?: ReactNode;
  /** Show search bar in topbar (default: false) */
  showSearch?: boolean;
  /** Search placeholder text */
  searchPlaceholder?: string;
};

export default function DashboardLayout({
  children,
  sidebarCta,
  showSearch = false,
  searchPlaceholder = "Cari...",
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);

  // Centralized auth guard
  useEffect(() => {
    const session = localStorage.getItem("adminSession");
    if (!session) {
      router.replace("/");
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthenticated(true);
    }
  }, [router]);

  // Don't render until auth check completes
  if (!authenticated) {
    return null;
  }

  return (
    <div className="dashboard-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-badge">ITS</div>
          <div>
            <div className="brand-title">Admin Panel</div>
            <div className="brand-subtitle">Management System</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.href}
              className={`nav-item${pathname === item.href ? " active" : ""}`}
              type="button"
              onClick={() => router.push(item.href)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {sidebarCta}
      </aside>

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="top-accent" />
        <header className="dashboard-topbar">
          {showSearch ? (
            <div className="topbar-search">
              <SearchIcon className="icon-sm" aria-hidden="true" />
              <input type="text" placeholder={searchPlaceholder} />
            </div>
          ) : null}
          <button
            className="topbar-icon"
            type="button"
            aria-label="Notifications"
          >
            <BellIcon className="icon-sm" aria-hidden="true" />
            <span className="notification-dot" />
          </button>
          <button className="topbar-icon" type="button" aria-label="Profile">
            <UserCircleIcon className="icon-sm" aria-hidden="true" />
          </button>
        </header>

        <div className="dashboard-content">{children}</div>
      </div>
    </div>
  );
}
