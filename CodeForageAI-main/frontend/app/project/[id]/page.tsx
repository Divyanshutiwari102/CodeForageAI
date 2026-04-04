import { EditorPage } from "@/features/editor/editor-page";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditorPage projectId={id} />;
}
