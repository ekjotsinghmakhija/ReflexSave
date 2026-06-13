'use client';
import { useEffect, useState } from 'react';

export default function Header({ alert }: { alert?: { text: string, level: string } }) {
    const [time, setTime] = useState("--:--:--");

    useEffect(() => {
        const int = setInterval(() => setTime(new Date().toLocaleTimeString('en-IN', { hour12: false })), 1000);
        return () => clearInterval(int);
    }, []);

    return (
        <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 p-4 border-b border-white/10 bg-[#060a12]/85 backdrop-blur-md">
            <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 flex items-center justify-center border-2 border-cyan-400 rounded-full shadow-[0_0_16px_rgba(0,212,255,0.5)]">
                    <span className="font-bold text-cyan-400 text-sm tracking-widest">NR</span>
                </div>
                <div>
                    <h1 className="text-lg md:text-xl font-bold tracking-widest uppercase bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
                        ReflexSave
                    </h1>
                    <p className="text-xs text-slate-400 tracking-wider">Earthquake Response Simulation</p>
                </div>
            </div>

            <div className="flex-1 min-w-[200px] max-w-lg">
                <div className={`flex items-center gap-3 px-4 py-2 rounded border ${alert?.level === 'critical' ? 'bg-red-500/10 border-red-500/40 text-red-400 animate-pulse' :
                    alert?.level === 'warning' ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400' :
                        'bg-green-500/10 border-green-500/30 text-green-400'
                    }`}>
                    <span className="text-sm">⚠</span>
                    <span className="text-xs font-semibold truncate">{alert?.text || "System Standby"}</span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-slate-500 tracking-widest font-bold">LOCAL TIME</span>
                    <span className="text-cyan-400 font-medium tracking-widest">{time}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500 text-red-500 bg-red-500/10 text-xs font-bold tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(255,59,92,0.8)]"></span>
                    LIVE
                </div>
            </div>
        </header>
    );
}
