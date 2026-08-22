"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/" },
    { label: "Raw Data", href: "/raw-data" },
    { label: "Analysis Agent", href: "/agent" }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-gray-900 text-white font-bold flex items-center justify-center text-sm tracking-tight">
              HA
            </span>
            <span className="font-bold text-base sm:text-lg text-gray-900 tracking-tight">
              Health<span className="text-gray-500 font-normal">Assistant</span>
            </span>
          </Link>

          {/* Clean Segmented Navigation with Comfortable Touch Targets */}
          <nav className="flex items-center p-1 bg-gray-100/90 rounded-xl sm:rounded-full text-xs sm:text-sm font-medium">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-full transition-all duration-150 whitespace-nowrap ${
                    isActive
                      ? "bg-white text-gray-900 shadow-xs font-semibold"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Status */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-gray-800">Alex (30)</span>
          </div>
        </div>
      </div>
    </header>
  );
}
