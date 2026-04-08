"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const Monaco = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full flex-col" style={{ background: "#0f0f18" }}>
      <div className="space-y-3 p-6">
        {Array.from({ length: 18 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-4 rounded"
            style={{ width: `${30 + ((i * 37 + 13) % 55)}%`, opacity: 0.4 - i * 0.015 }}
          />
        ))}
      </div>
    </div>
  ),
});

interface Props {
  value: string;
  language: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export function CodeEditor({ value, language, onChange, readOnly = false }: Props) {
  return (
    <Monaco
      height="100%"
      defaultLanguage={language}
      language={language}
      value={value}
      onChange={(next) => onChange?.(next ?? "")}
      theme="vs-dark"
      options={{
        // Layout
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        padding: { top: 16, bottom: 16 },
        // Typography
        fontSize: 13,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        fontLigatures: true,
        lineHeight: 1.65,
        letterSpacing: 0.3,
        // UX
        smoothScrolling: true,
        cursorSmoothCaretAnimation: "on",
        cursorBlinking: "smooth",
        cursorStyle: "line",
        cursorWidth: 2,
        // Editing
        readOnly,
        wordWrap: "off",
        tabSize: 2,
        insertSpaces: true,
        autoIndent: "full",
        formatOnPaste: true,
        formatOnType: true,
        // Visuals
        renderLineHighlight: "line",
        renderWhitespace: "selection",
        bracketPairColorization: { enabled: true },
        guides: { bracketPairs: "active", indentation: true },
        // Sidebar
        lineNumbers: "on",
        lineDecorationsWidth: 4,
        glyphMargin: false,
        folding: true,
        // Intellisense
        quickSuggestions: { other: true, comments: false, strings: false },
        suggestOnTriggerCharacters: true,
        parameterHints: { enabled: true },
        // Scrollbar
        scrollbar: {
          vertical: "auto",
          horizontal: "auto",
          verticalScrollbarSize: 6,
          horizontalScrollbarSize: 6,
          useShadows: false,
        },
        overviewRulerBorder: false,
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
      }}
    />
  );
}

export { CodeEditor as MonacoEditor };
