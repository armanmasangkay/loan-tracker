"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth";

interface HeaderProps {
  user: {
    username: string;
    role: "admin" | "user";
  };
}

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const [showLogout, setShowLogout] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowLogout(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Loans";
    if (pathname === "/dashboard/loans/new") return "New Loan";
    if (pathname.startsWith("/dashboard/loans/")) return "Loan Details";
    if (pathname === "/dashboard/users") return "Users";
    if (pathname === "/dashboard/settings") return "Settings";
    if (pathname === "/dashboard/maintenance") return "Maintenance";
    return "Loan Tracker";
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-teal-600 to-teal-500 shadow-md flex justify-center">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Page Title */}
          <h1 className="text-xl font-semibold text-white">
            {getPageTitle()}
          </h1>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLink href="/dashboard" current={pathname === "/dashboard"}>
              Loans
            </NavLink>
            <NavLink
              href="/dashboard/loans/new"
              current={pathname === "/dashboard/loans/new"}
            >
              New Loan
            </NavLink>
            {user.role === "admin" && (
              <>
                <NavLink href="/dashboard/users" current={pathname === "/dashboard/users"}>
                  Users
                </NavLink>
                <NavLink
                  href="/dashboard/maintenance"
                  current={pathname === "/dashboard/maintenance"}
                >
                  Maintenance
                </NavLink>
              </>
            )}
            <NavLink href="/dashboard/settings" current={pathname === "/dashboard/settings"}>
              Settings
            </NavLink>
          </nav>

          {/* User Info */}
          <div className="flex items-center relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setShowLogout(!showLogout)}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              {/* Avatar with initials */}
              <div className="w-8 h-8 rounded-full bg-white text-teal-600 flex items-center justify-center text-sm font-semibold">
                {getInitials(user.username)}
              </div>
              {/* Desktop: show full info */}
              <div className="hidden md:flex flex-col items-start">
                <span className="text-xs text-teal-200 leading-tight">
                  Signed in as
                </span>
                <span className="text-sm font-medium text-white leading-tight">
                  {user.username}
                </span>
              </div>
              {user.role === "admin" && (
                <span className="hidden md:inline text-xs bg-white/20 text-white px-2 py-1 rounded-full font-medium">
                  Admin
                </span>
              )}
              {/* Dropdown arrow */}
              <svg
                className={cn(
                  "w-4 h-4 text-teal-200 transition-transform",
                  showLogout && "rotate-180"
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {/* Dropdown menu */}
            {showLogout && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-[var(--border)] rounded-lg shadow-lg py-1 min-w-[160px]">
                {/* Mobile: show user info in dropdown */}
                <div className="md:hidden px-4 py-2 border-b border-[var(--border)]">
                  <span className="text-xs text-[var(--muted-foreground)]">Signed in as</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {user.username}
                    </span>
                    {user.role === "admin" && (
                      <span className="text-xs bg-[var(--primary-light)] text-[var(--primary)] px-2 py-0.5 rounded-full font-medium">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setShowLogout(false)}
                  className="block w-full px-4 py-2 text-sm text-left text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                >
                  Change Password
                </Link>
                <div className="border-t border-[var(--border)] my-1" />
                <form action={logout}>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 text-sm text-left text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                  >
                    Logout
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  current,
  children,
}: {
  href: string;
  current: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "px-3 py-2 text-sm font-medium rounded-lg transition-colors min-h-[44px] flex items-center",
        current
          ? "bg-white/20 text-white"
          : "text-teal-100 hover:bg-white/10 hover:text-white"
      )}
    >
      {children}
    </Link>
  );
}
