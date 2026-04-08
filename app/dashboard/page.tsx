import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";

export const metadata = { title: "Dashboard" };

export default function Page() {
  return (
    <ProtectedRoute>
      <DashboardShell>
        <DashboardPage />
      </DashboardShell>
    </ProtectedRoute>
  );
}
