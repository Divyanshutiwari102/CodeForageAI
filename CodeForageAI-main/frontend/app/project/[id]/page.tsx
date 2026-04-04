import { RenderTemplatePage } from "@/app/render-template-page";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await params;
  return <RenderTemplatePage fileName="page-editor.html" title="Project Editor" />;
}
