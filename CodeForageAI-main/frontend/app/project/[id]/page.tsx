import { EditorPage } from "@/features/editor/editor-page";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ProtectedRoute>
      <EditorPage projectId={id} />
    </ProtectedRoute>
  );
}
