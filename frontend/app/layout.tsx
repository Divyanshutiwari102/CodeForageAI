import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { GlobalErrorListener } from "@/components/ui/global-error-listener";

export const metadata: Metadata = {
  title: "CodeForageAI",
  description: "Premium AI-native coding workspace",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-slate-950 text-slate-100 antialiased">
        {children}
        <GlobalErrorListener />
        <Toaster />
      </body>
    </html>
  );
}
