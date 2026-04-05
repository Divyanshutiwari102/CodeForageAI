import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminDashboardPage } from "@/features/admin/admin-dashboard-page";

export default function Page() {
  return (
    <ProtectedRoute>
      <AdminDashboardPage />
    </ProtectedRoute>
  );
}
