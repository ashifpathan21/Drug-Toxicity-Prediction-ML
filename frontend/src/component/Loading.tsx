export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[220px] p-6">
      <div className="flex flex-col items-center relative">
        <div className="flask-neck" />
        <div className="flask-loader" />
        <div className="lab-bubbles w-[60px] h-[80px] absolute bottom-0 left-1/2 -translate-x-1/2 overflow-hidden pointer-events-none">
          <span style={{ left: '15%', animationDelay: '0s', animationDuration: '1.5s' }} />
          <span style={{ left: '45%', animationDelay: '0.4s', animationDuration: '2.1s' }} />
          <span style={{ left: '70%', animationDelay: '0.9s', animationDuration: '1.2s' }} />
          <span style={{ left: '25%', animationDelay: '0.2s', animationDuration: '1.8s' }} />
          <span style={{ left: '60%', animationDelay: '0.7s', animationDuration: '1.4s' }} />
        </div>
      </div>
      <div className="mt-6 text-on-surface text-center">
        <div className="font-bold tracking-widest text-[#00ffaa] mb-1">ANALYZING DRUG TOXICITY...</div>
        <div className="text-xs text-on-surface-variant uppercase tracking-wider">Running Toxicity Diagnostics</div>
      </div>
    </div>
  );
}
