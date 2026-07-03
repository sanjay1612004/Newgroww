import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWatchlist } from '../api/watchlistApi';
import { useAuth } from '../context/AuthContext';
import WatchlistRow from '../components/WatchlistRow';
import { FiBookmark, FiSearch } from 'react-icons/fi';

export default function Watchlist() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    getWatchlist()
      .then((res) => {
        const d = res.data;
        // Backend returns { success, watchlist: [...] }
        setItems(d?.watchlist || (Array.isArray(d) ? d : []));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  const handleRemove = (symbol) => {
    setItems((prev) => prev.filter((i) => i.symbol !== symbol));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-12 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <FiBookmark className="text-groww-green text-2xl" />
        <div>
          <h1 className="text-2xl font-extrabold text-groww-text">My Watchlist</h1>
          <p className="text-groww-muted text-sm">{items.length} stocks tracked</p>
        </div>
      </div>

      <div className="bg-groww-card border border-groww-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="divide-y divide-groww-border">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="animate-pulse bg-groww-border rounded-full w-10 h-10" />
                <div className="flex-1 space-y-2">
                  <div className="animate-pulse bg-groww-border rounded h-3 w-32" />
                  <div className="animate-pulse bg-groww-border rounded h-2 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-groww-muted">
            <FiSearch className="text-4xl mx-auto mb-3 text-groww-border" />
            <p className="font-medium text-groww-text mb-1">Your watchlist is empty</p>
            <p className="text-sm">Browse stocks and add them to track their prices.</p>
            <button onClick={() => navigate('/stocks')} className="btn-primary mt-4 text-sm">
              Browse Stocks
            </button>
          </div>
        ) : (
          <div className="divide-y divide-groww-border">
            {items.map((item, i) => (
              <WatchlistRow key={i} item={item} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
