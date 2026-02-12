
import { MissionLog } from '../types';
import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { clsx } from 'clsx';

export default function LogConsole({ logs, title = "Mission Logs" }: { logs: MissionLog[], title?: string }) {
    const logContainerRef = useRef<HTMLDivElement>(null);
    const shouldScrollToBottom = useRef(true);

    // Effect to auto-scroll to bottom only if user hasn't scrolled up
    useEffect(() => {
        if (shouldScrollToBottom.current && logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    // Handle user scrolling
    const handleScroll = () => {
        if (logContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
            // If user scrolled near the bottom, enable auto-scroll again
            if (scrollHeight - scrollTop - clientHeight < 50) { // 50px threshold
                shouldScrollToBottom.current = true;
            } else {
                shouldScrollToBottom.current = false;
            }
        }
    };

    useEffect(() => {
      const el = logContainerRef.current;
      if (el) {
        el.addEventListener('scroll', handleScroll);
        return () => el.removeEventListener('scroll', handleScroll);
      }
    }, []);

    return (
        <div className="flex flex-col h-full">
            <div className="p-2 bg-tactical-panel border-b border-tactical-border">
                <h2 className="text-xs font-bold text-tactical-muted uppercase">{title}</h2>
            </div>
            <div 
                ref={logContainerRef} 
                className="flex-1 bg-black p-2 font-mono text-[10px] overflow-y-auto text-tactical-muted scrollbar-thin scrollbar-thumb-tactical-green/50 scrollbar-track-black"
            >
                {logs.length === 0 && <div className="text-tactical-muted/50 mt-4 text-center">No recent logs.</div>}
                {logs.map((log, i) => (
                    <div key={log.id || i} className="mb-1 border-b border-white/5 pb-1 last:border-b-0">
                        <span className="text-tactical-blue">[{format(new Date(log.timestamp), 'HH:mm:ss')}]</span>
                        <span className={clsx("ml-2 font-bold",
                            log.level === 'CRITICAL' && 'text-tactical-red',
                            log.level === 'WARN' && 'text-yellow-500',
                            log.level === 'INFO' && 'text-tactical-green'
                        )}>
                            {log.level}
                        </span>
                        <span className="ml-2 text-gray-300">
                             :: {log.message}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
