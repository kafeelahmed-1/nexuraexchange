import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download } from "lucide-react";

export function MockAppQr({ platform, align = "center" }: { platform: "iOS" | "Android" | "App"; align?: "center" | "start" }) {
  const qrRef = useRef<SVGSVGElement>(null);
  const downloadLabel = platform === "iOS" ? "iOS" : platform === "Android" ? "android" : "app";
  const downloadQr = () => {
    if (!qrRef.current) return;
    const url = URL.createObjectURL(new Blob([qrRef.current.outerHTML], { type: "image/svg+xml" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `nexora-${downloadLabel}-qr.svg`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className={platform === "App" ? `flex flex-col ${align === "start" ? "items-start" : "items-center"}` : "flex min-w-0 flex-col items-center gap-2 rounded-xl border border-border bg-card p-3"}>
      {platform !== "App" && <span className="text-xs font-semibold text-muted-foreground">{platform === "iOS" ? "iPhone" : "Android"} app</span>}
      <QRCodeSVG
        ref={qrRef}
        value={`https://nexora.exchange/app?platform=${downloadLabel}`}
        size={platform === "App" ? 176 : 96}
        level="H"
        includeMargin
        bgColor="#ffffff"
        fgColor="#071014"
        title={`${platform} app QR code`}
        className={platform === "App" ? "block h-auto w-[clamp(9rem,52vw,11rem)] max-w-full" : "block h-auto max-w-full"}
      />
      {platform !== "App" && (
        <button type="button" onClick={downloadQr} className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-2 py-2 text-xs font-semibold transition hover:border-primary/40 hover:text-primary">
          <Download size={14} />Download QR
        </button>
      )}
    </div>
  );
}