export function FolioMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <rect width="32" height="32" rx="7" className="fill-paper" />
      <path
        d="M8.5 6.5h11.2L24.5 11.4V24a2.5 2.5 0 0 1-2.5 2.5H8.5A2.5 2.5 0 0 1 6 24V9a2.5 2.5 0 0 1 2.5-2.5z"
        className="fill-accent"
      />
      <path
        d="M19.6 6.6v5.2h5.3"
        stroke="currentColor"
        className="stroke-accent-fg"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 16.2h11M10.5 19.6h8.5"
        className="stroke-accent-fg"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
