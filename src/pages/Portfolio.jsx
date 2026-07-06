import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHoldings, getHistory, getSummary, getAnalytics, addMoney } from '../api/portfolioApi';
import PortfolioAnalyticsChart from '../components/PortfolioAnalyticsChart';
import BuySellModal from '../components/BuySellModal';
import { FiBriefcase, FiTrendingUp, FiTrendingDown, FiPlus, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { subscribePrices } from '../api/socket';

const tabs = ['Overview', 'Holdings', 'History'];

function StatCard({ label, value, sub, color = 'text-groww-text' }) {
  return (
    <div className="card">
      <p className="text-xs text-groww-muted mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-groww-muted mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Portfolio() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Overview');
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sellStock, setSellStock] = useState(null);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [toast, setToast] = useState('');

  const reload = () => {
    setLoading(true);
    Promise.allSettled([getSummary(), getAnalytics(), getHoldings(), getHistory()])
      .then(([s, a, h, hi]) => {
        if (s.status === 'fulfilled') setSummary(s.value.data?.data);
        if (a.status === 'fulfilled') setAnalytics(a.value.data?.data);
        if (h.status === 'fulfilled') {
          const d = h.value.data?.data;
          setHoldings(Array.isArray(d) ? d : []);
        }
        if (hi.status === 'fulfilled') {
          const d = hi.value.data?.data;
          setHistory(Array.isArray(d) ? d : []);
        }
      })
      .finally(() => setLoading(false));
  };

  const unsubRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    reload();
  }, [isLoggedIn]);

  // Subscribe to live prices for holdings
  useEffect(() => {
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }

    const allHoldings = analytics?.holdings || holdings;
    const symbols = allHoldings
      .map((h) => h.symbol)
      .filter(Boolean);

    if (symbols.length === 0) return;

    const handlePriceUpdate = ({ symbol, price }) => {
      setHoldings((prev) =>
        prev.map((h) =>
          h.symbol === symbol
            ? {
                ...h,
                currentPrice: price,
                pnl: (price - (h.avgPrice || 0)) * (h.quantity || 0),
                returnPercent: h.avgPrice ? (((price - h.avgPrice) / h.avgPrice) * 100) : 0,
              }
            : h
        )
      );
    };

    unsubRef.current = subscribePrices(symbols, handlePriceUpdate);

    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [holdings.length, analytics]);

  const handleAddMoney = async (e) => {
    e.preventDefault();
    if (!addAmount || Number(addAmount) <= 0) return;
    try {
      await addMoney(Number(addAmount));
      setToast(`₹${addAmount} added to wallet!`);
      setTimeout(() => setToast(''), 3000);
      setShowAddMoney(false);
      setAddAmount('');
      reload();
    } catch (err) {
      setToast('Failed to add money.');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const fmt = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—';

  // Backend summary returns { summary: { cashBalance, totalInvested, totalProfitLoss, holdingsCount } }
  const sum = summary?.summary || summary || {};
  const anal = analytics?.analytics || {};
  const pnl = anal.unrealizedPnL ?? sum.totalProfitLoss ?? 0;
  const pnlPct = anal.returnPercentage;

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-12 space-y-4">
      {[1,2,3].map(i => <div key={i} className="animate-pulse bg-groww-border rounded-xl h-24" />)}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-12 animate-fade-in">
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-groww-card border border-groww-border rounded-xl px-4 py-3 text-sm text-groww-green shadow-2xl animate-slide-up">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <FiBriefcase className="text-groww-green text-2xl" />
          <div>
            <h1 className="text-2xl font-extrabold text-groww-text">My Portfolio</h1>
            <p className="text-groww-muted text-sm">{holdings.length} holdings</p>
          </div>
        </div>
        <button onClick={() => setShowAddMoney(true)} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
          <FiPlus /> Add Money
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Cash Balance" value={fmt(anal.cashBalance ?? sum.cashBalance)} />
        <StatCard label="Invested Value" value={fmt(anal.investedValue ?? sum.totalInvested)} />
        <StatCard
          label="Unrealized P&L"
          value={pnl != null ? `${pnl >= 0 ? '+' : ''}${fmt(pnl)}` : '—'}
          sub={pnlPct != null ? `${pnlPct >= 0 ? '+' : ''}${Number(pnlPct).toFixed(2)}%` : ''}
          color={pnl >= 0 ? 'text-groww-green' : 'text-groww-red'}
        />
        <StatCard label="Total Account Value" value={fmt(anal.totalAccountValue)} />
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-groww-border mb-6">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-3 text-sm font-semibold transition-colors ${tab === t ? 'tab-active' : 'tab-inactive'}`}>{t}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'Overview' && (
        <div className="space-y-6">
          {analytics?.topWinner && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card border-l-4 border-l-groww-green">
                <p className="text-xs text-groww-muted mb-1 flex items-center gap-1"><FiTrendingUp /> Top Winner</p>
                <p className="font-bold text-groww-text">{analytics.topWinner.companyName}</p>
                <p className="text-groww-green font-semibold text-sm">+{fmt(analytics.topWinner.pnl)} ({analytics.topWinner.returnPercent}%)</p>
              </div>
              {analytics?.topLoser && (
                <div className="card border-l-4 border-l-groww-red">
                  <p className="text-xs text-groww-muted mb-1 flex items-center gap-1"><FiTrendingDown /> Top Loser</p>
                  <p className="font-bold text-groww-text">{analytics.topLoser.companyName}</p>
                  <p className="text-groww-red font-semibold text-sm">{fmt(analytics.topLoser.pnl)} ({analytics.topLoser.returnPercent}%)</p>
                </div>
              )}
            </div>
          )}
          <PortfolioAnalyticsChart holdings={analytics?.holdings || []} />
        </div>
      )}

      {/* Holdings Tab */}
      {tab === 'Holdings' && (
        <div>
          {holdings.length === 0 ? (
            <div className="card text-center py-16 text-groww-muted">
              No holdings yet. Start investing!
              <br />
              <button onClick={() => navigate('/stocks')} className="btn-primary mt-4 text-sm">Browse Stocks</button>
            </div>
          ) : (
            <div className="bg-groww-card border border-groww-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-groww-border">
                    {['Stock', 'Qty', 'Avg Price', 'Current', 'P&L', ''].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs text-groww-muted font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(analytics?.holdings || holdings).map((h, i) => {
                    const hp = h.pnl ?? 0;
                    const isGain = hp >= 0;
                    return (
                      <tr key={i} className="border-b border-groww-border hover:bg-groww-card-hover transition-colors cursor-pointer"
                        onClick={() => navigate(`/stocks/${h.searchId || h.symbol?.toLowerCase()}`)}>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-groww-text">{h.companyName}</p>
                          <p className="text-xs text-groww-muted">{h.symbol}</p>
                        </td>
                        <td className="px-5 py-4 text-groww-text">{h.quantity}</td>
                        <td className="px-5 py-4 text-groww-text">{fmt(h.avgPrice)}</td>
                        <td className="px-5 py-4 text-groww-text">{h.currentPrice ? fmt(h.currentPrice) : '—'}</td>
                        <td className={`px-5 py-4 font-semibold ${isGain ? 'text-groww-green' : 'text-groww-red'}`}>
                          {isGain ? '+' : ''}{fmt(hp)}
                          {h.returnPercent != null && <span className="block text-xs font-normal">{isGain ? '+' : ''}{Number(h.returnPercent).toFixed(2)}%</span>}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSellStock(h); }}
                            className="text-xs bg-groww-red/10 text-groww-red border border-groww-red/20 px-3 py-1 rounded-lg hover:bg-groww-red hover:text-white transition-all font-medium">
                            Sell
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {tab === 'History' && (
        <div>
          {history.length === 0 ? (
            <div className="card text-center py-16 text-groww-muted">No transaction history yet.</div>
          ) : (
            <div className="bg-groww-card border border-groww-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-groww-border">
                    {['Stock', 'Type', 'Qty', 'Price', 'Amount', 'Date'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs text-groww-muted font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((tx, i) => (
                    <tr key={i} className="border-b border-groww-border hover:bg-groww-card-hover transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-groww-text">{tx.companyName || tx.symbol}</p>
                        <p className="text-xs text-groww-muted">{tx.symbol}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tx.type === 'BUY' ? 'bg-groww-green/10 text-groww-green' : 'bg-groww-red/10 text-groww-red'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-groww-text">{tx.quantity}</td>
                      <td className="px-5 py-4 text-groww-text">{fmt(tx.price)}</td>
                      <td className="px-5 py-4 font-semibold text-groww-text">{fmt(tx.amount)}</td>
                      <td className="px-5 py-4 text-groww-muted text-xs">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {sellStock && (
        <BuySellModal
          stock={{ ...sellStock, nseScriptCode: sellStock.symbol, displayName: sellStock.companyName, ltp: sellStock.currentPrice || sellStock.avgPrice }}
          onClose={() => setSellStock(null)}
          onSuccess={() => {
            setToast('Sell order placed!');
            setTimeout(() => setToast(''), 3000);
            setSellStock(null);
            reload();
          }}
        />
      )}

      {/* Add Money Modal */}
      {showAddMoney && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-groww-card border border-groww-border rounded-2xl w-full max-w-sm shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-groww-border">
              <h2 className="font-bold text-groww-text text-lg">Add Money to Wallet</h2>
              <button onClick={() => setShowAddMoney(false)} className="text-groww-muted hover:text-groww-text transition-colors p-1">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleAddMoney} className="p-5 space-y-4">
              <div>
                <label className="text-xs text-groww-muted mb-1.5 block font-medium">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Enter amount"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="input-field font-bold text-lg"
                />
              </div>
              <div className="flex gap-2">
                {[100, 500, 1000, 5000].map(amt => (
                  <button key={amt} type="button" onClick={() => setAddAmount(amt.toString())}
                    className="flex-1 bg-groww-surface border border-groww-border rounded-lg py-1.5 text-xs text-groww-text hover:border-groww-green/50 transition-colors">
                    +₹{amt}
                  </button>
                ))}
              </div>
              <button type="submit" className="btn-primary w-full py-3.5 mt-2 rounded-xl font-bold text-sm">
                Add ₹{addAmount || 0}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
