"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderGit2, LayoutDashboard, MessageSquare, Settings, ShieldCheck, Zap } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/utils/cn";

const baseLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/project/1", label: "Editor", icon: FolderGit2 },
  { href: "#", label: "Assistant", icon: MessageSquare },
  { href: "#", label: "Settings", icon: Settings },
];
const adminLink = { href: "/admin", label: "Admin", icon: ShieldCheck };

export function Sidebar() {
  const pathname = usePathname();
  const userRole = useAuthStore((state) => state.user?.role);
  const links = userRole === "ADMIN" ? [baseLinks[0], adminLink, ...baseLinks.slice(1)] : baseLinks;

  return (
    <aside className="hidden border-r border-white/[0.06] bg-zinc-950 md:flex md:w-[240px] md:flex-col">
      <div className="flex h-[60px] items-center gap-2.5 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500 shadow-[0_0_12px_rgba(56,189,248,0.35)]">
          <Zap className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-white">
          CodeForage<span className="text-sky-400">AI</span>
        </span>
      </div>

      <nav className="flex flex-col gap-1 px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Menu</p>
        {links.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
                active ? "nav-active" : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100",
              )}
            >
              <item.icon className={cn("h-4 w-4 flex-shrink-0", active && "text-sky-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/[0.06] p-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="h-7 w-7 flex-shrink-0 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500" />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-zinc-200">My workspace</p>
            <p className="text-[10px] text-zinc-500">Free plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
