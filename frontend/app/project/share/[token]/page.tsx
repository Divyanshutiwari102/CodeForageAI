import Link from "next/link";
import { getProjectByShareToken } from "@/services/projects";

export default async function SharedProjectPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const project = await getProjectByShareToken(token);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-4 p-6 text-center text-slate-100">
      <h1 className="text-2xl font-semibold">{project.name}</h1>
      <p className="text-sm text-slate-400">This is a shared project link.</p>
      <Link
        href={`/project/${project.id}`}
        className="rounded-md border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 hover:bg-cyan-400/20"
      >
        Open Project
      </Link>
    </main>
  );
}
