export default function Loading() {
  return (
    <div className="loading-shell flex items-center justify-center min-h-[180px]">
      <div className="reaction-vessel relative w-44 h-44 rounded-2xl border-2 border-primary/60 bg-surface-container-high overflow-hidden">
        <div className="bubble-group absolute bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-3/4">
          <span className="bubble" style={{ left: '15%', animationDelay: '0s' }} />
          <span className="bubble" style={{ left: '45%', animationDelay: '0.15s' }} />
          <span className="bubble" style={{ left: '70%', animationDelay: '0.28s' }} />
        </div>
        <div className="glow-ring absolute inset-1 rounded-xl border border-cyan-300/25 animate-pulse" />
      </div>
      <div className="ml-4 text-on-surface">
        <div className="font-semibold text-lg mb-1">Analyzing Molecules</div>
        <div className="text-sm text-on-surface-variant">Please wait while chemistry magic is computed...</div>
      </div>
    </div>
  );
}
