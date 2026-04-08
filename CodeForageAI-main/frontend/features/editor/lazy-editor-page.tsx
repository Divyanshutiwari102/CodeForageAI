"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const EditorPage = dynamic(
  () => import("@/features/editor/editor-page").then((module) => module.EditorPage),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[calc(100vh-64px)] w-full rounded-none" />,
  },
);

export function LazyEditorPage({ projectId }: { projectId: string }) {
  return <EditorPage projectId={projectId} />;
}
