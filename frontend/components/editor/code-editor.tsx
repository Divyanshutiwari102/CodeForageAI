"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const Monaco = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <Skeleton className="h-full min-h-[340px] w-full rounded-none" />,
});

interface Props {
  value: string;
  language: string;
  onChange?: (value: string) => void;
}

export function CodeEditor({ value, language, onChange }: Props) {
  return (
    <Monaco
      height="100%"
      defaultLanguage={language}
      language={language}
      value={value}
      onChange={(next) => onChange?.(next ?? "")}
      theme="vs-dark"
      options={{ minimap: { enabled: false }, fontSize: 13, smoothScrolling: true }}
    />
  );
}

export { CodeEditor as MonacoEditor };
