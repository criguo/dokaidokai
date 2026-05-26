"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { useUserStore } from "@/stores/user-store";

const THEME_ICONS: Record<string, string> = {
  light: "☀️",
  dark: "🌙",
  system: "💻",
};

const THEME_LABELS: Record<string, string> = {
  light: "浅色",
  dark: "深色",
  system: "跟随系统",
};

export function Header() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const apiKey = useUserStore((s) => s.apiKey);
  const setApiKey = useUserStore((s) => s.setApiKey);

  const [showSettings, setShowSettings] = useState(false);
  const [keyInput, setKeyInput] = useState(apiKey);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  const desktopNav = [
    { href: "/", label: "首页", icon: "🏠" },
    { href: "/mistakes", label: "做题记录", icon: "📋" },
    { href: "/data", label: "学习数据", icon: "📊" },
  ];

  const cycleTheme = () => {
    const order: Array<"light" | "dark" | "system"> = ["light", "dark", "system"];
    const idx = order.indexOf((theme as typeof order[number]) ?? "system");
    setTheme(order[(idx + 1) % 3]);
  };

  return (
    <header className="sticky top-0 z-40 border-b" style={{
      backgroundColor: "var(--color-surface)",
      borderColor: "var(--color-border)",
      paddingTop: "env(safe-area-inset-top, 0px)",
    }}>
      <div className="max-w-5xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-bold active:opacity-70 transition-opacity"
          style={{ color: "var(--color-accent)" }}
        >
          Dokaidokai
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1.5">
          {desktopNav.map((nav) => {
            const isActive = pathname === nav.href;
            return (
              <Link
                key={nav.href}
                href={nav.href}
                className="text-xs font-medium px-3 py-2 rounded-lg border active:scale-95 transition-all flex items-center gap-1.5"
                style={{
                  borderColor: isActive ? "var(--color-accent)" : "var(--color-border)",
                  color: isActive ? "var(--color-accent-text)" : "var(--color-text-muted)",
                  backgroundColor: isActive ? "var(--color-accent)" : "var(--color-surface)",
                }}
              >
                <span className="text-sm">{nav.icon}</span>
                {nav.label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Fullscreen */}
          <button
            className="text-base min-w-[36px] min-h-[36px] flex items-center justify-center rounded-md active:opacity-70 transition-opacity"
            onClick={toggleFullscreen}
            title={isFullscreen ? "退出全屏" : "全屏"}
            style={{ backgroundColor: "var(--color-highlight)" }}
          >
            {isFullscreen ? "⛷" : "⛶"}
          </button>

          {/* Theme toggle */}
          <button
            className="text-base min-w-[36px] min-h-[36px] flex items-center justify-center rounded-md active:opacity-70 transition-opacity"
            onClick={cycleTheme}
            title={`主题: ${THEME_LABELS[theme ?? "system"]}`}
            style={{ backgroundColor: "var(--color-highlight)" }}
          >
            {THEME_ICONS[theme ?? "system"]}
          </button>

          {/* Settings gear */}
          <button
            className="text-base min-w-[36px] min-h-[36px] flex items-center justify-center rounded-md active:opacity-70 transition-opacity"
            onClick={() => {
              setKeyInput(apiKey);
              setShowSettings(!showSettings);
            }}
            title="设置"
            style={{ backgroundColor: "var(--color-highlight)" }}
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowSettings(false)}
          />
          <div
            className="absolute right-2 sm:right-4 top-14 w-[calc(100vw-16px)] max-w-[320px] sm:w-80 rounded-xl border shadow-xl p-5 z-50"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}
          >
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text)" }}>
              设置
            </h3>

            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--color-text-muted)" }}>
              主题模式
            </label>
            <div className="flex gap-2 mb-4">
              {(["light", "dark", "system"] as const).map((t) => (
                <button
                  key={t}
                  className={`flex-1 text-xs py-2 rounded-lg border active:scale-95 transition-transform ${
                    theme === t ? "font-semibold" : ""
                  }`}
                  style={{
                    backgroundColor: theme === t ? "var(--color-accent)" : "transparent",
                    borderColor: theme === t ? "var(--color-accent)" : "var(--color-border)",
                    color: theme === t ? "var(--color-accent-text)" : "var(--color-text)",
                  }}
                  onClick={() => setTheme(t)}
                >
                  {THEME_ICONS[t]} {THEME_LABELS[t]}
                </button>
              ))}
            </div>

            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--color-text-muted)" }}>
              DeepSeek API Key
            </label>
            <div className="flex gap-2 mb-1">
              <input
                type="password"
                className="flex-1 text-xs rounded-lg border px-3 py-2 min-h-[36px]"
                style={{
                  backgroundColor: "var(--color-bg)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
                placeholder="sk-..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
              />
              <button
                className="text-xs px-3 py-2 rounded-lg font-medium min-h-[36px] active:opacity-80 transition-opacity"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "var(--color-accent-text)",
                }}
                onClick={() => {
                  setApiKey(keyInput.trim());
                  setShowSettings(false);
                }}
              >
                保存
              </button>
            </div>
            <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>
              Key 仅保存在本地浏览器，不会上传服务器
            </p>

            <button
              className="w-full text-xs py-2 rounded-lg border min-h-[36px] active:opacity-80 transition-opacity"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text-muted)",
              }}
              onClick={() => setShowSettings(false)}
            >
              关闭
            </button>
          </div>
        </>
      )}
    </header>
  );
}
