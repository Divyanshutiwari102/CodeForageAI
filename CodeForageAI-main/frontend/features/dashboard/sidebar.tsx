"use client";

import Link from "next/link";
import { LayoutDashboard, FolderGit2, MessageSquare, Settings, ShieldCheck } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin", label: "Admin Metrics", icon: ShieldCheck },
  { href: "/project/1", label: "Editor", icon: FolderGit2 },
  { href: "#", label: "Assistant", icon: MessageSquare },
  { href: "#", label: "Settings", icon: Settings },
];

export function Sidebar() {
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
