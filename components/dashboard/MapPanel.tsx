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
                appRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!appRef.current) return;
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        appRef.current.handleManualObstacle(x, y);
    };

    return (
        <div className="relative w-full h-[500px] lg:h-[600px] p-2 bg-[#0a1018]">
            <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="w-full h-full rounded-lg block cursor-crosshair"
            />
        </div>
    );
}
