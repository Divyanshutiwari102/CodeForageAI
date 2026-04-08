import { AuthForm } from "@/features/auth/auth-form";
export const metadata = { title: "Create account" };
export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
