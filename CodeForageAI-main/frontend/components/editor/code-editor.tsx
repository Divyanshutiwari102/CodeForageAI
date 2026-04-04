"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const Monaco = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <Skeleton className="h-full min-h-[340px] w-full rounded-none" />,
});

interface Props {
  defaultValue: string;
  language: string;
}

export function CodeEditor({ defaultValue, language }: Props) {
  return (
    <Monaco
      height="100%"
      defaultLanguage={language}
      language={language}
      defaultValue={defaultValue}
      theme="vs-dark"
      options={{ minimap: { enabled: false }, fontSize: 13, smoothScrolling: true }}
    />
  );
}

export { CodeEditor as MonacoEditor };
