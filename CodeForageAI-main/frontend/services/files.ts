import type { FileNode } from "@/types";

export const DEMO_TREE: FileNode[] = [
  {
    id: "src",
    name: "src",
    type: "folder",
    children: [
      {
        id: "src-app",
        name: "app",
        type: "folder",
        children: [
          {
            id: "src-app-page",
            name: "page.tsx",
            type: "file",
            language: "typescript",
            content: `export default function Page() {\n  return <main className=\"p-8\">Hello CodeForage</main>;\n}`,
          },
          {
            id: "src-app-layout",
            name: "layout.tsx",
            type: "file",
            language: "typescript",
            content: `export default function RootLayout({ children }: { children: React.ReactNode }) {\n  return <html lang=\"en\"><body>{children}</body></html>;\n}`,
          },
        ],
      },
      {
        id: "src-components",
        name: "components",
        type: "folder",
        children: [
          {
            id: "src-components-button",
            name: "Button.tsx",
            type: "file",
            language: "typescript",
            content: `export function Button({ children }: { children: React.ReactNode }) {\n  return <button className=\"rounded-lg px-4 py-2\">{children}</button>;\n}`,
          },
        ],
      },
    ],
  },
  { id: "package-json", name: "package.json", type: "file", language: "json", content: `{"name":"frontend","private":true}` },
];

export async function getProjectTree(): Promise<FileNode[]> {
  await new Promise((r) => setTimeout(r, 250));
  return DEMO_TREE;
}
