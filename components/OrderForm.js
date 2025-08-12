import { useState } from "react";

export default function OrderForm({ onSubmitOrder, bestBid, bestAsk }) {
  const [side, setSide] = useState("buy");
  const [orderType, setOrderType] = useState("limit");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!quantity || (orderType === "limit" && !price)) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate quantity is whole number
    const wholeQuantity = Math.floor(parseFloat(quantity));
    if (wholeQuantity !== parseFloat(quantity)) {
      alert("Quantity must be a whole number");
      return;
    }

    setLoading(true);
    try {
      await onSubmitOrder({
        side,
        price: orderType === "market" ? null : parseFloat(price),
        quantity: wholeQuantity, // Use whole number
        type: orderType,
      });
      setPrice("");
      setQuantity("");
    } catch (error) {
      console.error("Order submission failed:", error);
      alert(`Order failed: ${error.message}`);
    }
    setLoading(false);
  };

  const fillMarketPrice = () => {
    if (orderType === "limit") {
      const targetPrice = side === "buy" ? bestAsk : bestBid;
      if (targetPrice) {
        setPrice(targetPrice.toString());
      }
    }
  };

  // Handle quantity input to only allow whole numbers
  const handleQuantityChange = (e) => {
    const value = e.target.value;
    // Only allow digits
    if (value === "" || /^\d+$/.test(value)) {
      setQuantity(value);
    }
  };

  const spread = bestAsk && bestBid ? bestAsk - bestBid : null;

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
        <h2 className="text-lg font-bold text-white">Place Order</h2>

        {/* Compact Market Info */}
        <div className="mt-2 flex justify-between text-xs">
          <div>
            <span className="text-gray-400">Bid: </span>
            <span className="text-green-400 font-mono">
              {bestBid ? `$${bestBid.toFixed(2)}` : "N/A"}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Ask: </span>
            <span className="text-red-400 font-mono">
              {bestAsk ? `$${bestAsk.toFixed(2)}` : "N/A"}
            </span>
          </div>
          {spread && (
            <div>
              <span className="text-gray-400">Spread: </span>
              <span className="text-yellow-400 font-mono">
                ${spread.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Compact Type & Side Selection */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">
              Type
            </label>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setOrderType("limit")}
                className={`px-2 py-1.5 rounded text-xs font-medium transition-all ${
                  orderType === "limit"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                LIMIT
              </button>
              <button
                type="button"
                onClick={() => setOrderType("market")}
                className={`px-2 py-1.5 rounded text-xs font-medium transition-all ${
                  orderType === "market"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                MARKET
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">
              Side
            </label>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setSide("buy")}
                className={`px-2 py-1.5 rounded text-xs font-medium transition-all ${
                  side === "buy"
                    ? "bg-green-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                🟢 BUY
              </button>
              <button
                type="button"
                onClick={() => setSide("sell")}
                className={`px-2 py-1.5 rounded text-xs font-medium transition-all ${
                  side === "sell"
                    ? "bg-red-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                🔴 SELL
              </button>
            </div>
          </div>
        </div>

        {/* Price & Quantity Inputs */}
        <div className="grid grid-cols-2 gap-3">
          {orderType === "limit" && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-gray-300">
                  Price ($)
                </label>
                <button
                  type="button"
                  onClick={fillMarketPrice}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Market
                </button>
              </div>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="0.00"
                required
              />
            </div>
          )}

          <div className={orderType === "market" ? "col-span-2" : ""}>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Quantity
            </label>
            <input
              type="number"
              step="1"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="1"
              required
            />
            {quantity && parseFloat(quantity) % 1 !== 0 && (
              <div className="text-red-400 text-xs mt-1">
                ⚠️ Quantity must be a whole number
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={
            loading ||
            !quantity ||
            (orderType === "limit" && !price) ||
            (quantity && parseFloat(quantity) % 1 !== 0)
          }
          className={`w-full py-3 px-4 rounded font-bold text-sm transition-all ${
            side === "buy"
              ? "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white"
              : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading
            ? "Processing..."
            : `${orderType.toUpperCase()} ${side.toUpperCase()}`}
        </button>
      </form>
    </div>
  );
}
