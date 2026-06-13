export default function SensorPanel({ sensors }: { sensors: any[] }) {
    return (
        <div className="glass-panel rounded-xl flex flex-col flex-1">
            <header className="px-4 py-3 border-b border-white/5">
                <h2 className="text-xs font-semibold tracking-widest uppercase">Sensor Feed</h2>
            </header>
            <div className="p-4 flex flex-col gap-2 overflow-y-auto">
                {sensors?.map((s, i) => (
                    <div key={i} className="bg-[#0e182a]/60 border border-white/5 p-3 rounded flex justify-between items-center transition hover:border-cyan-500/30">
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-200">{s.name}</span>
                            <span className="text-cyan-400 text-sm">{s.value.toFixed(1)} {s.unit}</span>
                        </div>
                        <div className="text-[10px] font-bold tracking-widest px-2 py-1 rounded border uppercase" style={{
                            color: s.status === 'safe' ? '#00e676' : s.status === 'warning' ? '#ffd23f' : '#ff3b5c',
                            borderColor: s.status === 'safe' ? '#00e67640' : s.status === 'warning' ? '#ffd23f40' : '#ff3b5c40',
                            backgroundColor: s.status === 'safe' ? '#00e67615' : s.status === 'warning' ? '#ffd23f15' : '#ff3b5c15'
                        }}>
                            {s.status}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
