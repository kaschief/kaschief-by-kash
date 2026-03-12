import { PERSONAL } from "@data";

export function HomePageFallback() {
  const { initials } = PERSONAL;
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: "var(--bg)" }}>
      <div className="flex flex-col items-center gap-6">
        {/* Pulsing initials mark */}
        <span
          className="animate-pulse font-serif text-2xl tracking-[0.3em]"
          style={{ color: "var(--gold-dim)" }}>
          {initials}
        </span>
        {/* Minimal loading bar */}
        <div
          className="h-px w-24 overflow-hidden rounded-full"
          style={{ backgroundColor: "var(--stroke)" }}>
          <div
            className="h-full w-full origin-left animate-[shimmer_1.5s_ease-in-out_infinite] rounded-full"
            style={{ backgroundColor: "var(--gold-dim)" }}
          />
        </div>
      </div>
    </div>
  );
}
