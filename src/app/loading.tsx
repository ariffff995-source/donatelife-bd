export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] py-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
        </div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          Loading DonateLife BD...
        </p>
      </div>
    </div>
  );
}
