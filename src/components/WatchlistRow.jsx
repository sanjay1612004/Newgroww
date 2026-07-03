import { useState } from 'react';
import { FiTrash2, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { removeFromWatchlist } from '../api/watchlistApi';
import { useNavigate } from 'react-router-dom';

export default function WatchlistRow({ item, onRemove }) {
  const navigate = useNavigate();
  const [removing, setRemoving] = useState(false);

  const handleRemove = async (e) => {
    e.stopPropagation();
    setRemoving(true);
    try {
      await removeFromWatchlist(item.symbol);
      onRemove?.(item.symbol);
    } catch { setRemoving(false); }
  };

  const isGain = item.dayChangePerc >= 0;

  return (
    <div
      onClick={() => navigate(`/stocks/${item.searchId || item.symbol?.toLowerCase()}`)}
      className="flex items-center gap-4 px-5 py-4 border-b border-groww-border
                 hover:bg-groww-card-hover cursor-pointer transition-colors group">
      <div className="w-10 h-10 rounded-full bg-groww-green/10 flex items-center justify-center shrink-0">
        <span className="text-groww-green font-bold text-sm">{(item.companyName || '?')[0]}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-groww-text group-hover:text-groww-green transition-colors truncate">
          {item.companyName}
        </p>
        <p className="text-xs text-groww-muted">{item.symbol}</p>
      </div>

      <div className="text-right mr-4">
        <p className="text-sm font-bold text-groww-text">
          {item.livePrice != null
            ? `₹${Number(item.livePrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
            : '—'}
        </p>
        {item.dayChangePerc != null && (
          <p className={`text-xs flex items-center justify-end gap-0.5 font-medium ${isGain ? 'text-gain' : 'text-loss'}`}>
            {isGain ? <FiTrendingUp /> : <FiTrendingDown />}
            {isGain ? '+' : ''}{Number(item.dayChangePerc).toFixed(2)}%
          </p>
        )}
      </div>

      <button onClick={handleRemove} disabled={removing}
        className="opacity-0 group-hover:opacity-100 text-groww-muted hover:text-groww-red transition-all duration-200 p-1">
        <FiTrash2 size={16} />
      </button>
    </div>
  );
}
