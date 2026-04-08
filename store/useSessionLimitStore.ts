/**
 * useSessionLimitStore
 * Claude-style daily message limits:
 *   FREE → FREE_DAILY_LIMIT messages/day, resets midnight UTC
 *   PRO  → unlimited (-1)
 */
"use client";

import { create } from "zustand";

export const FREE_DAILY_LIMIT = 20;
export const PRO_DAILY_LIMIT  = -1;

const STORAGE_KEY = "cfai-session-limit";

interface StoredState { date: string; used: number; userId: string; }

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadStored(userId: string): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const p: StoredState = JSON.parse(raw);
    if (p.userId !== userId || p.date !== todayUTC()) return 0;
    return p.used ?? 0;
  } catch { return 0; }
}

function persist(userId: string, used: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayUTC(), used, userId }));
  } catch { /* storage full */ }
}

function nextMidnightUTC(): string {
  const d = new Date();
  d.setUTCHours(24, 0, 0, 0);
  return d.toISOString();
}

interface SessionLimitState {
  used: number;
  limit: number;
  resetsAt: string;
  showPaywall: boolean;
  boot: (userId: string, plan: "free" | "pro") => void;
  consumeMessage: () => boolean;
  dismissPaywall: () => void;
}

export const useSessionLimitStore = create<SessionLimitState>((set, get) => ({
  used: 0,
  limit: FREE_DAILY_LIMIT,
  resetsAt: nextMidnightUTC(),
  showPaywall: false,

  boot: (userId, plan) => {
    const limit = plan === "pro" ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;
    const used  = plan === "pro" ? 0 : loadStored(userId);
    set({ used, limit, resetsAt: nextMidnightUTC(), showPaywall: false });
  },

  consumeMessage: () => {
    const { used, limit } = get();
    if (limit === PRO_DAILY_LIMIT) return true;
    if (used >= limit) { set({ showPaywall: true }); return false; }
    set({ used: used + 1 });
    return true;
  },

  dismissPaywall: () => set({ showPaywall: false }),
}));

export function selectSessionStatus(s: SessionLimitState) {
  const unlimited = s.limit === PRO_DAILY_LIMIT;
  const remaining = unlimited ? Infinity : Math.max(0, s.limit - s.used);
  const pct       = unlimited ? 0 : Math.min(100, Math.round((s.used / s.limit) * 100));
  const nearLimit = !unlimited && remaining <= 5;
  return { unlimited, remaining, pct, nearLimit };
}
