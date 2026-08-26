import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { CallToolResult } from "@/lib/app-data";
import { redirectToLoginIfRequired } from "@/lib/app-data/login";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { pdfPagesToDocx } from "@/lib/convert";
import { LANGS } from "@/lib/i18n";
import { ingestFile, ingestPdf } from "@/lib/open-document";
import { extractDocumentText, extractPageText } from "@/lib/pdf/engine";
import { bakePdf } from "@/lib/pdf/mutate";
import { readDriveFile, searchDriveFiles } from "@/lib/server/drive";
import { translateDocumentText } from "@/lib/server/translate";
import { knockOutWhite, loadImage, renderTypedSignature } from "@/lib/signatures";
import { useAppStore, useT } from "@/lib/store";
import type { SavedSignature, UiLang } from "@/lib/types";
import { bytesToBlob, downloadBlob, stemFilename, uid } from "@/lib/utils";

export function AppPanels() {
  const panel = useAppStore((s) => s.panel);
  const setPanel = useAppStore((s) => s.setPanel);
  const t = useT();
  const titleMap: Record<string, string> = {
    convert: t("convert.title"),
    protect: t("protect.title"),
    sign: t("sign.title"),
    translate: t("translate.title"),
    share: t("share.title"),
    print: t("print.title"),
    rotate: t("rotate.title"),
    password: t("file.passwordTitle"),
    help: t("help.title"),
    cloud: t("share.title"),
  };
  const open = panel !== null;
  if (!open) return null;
  return (
    <Dialog open onOpenChange={(v) => !v && setPanel(null)}>
      <DialogContent title={panel ? titleMap[panel] : undefined}>
        {panel === "convert" && <ConvertPanel />}
        {panel === "protect" && <ProtectPanel />}
        {panel === "sign" && <SignPanel />}
        {panel === "translate" && <TranslatePanel />}
        {panel === "share" || panel === "cloud" ? <SharePanel /> : null}
        {panel === "rotate" && <RotatePanel />}
        {panel === "password" && <PasswordPanel />}
        {panel === "help" && <HelpPanel />}
      </DialogContent>
    </Dialog>
  );
}

function ConvertPanel() {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const name = useAppStore((s) => s.name);
  const pageOrder = useAppStore((s) => s.pageOrder);
  const rotations = useAppStore((s) => s.rotations);
  const annotations = useAppStore((s) => s.annotations);
  const bytes = useAppStore((s) => s.bytes);

  const toWord = async () => {
    if (!bytes) return;
    setBusy(true);
    try {
      const blob = await pdfPagesToDocx({
        title: stemFilename(name),
        pageOrder,
        rotations,
        annotations,
      });
      downloadBlob(blob, `${stemFilename(name)}.docx`);
      toast.success(t("convert.done"));
    } catch {
      toast.error(t("error.open"));
    } finally {
      setBusy(false);
    }
  };

  const toGdoc = async () => {
    if (!bytes) return;
    setBusy(true);
    try {
      const blob = await pdfPagesToDocx({
        title: stemFilename(name),
        pageOrder,
        rotations,
        annotations,
      });
      downloadBlob(blob, `${stemFilename(name)}.docx`);
      toast.success(t("convert.copied"));
    } catch {
      toast.error(t("error.open"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">{t("convert.hintWord")}</p>
      <Button disabled={busy || !bytes} onClick={() => void toWord()}>
        {busy ? t("convert.working") : t("convert.toWord")}
      </Button>
      <p className="text-sm text-muted">{t("convert.hintGdoc")}</p>
      <Button variant="secondary" disabled={busy || !bytes} onClick={() => void toGdoc()}>
        {t("convert.toGdoc")}
      </Button>
      <p className="text-sm text-muted">{t("convert.hintPdf")}</p>
      <label className="inline-flex">
        <input
          type="file"
          accept=".docx,.pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void ingestFile(f);
          }}
        />
        <Button variant="outline" asChild>
          <span>{t("convert.toPdf")}</span>
        </Button>
      </label>
    </div>
  );
}

function ProtectPanel() {
  const t = useT();
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [owner, setOwner] = useState("");
  const userPassword = useAppStore((s) => s.userPassword);
  const setUserPassword = useAppStore((s) => s.setUserPassword);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">{t("protect.hint")}</p>
      <label className="text-xs font-medium text-muted">
        {t("protect.user")}
        <Input type="password" className="mt-1" value={pass} onChange={(e) => setPass(e.target.value)} />
      </label>
      <label className="text-xs font-medium text-muted">
        {t("protect.confirm")}
        <Input
          type="password"
          className="mt-1"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </label>
      <label className="text-xs font-medium text-muted">
        {t("protect.owner")}
        <Input type="password" className="mt-1" value={owner} onChange={(e) => setOwner(e.target.value)} />
      </label>
      {userPassword ? <p className="text-sm text-success">{t("protect.locked")}</p> : null}
      <div className="flex gap-2">
        <Button
          onClick={() => {
            if (pass !== confirm) {
              toast.error(t("protect.mismatch"));
              return;
            }
            setUserPassword(pass);
            toast.success(t("protect.locked"));
          }}
        >
          {t("protect.apply")}
        </Button>
        <Button variant="ghost" onClick={() => setUserPassword("")}>
          {t("protect.remove")}
        </Button>
      </div>
    </div>
  );
}

