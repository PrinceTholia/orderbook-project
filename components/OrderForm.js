// components/OrderForm.js - Enhanced with order types
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

    setLoading(true);
    try {
      await onSubmitOrder({
        side,
        price: orderType === "market" ? null : parseFloat(price),
        quantity: parseFloat(quantity),
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Place Order</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Order Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Type
          </label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setOrderType("limit")}
              className={`px-4 py-2 rounded ${
                orderType === "limit"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Limit
            </button>
            <button
              type="button"
              onClick={() => setOrderType("market")}
              className={`px-4 py-2 rounded ${
                orderType === "market"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Market
            </button>
          </div>
        </div>

        {/* Side Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Side
          </label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setSide("buy")}
              className={`px-4 py-2 rounded ${
                side === "buy"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Buy {bestAsk && `@ $${bestAsk.toFixed(2)}`}
            </button>
            <button
              type="button"
              onClick={() => setSide("sell")}
              className={`px-4 py-2 rounded ${
                side === "sell"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Sell {bestBid && `@ $${bestBid.toFixed(2)}`}
            </button>
          </div>
        </div>

        {/* Price Input (only for limit orders) */}
        {orderType === "limit" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price ($)
              <button
                type="button"
                onClick={fillMarketPrice}
                className="ml-2 text-xs text-blue-600 hover:text-blue-800"
              >
                Use Market Price
              </button>
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              required
            />
          </div>
        )}

        {/* Quantity Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
          </label>
          <input
            type="number"
            step="0.0001"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.0000"
            required
          />
        </div>

        {/* Market Order Warning */}
        {orderType === "market" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> Market orders execute immediately at the
              best available price.
              {side === "buy" &&
                bestAsk &&
                ` Current best ask: $${bestAsk.toFixed(2)}`}
              {side === "sell" &&
                bestBid &&
                ` Current best bid: $${bestBid.toFixed(2)}`}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !quantity || (orderType === "limit" && !price)}
          className={`w-full py-2 px-4 rounded-md font-medium ${
            side === "buy"
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading
            ? "Placing Order..."
            : `Place ${orderType.toUpperCase()} ${side.toUpperCase()} Order`}
        </button>
      </form>
    </div>
  );
}
