export default function Loading() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4"
      style={{ background: "#0a0a0f" }}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-400/30 border-t-violet-400" />
    </div>
  );
}
