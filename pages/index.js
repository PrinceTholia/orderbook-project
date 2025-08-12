import { useState, useEffect } from "react";
import OrderBook from "../components/OrderBook";
import OrderForm from "../components/OrderForm";
import TradeHistory from "../components/TradeHistory";

export default function Home() {
  const [orderbook, setOrderbook] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();
      setOrderbook(data.orderbook);
      setTrades(data.trades);
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
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Order submission failed:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchData();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading OrderBook...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Cryptocurrency OrderBook
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <OrderBook orderbook={orderbook} />
          </div>

          <div className="space-y-6">
            <OrderForm onSubmitOrder={submitOrder} />
            <TradeHistory trades={trades} />
          </div>
        </div>
      </div>
    </div>
  );
}
