import { readFile } from "node:fs/promises";
import path from "node:path";

type RenderTemplatePageProps = {
  fileName: "page-landing.html" | "page-dashboard.html" | "page-editor.html";
  title: string;
};

export async function RenderTemplatePage({ fileName, title }: RenderTemplatePageProps) {
  const html = await readFile(path.join(process.cwd(), "templates", fileName), "utf-8");

  return (
    <iframe
      title={title}
      srcDoc={html}
      className="h-screen w-full border-0"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
    />
  );
}
