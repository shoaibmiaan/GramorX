// components/certificates/CertificateCanvas.tsx
import * as React from "react";

/**
 * Draws a crisp certificate PNG from props using a <canvas>.
 * Uses DS color tokens by reading CSS variables; no hard-coded hex.
 */
export type CertificateCanvasProps = {
  fullName: string;
  band: number;               // e.g. 7.5
  cohort?: string;            // e.g. "BandBoost Sept 2025"
  issuedAt?: string;          // ISO date
  certificateId?: string;     // UUID
  width?: number;             // CSS pixels (before DPR scale), default 1200
  height?: number;            // CSS pixels, default 800
  backgroundLabel?: string;   // optional watermark label
  onReady?: (dataUrl: string) => void; // fires after render
};

export function CertificateCanvas({
  fullName,
  band,
  cohort,
  issuedAt,
  certificateId,
  width = 1200,
  height = 800,
  backgroundLabel = "GramorX",
  onReady,
}: CertificateCanvasProps) {
  const ref = React.useRef<HTMLCanvasElement | null>(null);

  // helper: get css var as an rgb(var(--token)) string
  const css = (name: string, fallback: string) => {
    const root = document.documentElement;
    const v = getComputedStyle(root).getPropertyValue(name).trim();
    // If tokens store numbers like "12 34 56", form "rgb(var(--token))"
    if (v) {
      if (v.includes("rgb")) return v;
      if (v.match(/^\d+(\s+\d+){2}/)) return `rgb(var(${name}))`;
      if (v.startsWith("#")) return v;
    }
    return fallback;
  };

  const draw = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    el.width = width * dpr;
    el.height = height * dpr;
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;

    const ctx = el.getContext("2d");
    if (!ctx) return;
    ctx.resetTransform();
    ctx.scale(dpr, dpr);

    // Colors from DS tokens
    const bg = css("--color-background", "#0b0c10");
    const fg = css("--color-foreground", "#e8eaed");
    const border = css("--color-border", "#232733");
    const primary = css("--color-primary", "#3b82f6");
    const muted = css("--color-muted-foreground", "rgba(168,176,191,1)");

    // Background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Outer border
    ctx.strokeStyle = border;
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, width - 48, height - 48);

    // Watermark
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-Math.PI / 12);
    ctx.fillStyle = fg;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 140px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial";
    ctx.fillText(backgroundLabel, 0, 0);
    ctx.restore();

    // Header
    ctx.fillStyle = fg;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.font = "600 48px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial";
    ctx.fillText("Certificate of Achievement", width / 2, 140);

    // Subheader line
    ctx.strokeStyle = border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width * 0.2, 160);
    ctx.lineTo(width * 0.8, 160);
    ctx.stroke();

    // Recipient
    ctx.font = "700 64px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial";
    ctx.fillText(fullName, width / 2, 260);

    // Band badge
    const badgeY = 350;
    ctx.fillStyle = primary;
    const badgeW = 280;
    const badgeH = 86;
    const badgeX = (width - badgeW) / 2;
    const r = 16;
    roundRect(ctx, badgeX, badgeY, badgeW, badgeH, r);
    ctx.fill();

    ctx.fillStyle = "#000000"; // text over primary needs contrast; we assume primary is light in our DS
    ctx.font = "800 44px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial";
    ctx.textAlign = "center";
    ctx.fillText(`Predicted Band ${band.toFixed(1)}`, width / 2, badgeY + 56);

    // Details
    ctx.fillStyle = muted;
    ctx.font = "400 22px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial";
    const detailY = 470;
    const issuedDate = issuedAt
      ? new Date(issuedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
      : new Date().toLocaleDateString();
    const lines = [
      cohort ? `Cohort: ${cohort}` : "",
      `Issued: ${issuedDate}`,
      certificateId ? `ID: ${certificateId}` : "",
    ].filter(Boolean);
    lines.forEach((txt, i) => ctx.fillText(txt, width / 2, detailY + i * 28));

    // Signatures
    ctx.strokeStyle = border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width * 0.22, height - 160);
    ctx.lineTo(width * 0.42, height - 160);
    ctx.moveTo(width * 0.58, height - 160);
    ctx.lineTo(width * 0.78, height - 160);
    ctx.stroke();

    ctx.fillStyle = fg;
    ctx.font = "500 18px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial";
    ctx.textAlign = "center";
    ctx.fillText("GramorX Director", width * 0.32, height - 130);
    ctx.fillText("Authorized AI Evaluator", width * 0.68, height - 130);

    // Done
    const dataUrl = el.toDataURL("image/png");
    onReady?.(dataUrl);
  }, [backgroundLabel, band, certificateId, cohort, issuedAt, width, height]);

  React.useEffect(() => {
    // Avoid SSR issues
    if (typeof window !== "undefined") {
      draw();
    }
  }, [draw]);

  const download = () => {
    const el = ref.current;
    if (!el) return;
    const link = document.createElement("a");
    link.download = `GramorX-Certificate-${certificateId ?? "latest"}.png`;
    link.href = el.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-card p-3">
        <canvas ref={ref} className="w-full rounded-lg border border-border bg-background" />
      </div>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={download}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-border/30"
        >
          Download PNG
        </button>
      </div>
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