function SignPanel() {
  const t = useT();
  const [tab, setTab] = useState<"typed" | "initials" | "upload">("typed");
  const [full, setFull] = useState("");
  const [initials, setInitials] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const signatures = useAppStore((s) => s.signatures);
  const addSignature = useAppStore((s) => s.addSignature);
  const removeSignature = useAppStore((s) => s.removeSignature);
  const setActiveSignature = useAppStore((s) => s.setActiveSignature);
  const setPanel = useAppStore((s) => s.setPanel);
  const setTool = useAppStore((s) => s.setTool);

  useEffect(() => {
    let live = true;
    const run = async () => {
      if (tab === "typed" && full.trim()) {
        const url = await renderTypedSignature(full, "full");
        if (live) setPreview(url);
      } else if (tab === "initials" && initials.trim()) {
        const url = await renderTypedSignature(initials, "initials");
        if (live) setPreview(url);
      }
    };
    void run();
    return () => {
      live = false;
    };
  }, [tab, full, initials]);

  const save = (kind: SavedSignature["kind"], name: string, dataUrl: string) => {
    const sig = { id: uid("sig"), name, kind, dataUrl };
    addSignature(sig);
    setTool("sign");
    setPanel(null);
    toast.success(t("action.place"));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1 rounded-md bg-paper p-1">
        {(["typed", "initials", "upload"] as const).map((k) => (
          <button
            key={k}
            type="button"
            className={`h-8 flex-1 rounded-sm text-sm ${tab === k ? "bg-surface text-fg" : "text-muted"}`}
            onClick={() => setTab(k)}
          >
            {t(`sign.${k}`)}
          </button>
        ))}
      </div>
      {tab === "typed" ? (
        <Input placeholder={t("sign.placeholder")} value={full} onChange={(e) => setFull(e.target.value)} />
      ) : null}
      {tab === "initials" ? (
        <Input
          placeholder={t("sign.initialsPh")}
          value={initials}
          onChange={(e) => setInitials(e.target.value)}
          maxLength={6}
        />
      ) : null}
      {tab === "upload" ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted">{t("sign.formats")}</p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const url = URL.createObjectURL(f);
              try {
                const img = await loadImage(url);
                setPreview(knockOutWhite(img));
              } finally {
                URL.revokeObjectURL(url);
              }
            }}
          />
        </div>
      ) : null}
      {preview ? (
        <div className="rounded-md bg-paper p-3">
          <img src={preview} alt="" className="mx-auto h-20 object-contain" />
        </div>
      ) : (
        <p className="text-sm text-muted">{t("sign.empty")}</p>
      )}
      <Button
        disabled={!preview}
        onClick={() =>
          preview &&
          save(
            tab,
            tab === "initials" ? initials || "Initials" : full || "Signature",
            preview,
          )
        }
      >
        {t("action.place")}
      </Button>
      {signatures.length ? (
        <div>
          <p className="mb-2 text-xs font-medium text-muted">{t("sign.saved")}</p>
          <ul className="flex flex-col gap-2">
            {signatures.map((s) => (
              <li key={s.id} className="flex items-center gap-2 rounded-sm bg-paper p-2">
                <img src={s.dataUrl} alt="" className="h-8 w-20 object-contain" />
                <span className="flex-1 truncate text-sm">{s.name}</span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setActiveSignature(s);
                    setTool("sign");
                    setPanel(null);
                  }}
                >
                  {t("sign.use")}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => removeSignature(s.id)}>
                  {t("action.delete")}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function TranslatePanel() {
  const t = useT();
  const [target, setTarget] = useState<UiLang>("es");
  const [scope, setScope] = useState<"selection" | "page" | "document">("selection");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const selection = useAppStore((s) => s.selection);
  const currentPage = useAppStore((s) => s.currentPage);
  const pageOrder = useAppStore((s) => s.pageOrder);
  const pageCount = useAppStore((s) => s.pageCount);
  const addAnnotation = useAppStore((s) => s.addAnnotation);

  const run = async () => {
    let text = "";
    if (scope === "selection") text = selection?.text ?? "";
    else if (scope === "page") {
      const orig = pageOrder[currentPage - 1] ?? 0;
      text = await extractPageText(orig + 1);
    } else {
      text = await extractDocumentText(pageCount);
    }
    if (!text.trim()) {
      toast.error(t("translate.needSelection"));
      return;
    }
    setBusy(true);
    try {
      const res = await translateDocumentText({ data: { text, targetLang: target } });
      if (!res.ok) {
        toast.error(res.error === "unavailable" ? t("translate.unavailable") : t("error.ai"));
        return;
      }
      setResult(res.text);
    } catch {
      toast.error(t("error.ai"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-medium text-muted">
        {t("translate.target")}
        <select
          className="mt-1 h-10 w-full rounded-sm border border-border bg-surface px-2 text-sm"
          value={target}
          onChange={(e) => setTarget(e.target.value as UiLang)}
        >
          {LANGS.map((l) => (
            <option key={l.code} value={l.code}>
              {t(`target.${l.code}`)}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap gap-1">
        {(["selection", "page", "document"] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={scope === s ? "default" : "outline"}
            onClick={() => setScope(s)}
          >
            {t(`translate.${s}`)}
          </Button>
        ))}
      </div>
      <Button disabled={busy} onClick={() => void run()}>
        {busy ? t("translate.working") : t("translate.run")}
      </Button>
      {result ? (
        <>
          <Textarea readOnly value={result} className="min-h-32" />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                const sel = selection;
                addAnnotation({
                  type: "text",
                  pageIndex: sel?.pageIndex ?? pageOrder[currentPage - 1] ?? 0,
                  x: sel?.x ?? 0.1,
                  y: (sel?.y ?? 0.1) + (sel?.h ?? 0.05) + 0.01,
                  w: Math.max(sel?.w ?? 0.6, 0.4),
                  h: 0.12,
                  text: result,
                });
                toast.success(t("translate.replace"));
              }}
            >
              {t("translate.replace")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                void navigator.clipboard.writeText(result);
                toast.success(t("translate.copied"));
              }}
            >
              {t("action.copy")}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}

function unpackDrive(raw: {
  ok: boolean;
  json: string | null;
  errorMessage?: string;
  loginRequired?: boolean;
  loginUrl?: string;
}): CallToolResult {
  let data: unknown = null;
  if (raw.json) {
    try {
      data = JSON.parse(raw.json);
    } catch {
      data = raw.json;
    }
  }
  return {
    ok: raw.ok,
    data,
    errorMessage: raw.errorMessage,
    loginRequired: raw.loginRequired,
    loginUrl: raw.loginUrl,
  };
}

function SharePanel() {
  const t = useT();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ id: string; name: string }>>([]);
  const [busy, setBusy] = useState(false);
  const name = useAppStore((s) => s.name);
  const bytes = useAppStore((s) => s.bytes);
  const pageOrder = useAppStore((s) => s.pageOrder);
  const rotations = useAppStore((s) => s.rotations);
  const annotations = useAppStore((s) => s.annotations);
  const userPassword = useAppStore((s) => s.userPassword);
  const password = useAppStore((s) => s.password);

  const baked = async () => {
    if (!bytes) return null;
    return bakePdf({
      bytes,
      pageOrder,
      rotations,
      annotations,
      userPassword: userPassword || undefined,
      openPassword: password || undefined,
    });
  };

  const download = async () => {
    const out = await baked();
    if (!out) return;
    downloadBlob(bytesToBlob(out, "application/pdf"), name || "foliosyne.pdf");
  };

  const share = async () => {
    const out = await baked();
    if (!out) return;
    const file = new File([bytesToBlob(out, "application/pdf")], name || "foliosyne.pdf", {
      type: "application/pdf",
    });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: name });
        return;
      } catch {
        /* cancelled */
      }
    }
    downloadBlob(file, file.name);
    toast.message(t("share.unsupported"));
  };

  const search = async () => {
    setBusy(true);
    try {
      const raw = await searchDriveFiles({ data: { query } });
      const res = unpackDrive(raw);
      if (redirectToLoginIfRequired(res)) return;
      if (!res.ok) {
        toast.error(t("share.connect"));
        return;
      }
      const items = normalizeDriveList(res.data);
      setResults(items);
      if (!items.length) toast.message(t("share.noResults"));
    } catch {
      toast.error(t("error.drive"));
    } finally {
      setBusy(false);
    }
  };

  const openDrive = async (id: string, fileName: string) => {
    setBusy(true);
    try {
      const raw = await readDriveFile({ data: { fileId: id } });
      const res = unpackDrive(raw);
      if (redirectToLoginIfRequired(res)) return;
      if (!res.ok || res.data == null) {
        toast.error(t("error.drive"));
        return;
      }
      const fileBytes = decodeDriveFile(res.data);
      if (fileBytes)
        await ingestPdf(fileBytes, fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
    } catch {
      toast.error(t("error.drive"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {bytes ? (
        <>
          <p className="text-sm text-muted">{t("share.hint")}</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void download()}>{t("share.download")}</Button>
            <Button variant="secondary" onClick={() => void share()}>
              {t("share.webShare")}
            </Button>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted">{t("share.driveHint")}</p>
      )}
      {bytes ? <p className="text-sm text-muted">{t("share.driveHint")}</p> : null}
      <div className="flex gap-2">
        <Input value={query} placeholder={t("share.search")} onChange={(e) => setQuery(e.target.value)} />
        <Button variant="secondary" disabled={busy} onClick={() => void search()}>
          {t("share.search")}
        </Button>
      </div>
      <ul className="max-h-40 overflow-auto text-sm">
        {results.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-2 border-b border-border py-1.5">
            <span className="truncate">{r.name}</span>
            <Button size="sm" variant="ghost" onClick={() => void openDrive(r.id, r.name)}>
              {t("share.openFile")}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function normalizeDriveList(data: unknown): Array<{ id: string; name: string }> {
  if (!data) return [];
  const arr = Array.isArray(data)
    ? data
    : typeof data === "object" && data && "files" in data && Array.isArray((data as { files: unknown }).files)
      ? (data as { files: unknown[] }).files
      : typeof data === "object" && data && "items" in data && Array.isArray((data as { items: unknown }).items)
        ? (data as { items: unknown[] }).items
        : [];
  return arr
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const rec = item as Record<string, unknown>;
      const id = String(rec.id ?? rec.fileId ?? rec.documentId ?? "");
      const name = String(rec.name ?? rec.title ?? rec.filename ?? id);
      if (!id) return null;
      return { id, name };
    })
    .filter((x): x is { id: string; name: string } => x !== null);
}

function decodeDriveFile(data: unknown): Uint8Array | null {
  if (!data) return null;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (data instanceof Uint8Array) return data;
  if (typeof data === "string") {
    try {
      const bin = atob(data);
      const out = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
      return out;
    } catch {
      return null;
    }
  }
  if (typeof data === "object") {
    const rec = data as Record<string, unknown>;
    if (typeof rec.content === "string") return decodeDriveFile(rec.content);
    if (typeof rec.data === "string") return decodeDriveFile(rec.data);
    if (typeof rec.base64 === "string") return decodeDriveFile(rec.base64);
  }
  return null;
}

function RotatePanel() {
  const t = useT();
  const [mode, setMode] = useState<"this" | "all" | "range">("this");
  const [fromPage, setFromPage] = useState("");
  const [toPage, setToPage] = useState("");
  const currentPage = useAppStore((s) => s.currentPage);
  const pageCount = useAppStore((s) => s.pageCount);
  const pageOrder = useAppStore((s) => s.pageOrder);
  const rotatePages = useAppStore((s) => s.rotatePages);

  useEffect(() => {
    setFromPage(String(currentPage));
    setToPage(String(currentPage));
  }, [currentPage]);

  const targets = () => {
    if (mode === "this") return [pageOrder[currentPage - 1] ?? 0];
    if (mode === "all") return pageOrder.slice();
    const a = Math.max(1, Math.min(pageCount, Number.parseInt(fromPage, 10) || 1));
    const b = Math.max(1, Math.min(pageCount, Number.parseInt(toPage, 10) || a));
    const lo = Math.min(a, b) - 1;
    const hi = Math.max(a, b) - 1;
    return pageOrder.slice(lo, hi + 1);
  };

  const go = (delta: number) => {
    rotatePages(targets(), delta);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">{t("rotate.hint")}</p>
      <div className="flex flex-wrap gap-1">
        {(["this", "range", "all"] as const).map((m) => (
          <Button key={m} size="sm" variant={mode === m ? "default" : "outline"} onClick={() => setMode(m)}>
            {t(`rotate.${m}`)}
          </Button>
        ))}
      </div>
      {mode === "range" ? (
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted">{t("rotate.from")}</label>
          <Input
            type="number"
            min={1}
            max={pageCount}
            className="w-20"
            value={fromPage}
            onChange={(e) => setFromPage(e.target.value)}
          />
          <label className="text-xs text-muted">{t("rotate.to")}</label>
          <Input
            type="number"
            min={1}
            max={pageCount}
            className="w-20"
            value={toPage}
            onChange={(e) => setToPage(e.target.value)}
          />
        </div>
      ) : null}
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => go(-90)}>
          {t("rotate.left")}
        </Button>
        <Button variant="secondary" onClick={() => go(90)}>
          {t("rotate.right")}
        </Button>
        <Button variant="outline" onClick={() => go(180)}>
          {t("rotate.around")}
        </Button>
      </div>
    </div>
  );
}

function PasswordPanel() {
  const t = useT();
  const [value, setValue] = useState("");
  const pendingBytes = useAppStore((s) => s.pendingBytes);
  const pendingName = useAppStore((s) => s.pendingName);
  const clearPasswordGate = useAppStore((s) => s.clearPasswordGate);

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!pendingBytes) return;
        const fileBytes = pendingBytes;
        const fileName = pendingName;
        clearPasswordGate();
        void ingestPdf(fileBytes, fileName, value);
      }}
    >
      <p className="text-sm text-muted">{t("file.passwordHint")}</p>
      <Input type="password" autoFocus value={value} onChange={(e) => setValue(e.target.value)} />
      <Button type="submit">{t("action.unlock")}</Button>
    </form>
  );
}

function HelpPanel() {
  const t = useT();
  const rows = [
    ["Cmd/Ctrl O", t("help.kOpen")],
    ["Cmd/Ctrl S", t("help.kSave")],
    ["Cmd/Ctrl P", t("help.kPrint")],
    ["Cmd/Ctrl + -", t("help.kZoom")],
    ["Cmd/Ctrl 0", t("help.kFit")],
    ["PgUp / PgDn", t("help.kPages")],
  ];
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">{t("help.body")}</p>
      <p className="text-xs font-medium uppercase tracking-wide text-subtle">{t("help.shortcuts")}</p>
      <ul className="text-sm">
        {rows.map(([k, v]) => (
          <li key={k} className="flex justify-between gap-4 border-b border-border py-1.5">
            <span className="font-mono text-xs text-muted">{k}</span>
            <span>{v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
