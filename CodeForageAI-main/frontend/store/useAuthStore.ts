"use client";

import { create } from "zustand";
import type { User } from "@/types";
import { getCurrentUser } from "@/services/auth";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  loadUser: async () => {
    set({ isLoading: true });
    const user = await getCurrentUser();
    set({ user, isLoading: false });
  },
}));
