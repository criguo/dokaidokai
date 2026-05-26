"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNav() {
  const pathname = usePathname();

  const tabs = [
    { href: "/", label: "首页", icon: "🏠" },
    { href: "/mistakes", label: "做题记录", icon: "📋" },
    { href: "/data", label: "学习数据", icon: "📊" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t md:hidden"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-0.5 px-4 py-1 text-xs"
              style={{ color: isActive ? "var(--color-accent)" : "var(--color-text-muted)" }}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
