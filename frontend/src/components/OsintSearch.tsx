
import { useState } from 'react';
import { useMissionStore } from '../stores/missionStore';
import { Search, Globe, User, AlertCircle, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';

export default function OsintSearch() {
  const [query, setQuery] = useState('');
  const { currentOsintResults: results, isOsintLoading, performOsintSearch } = useMissionStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performOsintSearch(query.trim());
    }
  };

  return (
    <div className="h-full flex flex-col bg-tactical-bg p-4 tactical-border">
      <h2 className="text-xs font-bold text-tactical-muted uppercase tracking-widest mb-4 flex items-center gap-2">
        <Globe size={12}/> OPEN SOURCE INTELLIGENCE
      </h2>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for target (name, email, alias...)"
          className="flex-1 p-2 bg-tactical-panel border border-tactical-border text-tactical-text text-xs focus:border-tactical-blue outline-none"
          disabled={isOsintLoading}
        />
        <button
          type="submit"
          className="p-2 bg-tactical-blue text-white hover:bg-tactical-blue/80 transition-colors flex items-center gap-1 text-xs font-mono"
          disabled={isOsintLoading}
        >
          {isOsintLoading ? 'SCANNING...' : <><Search size={14}/> SEARCH</>}
        </button>
      </form>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-tactical-green/50 scrollbar-track-tactical-panel">
        {isOsintLoading && (
          <div className="text-tactical-green/70 animate-pulse text-center mt-8 text-sm">
            Executing deep scan... please standby.
          </div>
        )}

        {!isOsintLoading && results.length === 0 && (
          <div className="text-tactical-muted/50 text-center mt-8 text-xs">
            No results yet. Initiate a query.
          </div>
        )}

        {!isOsintLoading && results.map((result, index) => (
          <div key={index} className="bg-tactical-panel border border-tactical-border p-3 mb-3 text-xs space-y-2">
            <div className="flex justify-between items-center text-tactical-green font-bold">
              <span>{result.type.toUpperCase()} - {result.source}</span>
              <AlertCircle size={14} className="text-yellow-500" />
            </div>
            {Object.entries(result.data).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b border-tactical-border/20 pb-1 last:border-b-0 last:pb-0">
                <span className="text-tactical-muted capitalize">{key.replace(/_/g, ' ')}:</span>
                <span className={clsx(
                    "text-tactical-text",
                    key === 'match_confidence' && (value > 0.8 ? 'text-tactical-green' : value > 0.5 ? 'text-yellow-500' : 'text-tactical-red')
                )}>
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
