'use client';
import { useEffect, useRef } from 'react';
import { NeuralVisualizer } from '@/lib/simulation/renderers';

export default function NeuralPanel({ logs }: { logs: any[] }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const vizRef = useRef<NeuralVisualizer | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        let isMounted = true;

        if (!vizRef.current) {
            setTimeout(() => {
                if (isMounted && canvasRef.current && !vizRef.current) {
                    vizRef.current = new NeuralVisualizer(canvasRef.current);
                }
            }, 50);
        }

        return () => {
            isMounted = false;
            vizRef.current = null; // CRITICAL FIX
        };
    }, []);

    return (
        <div className="glass-panel rounded-xl flex flex-col flex-1 h-[260px]">
            <header className="px-4 py-3 border-b border-white/5 flex justify-between">
                <h2 className="text-xs font-semibold tracking-widest uppercase">AI Decisions</h2>
                <span className="text-[10px] font-bold tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded">CORE</span>
            </header>

            <div className="p-2 flex flex-col gap-2 h-full overflow-hidden">
                <canvas ref={canvasRef} className="w-full h-[60px] bg-[#060a12]/60 border border-white/5 rounded shrink-0" />

                <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
                    {logs?.map((log) => (
                        <div key={log.id} className={`text-[11px] p-2 rounded border-l-2 bg-[#0e182a]/50 ${log.type === 'critical' ? 'border-red-500 text-red-200' :
                                log.type === 'warning' ? 'border-yellow-400 text-yellow-100' :
                                    log.type === 'success' ? 'border-green-400 text-green-100' :
                                        'border-cyan-400 text-slate-300'
                            }`}>
                            <span className="text-slate-500 mr-2 font-mono">{log.time}</span>
                            <span dangerouslySetInnerHTML={{ __html: log.text }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
