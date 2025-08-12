class OrderBook {
  constructor() {
    this.bids = new Map(); // price -> quantity
    this.asks = new Map(); // price -> quantity
    this.trades = [];
    this.lastPrice = 0;
  }

  addOrder(side, price, quantity) {
    const order = {
      side,
      price: parseFloat(price),
      quantity: parseFloat(quantity),
      timestamp: Date.now(),
    };

    if (side === "buy") {
      return this.addBuyOrder(order);
    } else {
      return this.addSellOrder(order);
    }
  }

  addBuyOrder(order) {
    const { price, quantity } = order;
    let remainingQty = quantity;
    const trades = [];

    // Check for matching sell orders
    const sortedAsks = Array.from(this.asks.entries()).sort(
      (a, b) => a[0] - b[0]
    );

    for (const [askPrice, askQty] of sortedAsks) {
      if (price >= askPrice && remainingQty > 0) {
        const tradeQty = Math.min(remainingQty, askQty);
        trades.push({
          price: askPrice,
          quantity: tradeQty,
          timestamp: Date.now(),
          side: "buy",
        });

        remainingQty -= tradeQty;
        this.lastPrice = askPrice;

        if (askQty === tradeQty) {
          this.asks.delete(askPrice);
        } else {
          this.asks.set(askPrice, askQty - tradeQty);
        }
      } else {
        break;
      }
    }

    // Add remaining quantity to bid book
    if (remainingQty > 0) {
      const currentBid = this.bids.get(price) || 0;
      this.bids.set(price, currentBid + remainingQty);
    }

    this.trades.push(...trades);
    return trades;
  }

  addSellOrder(order) {
    const { price, quantity } = order;
    let remainingQty = quantity;
    const trades = [];

    // Check for matching buy orders
    const sortedBids = Array.from(this.bids.entries()).sort(
      (a, b) => b[0] - a[0]
    );

    for (const [bidPrice, bidQty] of sortedBids) {
      if (price <= bidPrice && remainingQty > 0) {
        const tradeQty = Math.min(remainingQty, bidQty);
        trades.push({
          price: bidPrice,
          quantity: tradeQty,
          timestamp: Date.now(),
          side: "sell",
        });

        remainingQty -= tradeQty;
        this.lastPrice = bidPrice;

        if (bidQty === tradeQty) {
          this.bids.delete(bidPrice);
        } else {
          this.bids.set(bidPrice, bidQty - tradeQty);
        }
      } else {
        break;
      }
    }

    // Add remaining quantity to ask book
    if (remainingQty > 0) {
      const currentAsk = this.asks.get(price) || 0;
      this.asks.set(price, currentAsk + remainingQty);
    }

    this.trades.push(...trades);
    return trades;
  }

  getOrderBook() {
    const bids = Array.from(this.bids.entries())
      .sort((a, b) => b[0] - a[0])
      .slice(0, 20);

    const asks = Array.from(this.asks.entries())
      .sort((a, b) => a[0] - b[0])
      .slice(0, 20);

    return { bids, asks, lastPrice: this.lastPrice };
  }

  getRecentTrades(limit = 50) {
    return this.trades.slice(-limit).reverse();
  }
}

// Global orderbook instance
let globalOrderBook = null;

export function getOrderBook() {
  if (!globalOrderBook) {
    globalOrderBook = new OrderBook();
  }
  return globalOrderBook;
}
