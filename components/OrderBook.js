import { useState, useEffect } from "react";

export default function OrderBook({ orderbook }) {
  const { bids = [], asks = [], lastPrice = 0 } = orderbook || {};

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Order Book</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Bids */}
        <div>
          <h3 className="text-lg font-semibold text-green-600 mb-2">Bids</h3>
          <div className="space-y-1">
            <div className="grid grid-cols-2 text-sm font-medium text-gray-600">
              <span>Price</span>
              <span>Quantity</span>
            </div>
            {bids.map(([price, qty], index) => (
              <div key={index} className="grid grid-cols-2 text-sm">
                <span className="text-green-600">
                  ${price != null ? price.toFixed(2) : "0.00"}
                </span>
                <span>{qty != null ? qty.toFixed(4) : "0.0000"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Asks */}
        <div>
          <h3 className="text-lg font-semibold text-red-600 mb-2">Asks</h3>
          <div className="space-y-1">
            <div className="grid grid-cols-2 text-sm font-medium text-gray-600">
              <span>Price</span>
              <span>Quantity</span>
            </div>
            {asks.map(([price, qty], index) => (
              <div key={index} className="grid grid-cols-2 text-sm">
                <span className="text-red-600">
                  ${price != null ? price.toFixed(2) : "0.00"}
                </span>
                <span>{qty != null ? qty.toFixed(4) : "0.0000"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {lastPrice > 0 && (
        <div className="mt-4 text-center">
          <span className="text-lg font-bold">
            Last Price:{" "}
            <span className="text-blue-600">${lastPrice.toFixed(2)}</span>
          </span>
        </div>
      )}

      {/* Show empty state */}
      {bids.length === 0 && asks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No orders in the book yet. Place an order to get started!
        </div>
      )}
    </div>
  );
}
