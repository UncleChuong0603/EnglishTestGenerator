"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore, type ReactNode } from "react";
import type { InterfaceLanguage } from "@/lib/i18n/config";

const SIDEBAR_STORAGE_KEY = "toeic-gym:learner-sidebar-collapsed";
const SIDEBAR_CHANGE_EVENT = "toeic-gym:learner-sidebar-change";

function subscribeToSidebarPreference(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(SIDEBAR_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(SIDEBAR_CHANGE_EVENT, onStoreChange);
  };
}

function getSidebarPreference() {
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function SidebarToggleIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="20"
    >
      <path d={collapsed ? "m9 18 6-6-6-6" : "m15 18-6-6 6-6"} />
    </svg>
  );
}

export function LearnerNavigationShell({
  brand,
  children,
  locale,
}: {
  brand: string;
  children: ReactNode;
  locale: InterfaceLanguage;
}) {
  const collapsed = useSyncExternalStore(
    subscribeToSidebarPreference,
    getSidebarPreference,
    () => false,
  );
  const vi = locale === "vi";
  const toggleLabel = collapsed
    ? vi
      ? "Hiện thanh điều hướng"
      : "Show navigation sidebar"
    : vi
      ? "Ẩn thanh điều hướng"
      : "Hide navigation sidebar";

  function toggleSidebar() {
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(!collapsed));
      window.dispatchEvent(new Event(SIDEBAR_CHANGE_EVENT));
    } catch {
      // Keep the expanded navigation available when storage is unavailable.
    }
  }

  return (
    <aside
      className="learner-navigation"
      data-collapsed={collapsed ? "true" : "false"}
    >
      <Link
        aria-label={
          vi
            ? "Về trang giới thiệu TOEIC GYM"
            : "Go to TOEIC GYM public home"
        }
        className="learner-navigation-brand"
        href="/"
      >
        <Image
          alt=""
          height={32}
          src="/brand/toeic-gym-mark.png"
          width={32}
        />
        <span>{brand}</span>
      </Link>
      <button
        aria-controls="learner-sidebar-groups"
        aria-expanded={!collapsed}
        aria-label={toggleLabel}
        className="learner-sidebar-toggle"
        onClick={toggleSidebar}
        title={toggleLabel}
        type="button"
      >
        <SidebarToggleIcon collapsed={collapsed} />
      </button>
      {children}
    </aside>
  );
}
