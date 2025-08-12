import { useState, useEffect } from "react";
import OrderBook from "../components/OrderBook";
import OrderForm from "../components/OrderForm";
import TradeHistory from "../components/TradeHistory";
import PriceChart from "../components/PriceChart";

export default function Home() {
  const [orderbook, setOrderbook] = useState(null);
  const [trades, setTrades] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bestBid, setBestBid] = useState(null);
  const [bestAsk, setBestAsk] = useState(null);
  const [showNuclearConfirm, setShowNuclearConfirm] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();
      setOrderbook(data.orderbook);
      setTrades(data.trades);
      setPendingOrders(data.pendingOrders || []);
      setBestBid(data.bestBid);
      setBestAsk(data.bestAsk);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitOrder = async (orderData) => {
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        setOrderbook(data.orderbook);
        setTrades(data.recentTrades);
        setPendingOrders(data.pendingOrders || []);
        setBestBid(data.bestBid);
        setBestAsk(data.bestAsk);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Order submission failed:", error);
      throw error;
    }
  };

  const handleClearData = async (action, params = {}) => {
    try {
      const response = await fetch("/api/orders", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, ...params }),
      });

      const data = await response.json();

      if (data.success) {
        setOrderbook(data.orderbook);
        setTrades(data.recentTrades);
        setPendingOrders(data.pendingOrders || []);
        setBestBid(data.bestBid);
        setBestAsk(data.bestAsk);
      } else {
        throw new Error(data.message || "Clear operation failed");
      }
    } catch (error) {
      console.error("Clear operation failed:", error);
      throw error;
    }
  };

  const handleNuclearClear = async () => {
    try {
      await handleClearData("clearAllData");
      setShowNuclearConfirm(false);
    } catch (error) {
      console.error("Failed to clear all data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚡</div>
          <div className="text-xl text-white font-bold">
            Loading OrderBook...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Compact Header with Nuclear Clear */}
      <div className="bg-gray-900 border-b border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Trading Platform
              </h1>
              <p className="text-gray-400 text-sm">Live OrderBook</p>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              {/* Nuclear Clear Button */}
              <button
                onClick={() => setShowNuclearConfirm(true)}
                className="px-3 py-1.5 bg-red-700/20 hover:bg-red-700/30 text-red-400 text-xs rounded border border-red-700/50 transition-all font-medium"
              >
                🗑️ CLEAR ALL DATA
              </button>

              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-green-400">Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Single Screen Layout */}
      <div className="container mx-auto px-4 py-4">
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-4"
          style={{ height: "calc(100vh - 120px)" }}
        >
          <div className="lg:col-span-7">
            <PriceChart trades={trades} lastPrice={orderbook?.lastPrice} />
          </div>

          <div className="lg:col-span-5">
            <OrderBook
              orderbook={orderbook}
              pendingOrders={pendingOrders}
              onClearData={handleClearData}
            />
          </div>

          <div className="lg:col-span-7">
            <OrderForm
              onSubmitOrder={submitOrder}
              bestBid={bestBid}
              bestAsk={bestAsk}
            />
          </div>

          <div className="lg:col-span-5">
            <TradeHistory trades={trades} onClearData={handleClearData} />
          </div>
        </div>
      </div>

      {/* Nuclear Clear Confirmation Modal */}
      {showNuclearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-red-600 rounded-lg p-8 max-w-md mx-4">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-red-400 mb-3">
                NUCLEAR OPTION
              </h3>
              <p className="text-gray-300 mb-4">
                This will permanently delete <strong>ALL DATA</strong>:
              </p>
              <ul className="text-sm text-gray-400 space-y-1 text-left mb-4">
                <li>• All executed trades</li>
                <li>• All pending orders (bids & asks)</li>
                <li>• Price history</li>
                <li>• Market statistics</li>
              </ul>
              <p className="text-red-400 font-bold text-sm">
                This action cannot be undone!
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowNuclearConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleNuclearClear}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded font-bold transition-all"
              >
                CLEAR ALL DATA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
