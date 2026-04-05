"use client";

import { create } from "zustand";
import axios from "axios";
import type { User } from "@/types";
import { getCurrentUser, login as loginRequest, signup as signupRequest } from "@/services/auth";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/services/token";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  init: () => Promise<void>;
  login: (payload: { username: string; password: string }) => Promise<boolean>;
  signup: (payload: { username: string; name: string; password: string }) => Promise<boolean>;
  loadUser: () => Promise<void>;
  logout: () => void;
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback;
  const message = error.response?.data?.message;
  return typeof message === "string" && message.length > 0 ? message : fallback;
}

export const useAuthStore = create<AuthState>((set, get) => ({
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
    try {
      await get().loadUser();
    } catch (error) {
      const message = extractErrorMessage(error, "Session initialization failed");
      set({ user: null, isAuthenticated: false, isLoading: false, error: message });
      if (process.env.NODE_ENV !== "production") {
        console.error("Auth init failed");
      }
      return;
    }
  },
  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await loginRequest(payload);
      setAuthToken(token);
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      const message = extractErrorMessage(error, "Login failed. Please try again.");
      clearAuthToken();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: message,
      });
      return false;
    }
  },
  signup: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await signupRequest(payload);
      setAuthToken(token);
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      const message = extractErrorMessage(error, "Unable to create account. Please try again.");
      clearAuthToken();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: message,
      });
      return false;
    }
  },
  loadUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      const message = extractErrorMessage(error, "Failed to load user profile");
      clearAuthToken();
      set({ user: null, isAuthenticated: false, isLoading: false, error: message });
      throw new Error(message);
    }
  },
  logout: () => {
    clearAuthToken();
    set({ user: null, isAuthenticated: false, isLoading: false, error: null });
  },
}));
