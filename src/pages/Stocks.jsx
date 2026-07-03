import { useState, useEffect, useCallback } from 'react';
import { searchStocks, getMostBought } from '../api/marketApi';
import StockCard from '../components/StockCard';
import { FiSearch, FiLoader } from 'react-icons/fi';

function extractSearchResults(data) {
  let results = [];
  if (Array.isArray(data)) results = data;
  else if (data?.content && Array.isArray(data.content)) results = data.content;
  else if (data?.data?.content && Array.isArray(data.data.content)) results = data.data.content;
  else if (data?.results) results = data.results;
  else if (data?.data && Array.isArray(data.data)) results = data.data;

  return results.filter(item => {
    if (item.entity_type) {
      return item.entity_type === 'Stocks' || item.entity_type === 'STOCK';
    }
    return true;
  });
}

export default function Stocks() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(false);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [debounce, setDebounce] = useState(null);

  useEffect(() => {
    getMostBought()
      .then((res) => {
        const d = res.data;
        let stocks = [];
        if (d?.exploreCompanies?.POPULAR_STOCKS_MOST_BOUGHT) {
          stocks = d.exploreCompanies.POPULAR_STOCKS_MOST_BOUGHT;
        } else if (d?.data && Array.isArray(d.data)) {
          stocks = d.data;
        } else if (Array.isArray(d)) {
          stocks = d;
        }
        setFeatured(stocks);
      })
      .catch(() => {})
      .finally(() => setFeaturedLoading(false));
  }, []);

  const doSearch = useCallback((q) => {
    clearTimeout(debounce);
    if (!q.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchStocks(q);
        const stocks = extractSearchResults(res.data);
        setResults(stocks);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 400);
    setDebounce(t);
  }, [debounce]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    doSearch(val);
  };

  const showingSearch = query.trim().length > 0;
  const displayStocks = showingSearch ? results : featured;

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12 animate-fade-in">
      <h1 className="text-3xl font-extrabold text-groww-text mb-2">
        Explore <span className="text-groww-green">Stocks</span>
      </h1>
      <p className="text-groww-muted text-sm mb-8">Search and discover stocks on NSE/BSE</p>

      {/* Search Bar */}
      <div className="relative max-w-xl mb-10">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-groww-muted text-lg" />
        <input id="stocks-search" type="text" placeholder="Search by company name or symbol…"
          value={query} onChange={handleChange}
          className="w-full bg-groww-card border border-groww-border rounded-xl pl-11 pr-4 py-4 text-groww-text placeholder-groww-muted focus:outline-none focus:border-groww-green transition-colors text-sm shadow-lg" />
        {loading && <FiLoader className="absolute right-4 top-1/2 -translate-y-1/2 text-groww-green animate-spin" />}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">
            {showingSearch ? `Results for "${query}" (${results.length})` : 'Most Bought Stocks'}
          </h2>
        </div>

        {(showingSearch ? false : featuredLoading) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-groww-border rounded-xl h-28" />)}
          </div>
        ) : displayStocks.length === 0 ? (
          <div className="card text-center py-20">
            <FiSearch className="text-4xl text-groww-border mx-auto mb-3" />
            <p className="text-groww-muted text-sm">
              {showingSearch ? 'No stocks found. Try a different search.' : 'No stocks available.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayStocks.map((s, i) => (
              <StockCard key={i} stock={s} variant={!showingSearch ? 'mostbought' : 'default'} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
