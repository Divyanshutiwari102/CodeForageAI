export function FooterSection() {
  return (
    <footer className="border-t border-white/10 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 text-xs text-slate-400">
        <span>© {new Date().getFullYear()} CodeForageAI</span>
        <div className="flex items-center gap-4">
          <a href="#" className="transition hover:text-slate-200">Privacy</a>
          <a href="#" className="transition hover:text-slate-200">Terms</a>
          <a href="#" className="transition hover:text-slate-200">Contact</a>
        </div>
      </div>
    </footer>
  );
}
