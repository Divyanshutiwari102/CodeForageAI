export function FooterSection() {
  return (
    <footer
      className="border-t px-4 py-10 sm:px-6 lg:px-8"
      style={{ borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-orange-400 via-pink-500 to-violet-600 text-xs font-bold text-white">
            ⬡
          </div>
          <span className="text-sm font-medium text-white/60">CodeForageAI</span>
        </div>
        <div className="flex items-center gap-5 text-xs text-white/30">
          {["Privacy", "Terms", "Contact", "Status"].map((item) => (
            <a key={item} href="#" className="transition hover:text-white/60">
              {item}
            </a>
          ))}
        </div>
        <p className="text-xs text-white/20">© {new Date().getFullYear()} CodeForageAI</p>
      </div>
    </footer>
  );
}
