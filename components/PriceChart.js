import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

export default function PriceChart({ trades, lastPrice }) {
  const [chartData, setChartData] = useState([]);
  const [metrics, setMetrics] = useState({
    high: 0,
    low: 0,
    open: 0,
    gap: 0,
    volatility: 0,
    volume: 0,
  });

  useEffect(() => {
    if (trades && trades.length > 0) {
      const last30Trades = trades.slice(-30);
      const processedData = last30Trades.map((trade, index) => ({
        time: new Date(trade.timestamp).toLocaleTimeString("en-US", {
          hour12: false,
          minute: "2-digit",
          second: "2-digit",
        }),
        price: trade.price,
        volume: trade.quantity,
        timestamp: trade.timestamp,
      }));

      setChartData(processedData);

      // Calculate metrics
      const prices = processedData.map((d) => d.price);
      const volumes = processedData.map((d) => d.volume);

      if (prices.length > 0) {
        const high = Math.max(...prices);
        const low = Math.min(...prices);
        const open = prices[0];
        const close = lastPrice || prices[prices.length - 1];

        const gap = ((close - open) / open) * 100;

        // Simple volatility (standard deviation)
        const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
        const variance =
          prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
        const volatility = Math.sqrt(variance);
        const totalVolume = volumes.reduce((a, b) => a + b, 0);

        setMetrics({ high, low, open, gap, volatility, volume: totalVolume });
      }
    }
  }, [trades, lastPrice]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl">
          <p className="text-gray-300 text-sm">{`Time: ${label}`}</p>
          <p className="text-green-400 font-mono font-bold">
            {`Price: $${data.price.toFixed(2)}`}
          </p>
          <p className="text-blue-400 text-sm">
            {`Volume: ${data.volume.toFixed(4)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white">Live Price Chart</h2>
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400">Live</span>
        </div>
      </div>

      {/* Compact Metrics */}
      <div className="grid grid-cols-6 gap-2 mb-4">
        <div className="bg-gray-800 p-2 rounded text-center">
          <div className="text-gray-400 text-xs">HIGH</div>
          <div className="text-green-400 font-mono text-sm">
            ${metrics.high.toFixed(2)}
          </div>
        </div>
        <div className="bg-gray-800 p-2 rounded text-center">
          <div className="text-gray-400 text-xs">LOW</div>
          <div className="text-red-400 font-mono text-sm">
            ${metrics.low.toFixed(2)}
          </div>
        </div>
        <div className="bg-gray-800 p-2 rounded text-center">
          <div className="text-gray-400 text-xs">OPEN</div>
          <div className="text-white font-mono text-sm">
            ${metrics.open.toFixed(2)}
          </div>
        </div>
        <div className="bg-gray-800 p-2 rounded text-center">
          <div className="text-gray-400 text-xs">GAP</div>
          <div
            className={`font-mono text-sm ${
              metrics.gap >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {metrics.gap >= 0 ? "+" : ""}
            {metrics.gap.toFixed(1)}%
          </div>
        </div>
        <div className="bg-gray-800 p-2 rounded text-center">
          <div className="text-gray-400 text-xs">VOL</div>
          <div className="text-yellow-400 font-mono text-sm">
            {metrics.volatility.toFixed(1)}
          </div>
        </div>
        <div className="bg-gray-800 p-2 rounded text-center">
          <div className="text-gray-400 text-xs">SIZE</div>
          <div className="text-blue-400 font-mono text-sm">
            {metrics.volume.toFixed(0)}
          </div>
        </div>
      </div>

      {/* High-Quality Chart */}
      <div style={{ height: "200px" }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 10 }}
                width={50}
                domain={["dataMin - 0.5", "dataMax + 0.5"]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#00ff88"
                strokeWidth={2}
                fill="url(#priceGradient)"
                dot={{ fill: "#00ff88", strokeWidth: 0, r: 2 }}
                activeDot={{
                  r: 4,
                  stroke: "#00ff88",
                  strokeWidth: 2,
                  fill: "#fff",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-3xl mb-2">📈</div>
              <div className="text-sm">No price data available</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
