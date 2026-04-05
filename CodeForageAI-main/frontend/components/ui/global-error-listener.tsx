"use client";

import { useApiErrorToast } from "@/hooks/useApiErrorToast";

export function GlobalErrorListener() {
  useApiErrorToast();
  return null;
}
