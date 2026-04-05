"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import type { ApiErrorEventDetail } from "@/services/errors";
import { API_ERROR_EVENT } from "@/services/errors";

export function useApiErrorToast() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onError = (event: Event) => {
      const customEvent = event as CustomEvent<ApiErrorEventDetail>;
      const message = customEvent.detail?.message;
      if (!message) return;
      toast.error(message);
    };
    window.addEventListener(API_ERROR_EVENT, onError);
    return () => window.removeEventListener(API_ERROR_EVENT, onError);
  }, []);
}
