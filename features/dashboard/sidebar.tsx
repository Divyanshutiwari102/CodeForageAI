"use client";

import { useState, useMemo, useCallback, useEffect, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Home, Search, BookOpen, LayoutGrid, Star, User, Users,
  ShieldCheck, Gift, Zap, LogOut, PanelLeft, ChevronDown,
  X, Bell,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useProjectsStore } from "@/store/useProjectsStore";
import { cn } from "@/utils/cn";
import { SessionLimitBar } from "@/components/ui/session-limit-bar";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  shortcut?: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/search", label: "Search", icon: Search, shortcut: "⌘K" },
  { href: "/dashboard/resources", label: "Resources", icon: BookOpen },
];

const PROJECT_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "All projects", icon: LayoutGrid },
  { href: "/dashboard/starred", label: "Starred", icon: Star },
  { href: "/dashboard/mine", label: "Created by me", icon: User },
  { href: "/dashboard/shared", label: "Shared with me", icon: Users },
  { href: "/admin", label: "Admin", icon: ShieldCheck, adminOnly: true },
];

const spring = { type: "spring" as const, stiffness: 400, damping: 35 };
const springFast = { type: "spring" as const, stiffness: 500, damping: 40 };

function MobileOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </AnimatePresence>
  );
}

const SectionHeader = memo(function SectionHeader({ label }: { label: string }) {
  return (
    <p className="mb-1 mt-5 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/20 select-none">
      {label}
    </p>
  );
});

const NavLink = memo(function NavLink({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm outline-none",
        "transition-colors duration-150",
        "focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent",
        collapsed && "justify-center px-0",
        active ? "text-white" : "text-white/45 hover:text-white/80",
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-active-bg"
          className="absolute inset-0 rounded-lg bg-white/[0.08]"
          transition={spring}
        />
      )}
      {!active && (
        <span className="absolute inset-0 rounded-lg bg-white/0 transition-colors duration-150 group-hover:bg-white/[0.04]" />
      )}
      {active && (
        <motion.span
          layoutId="nav-accent"
          className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-violet-400"
          transition={spring}
        />
      )}
      <item.icon
        className={cn(
          "relative z-10 h-4 w-4 flex-shrink-0 transition-colors duration-150",
          active ? "text-violet-400" : "text-white/35 group-hover:text-white/55",
        )}
        aria-hidden="true"
      />
      {!collapsed && (
        <>
          <span className="relative z-10 flex-1 truncate">{item.label}</span>
          {item.shortcut && (
            <span className="relative z-10 text-[10px] text-white/20 transition-colors group-hover:text-white/35">
              {item.shortcut}
            </span>
          )}
        </>
      )}
    </Link>
  );
});

const RecentLink = memo(function RecentLink({
  project,
  active,
  onClick,
}: {
  project: { id: string; name: string };
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={`/project/${project.id}`}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs outline-none",
        "transition-colors duration-150",
        "focus-visible:ring-2 focus-visible:ring-violet-500/60",
        active
          ? "bg-white/[0.07] text-white/90"
          : "text-white/40 hover:bg-white/[0.04] hover:text-white/70",
      )}
    >
      <motion.div
        className={cn(
          "h-1.5 w-1.5 flex-shrink-0 rounded-full transition-colors",
          active ? "bg-violet-400" : "bg-white/20 group-hover:bg-violet-400/60",
        )}
        whileHover={{ scale: 1.4 }}
        transition={springFast}
      />
      <span className="truncate">{project.name}</span>
    </Link>
  );
});

