import { useState } from "react";

export default function OrderBook({
  orderbook,
  pendingOrders = [],
  onClearData,
}) {
  const [showConfirm, setShowConfirm] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { bids = [], asks = [], lastPrice = 0 } = orderbook || {};

  const formatPrice = (price) => {
    if (price == null || isNaN(price)) return "0.00";
    return Number(price).toFixed(2);
  };

  const formatQuantity = (qty) => {
    if (qty == null || isNaN(qty)) return "0";
    return Number(qty).toFixed(0); // Changed to show whole numbers
  };

  const maxRows = 8;
  const displayBids = bids.slice(0, maxRows);
  const displayAsks = asks.slice(0, maxRows);

  const maxBidQty = Math.max(...displayBids.map(([, qty]) => qty), 1);
  const maxAskQty = Math.max(...displayAsks.map(([, qty]) => qty), 1);

  const handleClearOrder = async (price, side) => {
    try {
      await onClearData("clearOrder", { price, side });
      setShowConfirm(null);
      setSelectedOrder(null);
    } catch (error) {
      console.error("Failed to clear order:", error);
    }
  };

  const handleClearAllOrders = async () => {
    try {
      await onClearData("clearAllOrders");
      setShowConfirm(null);
    } catch (error) {
      console.error("Failed to clear all orders:", error);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white">Order Book</h2>
            {lastPrice > 0 && (
              <div className="text-right">
                <span className="text-xs text-gray-400">Last: </span>
                <span className="text-yellow-400 font-mono font-bold">
                  ${formatPrice(lastPrice)}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowConfirm("clearAllOrders")}
            disabled={bids.length === 0 && asks.length === 0}
            className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs rounded border border-red-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Clear All Orders
          </button>
        </div>
      </div>

      <div
        className="grid grid-cols-2 divide-x divide-gray-700"
        style={{ height: "320px" }}
      >
        {/* Bids */}
        <div className="bg-gray-900">
          <div className="bg-green-900/20 px-3 py-2 border-b border-gray-700">
            <div className="grid grid-cols-4 gap-2 text-xs font-medium text-green-400">
              <span>PRICE</span>
              <span>QTY</span>
              <span>TOTAL</span>
              <span>ACTION</span>
            </div>
          </div>
          <div className="overflow-y-auto" style={{ height: "260px" }}>
            {displayBids.map(([price, qty], index) => {
              const depthPercent = (qty / maxBidQty) * 100;
              return (
                <div key={index} className="relative group">
                  <div
                    className="absolute inset-0 bg-green-500/10"
                    style={{ width: `${depthPercent}%` }}
                  />
                  <div className="relative grid grid-cols-4 gap-2 text-xs py-1.5 px-3 hover:bg-gray-800/50">
                    <span className="text-green-400 font-mono">
                      ${formatPrice(price)}
                    </span>
                    <span className="text-white font-mono">
                      {formatQuantity(qty)}
                    </span>
                    <span className="text-gray-400 font-mono">
                      ${formatQuantity(qty * price)}
                    </span>
                    <span>
                      <button
                        onClick={() => {
                          setSelectedOrder({ price, side: "buy" });
                          setShowConfirm("clearOrder");
                        }}
                        className="opacity-0 group-hover:opacity-100 px-1 py-0.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs rounded transition-all"
                      >
                        ✕
                      </button>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Asks */}
        <div className="bg-gray-900">
          <div className="bg-red-900/20 px-3 py-2 border-b border-gray-700">
            <div className="grid grid-cols-4 gap-2 text-xs font-medium text-red-400">
              <span>PRICE</span>
              <span>QTY</span>
              <span>TOTAL</span>
              <span>ACTION</span>
            </div>
          </div>
          <div className="overflow-y-auto" style={{ height: "260px" }}>
            {displayAsks.map(([price, qty], index) => {
              const depthPercent = (qty / maxAskQty) * 100;
              return (
                <div key={index} className="relative group">
                  <div
                    className="absolute inset-0 bg-red-500/10"
                    style={{ width: `${depthPercent}%` }}
                  />
                  <div className="relative grid grid-cols-4 gap-2 text-xs py-1.5 px-3 hover:bg-gray-800/50">
                    <span className="text-red-400 font-mono">
                      ${formatPrice(price)}
                    </span>
                    <span className="text-white font-mono">
                      {formatQuantity(qty)}
                    </span>
                    <span className="text-gray-400 font-mono">
                      ${formatQuantity(qty * price)}
                    </span>
                    <span>
                      <button
                        onClick={() => {
                          setSelectedOrder({ price, side: "sell" });
                          setShowConfirm("clearOrder");
                        }}
                        className="opacity-0 group-hover:opacity-100 px-1 py-0.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs rounded transition-all"
                      >
                        ✕
                      </button>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {displayBids.length === 0 && displayAsks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-sm">No orders available</div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-white mb-3">
              Confirm Clear Action
            </h3>
            <p className="text-gray-300 mb-4">
              {showConfirm === "clearAllOrders"
                ? "Are you sure you want to clear all pending orders? This action cannot be undone."
                : selectedOrder
                ? `Are you sure you want to clear the ${selectedOrder.side} order at $${selectedOrder.price}?`
                : "Are you sure you want to clear this order?"}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowConfirm(null);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={
                  showConfirm === "clearAllOrders"
                    ? handleClearAllOrders
                    : () =>
                        handleClearOrder(
                          selectedOrder.price,
                          selectedOrder.side
                        )
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
