"use client";

import { useEffect, useRef, useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { Plus, ArrowRight, LayoutGrid, Clock, Sparkles, X } from "lucide-react";
import { useProjectsStore } from "@/store/useProjectsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { ProjectCard } from "@/features/dashboard/project-card";
import { Skeleton } from "@/components/ui/skeleton";

const PROMPTS = [
  "Build a SaaS analytics dashboard with charts",
  "Create a real-time chat app with rooms",
  "Build an e-commerce store with Stripe checkout",
  "Create a task management tool like Linear",
  "Build a social media app with feeds",
  "Create a booking system with calendar",
];

const spring = { type: "spring" as const, stiffness: 400, damping: 35 };

// ─── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = memo(function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <motion.div
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08]"
        style={{ background: "rgba(255,255,255,0.03)" }}
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-2xl opacity-30">⬡</span>
      </motion.div>
      <p className="mb-1.5 text-base font-medium text-white/50">No projects yet</p>
      <p className="mb-7 text-sm text-white/25">Type a prompt above or start from scratch</p>
      <motion.button
        onClick={onNew}
        className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm text-white/60 transition-colors hover:border-white/15 hover:bg-white/[0.08] hover:text-white"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.97 }}
        transition={spring}
      >
        Create blank project
      </motion.button>
    </motion.div>
  );
});

