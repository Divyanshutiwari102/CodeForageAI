"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseResizableOptions {
  initialSize: number;
  minSize?: number;
  maxSize?: number;
  direction?: "horizontal" | "vertical";
  storageKey?: string;
}

interface UseResizableReturn {
  size: number;
  isDragging: boolean;
  handleRef: React.RefObject<HTMLDivElement | null>;
  handleMouseDown: (e: React.MouseEvent) => void;
}

export function useResizable({
  initialSize,
  minSize = 140,
  maxSize = 600,
  direction = "horizontal",
  storageKey,
}: UseResizableOptions): UseResizableReturn {
  const [size, setSize] = useState(() => {
    if (storageKey && typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const n = Number(stored);
        if (!isNaN(n) && n >= minSize && n <= maxSize) return n;
      }
    }
    return initialSize;
  });
  const [isDragging, setIsDragging] = useState(false);
  const handleRef = useRef<HTMLDivElement>(null);
  const startPos = useRef(0);
  const startSize = useRef(size);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      startPos.current = direction === "horizontal" ? e.clientX : e.clientY;
      startSize.current = size;
    },
    [size, direction],
  );

  useEffect(() => {
    if (!isDragging) return;

    function onMouseMove(e: MouseEvent) {
      const delta =
        direction === "horizontal"
          ? e.clientX - startPos.current
          : e.clientY - startPos.current;
      const next = Math.max(minSize, Math.min(maxSize, startSize.current + delta));
      setSize(next);
    }

    function onMouseUp() {
      setIsDragging(false);
      if (storageKey) {
        localStorage.setItem(storageKey, String(startSize.current));
      }
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    // Prevent text selection while dragging
    document.body.style.userSelect = "none";
    document.body.style.cursor = direction === "horizontal" ? "col-resize" : "row-resize";

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging, direction, minSize, maxSize, storageKey]);

  // Persist on size change
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, String(size));
    }
  }, [size, storageKey]);

  return { size, isDragging, handleRef, handleMouseDown };
}
