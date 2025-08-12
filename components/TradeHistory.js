import { useState } from "react";

export default function TradeHistory({ trades = [], onClearData }) {
  const [showConfirm, setShowConfirm] = useState(null);
  const displayTrades = trades.slice(0, 15);

  const handleClearTrade = async (tradeIndex) => {
    try {
      await onClearData("clearTrade", { tradeIndex });
      setShowConfirm(null);
    } catch (error) {
      console.error("Failed to clear trade:", error);
    }
  };

  const handleClearAllTrades = async () => {
    try {
      await onClearData("clearAllTrades");
      setShowConfirm(null);
    } catch (error) {
      console.error("Failed to clear all trades:", error);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Recent Trades</h2>

          {/* Clear Actions */}
          <div className="flex space-x-2">
            <button
              onClick={() => setShowConfirm("clearAllTrades")}
              disabled={trades.length === 0}
              className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs rounded border border-red-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      <div className="p-3">
        <div className="grid grid-cols-5 gap-2 text-xs font-medium text-gray-400 mb-2 pb-2 border-b border-gray-700">
          <span>TIME</span>
          <span>SIDE</span>
          <span>PRICE</span>
          <span>SIZE</span>
          <span>ACTION</span>
        </div>

        <div className="space-y-1 max-h-60 overflow-y-auto">
          {displayTrades.map((trade, index) => (
            <div
              key={index}
              className="grid grid-cols-5 gap-2 text-xs py-1.5 px-2 hover:bg-gray-800/50 rounded group"
            >
              <span className="text-gray-400 font-mono">
                {new Date(trade.timestamp).toLocaleTimeString("en-US", {
                  hour12: false,
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
              <span
                className={`font-bold ${
                  trade.side === "buy" ? "text-green-400" : "text-red-400"
                }`}
              >
                {trade.side === "buy" ? "🟢" : "🔴"}
              </span>
              <span className="text-white font-mono">
                ${trade.price.toFixed(2)}
              </span>
              <span className="text-gray-300 font-mono">
                {trade.quantity.toFixed(4)}
              </span>
              <span>
                <button
                  onClick={() => handleClearTrade(trades.length - 1 - index)}
                  className="opacity-0 group-hover:opacity-100 px-2 py-0.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs rounded transition-all"
                >
                  ✕
                </button>
              </span>
            </div>
          ))}
        </div>

        {displayTrades.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-2xl mb-2">📈</div>
            <div className="text-sm">No trades yet</div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-white mb-3">
              Confirm Clear Action
            </h3>
            <p className="text-gray-300 mb-4">
              {showConfirm === "clearAllTrades"
                ? "Are you sure you want to clear all trade history? This action cannot be undone."
                : "Are you sure you want to clear this trade?"}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={
                  showConfirm === "clearAllTrades"
                    ? handleClearAllTrades
                    : () => {}
                }
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-sm transition-all"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
