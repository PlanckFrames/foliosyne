import { Pipette } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PRESET_INK,
  PRESET_PAPER,
  hexToRgb,
  hsvToRgb,
  parseHex,
  rgbToHex,
  rgbToHsv,
} from "@/lib/color";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (hex: string) => void;
  onEyedrop?: () => void;
  eyedropActive?: boolean;
  presets?: string[];
  compact?: boolean;
};

export function ColorPop({
  value,
  onChange,
  onEyedrop,
  eyedropActive,
  presets,
  compact,
}: Props) {
  const rgb = hexToRgb(value);
  const hsv0 = useMemo(() => rgbToHsv(rgb.r, rgb.g, rgb.b), [rgb.r, rgb.g, rgb.b]);
  const [hex, setHex] = useState(value.replace("#", "").toUpperCase());
  const [hsv, setHsv] = useState(hsv0);

  useEffect(() => {
    setHex(value.replace("#", "").toUpperCase());
    setHsv(rgbToHsv(rgb.r, rgb.g, rgb.b));
  }, [value, rgb.r, rgb.g, rgb.b]);

  const commitHsv = (next: { h: number; s: number; v: number }) => {
    setHsv(next);
    const c = hsvToRgb(next.h, next.s, next.v);
    const out = rgbToHex(c.r, c.g, c.b);
    setHex(out.slice(1));
    onChange(out);
  };

  const commitRgb = (r: number, g: number, b: number) => {
    const out = rgbToHex(r, g, b);
    setHex(out.slice(1));
    setHsv(rgbToHsv(r, g, b));
    onChange(out);
  };

  const chips = presets ?? PRESET_INK;
  const hue = hsvToRgb(hsv.h, 1, 1);
  const hueColor = rgbToHex(hue.r, hue.g, hue.b);

  return (
    <div className={cn("flex flex-col gap-2", compact ? "w-52" : "w-56")}>
      <div className="flex items-center gap-2">
        <div
          className="size-8 shrink-0 rounded-sm border border-border"
          style={{ background: value }}
        />
        <span className="text-[11px] text-muted">#</span>
        <input
          value={hex}
          maxLength={6}
          aria-label="Hex"
          className="h-8 w-full rounded-sm border border-border bg-surface px-2 font-mono text-xs uppercase"
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9a-fA-F]/g, "");
            setHex(raw.toUpperCase());
            const parsed = parseHex(raw);
            if (parsed) onChange(rgbToHex(parsed.r, parsed.g, parsed.b));
          }}
        />
        {onEyedrop ? (
          <Button
            type="button"
            variant={eyedropActive ? "default" : "ghost"}
            size="icon-sm"
            aria-label="Eyedropper"
            onClick={onEyedrop}
          >
            <Pipette />
          </Button>
        ) : null}
      </div>
      <div
        className="relative h-24 w-full cursor-crosshair rounded-sm border border-border"
        style={{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueColor})`,
        }}
        onPointerDown={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const s = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
          const v = Math.max(0, Math.min(1, 1 - (e.clientY - r.top) / r.height));
          commitHsv({ ...hsv, s, v });
        }}
      >
        <div
          className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
        />
      </div>
      <input
        type="range"
        min={0}
        max={360}
        value={Math.round(hsv.h)}
        aria-label="Hue"
        className="h-3 w-full cursor-pointer appearance-none rounded-sm"
        style={{
          background:
            "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
        }}
        onChange={(e) => commitHsv({ ...hsv, h: Number(e.target.value) })}
      />
      {(["r", "g", "b"] as const).map((k) => (
        <label key={k} className="flex items-center gap-2 text-[11px] uppercase text-muted">
          {k}
          <input
            type="range"
            min={0}
            max={255}
            value={rgb[k]}
            className="flex-1"
            onChange={(e) => {
              const n = Number(e.target.value);
              commitRgb(k === "r" ? n : rgb.r, k === "g" ? n : rgb.g, k === "b" ? n : rgb.b);
            }}
          />
          <span className="w-8 tabular-nums text-fg">{rgb[k]}</span>
        </label>
      ))}
      <div className="flex flex-wrap gap-1">
        {chips.map((c) => (
          <button
            key={c}
            type="button"
            className={cn(
              "size-5 rounded-sm border border-border",
              c.toUpperCase() === value.toUpperCase() && "ring-2 ring-accent",
            )}
            style={{ background: c }}
            aria-label={c}
            onClick={() => onChange(c)}
          />
        ))}
      </div>
    </div>
  );
}

export { PRESET_PAPER };
