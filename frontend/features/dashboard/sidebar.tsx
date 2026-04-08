"use client";

import Link from "next/link";
import { LayoutDashboard, FolderGit2, MessageSquare, Settings, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const baseLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/project/1", label: "Editor", icon: FolderGit2 },
  { href: "#", label: "Assistant", icon: MessageSquare },
  { href: "#", label: "Settings", icon: Settings },
];

const adminLink = { href: "/admin", label: "Admin Metrics", icon: ShieldCheck };

export function Sidebar() {
  const userRole = useAuthStore((state) => state.user?.role);
  const links = userRole === "ADMIN" ? [baseLinks[0], adminLink, ...baseLinks.slice(1)] : baseLinks;

  return (
    <aside className="hidden border-r border-white/10 bg-slate-950/80 p-5 md:block">
      <p className="mb-8 text-xl font-semibold">CodeForageAI</p>
      <div className="space-y-2">
        {links.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
