"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/config/navigation";

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-6">
        <span className="font-semibold">Fisheries Compliance</span>

        <div className="flex gap-4">
          {NAV_ITEMS.map(item => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition ${
                  isActive
                    ? "font-medium text-black"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
