'use client';

import { useEffect, useRef } from 'react';
import { AppController } from '@/lib/simulation/app';

export default function MapPanel({ onStateUpdate }: { onStateUpdate: (state: any) => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const appRef = useRef<AppController | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        let isMounted = true;

        if (!appRef.current) {
            // Wait 50ms for Tailwind to apply styles so the canvas parent isn't 0x0
            setTimeout(() => {
                if (isMounted && canvasRef.current && !appRef.current) {
                    appRef.current = new AppController(canvasRef.current, null, onStateUpdate);
                }
            }, 50);
        }

        return () => {
            isMounted = false;
            if (appRef.current) {
                appRef.current.destroy();
                appRef.current = null; // CRITICAL FIX for React Strict Mode!
            }
        };
        // Disable warning to prevent infinite re-renders from the parent state setter
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="relative w-full h-[500px] lg:h-[600px] p-2 bg-[#0a1018]">
            {/* The canvas relies on this parent div for its size */}
            <canvas ref={canvasRef} className="w-full h-full rounded-lg block" />
        </div>
    );
}
