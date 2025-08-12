// pages/api/orders.js - Enhanced version
import { getOrderBook } from "../../lib/orderbook";

export default function handler(req, res) {
  const orderbook = getOrderBook();

  if (req.method === "POST") {
    const { side, price, quantity, type = "limit" } = req.body;

    try {
      // Validation
      if (!side || !quantity) {
        return res.status(400).json({
          error: "Missing required fields",
          required: ["side", "quantity"],
        });
      }

      if (type === "limit" && !price) {
        return res.status(400).json({
          error: "Price is required for limit orders",
        });
      }

      const result = orderbook.addOrder(side, price, quantity, type);
      const updatedBook = orderbook.getOrderBook();
      const recentTrades = orderbook.getRecentTrades();

      res.status(200).json({
        success: true,
        result,
        orderbook: updatedBook,
        recentTrades,
        bestBid: orderbook.getBestBid(),
        bestAsk: orderbook.getBestAsk(),
      });
    } catch (error) {
      res.status(400).json({
        error: error.message,
        code: "ORDER_PROCESSING_ERROR",
      });
    }
  } else if (req.method === "GET") {
    try {
      const book = orderbook.getOrderBook();
      const trades = orderbook.getRecentTrades();

      res.status(200).json({
        orderbook: book,
        trades,
        bestBid: orderbook.getBestBid(),
        bestAsk: orderbook.getBestAsk(),
        spread:
          orderbook.getBestAsk() && orderbook.getBestBid()
            ? orderbook.getBestAsk() - orderbook.getBestBid()
            : null,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch orderbook data",
        details: error.message,
      });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
