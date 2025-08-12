class OrderBook {
  constructor() {
    this.bids = new Map(); // price -> total quantity
    this.asks = new Map(); // price -> total quantity
    this.trades = [];
    this.lastPrice = 0;
    this.bestBid = null;
    this.bestAsk = null;
  }

  // Input validation
  validateOrder(side, price, quantity, type = "limit") {
    if (!side || !["buy", "sell"].includes(side)) {
      throw new Error('Invalid side: must be "buy" or "sell"');
    }

    if (!quantity || quantity <= 0) {
      throw new Error("Invalid quantity: must be positive number");
    }

    // Ensure quantity is a whole number
    const wholeQuantity = Math.floor(parseFloat(quantity));
    if (wholeQuantity !== parseFloat(quantity)) {
      throw new Error("Invalid quantity: must be a whole number");
    }

    if (type === "limit") {
      if (!price || price <= 0) {
        throw new Error(
          "Invalid price: must be positive number for limit orders"
        );
      }
    }

    return {
      side,
      price: type === "limit" ? parseFloat(price) : null,
      quantity: wholeQuantity, // Use whole number
      type,
      timestamp: Date.now(),
    };
  }

  addOrder(side, price, quantity, type = "limit") {
    const order = this.validateOrder(side, price, quantity, type);

    if (type === "market") {
      return this.processMarketOrder(order);
    } else {
      return this.processLimitOrder(order);
    }
  }

  processLimitOrder(order) {
    const { side, price, quantity } = order;

    if (side === "buy") {
      return this.processBuyOrder(price, quantity);
    } else {
      return this.processSellOrder(price, quantity);
    }
  }

  processBuyOrder(buyPrice, buyQuantity) {
    let remainingQty = buyQuantity;
    const trades = [];

    // Sort asks by price (ascending) - match with cheapest asks first
    const sortedAsks = Array.from(this.asks.entries()).sort(
      (a, b) => a[0] - b[0]
    );

    // Try to match with existing asks
    for (const [askPrice, askQty] of sortedAsks) {
      if (remainingQty <= 0) break;

      // Buy order can match if buy price >= ask price
      if (buyPrice >= askPrice) {
        const matchedQty = Math.min(remainingQty, askQty);

        // Create trade
        trades.push({
          price: askPrice, // Trade happens at ask price (price improvement for buyer)
          quantity: matchedQty,
          timestamp: Date.now(),
          side: "buy",
          buyOrderPrice: buyPrice,
          sellOrderPrice: askPrice,
        });

        remainingQty -= matchedQty;
        this.lastPrice = askPrice;

        // Update ask book
        if (askQty === matchedQty) {
          this.asks.delete(askPrice);
        } else {
          this.asks.set(askPrice, askQty - matchedQty);
        }

        // Clear cache since asks changed
        this.bestAsk = null;
      } else {
        // No more matching possible (asks are sorted by price)
        break;
      }
    }

    // Add remaining quantity to bid book
    if (remainingQty > 0) {
      const currentBidQty = this.bids.get(buyPrice) || 0;
      this.bids.set(buyPrice, currentBidQty + remainingQty);

      // Update best bid cache
      if (this.bestBid === null || buyPrice > this.bestBid) {
        this.bestBid = buyPrice;
      }
    }

    this.trades.push(...trades);
    return trades;
  }

  processSellOrder(sellPrice, sellQuantity) {
    let remainingQty = sellQuantity;
    const trades = [];

    // Sort bids by price (descending) - match with highest bids first
    const sortedBids = Array.from(this.bids.entries()).sort(
      (a, b) => b[0] - a[0]
    );

    // Try to match with existing bids
    for (const [bidPrice, bidQty] of sortedBids) {
      if (remainingQty <= 0) break;

      // Sell order can match if sell price <= bid price
      if (sellPrice <= bidPrice) {
        const matchedQty = Math.min(remainingQty, bidQty);

        // Create trade
        trades.push({
          price: bidPrice, // Trade happens at bid price (price improvement for seller)
          quantity: matchedQty,
          timestamp: Date.now(),
          side: "sell",
          buyOrderPrice: bidPrice,
          sellOrderPrice: sellPrice,
        });

        remainingQty -= matchedQty;
        this.lastPrice = bidPrice;

        // Update bid book
        if (bidQty === matchedQty) {
          this.bids.delete(bidPrice);
        } else {
          this.bids.set(bidPrice, bidQty - matchedQty);
        }

        // Clear cache since bids changed
        this.bestBid = null;
      } else {
        // No more matching possible (bids are sorted by price)
        break;
      }
    }

    // Add remaining quantity to ask book
    if (remainingQty > 0) {
      const currentAskQty = this.asks.get(sellPrice) || 0;
      this.asks.set(sellPrice, currentAskQty + remainingQty);

      // Update best ask cache
      if (this.bestAsk === null || sellPrice < this.bestAsk) {
        this.bestAsk = sellPrice;
      }
    }

    this.trades.push(...trades);
    return trades;
  }

  processMarketOrder(order) {
    const { side, quantity } = order;

    if (side === "buy") {
      // Market buy: match with best available asks
      return this.processMarketBuy(quantity);
    } else {
      // Market sell: match with best available bids
      return this.processMarketSell(quantity);
    }
  }

  processMarketBuy(quantity) {
    let remainingQty = quantity;
    const trades = [];

    // Sort asks by price (ascending)
    const sortedAsks = Array.from(this.asks.entries()).sort(
      (a, b) => a[0] - b[0]
    );

    for (const [askPrice, askQty] of sortedAsks) {
      if (remainingQty <= 0) break;

      const matchedQty = Math.min(remainingQty, askQty);

      trades.push({
        price: askPrice,
        quantity: matchedQty,
        timestamp: Date.now(),
        side: "buy",
        orderType: "market",
      });

      remainingQty -= matchedQty;
      this.lastPrice = askPrice;

      if (askQty === matchedQty) {
        this.asks.delete(askPrice);
      } else {
        this.asks.set(askPrice, askQty - matchedQty);
      }
    }

    this.trades.push(...trades);
    return { trades, unfilledQuantity: remainingQty };
  }

  processMarketSell(quantity) {
    let remainingQty = quantity;
    const trades = [];

    // Sort bids by price (descending)
    const sortedBids = Array.from(this.bids.entries()).sort(
      (a, b) => b[0] - a[0]
    );

    for (const [bidPrice, bidQty] of sortedBids) {
      if (remainingQty <= 0) break;

      const matchedQty = Math.min(remainingQty, bidQty);

      trades.push({
        price: bidPrice,
        quantity: matchedQty,
        timestamp: Date.now(),
        side: "sell",
        orderType: "market",
      });

      remainingQty -= matchedQty;
      this.lastPrice = bidPrice;

      if (bidQty === matchedQty) {
        this.bids.delete(bidPrice);
      } else {
        this.bids.set(bidPrice, bidQty - matchedQty);
      }
    }

    this.trades.push(...trades);
    return { trades, unfilledQuantity: remainingQty };
  }

  getBestBid() {
    if (this.bestBid === null && this.bids.size > 0) {
      this.bestBid = Math.max(...this.bids.keys());
    }
    return this.bestBid;
  }

  getBestAsk() {
    if (this.bestAsk === null && this.asks.size > 0) {
      this.bestAsk = Math.min(...this.asks.keys());
    }
    return this.bestAsk;
  }

  getOrderBook() {
    // Filter out zero quantities and sort properly
    const validBids = Array.from(this.bids.entries())
      .filter(([price, qty]) => qty > 0 && price > 0)
      .sort((a, b) => b[0] - a[0])
      .slice(0, 20);

    const validAsks = Array.from(this.asks.entries())
      .filter(([price, qty]) => qty > 0 && price > 0)
      .sort((a, b) => a[0] - b[0])
      .slice(0, 20);

    return {
      bids: validBids,
      asks: validAsks,
      lastPrice: this.lastPrice,
    };
  }

  getRecentTrades(limit = 50) {
    return this.trades.slice(-limit).reverse();
  }

  clearTrade(tradeIndex) {
    if (tradeIndex >= 0 && tradeIndex < this.trades.length) {
      this.trades.splice(tradeIndex, 1);
      return true;
    }
    return false;
  }

  // Clear all trades
  clearAllTrades() {
    this.trades = [];
    this.lastPrice = 0;
  }

  // Clear specific bid order
  clearBidOrder(price) {
    const deleted = this.bids.delete(parseFloat(price));
    if (deleted) {
      this.bestBid = null; // Reset cache
    }
    return deleted;
  }

  // Clear specific ask order
  clearAskOrder(price) {
    const deleted = this.asks.delete(parseFloat(price));
    if (deleted) {
      this.bestAsk = null; // Reset cache
    }
    return deleted;
  }

  // Clear all pending orders
  clearAllOrders() {
    this.bids.clear();
    this.asks.clear();
    this.bestBid = null;
    this.bestAsk = null;
  }

  // Clear everything (nuclear option)
  clearAllData() {
    this.bids.clear();
    this.asks.clear();
    this.trades = [];
    this.lastPrice = 0;
    this.bestBid = null;
    this.bestAsk = null;
  }

  // Get pending orders for management
  getPendingOrders() {
    const pendingBids = Array.from(this.bids.entries()).map(([price, qty]) => ({
      type: "bid",
      price,
      quantity: qty,
      side: "buy",
    }));

    const pendingAsks = Array.from(this.asks.entries()).map(([price, qty]) => ({
      type: "ask",
      price,
      quantity: qty,
      side: "sell",
    }));

    return [...pendingBids, ...pendingAsks].sort((a, b) => b.price - a.price);
  }

  // Debug method to check orderbook state
  getBookState() {
    return {
      bidsCount: this.bids.size,
      asksCount: this.asks.size,
      bestBid: this.getBestBid(),
      bestAsk: this.getBestAsk(),
      spread:
        this.getBestAsk() && this.getBestBid()
          ? this.getBestAsk() - this.getBestBid()
          : null,
      lastPrice: this.lastPrice,
      tradesCount: this.trades.length,
    };
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
