"use client";

import { Bell, User, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";

interface AppHeaderProps {
  pageTitle?: string;
  actionButton?: React.ReactNode;
}

export function AppHeader({ pageTitle, actionButton }: AppHeaderProps) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pageTitle) return pageTitle;
    if (pathname === "/") return "AO Dashboard";
    if (pathname === "/niner") return "Draft Email";
    if (pathname === "/vrt-call") return "VRT Call";
    return "Dashboard";
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left: Page Title */}
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right: User Actions */}
        <div className="flex items-center gap-4">
          {/* User Avatar */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white dark:bg-slate-700">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}
