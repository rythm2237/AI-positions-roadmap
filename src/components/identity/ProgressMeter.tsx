export function ProgressMeter({ value, label }: { value: number; label: string }) {
  return <div className="flex items-center gap-4"><div className="grid size-16 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#818cf8 ${value}%,rgba(255,255,255,.07) 0)` }}><div className="grid size-12 place-items-center rounded-full bg-[#090b19] text-sm font-bold text-white">{value}%</div></div><div><p className="text-sm font-medium text-slate-200">{label}</p><p className="mt-1 text-xs text-slate-500">Updated from your current workspace</p></div></div>;
}

