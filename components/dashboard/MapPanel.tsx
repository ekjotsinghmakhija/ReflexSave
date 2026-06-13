'use client';

import { useEffect, useRef } from 'react';
import { AppController } from '@/lib/simulation/app';

export default function MapPanel({ onStateUpdate }: { onStateUpdate: (state: any) => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const appRef = useRef<AppController | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Initialize simulation
        if (!appRef.current) {
            appRef.current = new AppController(canvasRef.current, null, onStateUpdate);
        }

        return () => {
            if (appRef.current) appRef.current.destroy();
        };
    }, [onStateUpdate]);

    return (
        <div className="relative w-full h-[500px] lg:h-[600px] p-2 bg-[#0a1018]">
            <canvas ref={canvasRef} className="w-full h-full rounded-lg" />
        </div>
    );
}
