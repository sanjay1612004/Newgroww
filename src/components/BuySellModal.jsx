import { useState } from 'react';
import { FiX, FiAlertCircle } from 'react-icons/fi';
import { buyStock, sellStock } from '../api/portfolioApi';

export default function BuySellModal({ stock, onClose, onSuccess }) {
  const [mode, setMode] = useState('BUY');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ltp = stock?.ltp || stock?.stats?.ltp || 0;
  const total = (ltp * quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleSubmit = async () => {
    if (!quantity || quantity < 1) { setError('Enter a valid quantity'); return; }
    setLoading(true);
    setError('');
    try {
      if (mode === 'BUY') {
        await buyStock({
          searchId: stock.searchId || stock.search_id || stock.nseScriptCode?.toLowerCase() || stock.symbol?.toLowerCase(),
          quantity: Number(quantity),
        });
      } else {
        await sellStock({
          symbol: stock.nseScriptCode || stock.symbol,
          quantity: Number(quantity),
        });
      }
      onSuccess?.(mode);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || `${mode} failed. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-groww-card border border-groww-border rounded-2xl w-full max-w-md shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-groww-border">
          <div>
            <h2 className="font-bold text-groww-text text-lg">{stock?.companyName || stock?.displayName}</h2>
            <p className="text-sm text-groww-muted">{stock?.nseScriptCode || stock?.symbol}</p>
          </div>
          <button onClick={onClose} className="text-groww-muted hover:text-groww-text transition-colors p-1">
            <FiX size={20} />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex m-5 mb-0 bg-groww-surface rounded-xl p-1 gap-1">
          {['BUY', 'SELL'].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                mode === m
                  ? m === 'BUY'
                    ? 'bg-groww-green text-groww-dark shadow'
                    : 'bg-groww-red text-white shadow'
                  : 'text-groww-muted hover:text-groww-text'
              }`}>
              {m}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Price */}
          <div className="flex items-center justify-between bg-groww-surface rounded-xl p-4">
            <div>
              <p className="text-xs text-groww-muted">Market Price</p>
              <p className="text-2xl font-bold text-groww-text mt-0.5">
                ₹{Number(ltp).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <span className="text-xs bg-groww-green/10 text-groww-green px-2 py-1 rounded-full font-medium">LIVE</span>
          </div>

          {/* Quantity */}
          <div>
            <label className="text-xs text-groww-muted mb-1.5 block font-medium">Quantity (Shares)</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 bg-groww-surface border border-groww-border rounded-lg text-groww-text hover:border-groww-green/50 transition-colors font-bold text-lg">−</button>
              <input type="number" min="1" value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="input-field text-center font-bold text-lg" />
              <button onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 bg-groww-surface border border-groww-border rounded-lg text-groww-text hover:border-groww-green/50 transition-colors font-bold text-lg">+</button>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between bg-groww-surface rounded-xl px-4 py-3">
            <span className="text-sm text-groww-muted">Estimated {mode === 'BUY' ? 'Cost' : 'Value'}</span>
            <span className="text-lg font-bold text-groww-text">₹{total}</span>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-groww-red/10 border border-groww-red/30 rounded-lg px-4 py-3">
              <FiAlertCircle className="text-groww-red shrink-0" />
              <p className="text-sm text-groww-red">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 disabled:opacity-60 ${
              mode === 'BUY'
                ? 'bg-groww-green text-groww-dark hover:bg-groww-green-dark'
                : 'bg-groww-red text-white hover:bg-red-700'
            }`}>
            {loading ? 'Processing…' : `${mode} ${quantity} Share${quantity !== 1 ? 's' : ''} · ₹${total}`}
          </button>
        </div>
      </div>
    </div>
  );
}
