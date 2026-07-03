import {
  ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';

const COLORS = ['#00d09c', '#4f8ef7', '#f5a623', '#eb5757', '#a855f7', '#06b6d4', '#f97316'];

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const PnLTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  const pnl = d?.pnl || 0;
  return (
    <div className="bg-groww-card border border-groww-border rounded-lg p-3 text-xs shadow-xl">
      <p className="font-semibold text-groww-text mb-1">{d?.companyName || d?.symbol}</p>
      <p className="text-groww-muted">Invested: <span className="text-groww-text font-medium">₹{d?.investedValue?.toFixed(2)}</span></p>
      <p className="text-groww-muted">Current: <span className="text-groww-text font-medium">₹{d?.currentValue?.toFixed(2)}</span></p>
      <p className={pnl >= 0 ? 'text-gain' : 'text-loss'}>P&L: {pnl >= 0 ? '+' : ''}₹{pnl?.toFixed(2)}</p>
    </div>
  );
};

export default function PortfolioAnalyticsChart({ holdings = [] }) {
  if (!holdings.length) {
    return (
      <div className="card text-center py-12 text-groww-muted text-sm">
        No holdings data available
      </div>
    );
  }

  const pieData = holdings.map((h) => ({
    name: h.symbol || h.companyName,
    value: h.investedValue || h.currentValue || 0,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Allocation Pie */}
      <div className="card">
        <h3 className="font-semibold text-groww-text mb-4 text-sm">Portfolio Allocation</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
              dataKey="value" labelLine={false} label={<CustomLabel />}>
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => [`₹${Number(v).toFixed(2)}`, 'Invested']} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          {pieData.map((d, i) => (
            <span key={i} className="flex items-center gap-1 text-xs text-groww-muted">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: COLORS[i % COLORS.length] }} />
              {d.name}
            </span>
          ))}
        </div>
      </div>

      {/* P&L Bar */}
      <div className="card">
        <h3 className="font-semibold text-groww-text mb-4 text-sm">Holding-wise P&L</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={holdings} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#242b3d" vertical={false} />
            <XAxis dataKey="symbol" tick={{ fontSize: 10, fill: '#8a9bb0' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#8a9bb0' }} tickLine={false} axisLine={false}
              tickFormatter={(v) => `₹${v}`} width={60} />
            <Tooltip content={<PnLTooltip />} />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
              {holdings.map((h, i) => (
                <Cell key={i} fill={(h.pnl || 0) >= 0 ? '#00d09c' : '#eb5757'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
