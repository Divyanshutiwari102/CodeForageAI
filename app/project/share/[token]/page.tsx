import Link from "next/link";
import { getProjectByShareToken } from "@/services/projects";

export default async function SharedProjectPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const project = await getProjectByShareToken(token);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center"
      style={{ background: "#0a0a0f", color: "#f1f1f5" }}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-pink-500 to-violet-600 text-2xl font-bold text-white shadow-lg shadow-violet-500/25">
        ⬡
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/30">Shared Project</p>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
          {project.name}
        </h1>
        {project.description && (
          <p className="mt-2 max-w-md text-sm text-white/45">{project.description}</p>
        )}
      </div>
      <Link
        href={`/project/${project.id}`}
        className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 active:scale-95"
      >
        Open Project →
      </Link>
    </main>
  );
}
