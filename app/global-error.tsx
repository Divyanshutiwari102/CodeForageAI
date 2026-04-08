"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ background: "#0a0a0f", color: "#f1f1f5", fontFamily: "Inter, sans-serif" }}>
        <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", padding: "1rem" }}>
          <p style={{ fontSize: "2rem" }}>⚠️</p>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Critical error</h2>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.4)" }}>
            {error.message || "A critical error occurred."}
          </p>
          <button
            onClick={reset}
            style={{ background: "#7c3aed", color: "#fff", borderRadius: "0.75rem", padding: "0.625rem 1.25rem", fontSize: "0.875rem", fontWeight: 500, border: "none", cursor: "pointer" }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
