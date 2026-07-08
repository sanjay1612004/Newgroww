import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStockDetails, getChart } from '../api/marketApi';
import { addToWatchlist } from '../api/watchlistApi';
import { getKycStatus } from '../api/kycApi';
import { useAuth } from '../context/AuthContext';
import StockChart from '../components/CandlestickChart';
import BuySellModal from '../components/BuySellModal';
import { FiBookmark, FiExternalLink, FiMapPin, FiUser, FiCalendar, FiArrowLeft, FiTrendingUp, FiGlobe } from 'react-icons/fi';

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-groww-border last:border-0">
      <span className="text-groww-muted mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-groww-muted">{label}</p>
        <p className="text-sm font-medium text-groww-text mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function StockDetail() {
  const { searchId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [stock, setStock] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [nseSymbol, setNseSymbol] = useState('');
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [addingWatch, setAddingWatch] = useState(false);
  const [checkingKyc, setCheckingKyc] = useState(false);
  const [toast, setToast] = useState('');

  // Fetch stock details
  useEffect(() => {
    setLoading(true);
    setError('');
    getStockDetails(searchId)
      .then((res) => {
        const canonicalId = res.data?.header?.searchId || res.data?.search_id;
        
        // If we loaded using a symbol (e.g. 'ltm') but the actual ID is 'larsen-toubro-infotech-ltd',
        // correct the URL in the browser so everything matches.
        if (canonicalId && canonicalId !== searchId) {
          navigate(`/stocks/${canonicalId}`, { replace: true });
          return;
        }

        setStock(res.data);
        const sym = res.data?.header?.nseScriptCode;
        if (sym) {
          setNseSymbol(sym);
          // Fetch initial chart
          fetchChartData(sym, '1M', 'line');
        }
      })
      .catch(() => setError('Failed to load stock details.'))
      .finally(() => setLoading(false));
  }, [searchId]);

  const fetchChartData = useCallback(async (sym, range, type) => {
    setChartLoading(true);
    try {
      const res = await getChart(sym, range, type);
      const d = res.data;
      // Backend returns Groww charting data with candles array
      const candles = d?.candles || d?.data || (Array.isArray(d) ? d : []);
      setChartData(candles);
    } catch {
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  }, []);

  const handleRangeChange = (range, type) => {
    if (nseSymbol) {
      fetchChartData(nseSymbol, range, type);
    }
  };

  const handleAddWatchlist = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    setAddingWatch(true);
    try {
      await addToWatchlist(searchId);
      setToast('Added to watchlist!');
    } catch (e) {
      setToast(e.response?.data?.message || 'Already in watchlist');
    } finally {
      setAddingWatch(false);
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleBuySellClick = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setCheckingKyc(true);
    try {
      const res = await getKycStatus();
      if (res.data?.data?.status === 'approved') {
        setShowModal(true);
      } else {
        setToast('Please complete your KYC to start trading.');
        setTimeout(() => {
          setToast('');
          navigate('/profile');
        }, 1500);
      }
    } catch (e) {
      if (e.response?.status === 404) {
        setToast('Please complete your KYC to start trading.');
        setTimeout(() => {
          setToast('');
          navigate('/profile');
        }, 1500);
      } else {
        setToast('Failed to verify KYC status.');
        setTimeout(() => setToast(''), 3000);
      }
    } finally {
      setCheckingKyc(false);
    }
  };

  const header = stock?.header || {};
  const details = stock?.details || {};
  const ltp = header.ltp || stock?.ltp;

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-12 space-y-4">
      {[1,2,3].map(i => <div key={i} className="animate-pulse bg-groww-border rounded-xl h-24" />)}
    </div>
  );

  if (error) return (
    <div className="max-w-5xl mx-auto px-4 pt-24 text-center py-20">
      <p className="text-groww-red mb-4">{error}</p>
      <button onClick={() => navigate(-1)} className="btn-outline text-sm">Go Back</button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-12 animate-fade-in">
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-groww-card border border-groww-border rounded-xl px-4 py-3 text-sm text-groww-green shadow-2xl animate-slide-up">
          {toast}
        </div>
      )}

      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-groww-muted hover:text-groww-text text-sm mb-6 transition-colors">
        <FiArrowLeft /> Back
      </button>

      {/* Header Card */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {header.logoUrl ? (
              <img src={header.logoUrl} alt="" className="w-14 h-14 rounded-xl object-contain bg-white p-1.5 shrink-0" />
            ) : (
              <div className="w-14 h-14 bg-groww-green/10 rounded-xl flex items-center justify-center shrink-0">
                <FiTrendingUp className="text-groww-green text-2xl" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-groww-text">{header.displayName || details.fullName || searchId}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {header.nseScriptCode && <span className="text-xs bg-groww-surface border border-groww-border px-2 py-0.5 rounded text-groww-muted font-mono">{header.nseScriptCode}</span>}
                {header.industryName && <span className="text-xs bg-groww-green/10 text-groww-green px-2 py-0.5 rounded-full">{header.industryName}</span>}
                {header.isFnoEnabled && <span className="text-xs bg-groww-yellow/10 text-groww-yellow px-2 py-0.5 rounded-full">F&O</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleAddWatchlist} disabled={addingWatch} className="btn-outline text-sm py-2 px-4 flex items-center gap-2">
              <FiBookmark size={14} /> {addingWatch ? '…' : 'Watchlist'}
            </button>
            <button onClick={handleBuySellClick} disabled={checkingKyc} className="btn-primary text-sm py-2 px-6">
              {checkingKyc ? 'Checking KYC…' : 'Buy / Sell'}
            </button>
          </div>
        </div>
        {ltp != null && (
          <div className="mt-5 pt-5 border-t border-groww-border">
            <p className="text-3xl font-extrabold text-groww-text">₹{Number(ltp).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-groww-muted mt-1">Last Traded Price · NSE</p>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="mb-6">
        {!nseSymbol ? (
          <div className="card h-[400px] flex flex-col items-center justify-center text-center p-6">
            <FiTrendingUp className="text-4xl text-groww-border mb-4" />
            <h3 className="text-lg font-bold text-groww-text mb-2">Chart Unavailable</h3>
            <p className="text-groww-muted text-sm max-w-sm">
              Live chart data is currently only supported for NSE-listed stocks. This stock trades exclusively on BSE.
            </p>
          </div>
        ) : (
          <>
            <StockChart
              data={chartData}
              symbol={nseSymbol}
              onRangeChange={handleRangeChange}
            />
            {chartLoading && (
              <div className="text-center text-groww-muted text-xs mt-2">Loading chart data…</div>
            )}
          </>
        )}
      </div>

      {/* Company Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-groww-text mb-3">Company Details</h2>
          <InfoRow icon={<FiUser size={14} />} label="CEO" value={details.ceo} />
          <InfoRow icon={<FiUser size={14} />} label="Managing Director" value={details.managingDirector} />
          <InfoRow icon={<FiMapPin size={14} />} label="Headquarters" value={details.headquarters} />
          <InfoRow icon={<FiCalendar size={14} />} label="Founded" value={details.foundedYear} />
          <InfoRow icon={<FiGlobe size={14} />} label="Parent Company" value={details.parentCompany} />
          {details.websiteUrl && (
            <a href={details.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-groww-green text-sm hover:underline mt-3">
              <FiExternalLink size={13} /> Visit Website
            </a>
          )}
        </div>
        <div className="card">
          <h2 className="font-semibold text-groww-text mb-3">About</h2>
          {details.businessSummary
            ? <p className="text-sm text-groww-muted leading-relaxed">{details.businessSummary}</p>
            : <p className="text-sm text-groww-muted italic">No business summary available.</p>
          }
          <div className="mt-4 pt-4 border-t border-groww-border grid grid-cols-2 gap-3">
            {header.floatingShares && <div><p className="text-xs text-groww-muted">Floating Shares</p><p className="text-sm font-semibold text-groww-text">{(header.floatingShares / 1e7).toFixed(2)} Cr</p></div>}
            {header.bseScriptCode && <div><p className="text-xs text-groww-muted">BSE Code</p><p className="text-sm font-semibold text-groww-text">{header.bseScriptCode}</p></div>}
            {header.isin && <div><p className="text-xs text-groww-muted">ISIN</p><p className="text-sm font-semibold text-groww-text font-mono">{header.isin}</p></div>}
            {header.nseTradingSymbol && <div><p className="text-xs text-groww-muted">NSE Symbol</p><p className="text-sm font-semibold text-groww-text">{header.nseTradingSymbol}</p></div>}
          </div>
        </div>
      </div>

      {/* Buy/Sell Modal */}
      {showModal && (
        <BuySellModal
          stock={{ ...header, searchId, ltp }}
          onClose={() => setShowModal(false)}
          onSuccess={(mode) => { setToast(`${mode} order placed!`); setTimeout(() => setToast(''), 3000); }}
        />
      )}
    </div>
  );
}
