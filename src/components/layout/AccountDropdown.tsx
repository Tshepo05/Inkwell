"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/Button";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";

export function AccountDropdown() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.viewer);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-paper-muted"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent">
          <User className="h-4 w-4" />
        </div>
        <span className="max-w-[100px] truncate">
          {user.firstName || user.name || "Account"}
        </span>
        <ChevronDown className={`h-4 w-4 text-ink-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-border bg-surface p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="px-3 py-2 border-b border-border mb-1">
            <p className="text-sm font-medium text-ink truncate">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user.name || "User"}
            </p>
            {user.email && (
              <p className="text-xs text-ink-muted truncate">{user.email}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink hover:bg-paper-muted transition-colors"
            >
              <User className="h-4 w-4 text-ink-muted" />
              Profile
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink hover:bg-paper-muted transition-colors"
            >
              <Settings className="h-4 w-4 text-ink-muted" />
              Settings
            </Link>
            <div className="h-px bg-border my-1" />
            <button
              onClick={() => void signOut()}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
