// components/dashboard/StatsPanel.tsx
'use client';

export default function StatsPanel({ robot, mission }: { robot: any, mission: any }) {
    const handleAftershock = () => {
        // Dispatches the event to the Canvas Engine
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('triggerAftershock'));
        }
    };

    return (
        <div className="glass-panel rounded-xl flex flex-col flex-1 relative overflow-hidden">
            <header className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-[#0a1220]/80">
                <h2 className="text-xs font-semibold tracking-widest uppercase text-slate-200">Robot & Rescue Stats</h2>
                <button
                    onClick={handleAftershock}
                    className="text-[10px] font-bold tracking-widest bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/50 px-3 py-1 rounded transition-all shadow-[0_0_10px_rgba(255,59,92,0.2)] cursor-pointer"
                >
                    ⚠ TRIGGER AFTERSHOCK
                </button>
            </header>

            <div className="p-4 flex flex-col gap-4 overflow-y-auto">

                {/* Robot Systems */}
                <div>
                    <h3 className="text-[10px] tracking-widest text-slate-500 mb-2 uppercase">Robot Systems</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-[#0e182a]/60 border border-white/5 p-3 rounded flex justify-between items-center">
                            <span className="text-xs text-slate-400 uppercase">Battery</span>
                            <span className="font-bold text-green-400">{Math.round(robot?.battery || 0)}%</span>
                        </div>
                        <div className="bg-[#0e182a]/60 border border-white/5 p-3 rounded flex justify-between items-center">
                            <span className="text-xs text-slate-400 uppercase">Speed</span>
                            <span className="font-bold text-cyan-400">{robot?.speed?.toFixed(1) || '0.0'} m/s</span>
                        </div>
                        <div className="bg-[#0e182a]/60 border border-white/5 p-3 rounded flex justify-between items-center">
                            <span className="text-xs text-slate-400 uppercase">Temp</span>
                            <span className="font-bold text-yellow-400">{Math.round(robot?.temperature || 0)}°C</span>
                        </div>
                        <div className="bg-[#0e182a]/60 border border-white/5 p-3 rounded flex justify-between items-center">
                            <span className="text-xs text-slate-400 uppercase">CPU</span>
                            <span className="font-bold text-purple-400">{Math.round(robot?.cpu || 0)}%</span>
                        </div>
                    </div>
                </div>

                {/* Mission Progress */}
                <div>
                    <h3 className="text-[10px] tracking-widest text-slate-500 mb-2 uppercase">Mission Progress</h3>
                    <div className="bg-[#0e182a]/60 border border-white/5 p-3 rounded flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-400 uppercase">People Saved</span>
                        <span className="font-bold text-xl text-green-400">{mission?.saved || 0} / {mission?.survivors || 0}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-[#0e182a]/60 border border-white/5 p-2 rounded flex flex-col justify-center">
                            <span className="block text-[10px] text-slate-400 mb-1">SAFE</span>
                            <span className="text-sm font-bold text-green-400">{mission?.safeZone || 0}</span>
                        </div>
                        <div className="bg-[#0e182a]/60 border border-white/5 p-2 rounded flex flex-col justify-center">
                            <span className="block text-[10px] text-slate-400 mb-1">RISK</span>
                            <span className="text-sm font-bold text-yellow-400">{mission?.riskZone || 0}</span>
                        </div>
                        <div className="bg-[#0e182a]/60 border border-white/5 p-2 rounded flex flex-col justify-center">
                            <span className="block text-[10px] text-slate-400 mb-1">CRITICAL</span>
                            <span className="text-sm font-bold text-red-500">{mission?.criticalZone || 0}</span>
                        </div>
                    </div>

                    <div className="mt-2 bg-[#0e182a]/60 border border-white/5 p-3 rounded flex justify-between items-center">
                        <span className="text-xs text-slate-400 uppercase">Obstacles Avoided</span>
                        <span className="font-bold text-white">{mission?.obstaclesAvoided || 0}</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
