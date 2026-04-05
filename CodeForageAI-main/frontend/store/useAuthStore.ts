"use client";

import { create } from "zustand";
import type { User } from "@/types";
import { getCurrentUser, login as loginRequest, signup as signupRequest } from "@/services/auth";
import { clearAuthToken, setAuthToken } from "@/services/token";
import { getErrorMessage } from "@/services/errors";

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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  init: async () => {
    try {
      await get().loadUser();
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
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
      const message = getErrorMessage(error, "Login failed. Please try again.");
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
      const message = getErrorMessage(error, "Unable to create account. Please try again.");
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
      const message = getErrorMessage(error, "Failed to load user profile");
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
