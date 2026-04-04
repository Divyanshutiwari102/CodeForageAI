import type { User } from "@/types";

export async function getCurrentUser(): Promise<User> {
  await new Promise((r) => setTimeout(r, 200));
  return {
    id: "u1",
    name: "Divyansh Tiwari",
    email: "divyansh@example.com",
    plan: "pro",
  };
}
