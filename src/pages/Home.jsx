import { useState, useEffect } from 'react';
import { getMostBought, getTopGainers, getTopLosers, getTrendingSectors, getNews } from '../api/marketApi';
import StockCard from '../components/StockCard';
import SectorCard from '../components/SectorCard';
import NewsCard from '../components/NewsCard';
import { FiTrendingUp, FiTrendingDown, FiStar, FiRefreshCw } from 'react-icons/fi';

const tabs = [
  { key: 'gainers', label: 'Top Gainers', icon: <FiTrendingUp /> },
  { key: 'losers',  label: 'Top Losers',  icon: <FiTrendingDown /> },
  { key: 'bought',  label: 'Most Bought', icon: <FiStar /> },
];

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-groww-border rounded-xl ${className}`} />;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('gainers');
  const [data, setData] = useState({ gainers: [], losers: [], bought: [], sectors: [], news: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [g, l, b, s, n] = await Promise.allSettled([
        getTopGainers(), getTopLosers(), getMostBought(), getTrendingSectors(), getNews()
      ]);

      const extract = (res, paths) => {
        if (res.status !== 'fulfilled') return [];
        const d = res.value.data;
        
        for (const path of paths) {
          const val = path.reduce((acc, k) => acc?.[k], d);
          if (Array.isArray(val) && val.length > 0) return val;
        }
        
        // fallback if none matched but there's a direct array
        if (Array.isArray(d)) return d;
        if (Array.isArray(d?.data)) return d.data;
        return [];
      };

      setData({
        gainers: extract(g, [['data', 'stocks'], ['stocks']]),
        losers:  extract(l, [['data', 'stocks'], ['stocks']]),
        bought:  extract(b, [['exploreCompanies', 'POPULAR_STOCKS_MOST_BOUGHT'], ['data']]),
        sectors: extract(s, [['data', 'sectors'], ['sectors']]),
        news:    extract(n, [['feed'], ['data']]),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const currentStocks = data[activeTab === 'gainers' ? 'gainers' : activeTab === 'losers' ? 'losers' : 'bought'];

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12 animate-fade-in">

      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-3xl font-extrabold text-groww-text">
            Markets <span className="text-groww-green">Overview</span>
          </h1>
          <button onClick={() => fetchAll(true)} disabled={refreshing}
            className="flex items-center gap-2 text-sm text-groww-muted hover:text-groww-green transition-colors">
            <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        <p className="text-groww-muted text-sm">Live market data · NSE/BSE</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left: Stocks Panel */}
        <div className="xl:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex gap-1 bg-groww-surface p-1 rounded-xl w-fit">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === t.key
                    ? 'bg-groww-green text-groww-dark shadow-sm'
                    : 'text-groww-muted hover:text-groww-text'
                }`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Stock Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />)}
            </div>
          ) : currentStocks.length === 0 ? (
            <div className="card text-center py-16 text-groww-muted">No data available</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentStocks.slice(0, 10).map((s, i) => (
                <StockCard key={i} stock={s} variant={activeTab === 'bought' ? 'mostbought' : 'default'} />
              ))}
            </div>
          )}

          {/* Trending Sectors */}
          <div>
            <h2 className="section-title mt-4">Trending Sectors</h2>
            {loading ? (
              <div className="space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
            ) : data.sectors.length === 0 ? (
              <div className="card text-center py-8 text-groww-muted text-sm">No sector data</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.sectors.slice(0, 8).map((s, i) => <SectorCard key={i} sector={s} />)}
              </div>
            )}
          </div>
        </div>

        {/* Right: News */}
        <div className="xl:col-span-1">
          <h2 className="section-title">Market News</h2>
          {loading ? (
            <div className="space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
          ) : data.news.length === 0 ? (
            <div className="card text-center py-8 text-groww-muted text-sm">No news available</div>
          ) : (
            <div className="space-y-3 max-h-[900px] overflow-y-auto pr-1">
              {data.news.map((n, i) => <NewsCard key={i} item={n} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
