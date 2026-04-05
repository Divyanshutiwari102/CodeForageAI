"use client";

import { create } from "zustand";
import type { User } from "@/types";
import { getCurrentUser, login as loginRequest, signup as signupRequest } from "@/services/auth";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/services/token";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  init: () => Promise<void>;
  login: (payload: { username: string; password: string }) => Promise<void>;
  signup: (payload: { username: string; name: string; password: string }) => Promise<void>;
  loadUser: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  init: async () => {
    const token = getAuthToken();
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }
    await useAuthStore.getState().loadUser();
  },
  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await loginRequest(payload);
      setAuthToken(token);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      clearAuthToken();
      set({ user: null, isAuthenticated: false, isLoading: false, error: "Invalid credentials" });
      throw new Error("Login failed");
    }
  },
  signup: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await signupRequest(payload);
      setAuthToken(token);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      clearAuthToken();
      set({ user: null, isAuthenticated: false, isLoading: false, error: "Signup failed" });
      throw new Error("Signup failed");
    }
  },
  loadUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      clearAuthToken();
      set({ user: null, isAuthenticated: false, isLoading: false });
      throw new Error("Unauthorized");
    }
  },
  logout: () => {
    clearAuthToken();
    set({ user: null, isAuthenticated: false, isLoading: false, error: null });
  },
}));
