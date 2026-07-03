import { useState, useEffect, useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { FiBarChart2 } from 'react-icons/fi';

const RANGES = ['1D', '1W', '1M', '3M', '6M', '1Y', '3Y', '5Y', 'ALL'];

export default function StockChart({ data = [], symbol, onRangeChange }) {
  const [range, setRange] = useState('1M');
  const [chartType, setChartType] = useState('line');

  const handleRangeChange = (r) => {
    setRange(r);
    onRangeChange?.(r, chartType);
  };

  const handleTypeChange = (type) => {
    setChartType(type);
    onRangeChange?.(range, type);
  };

  // Transform backend data to ApexCharts format
  const { series, categories } = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      // Try if data has candles property
      return { series: [], categories: [] };
    }

    if (chartType === 'candle') {
      const candles = data.map((point) => {
        if (Array.isArray(point)) {
          // [timestamp, open, high, low, close, volume]
          const ts = point[0];
          const x = ts > 1e11 ? ts : ts * 1000;
          return {
            x,
            y: [Number(point[1]), Number(point[2]), Number(point[3]), Number(point[4])]
          };
        }
        
        // object format
        const ts = point.t || point.timestamp || point.date;
        const x = typeof ts === 'number' && ts < 1e11 ? ts * 1000 : typeof ts === 'number' ? ts : new Date(ts).getTime();
        return {
          x,
          y: [
            Number(point.o ?? point.open ?? 0),
            Number(point.h ?? point.high ?? 0),
            Number(point.l ?? point.low ?? 0),
            Number(point.c ?? point.close ?? 0),
          ],
        };
      });
      return {
        series: [{ name: symbol, data: candles }],
        categories: [],
      };
    }

    // Line chart
    const points = data.map((point) => {
      if (Array.isArray(point)) {
        // [timestamp, close] or [timestamp, open, high, low, close]
        const ts = point[0];
        const x = ts > 1e11 ? ts : ts * 1000;
        const y = Number(point.length === 2 ? point[1] : point[4]);
        return { x, y };
      }
      
      const ts = point.t || point.timestamp || point.date;
      const x = typeof ts === 'number' && ts < 1e11 ? ts * 1000 : typeof ts === 'number' ? ts : new Date(ts).getTime();
      const y = Number(point.ltp ?? point.c ?? point.close ?? point.y ?? 0);
      return { x, y };
    });

    return {
      series: [{ name: symbol, data: points }],
      categories: [],
    };
  }, [data, chartType, symbol]);

  if (!data || data.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center h-64 text-groww-muted gap-3">
        <FiBarChart2 className="text-4xl text-groww-border" />
        <p className="text-sm">No chart data available</p>
      </div>
    );
  }

  const candleOptions = {
    chart: {
      type: 'candlestick',
      height: 350,
      background: 'transparent',
      toolbar: { show: true, tools: { download: false, selection: true, zoom: true, zoomin: true, zoomout: true, pan: true, reset: true } },
      animations: { enabled: true, speed: 500 },
    },
    theme: { mode: 'dark' },
    grid: { borderColor: '#242b3d', strokeDashArray: 3 },
    xaxis: {
      type: 'datetime',
      labels: { style: { colors: '#8a9bb0', fontSize: '10px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: '#8a9bb0', fontSize: '10px' },
        formatter: (v) => `₹${Number(v).toFixed(0)}`,
      },
      tooltip: { enabled: true },
    },
    plotOptions: {
      candlestick: {
        colors: { upward: '#00d09c', downward: '#eb5757' },
        wick: { useFillColor: true },
      },
    },
    tooltip: {
      theme: 'dark',
      style: { fontSize: '12px' },
      custom: ({ seriesIndex, dataPointIndex, w }) => {
        const o = w.globals.seriesCandleO[seriesIndex]?.[dataPointIndex];
        const h = w.globals.seriesCandleH[seriesIndex]?.[dataPointIndex];
        const l = w.globals.seriesCandleL[seriesIndex]?.[dataPointIndex];
        const c = w.globals.seriesCandleC[seriesIndex]?.[dataPointIndex];
        return `
          <div style="background:#161b27;border:1px solid #242b3d;border-radius:8px;padding:10px;font-size:12px;">
            <div style="color:#8a9bb0;margin-bottom:4px;">OHLC</div>
            <div style="color:#fff;">O: <b>₹${o?.toFixed(2)}</b></div>
            <div style="color:#00d09c;">H: <b>₹${h?.toFixed(2)}</b></div>
            <div style="color:#eb5757;">L: <b>₹${l?.toFixed(2)}</b></div>
            <div style="color:#fff;">C: <b>₹${c?.toFixed(2)}</b></div>
          </div>`;
      },
    },
  };

  const lineOptions = {
    chart: {
      type: 'area',
      height: 350,
      background: 'transparent',
      toolbar: { show: true, tools: { download: false, selection: true, zoom: true, zoomin: true, zoomout: true, pan: true, reset: true } },
      animations: { enabled: true, speed: 500 },
    },
    theme: { mode: 'dark' },
    grid: { borderColor: '#242b3d', strokeDashArray: 3 },
    xaxis: {
      type: 'datetime',
      labels: { style: { colors: '#8a9bb0', fontSize: '10px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: '#8a9bb0', fontSize: '10px' },
        formatter: (v) => `₹${Number(v).toFixed(0)}`,
      },
    },
    stroke: { curve: 'smooth', width: 2, colors: ['#00d09c'] },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.05,
        stops: [0, 100],
        colorStops: [
          { offset: 0, color: '#00d09c', opacity: 0.3 },
          { offset: 100, color: '#00d09c', opacity: 0.02 },
        ],
      },
    },
    tooltip: {
      theme: 'dark',
      x: { format: 'dd MMM yyyy HH:mm' },
      y: { formatter: (v) => `₹${Number(v).toFixed(2)}` },
    },
    colors: ['#00d09c'],
    dataLabels: { enabled: false },
  };

  const options = chartType === 'candle' ? candleOptions : lineOptions;
  const type = chartType === 'candle' ? 'candlestick' : 'area';

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="font-semibold text-groww-text text-sm">{symbol} Price Chart</h3>
        <div className="flex items-center gap-3">
          {/* Chart type toggle */}
          <div className="flex bg-groww-surface rounded-lg p-0.5 gap-0.5">
            {[
              { key: 'line', label: 'Line' },
              { key: 'candle', label: 'Candle' },
            ].map((t) => (
              <button key={t.key} onClick={() => handleTypeChange(t.key)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  chartType === t.key
                    ? 'bg-groww-green text-groww-dark'
                    : 'text-groww-muted hover:text-groww-text'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Range buttons */}
          <div className="flex gap-0.5 bg-groww-surface rounded-lg p-0.5">
            {RANGES.map((r) => (
              <button key={r} onClick={() => handleRangeChange(r)}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                  range === r
                    ? 'bg-groww-green text-groww-dark'
                    : 'text-groww-muted hover:text-groww-text'
                }`}>
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {series.length > 0 && series[0].data?.length > 0 ? (
        <ReactApexChart options={options} series={series} type={type} height={350} />
      ) : (
        <div className="flex items-center justify-center h-64 text-groww-muted text-sm">
          <FiBarChart2 className="mr-2" /> No data for this range
        </div>
      )}
    </div>
  );
}