function Avatar({ name, size = 7 }: { name?: string | null; size?: number }) {
  const letter = name?.charAt(0)?.toUpperCase() ?? "?";
  const sizeClass = `h-${size} w-${size}`;
  return (
    <div
      className={cn(
        sizeClass,
        "flex flex-shrink-0 items-center justify-center rounded-full",
        "bg-gradient-to-br from-orange-400 via-pink-500 to-violet-600",
        "text-xs font-bold text-white shadow-md select-none",
      )}
      aria-hidden="true"
    >
      {letter}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const projects = useProjectsStore((s) => s.projects);
  const prefersReduced = useReducedMotion();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  const isAdmin = useMemo(() => user?.role === "ADMIN", [user?.role]);
  const recentProjects = useMemo(() => projects.slice(0, 5), [projects]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "[" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCollapsed((c) => !c);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = useCallback(
    (href: string) => {
      if (href === "/dashboard") return pathname === "/dashboard";
      return pathname.startsWith(href);
    },
    [pathname],
  );

  const filteredProjectItems = useMemo(
    () => PROJECT_ITEMS.filter((i) => !i.adminOnly || isAdmin),
    [isAdmin],
  );

  const sidebarContent = (
    <nav className="flex h-full flex-col" aria-label="Main navigation">
      {/* Logo + toggle */}
      <div className="flex h-14 flex-shrink-0 items-center justify-between px-3">
        {!collapsed && (
          <motion.button
            onClick={() => setWorkspaceOpen((o) => !o)}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 py-1.5",
              "text-sm font-medium text-white/80 transition-colors",
              "hover:bg-white/[0.06] hover:text-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60",
            )}
            whileTap={prefersReduced ? {} : { scale: 0.98 }}
          >
            <Avatar name={user?.name} size={7} />
            <span className="truncate">{user?.name ? `${user.name}'s Forge` : "My Workspace"}</span>
            <motion.div
              animate={{ rotate: workspaceOpen ? 180 : 0 }}
              transition={springFast}
            >
              <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-white/30" />
            </motion.div>
          </motion.button>
        )}

        {/* Desktop collapse */}
        <motion.button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "hidden md:flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
            "text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white/60",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60",
            collapsed && "mx-auto",
          )}
          whileTap={prefersReduced ? {} : { scale: 0.9 }}
          title={collapsed ? "Expand sidebar (⌘[)" : "Collapse sidebar (⌘[)"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <PanelLeft className="h-4 w-4" />
        </motion.button>

        {/* Mobile close */}
        <motion.button
          onClick={() => setMobileOpen(false)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 hover:bg-white/[0.06] hover:text-white/60 md:hidden"
          whileTap={{ scale: 0.9 }}
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Workspace dropdown */}
      <AnimatePresence>
        {workspaceOpen && !collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mx-3 mb-2 rounded-xl border border-white/[0.07] bg-white/[0.03] p-2.5">
              <p className="truncate text-xs font-medium text-white/60">{user?.name}</p>
              <p className="mt-0.5 truncate text-[11px] text-white/35">{user?.email ?? "No email"}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrollable nav */}
      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-2 pb-4">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(item.href)}
              collapsed={collapsed}
              onClick={() => setMobileOpen(false)}
            />
          ))}
        </div>

        {!collapsed && <SectionHeader label="Projects" />}
        {collapsed && <div className="my-3 border-t border-white/[0.05]" />}
        <div className="space-y-0.5">
          {filteredProjectItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(item.href) && item.href !== "/dashboard"}
              collapsed={collapsed}
              onClick={() => setMobileOpen(false)}
            />
          ))}
        </div>

        {!collapsed && recentProjects.length > 0 && (
          <>
            <SectionHeader label="Recents" />
            <div className="space-y-0.5">
              {recentProjects.map((project) => (
                <RecentLink
                  key={project.id}
                  project={project}
                  active={pathname === `/project/${project.id}`}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </div>
          </>
        )}

        {!collapsed && recentProjects.length === 0 && (
          <p className="mt-5 px-3 text-[11px] text-white/20">No recent projects</p>
        )}
      </div>

      {/* Bottom cards */}
      {!collapsed && (
        <div className="flex-shrink-0 space-y-2 px-2 pb-3">
          <SessionLimitBar variant="full" />

          <motion.div
            className="group cursor-pointer rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/[0.06] transition-colors hover:bg-white/[0.06]"
            whileHover={prefersReduced ? {} : { y: -1 }}
            transition={springFast}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white/70 transition-colors group-hover:text-white/90">
                  Share CodeForageAI
                </p>
                <p className="mt-0.5 text-[11px] text-white/35">100 credits per referral</p>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.08] transition-colors group-hover:bg-white/[0.12]">
                <Gift className="h-3.5 w-3.5 text-white/50 transition-colors group-hover:text-white/70" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="group relative cursor-pointer overflow-hidden rounded-xl p-3"
            style={{
              background: "linear-gradient(135deg, rgba(109,40,217,0.25) 0%, rgba(37,99,235,0.2) 100%)",
              boxShadow: "inset 0 0 0 1px rgba(139,92,246,0.2)",
            }}
            whileHover={prefersReduced ? {} : {
              y: -1,
              boxShadow: "inset 0 0 0 1px rgba(139,92,246,0.4), 0 8px 24px rgba(109,40,217,0.2)",
            }}
            transition={springFast}
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)" }}
            />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white/90">Upgrade to Pro</p>
                <p className="mt-0.5 text-[11px] text-white/45">Unlimited messages & projects</p>
              </div>
              <motion.div
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500 shadow-lg shadow-violet-500/30"
                whileHover={prefersReduced ? {} : { rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.4 }}
              >
                <Zap className="h-3.5 w-3.5 text-white" />
              </motion.div>
            </div>
          </motion.div>

          {/* User footer */}
          <div className="flex items-center gap-2.5 rounded-lg px-1.5 py-2">
            <Avatar name={user?.name} size={7} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white/75">{user?.name ?? "User"}</p>
              <p className="truncate text-[10px] text-white/30">{user?.email ?? ""}</p>
            </div>
            <div className="flex items-center gap-0.5">
              <motion.button
                className="rounded-md p-1.5 text-white/25 transition-colors hover:bg-white/[0.06] hover:text-white/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                whileTap={prefersReduced ? {} : { scale: 0.85 }}
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="h-3.5 w-3.5" />
              </motion.button>
              <motion.button
                onClick={() => void logout()}
                className="rounded-md p-1.5 text-white/25 transition-colors hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                whileTap={prefersReduced ? {} : { scale: 0.85 }}
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="flex flex-shrink-0 flex-col items-center gap-2 pb-4">
          <motion.button
            onClick={() => void logout()}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/25 transition-colors hover:bg-red-500/10 hover:text-red-400"
            whileTap={{ scale: 0.85 }}
            aria-label="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </motion.button>
          <Avatar name={user?.name} size={7} />
        </div>
      )}
    </nav>
  );

  return (
    <>
      <MobileOverlay open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Desktop */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 280 }}
        transition={spring}
        className="relative hidden h-screen flex-shrink-0 flex-col overflow-hidden border-r border-white/[0.06] md:flex"
        style={{ background: "#0c0c14" }}
        aria-label="Sidebar"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-50"
          style={{ background: "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(109,40,217,0.12), transparent)" }}
          aria-hidden="true"
        />
        {sidebarContent}
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={spring}
            className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col overflow-hidden border-r border-white/[0.06] md:hidden"
            style={{ background: "#0c0c14" }}
            aria-label="Mobile navigation"
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-50"
              style={{ background: "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(109,40,217,0.12), transparent)" }}
              aria-hidden="true"
            />
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
