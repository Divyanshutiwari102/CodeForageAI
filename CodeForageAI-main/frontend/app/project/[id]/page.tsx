import { LazyEditorPage } from "@/features/editor/lazy-editor-page";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ProtectedRoute>
      <LazyEditorPage projectId={id} />
    </ProtectedRoute>
  );
}
