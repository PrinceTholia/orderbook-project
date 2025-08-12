import { useState } from "react";

export default function OrderForm({ onSubmitOrder }) {
  const [side, setSide] = useState("buy");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!price || !quantity) return;

    setLoading(true);
    try {
      await onSubmitOrder({
        side,
        price: parseFloat(price),
        quantity: parseFloat(quantity),
      });
      setPrice("");
      setQuantity("");
    } catch (error) {
      console.error("Order submission failed:", error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Place Order</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Type
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
              Buy
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
              Sell
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price ($)
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

        <button
          type="submit"
          disabled={loading || !price || !quantity}
          className={`w-full py-2 px-4 rounded-md font-medium ${
            side === "buy"
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? "Placing Order..." : `Place ${side.toUpperCase()} Order`}
        </button>
      </form>
    </div>
  );
}