// ─── New project modal ─────────────────────────────────────────────────────────
function NewProjectModal({
  open,
  onClose,
  creating,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  creating: boolean;
  onSubmit: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmit(name.trim());
    setName("");
  }

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={spring}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl border border-white/[0.08] p-6 shadow-2xl"
              style={{ background: "#15151e" }}
            >
              <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg text-white/25 transition-colors hover:bg-white/[0.06] hover:text-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                aria-label="Close dialog"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
                  <Sparkles className="h-4 w-4 text-violet-400" aria-hidden="true" />
                </div>
                <h2 id="modal-title" className="text-base font-semibold text-white">New project</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/50" htmlFor="project-name">
                    Project name
                  </label>
                  <input
                    id="project-name"
                    autoFocus
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My awesome app"
                    className={cn(
                      "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5",
                      "text-sm text-white placeholder:text-white/25",
                      "outline-none transition-all focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20",
                    )}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl px-4 py-2 text-sm text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={creating || !name.trim()}
                    className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                    whileTap={!creating ? { scale: 0.97 } : {}}
                  >
                    {creating ? "Creating…" : "Create project"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const projects = useProjectsStore((s) => s.projects);
  const loading = useProjectsStore((s) => s.loading);
  const loadDashboard = useProjectsStore((s) => s.loadDashboard);
  const createProject = useProjectsStore((s) => s.createProject);
  const prefersReduced = useReducedMotion();

  const [prompt, setPrompt] = useState("");
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "recent">("all");
  const [inputFocused, setInputFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handlePromptSubmit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt]);

  const handlePromptSubmit = useCallback(async () => {
    const name = (prompt.trim() || "New Project").slice(0, 60);
    if (!name) return;
    setCreating(true);
    try {
      const project = await createProject(name);
      toast.success("Project created!");
      router.push(`/project/${project.id}`);
    } catch {
      toast.error("Failed to create project");
    } finally {
      setCreating(false);
    }
  }, [prompt, createProject, router]);

  const handleModalCreate = useCallback(async (name: string) => {
    setCreating(true);
    try {
      const project = await createProject(name);
      toast.success("Project created!");
      setShowModal(false);
      router.push(`/project/${project.id}`);
    } catch {
      toast.error("Failed to create project");
    } finally {
      setCreating(false);
    }
  }, [createProject, router]);

  const firstName = user?.name?.split(" ")[0] ?? "there";

  const displayedProjects = activeTab === "recent"
    ? [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 6)
    : projects;

  return (
    <div className="relative flex min-h-screen flex-col overflow-auto">
      {/* Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 70% 50% at 60% 0%, rgba(139,92,246,0.22) 0%, transparent 60%)",
            "radial-gradient(ellipse 50% 40% at 90% 50%, rgba(59,130,246,0.14) 0%, transparent 60%)",
            "radial-gradient(ellipse 60% 60% at 30% 80%, rgba(236,72,153,0.12) 0%, transparent 60%)",
            "#0a0a0f",
          ].join(", "),
        }}
      />

      {/* Hero */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-8 pt-20">
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-2 flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1"
        >
          <Sparkles className="h-3 w-3 text-violet-400" />
          <span className="text-[11px] font-medium text-violet-300/80">AI-powered development</span>
        </motion.div>

        <motion.h1
          initial={prefersReduced ? {} : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.06 }}
          className="mb-8 text-center text-3xl font-bold text-white sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Got an idea,{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)" }}
          >
            {firstName}
          </span>
          ?
        </motion.h1>

        {/* Prompt input */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="w-full max-w-2xl"
        >
          <motion.div
            animate={{
              boxShadow: inputFocused
                ? "0 0 0 1px rgba(139,92,246,0.4), 0 8px 40px rgba(109,40,217,0.18)"
                : "0 0 0 1px rgba(255,255,255,0.08), 0 4px 20px rgba(0,0,0,0.3)",
            }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden rounded-2xl bg-[#14141d]"
          >
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Ask CodeForageAI to build a landing page for my startup..."
              rows={2}
              className="w-full resize-none bg-transparent px-5 pt-5 pb-2 text-sm text-white placeholder:text-white/25 focus:outline-none"
              style={{ minHeight: 80, maxHeight: 160 }}
              aria-label="Project prompt"
            />
            <div className="flex items-center justify-between px-4 pb-3 pt-1">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-white/35 transition-colors hover:bg-white/[0.05] hover:text-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
              >
                <Plus className="h-3.5 w-3.5" />
                Quick create
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/25">Build</span>
                <motion.button
                  type="button"
                  disabled={creating}
                  onClick={handlePromptSubmit}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60",
                    prompt.trim()
                      ? "bg-violet-600 text-white hover:bg-violet-500"
                      : "bg-white/[0.12] text-white disabled:opacity-50",
                  )}
                  whileTap={!creating ? { scale: 0.88 } : {}}
                  whileHover={!creating && prompt.trim() ? { scale: 1.05 } : {}}
                  transition={spring}
                  aria-label="Create project"
                >
                  {creating ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Prompt chips */}
          <motion.div
            initial={prefersReduced ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-3 flex flex-wrap gap-2"
          >
            {PROMPTS.slice(0, 4).map((p, i) => (
              <motion.button
                key={p}
                type="button"
                onClick={() => {
                  setPrompt(p);
                  textareaRef.current?.focus();
                }}
                className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-white/40 transition-colors hover:border-white/15 hover:bg-white/[0.07] hover:text-white/65"
                initial={prefersReduced ? {} : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.35 + i * 0.05 }}
                whileHover={prefersReduced ? {} : { y: -1 }}
              >
                {p}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Projects section */}
      <div className="relative z-10 border-t border-white/[0.05]" style={{ background: "rgba(10,10,15,0.95)" }}>
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-1 rounded-xl border border-white/[0.07] bg-white/[0.03] p-1">
              {(["all", "recent"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60",
                    activeTab === tab ? "text-white" : "text-white/40 hover:text-white/70",
                  )}
                >
                  {activeTab === tab && (
                    <motion.span
                      layoutId="tab-bg"
                      className="absolute inset-0 rounded-lg bg-white/[0.08]"
                      transition={spring}
                    />
                  )}
                  <span className="relative z-10">
                    {tab === "all" ? <LayoutGrid className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                  </span>
                  <span className="relative z-10 capitalize">{tab === "all" ? "All projects" : "Recent"}</span>
                </button>
              ))}
            </div>

            <motion.button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
              whileHover={prefersReduced ? {} : { y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={spring}
            >
              <Plus className="h-4 w-4" />
              New project
            </motion.button>
          </div>

          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : displayedProjects.length === 0 ? (
            <EmptyState onNew={() => setShowModal(true)} />
          ) : (
            <motion.div
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.05 } },
              }}
            >
              {displayedProjects.map((p) => (
                <motion.div
                  key={p.id}
                  variants={prefersReduced ? {} : {
                    hidden: { opacity: 0, y: 12 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                  }}
                >
                  <ProjectCard project={p} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <NewProjectModal
        open={showModal}
        onClose={() => setShowModal(false)}
        creating={creating}
        onSubmit={handleModalCreate}
      />
    </div>
  );
}
