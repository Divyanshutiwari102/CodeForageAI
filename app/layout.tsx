import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { GlobalErrorListener } from "@/components/ui/global-error-listener";
import { ThemeProvider } from "@/components/ui/theme-provider";

export const metadata: Metadata = {
  title: { default: "CodeForageAI", template: "%s — CodeForageAI" },
  description: "Build apps and websites by chatting with AI. The premium AI-native dev environment.",
  keywords: ["AI coding", "app builder", "AI developer tool", "code generation"],
  authors: [{ name: "CodeForageAI" }],
  openGraph: {
    title: "CodeForageAI — Build with AI",
    description: "Build apps and websites by chatting with AI",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('cfai-theme');
                const preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', stored ?? preferred);
              } catch {}
            `,
          }}
        />
      </head>
      <body className="min-h-full antialiased">
        <ThemeProvider>
          {children}
          <GlobalErrorListener />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
