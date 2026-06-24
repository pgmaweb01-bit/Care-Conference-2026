import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X } from "lucide-react";

export function QrScanner({ onDetected }: { onDetected: (text: string) => void }) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerId = "qr-scanner-region";
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const scanner = new Html5Qrcode(containerId, { verbose: false });
    scannerRef.current = scanner;

    (async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            if (cancelled) return;
            onDetected(decodedText);
            stop();
          },
          () => {},
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to start camera");
        setActive(false);
      }
    })();

    function stop() {
      cancelled = true;
      const s = scannerRef.current;
      if (!s) return;
      s.stop()
        .then(() => s.clear())
        .catch(() => {});
      scannerRef.current = null;
      setActive(false);
    }

    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Camera className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg">Scan QR Code</h3>
        </div>
        {active ? (
          <button
            onClick={() => setActive(false)}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card px-4 text-xs font-medium hover:bg-secondary"
          >
            <X className="h-3.5 w-3.5" /> Stop
          </button>
        ) : (
          <button
            onClick={() => {
              setError(null);
              setActive(true);
            }}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Camera className="h-3.5 w-3.5" /> Start Camera
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Point the camera at an attendee's QR pass. Detection is automatic.
      </p>
      <div
        id={containerId}
        className={`mt-4 overflow-hidden rounded-xl bg-black/90 ${active ? "block" : "hidden"}`}
        style={{ minHeight: active ? 280 : 0 }}
      />
      {error && (
        <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
