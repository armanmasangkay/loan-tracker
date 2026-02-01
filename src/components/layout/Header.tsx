"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface HeaderProps {
  user: {
    displayName: string;
    role: "admin" | "user";
  };
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();

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
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Page Title */}
          <h1 className="text-xl font-semibold text-slate-900">
            {getPageTitle()}
          </h1>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
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
          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-slate-600">{user.displayName}</span>
            {user.role === "admin" && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                Admin
              </span>
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
          ? "bg-blue-50 text-blue-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      {children}
    </Link>
  );
}
