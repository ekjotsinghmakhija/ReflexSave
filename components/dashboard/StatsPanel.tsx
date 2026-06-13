'use client';
import { useEffect, useState } from 'react';

export default function StatsPanel({ robot, mission }: { robot: any, mission: any }) {
    const [metrics, setMetrics] = useState({ inference_ms: 0, compute_tokens: 0 });

    useEffect(() => {
        const handleMetrics = (e: any) => setMetrics(e.detail);
        window.addEventListener('ai-metrics', handleMetrics);
        return () => window.removeEventListener('ai-metrics', handleMetrics);
    }, []);

    const handleAftershock = () => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('triggerAftershock'));
        }
    };

    return (
        <div className="glass-panel rounded-xl flex flex-col flex-1 relative overflow-hidden">
            <header className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-[#0a1220]/80">
                <h2 className="text-xs font-semibold tracking-widest uppercase text-slate-200">System Telemetry</h2>
                <span className="text-[10px] font-bold tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/50 px-2 py-0.5 rounded">
                    SWARM ACTIVE
                </span>
            </header>

            <div className="p-4 flex flex-col gap-4 overflow-y-auto">

                {/* Real Backend Robot Systems */}
                <div>
                    <h3 className="text-[10px] tracking-widest text-slate-500 mb-2 uppercase">Physical Systems (Server Sync)</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-[#0e182a]/60 border border-white/5 p-3 rounded flex justify-between items-center">
                            <span className="text-xs text-slate-400 uppercase">Battery</span>
                            <span className="font-bold text-green-400">{robot?.battery?.toFixed(1) || 0}%</span>
                        </div>
                        <div className="bg-[#0e182a]/60 border border-white/5 p-3 rounded flex justify-between items-center">
                            <span className="text-xs text-slate-400 uppercase">CPU</span>
                            <span className="font-bold text-purple-400">{robot?.cpu?.toFixed(1) || 0}%</span>
                        </div>
                    </div>
                </div>

                {/* AI INFERENCE METRICS (FOR THE JUDGES) */}
                <div>
                    <h3 className="text-[10px] tracking-widest text-slate-500 mb-2 uppercase text-purple-400">PyTorch AI Inference</h3>
                    <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-[#1e1430]/60 border border-purple-500/20 p-2 rounded flex flex-col justify-center">
                            <span className="block text-[10px] text-purple-300 mb-1">LATENCY</span>
                            <span className="text-sm font-bold text-white">{metrics.inference_ms} ms</span>
                        </div>
                        <div className="bg-[#1e1430]/60 border border-purple-500/20 p-2 rounded flex flex-col justify-center">
                            <span className="block text-[10px] text-purple-300 mb-1">COMPUTE DEPTH</span>
                            <span className="text-sm font-bold text-white">{metrics.compute_tokens} nodes</span>
                        </div>
                    </div>
                </div>

                {/* Action Controls */}
                <div className="mt-auto pt-4 border-t border-white/5">
                    <button onClick={handleAftershock} className="w-full text-xs font-bold tracking-widest bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/50 py-2 rounded transition-all cursor-pointer">
                        ⚠ TRIGGER RANDOM AFTERSHOCK
                    </button>
                    <p className="text-[10px] text-slate-500 mt-2 text-center">Or click directly on the map to inject custom debris</p>
                </div>

            </div>
        </div>
    );
}
