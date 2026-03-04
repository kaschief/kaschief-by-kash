export function HomePageFallback() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-6 py-20">
      <div className="w-full max-w-xl rounded-xl border border-[var(--stroke)] bg-[var(--bg-elevated)]/60 px-6 py-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--text-dim)]">
          Loading Portfolio
        </p>
        <p className="mt-3 text-sm text-[var(--cream-muted)]">
          Preparing sections and interaction modules.
        </p>
      </div>
    </main>
  );
}
