import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export default function SectorCard({ sector }) {
  const isGain = sector.dayChangePercent >= 0;

  return (
    <div className="card flex items-center justify-between p-4 group cursor-pointer hover:bg-groww-surface transition-colors duration-200">
      {sector.sectorLogo ? (
        <img src={sector.sectorLogo} alt={sector.sectorName}
          className="w-10 h-10 object-contain rounded-lg bg-white p-2 mr-2 shrink-0" />
      ) : (
        <div className="w-12 h-12 bg-groww-green/10 rounded-lg flex items-center justify-center shrink-0">
          <FiTrendingUp className="text-groww-green text-xl" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-groww-text truncate">{sector.sectorName}</p>
        <p className="text-xs text-groww-muted mt-0.5">
          {sector.totalStocks} stocks · {sector.positiveStocks}↑ {sector.negativeStocks}↓
        </p>
      </div>

      <div className={`flex items-center gap-1 font-semibold text-sm ${isGain ? 'text-gain' : 'text-loss'}`}>
        {isGain ? <FiTrendingUp /> : <FiTrendingDown />}
        {isGain ? '+' : ''}{Number(sector.dayChangePercent).toFixed(2)}%
      </div>
    </div>
  );
}
