import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../api/authApi';
import { searchStocks } from '../api/marketApi';
import { FiSearch, FiX, FiTrendingUp, FiBookmark, FiBriefcase, FiUser, FiLogOut, FiShield } from 'react-icons/fi';

function extractSearchResults(data) {
  let results = [];
  if (Array.isArray(data)) results = data;
  else if (data?.content && Array.isArray(data.content)) results = data.content;
  else if (data?.data?.content && Array.isArray(data.data.content)) results = data.data.content;
  else if (data?.results) results = data.results;
  else if (data?.data && Array.isArray(data.data)) results = data.data;
  
  return results.filter(item => {
    // Some APIs might not return entity_type, so we allow them by default,
    // but if it is present, we only want Stocks.
    if (item.entity_type) {
      return item.entity_type === 'Stocks' || item.entity_type === 'STOCK';
    }
    return true;
  });
}

export default function Navbar() {
  const { isLoggedIn, user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowDropdown(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setResults([]); setShowDropdown(false); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchStocks(val);
        const stocks = extractSearchResults(res.data);
        setResults(stocks.slice(0, 8));
        setShowDropdown(true);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 350);
  };

  const handleLogout = async () => {
    try { await logout(); } catch {}
    logoutUser();
    navigate('/login');
  };

  const goToStock = (stock) => {
    const id = stock.searchId || stock.search_id || stock.nseScriptCode?.toLowerCase();
    if (id) navigate(`/stocks/${id}`);
    setShowDropdown(false);
    setQuery('');
  };

  // User display name from context
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const initial = displayName[0]?.toUpperCase() || 'U';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-groww-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8  rounded-lg flex items-center justify-center">
            <img src="https://groww.in/groww-logo-270.png" alt="" />
          </div>
          <span className="text-xl font-extrabold text-groww-text tracking-tight">groww</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-xl relative" ref={searchRef}>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-groww-muted" />
            <input type="text" placeholder="Search stocks, e.g. Infosys, INFY…"
              value={query} onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => results.length > 0 && setShowDropdown(true)}
              className="w-full bg-groww-surface border border-groww-border rounded-full pl-10 pr-10 py-2.5 text-sm text-groww-text placeholder-groww-muted focus:outline-none focus:border-groww-green transition-colors duration-200" />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]); setShowDropdown(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-groww-muted hover:text-groww-text">
                <FiX />
              </button>
            )}
          </div>

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-groww-card border border-groww-border rounded-xl shadow-2xl overflow-hidden animate-fade-in z-50">
              {searching ? (
                <div className="p-4 text-center text-groww-muted text-sm">Searching…</div>
              ) : results.length === 0 ? (
                <div className="p-4 text-center text-groww-muted text-sm">No results found</div>
              ) : (
                results.map((stock, i) => (
                  <button key={i} onClick={() => goToStock(stock)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-groww-card-hover transition-colors text-left border-b border-groww-border last:border-0">
                    {stock.logoUrl || stock.imageUrl ? (
                      <img src={stock.logoUrl || stock.imageUrl} alt="" className="w-8 h-8 rounded-full object-contain bg-white p-1" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-groww-green/20 flex items-center justify-center text-groww-green text-xs font-bold">
                        {(stock.title || stock.companyName || stock.companyShortName || stock.company_short_name || '?')[0]}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-groww-text">{stock.title || stock.companyName || stock.companyShortName || stock.company_short_name}</p>
                      <p className="text-xs text-groww-muted">{stock.nseScriptCode || stock.nse_scrip_code || stock.bseScriptCode || stock.bse_scrip_code || stock.entity_type}</p>
                    </div>
                    {stock.ltp != null && (
                      <span className="ml-auto text-sm font-semibold text-groww-text">
                        ₹{Number(stock.ltp).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-groww-muted hover:text-groww-text hover:bg-groww-surface text-sm font-medium transition-colors">
            <FiTrendingUp /> Market
          </Link>
          <Link to="/stocks" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-groww-muted hover:text-groww-text hover:bg-groww-surface text-sm font-medium transition-colors">
            Stocks
          </Link>
          {isLoggedIn && (
            <>
              <Link to="/portfolio" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-groww-muted hover:text-groww-text hover:bg-groww-surface text-sm font-medium transition-colors">
                <FiBriefcase /> Portfolio
              </Link>
              <Link to="/watchlist" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-groww-muted hover:text-groww-text hover:bg-groww-surface text-sm font-medium transition-colors">
                <FiBookmark /> Watchlist
              </Link>
            </>
          )}
        </div>

        {/* Auth */}
        <div className="ml-auto flex items-center gap-3">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="text-sm text-groww-muted hover:text-groww-text transition-colors font-medium px-3 py-2">Login</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
            </>
          ) : (
            <div className="relative" ref={userMenuRef}>
              <button onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 bg-groww-surface border border-groww-border rounded-full px-3 py-2 hover:border-groww-green/50 transition-colors">
                <div className="w-7 h-7 bg-groww-green rounded-full flex items-center justify-center text-groww-dark font-bold text-sm">
                  {initial}
                </div>
                <span className="text-sm text-groww-text font-medium hidden md:block">{displayName.split(' ')[0]}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-groww-card border border-groww-border rounded-xl shadow-2xl overflow-hidden animate-fade-in">
                  <div className="px-4 py-3 border-b border-groww-border">
                    <p className="text-sm font-semibold text-groww-text">{displayName}</p>
                    <p className="text-xs text-groww-muted truncate">{user?.email || ''}</p>
                  </div>
                  <Link to="/profile" onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-groww-muted hover:text-groww-text hover:bg-groww-surface transition-colors">
                    <FiUser /> Profile & KYC
                  </Link>
                  <Link to="/admin" onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-groww-muted hover:text-groww-text hover:bg-groww-surface transition-colors">
                    <FiShield /> Admin Panel
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-groww-red hover:bg-groww-surface transition-colors border-t border-groww-border">
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
