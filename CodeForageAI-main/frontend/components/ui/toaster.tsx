"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      richColors
      closeButton
      position="top-right"
      expand
      duration={3500}
      toastOptions={{
        className: "text-sm",
      }}
    />
  );
}
