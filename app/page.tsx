'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import dynamic from 'next/dynamic';
import StatsPanel from '@/components/dashboard/StatsPanel';
import SensorPanel from '@/components/dashboard/SensorPanel';

// Dynamically import Canvas components to prevent SSR hydration errors
const MapPanel = dynamic(() => import('@/components/dashboard/MapPanel'), { ssr: false });
const NeuralPanel = dynamic(() => import('@/components/dashboard/NeuralPanel'), { ssr: false });

export default function Dashboard() {
    const [simState, setSimState] = useState<any>(null);

    return (
        <div className="min-h-screen bg-[#060a12] text-[#e8f0ff] font-sans overflow-x-hidden flex flex-col relative">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none opacity-40 scanlines z-50"></div>
            <div className="fixed inset-0 pointer-events-none bg-grid z-0"></div>

            <Header alert={simState?.alert} />

            <main className="relative z-10 flex-1 w-full max-w-screen-2xl mx-auto p-4 lg:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                    {/* Left Column: Map */}
                    <section className="lg:col-span-8 flex flex-col glass-panel rounded-xl overflow-hidden">
                        <header className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-[#0a1220]/80">
                            <h2 className="text-sm font-semibold tracking-widest uppercase">2D Earthquake Simulation</h2>
                            <span className="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded border border-cyan-400/30">ReflexSave v2.0</span>
                        </header>
                        {/* MapPanel will call setSimState to update the UI with backend data */}
                        <MapPanel onStateUpdate={setSimState} />
                        <div className="absolute top-16 right-6 max-w-[50%] p-2 bg-[#060a12]/90 border border-cyan-500/30 rounded text-xs text-cyan-400 backdrop-blur-md">
                            {simState?.statusString || "Initializing robots..."}
                        </div>
                    </section>

                    {/* Right Column: Stats, Sensors, Neural */}
                    <section className="lg:col-span-4 flex flex-col gap-6">
                        <StatsPanel robot={simState?.robot} mission={simState?.mission} />
                        <SensorPanel sensors={simState?.sensors} />
                        <NeuralPanel logs={simState?.logs} />
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
