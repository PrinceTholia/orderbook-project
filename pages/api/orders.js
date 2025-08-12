import { getOrderBook } from "../../lib/orderbook";

export default function handler(req, res) {
  const orderbook = getOrderBook();

  if (req.method === "POST") {
    const { side, price, quantity, type = "limit" } = req.body;

    try {
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
        pendingOrders: orderbook.getPendingOrders(),
      });
    } catch (error) {
      res.status(400).json({
        error: error.message,
        code: "ORDER_PROCESSING_ERROR",
      });
    }
  } else if (req.method === "DELETE") {
    const { action, tradeIndex, price, side } = req.body;

    try {
      let success = false;
      let message = "";

      switch (action) {
        case "clearTrade":
          success = orderbook.clearTrade(parseInt(tradeIndex));
          message = success ? "Trade cleared successfully" : "Trade not found";
          break;

        case "clearAllTrades":
          orderbook.clearAllTrades();
          success = true;
          message = "All trades cleared successfully";
          break;

        case "clearOrder":
          if (side === "buy") {
            success = orderbook.clearBidOrder(price);
          } else {
            success = orderbook.clearAskOrder(price);
          }
          message = success ? "Order cleared successfully" : "Order not found";
          break;

        case "clearAllOrders":
          orderbook.clearAllOrders();
          success = true;
          message = "All pending orders cleared successfully";
          break;

        case "clearAllData":
          orderbook.clearAllData();
          success = true;
          message = "All data cleared successfully";
          break;

        default:
          return res.status(400).json({ error: "Invalid clear action" });
      }

      const updatedBook = orderbook.getOrderBook();
      const recentTrades = orderbook.getRecentTrades();

      res.status(200).json({
        success,
        message,
        orderbook: updatedBook,
        recentTrades,
        bestBid: orderbook.getBestBid(),
        bestAsk: orderbook.getBestAsk(),
        pendingOrders: orderbook.getPendingOrders(),
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to clear data",
        details: error.message,
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
        pendingOrders: orderbook.getPendingOrders(),
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
    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
