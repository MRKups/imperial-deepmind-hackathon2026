"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/" },
    { label: "Raw Data", href: "/raw-data" },
    { label: "Anticipatory Agent", href: "/agent" }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Minimal Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-gray-900 text-white font-semibold flex items-center justify-center text-xs tracking-tighter">
              AH
            </span>
            <span className="font-semibold text-sm text-gray-900 tracking-tight">
              Anticipate<span className="text-gray-400 font-normal">Health</span>
            </span>
          </Link>

          {/* Clean Segmented Navigation */}
          <nav className="flex items-center p-1 bg-gray-100/70 rounded-full text-xs font-medium">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-1.5 rounded-full transition-all duration-150 ${
                    isActive
                      ? "bg-white text-gray-900 shadow-xs font-semibold"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Minimal User Status */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="font-medium text-gray-700">Alex</span>
          </div>
        </div>
      </div>
    </header>
  );
}
