"use client";

import React, { useEffect } from "react";
import clsx from "clsx";
import { X, Check } from "lucide-react";
import {
  useWorkspaceStore,
  THEME_PROFILES,
  type ThemeProfile,
} from "../../lib/store";

export function ThemeSettingsModal() {
  const { isThemeSettingsOpen, setThemeSettingsOpen, themeProfile, setThemeProfile } =
    useWorkspaceStore();

  // Close on Escape
  useEffect(() => {
    if (!isThemeSettingsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setThemeSettingsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isThemeSettingsOpen, setThemeSettingsOpen]);

  if (!isThemeSettingsOpen) return null;

  const handleSelect = (profile: ThemeProfile) => {
    setThemeProfile(profile);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]"
      onClick={() => setThemeSettingsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Theme color profiles"
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-card border border-line shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div>
            <h2 className="font-unbounded font-semibold text-sm text-ink">
              Color Profiles & Theme
            </h2>
            <p className="font-albert text-[11px] text-ink-muted mt-0.5">
              One click re-skins the entire workspace. Persisted to this browser.
            </p>
          </div>
          <button
            onClick={() => setThemeSettingsOpen(false)}
            title="Close"
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-hovered transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Grid */}
        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {THEME_PROFILES.map((profile) => {
            const isActive = themeProfile === profile.id;
            return (
              <button
                key={profile.id}
                onClick={() => handleSelect(profile.id)}
                className={clsx(
                  "group relative flex flex-col items-start gap-2.5 p-3 rounded-xl border text-left transition cursor-pointer",
                  isActive
                    ? "border-accent ring-2 ring-accent/25 bg-accent-soft/40"
                    : "border-line hover:border-line-strong hover:bg-hovered/40"
                )}
              >
                {/* Live swatch preview */}
                <div
                  className="w-full h-14 rounded-lg border border-line overflow-hidden flex"
                  aria-hidden
                >
                  <div
                    className="flex-[2] flex flex-col justify-center gap-1 px-2"
                    style={{ background: profile.swatch[0] }}
                  >
                    <span
                      className="block h-1.5 w-3/4 rounded-full"
                      style={{ background: profile.swatch[1] }}
                    />
                    <span
                      className="block h-1.5 w-1/2 rounded-full opacity-60"
                      style={{ background: profile.swatch[1] }}
                    />
                  </div>
                  <div
                    className="flex-1 flex flex-col justify-center gap-1 px-1.5"
                    style={{ background: profile.swatch[1] }}
                  >
                    <span
                      className="block h-1.5 w-full rounded-full"
                      style={{ background: profile.swatch[2] }}
                    />
                    <span
                      className="block h-1.5 w-2/3 rounded-full opacity-40"
                      style={{ background: profile.swatch[2] }}
                    />
                  </div>
                </div>

                <div className="w-full">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={clsx(
                        "inline-flex items-center justify-center w-5 h-5 rounded-md shrink-0",
                        isActive
                          ? "bg-accent text-on-accent"
                          : "bg-subtle text-ink-muted border border-line"
                      )}
                    >
                      <profile.icon className="w-3 h-3" />
                    </span>
                    <span className="font-albert text-xs font-semibold text-ink truncate">
                      {profile.name}
                    </span>
                    {isActive && (
                      <span className="ml-auto inline-flex items-center justify-center w-4 h-4 rounded-full bg-accent text-on-accent shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <p className="font-albert text-[10px] text-ink-muted mt-0.5 truncate">
                    {profile.tagline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-line flex items-center justify-between">
          <span className="font-albert text-[10px] text-ink-muted">
            Selection is stored in localStorage and applied instantly via CSS variables.
          </span>
        </div>
      </div>
    </div>
  );
}
