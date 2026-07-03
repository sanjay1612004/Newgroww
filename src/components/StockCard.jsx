import { useNavigate } from 'react-router-dom';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export default function StockCard({ stock, variant = 'default' }) {
  const navigate = useNavigate();

  const isMostBought = variant === 'mostbought' && stock.company;
  const comp = isMostBought ? stock.company : stock;
  
  const name = comp.title || comp.companyName || comp.companyShortName || comp.company_short_name || 'Unknown';
  const symbol = comp.nseScriptCode || comp.nse_scrip_code || comp.bseScriptCode || comp.bse_scrip_code || comp.symbol || '';
  const logo = comp.logoUrl || comp.imageUrl || null;
  const searchId = comp.searchId || comp.search_id || symbol.toLowerCase();

  // Price data
  let ltp, change, changePct, isGain;
  if (variant === 'mostbought') {
    ltp = stock.stats?.ltp;
    change = stock.stats?.dayChange;
    changePct = stock.stats?.dayChangePerc;
  } else {
    ltp = stock.ltp;
    const close = stock.close;
    change = ltp != null && close != null ? ltp - close : null;
    changePct = stock.dayChangePerc ?? (change != null && close ? (change / close) * 100 : null);
  }
  isGain = change != null ? change >= 0 : (changePct != null ? changePct >= 0 : true);

  const goToDetail = () => {
    if (searchId) navigate(`/stocks/${searchId}`);
  };

  return (
    <button onClick={goToDetail}
      className="card w-full text-left group cursor-pointer hover:bg-groww-surface transition-colors duration-200">
      <div className="flex items-center gap-3 mb-3">
        {logo ? (
          <img src={logo} alt={name} className="w-10 h-10 rounded-full object-contain bg-white p-1 shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-groww-green/20 flex items-center justify-center shrink-0">
            <span className="text-groww-green font-bold text-sm">{name[0]}</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-groww-text truncate group-hover:text-groww-green transition-colors">{name}</p>
          <p className="text-xs text-groww-muted">{symbol}</p>
        </div>
      </div>

      <div className="flex items-end justify-between mt-2">
        <div>
          {ltp != null ? (
            <p className="text-lg font-bold text-groww-text">
              ₹{Number(ltp).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          ) : (
            <p className="text-sm font-medium text-groww-green group-hover:underline">View Details</p>
          )}
          {changePct != null && (
            <div className={`flex items-center gap-1 text-xs font-medium ${isGain ? 'text-gain' : 'text-loss'}`}>
              {isGain ? <FiTrendingUp /> : <FiTrendingDown />}
              {changePct > 0 ? '+' : ''}{Number(changePct).toFixed(2)}%
            </div>
          )}
        </div>
        {change != null && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isGain ? 'bg-groww-green/10 text-groww-green' : 'bg-groww-red/10 text-groww-red'}`}>
            {(change > 0 ? '+' : '') + Number(change).toFixed(2)}
          </span>
        )}
      </div>
    </button>
  );
}
