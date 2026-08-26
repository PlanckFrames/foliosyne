import { useRef, type ReactNode } from "react";

const ACCEPT =
  ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/**
 * Always-mounted file input (visually hidden, NOT display:none) plus a pick()
 * callback. Label+display:none inputs silently do nothing in iframes/WebKit.
 */
export function FilePicker({
  id,
  accept = ACCEPT,
  onFile,
  children,
}: {
  id?: string;
  accept?: string;
  onFile: (file: File) => void;
  children: ReactNode | ((pick: () => void) => ReactNode);
}) {
  const ref = useRef<HTMLInputElement>(null);

  const pick = () => {
    const el = ref.current;
    if (!el) return;
    el.value = "";
    el.click();
  };

  return (
    <>
      <input
        ref={ref}
        id={id}
        type="file"
        accept={accept}
        className="file-ghost"
        tabIndex={-1}
        aria-hidden="true"
        suppressHydrationWarning
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.currentTarget.value = "";
        }}
      />
      {typeof children === "function" ? children(pick) : children}
    </>
  );
}
