/**
 * file-icons.ts
 * Maps file extensions → { icon emoji or symbol, color }
 * Used by the file tree to show contextual icons per file type.
 */

export interface FileIconConfig {
  symbol: string;
  color: string;
}

const ICON_MAP: Record<string, FileIconConfig> = {
  // TypeScript / JavaScript
  ts:    { symbol: "TS",  color: "#3178c6" },
  tsx:   { symbol: "TSX", color: "#3178c6" },
  js:    { symbol: "JS",  color: "#f7df1e" },
  jsx:   { symbol: "JSX", color: "#61dafb" },
  mjs:   { symbol: "JS",  color: "#f7df1e" },
  cjs:   { symbol: "CJS", color: "#f7df1e" },

  // Web
  html:  { symbol: "</>", color: "#e34c26" },
  css:   { symbol: "CSS", color: "#264de4" },
  scss:  { symbol: "CSS", color: "#cc6699" },
  sass:  { symbol: "CSS", color: "#cc6699" },
  less:  { symbol: "CSS", color: "#1d365d" },

  // Data
  json:  { symbol: "{ }", color: "#f5a623" },
  yaml:  { symbol: "YML", color: "#cc1018" },
  yml:   { symbol: "YML", color: "#cc1018" },
  toml:  { symbol: "TOM", color: "#9c4121" },
  xml:   { symbol: "XML", color: "#f1662a" },
  csv:   { symbol: "CSV", color: "#4caf50" },
  sql:   { symbol: "SQL", color: "#e38d13" },

  // Docs / Markup
  md:    { symbol: "MD",  color: "#3d9fc4" },
  mdx:   { symbol: "MDX", color: "#3d9fc4" },
  txt:   { symbol: "TXT", color: "#9e9e9e" },
  pdf:   { symbol: "PDF", color: "#f44336" },

  // Config / Build
  env:        { symbol: ".ENV", color: "#ecd53f" },
  gitignore:  { symbol: "GIT", color: "#f54d27" },
  dockerfile: { symbol: "DO",  color: "#2496ed" },
  lock:       { symbol: "🔒",  color: "#6e6e6e" },

  // Backend
  java:  { symbol: "☕", color: "#f89820" },
  py:    { symbol: "PY", color: "#306998" },
  go:    { symbol: "GO", color: "#00acd7" },
  rs:    { symbol: "RS", color: "#a72145" },
  rb:    { symbol: "RB", color: "#cc342d" },
  php:   { symbol: "PHP", color: "#4f5b93" },
  cs:    { symbol: "C#",  color: "#9b4993" },
  cpp:   { symbol: "C++", color: "#659ad2" },
  c:     { symbol: "C",   color: "#a8b9cc" },

  // Images / Media
  png:   { symbol: "IMG", color: "#7ec8e3" },
  jpg:   { symbol: "IMG", color: "#7ec8e3" },
  jpeg:  { symbol: "IMG", color: "#7ec8e3" },
  gif:   { symbol: "GIF", color: "#7ec8e3" },
  svg:   { symbol: "SVG", color: "#ffb13b" },
  ico:   { symbol: "ICO", color: "#9e9e9e" },
  webp:  { symbol: "IMG", color: "#7ec8e3" },

  // Fonts
  woff:  { symbol: "FNT", color: "#b0a4e3" },
  woff2: { symbol: "FNT", color: "#b0a4e3" },
  ttf:   { symbol: "FNT", color: "#b0a4e3" },

  // Shell / Scripts
  sh:    { symbol: "SH",  color: "#4eaa25" },
  bash:  { symbol: "SH",  color: "#4eaa25" },
  zsh:   { symbol: "ZSH", color: "#4eaa25" },
};

const FOLDER_COLOR = "#dcb67a";

export function getFileIcon(name: string, isFolder: boolean): FileIconConfig {
  if (isFolder) return { symbol: "▸", color: FOLDER_COLOR };
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  // Check for dotfiles like .env, .gitignore
  const dotName = name.startsWith(".") ? name.slice(1).toLowerCase() : "";
  return (
    ICON_MAP[ext] ??
    ICON_MAP[dotName] ??
    { symbol: "◦", color: "#6b7280" }
  );
}
