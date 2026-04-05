import type { User } from "@/types";
import { api } from "@/services/api";

interface UserProfileResponse {
  id: number;
  username: string;
  name: string;
}

interface AuthResponse {
  token: string;
  user: UserProfileResponse;
}

interface LoginPayload {
  username: string;
  password: string;
}

interface SignupPayload {
  username: string;
  name: string;
  password: string;
}

function mapUser(profile: UserProfileResponse): User {
  return {
    id: String(profile.id),
    name: profile.name,
    email: profile.username,
    plan: "free",
  };
}

export async function login(payload: LoginPayload): Promise<{ token: string; user: User }> {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return { token: data.token, user: mapUser(data.user) };
}

export async function signup(payload: SignupPayload): Promise<{ token: string; user: User }> {
  const { data } = await api.post<AuthResponse>("/auth/signup", payload);
  return { token: data.token, user: mapUser(data.user) };
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await api.get<UserProfileResponse>("/auth/me");
  return mapUser(data);
}
