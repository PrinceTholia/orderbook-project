import { getOrderBook } from "../../lib/orderbook";

export default function handler(req, res) {
  const orderbook = getOrderBook();

  if (req.method === "POST") {
    const { side, price, quantity } = req.body;

    if (!side || !price || !quantity) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const trades = orderbook.addOrder(side, price, quantity);
      const updatedBook = orderbook.getOrderBook();
      const recentTrades = orderbook.getRecentTrades();

      res.status(200).json({
        success: true,
        trades,
        orderbook: updatedBook,
        recentTrades,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to process order" });
    }
  } else if (req.method === "GET") {
    const book = orderbook.getOrderBook();
    const trades = orderbook.getRecentTrades();

    res.status(200).json({
      orderbook: book,
      trades,
    });
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
