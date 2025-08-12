export default function TradeHistory({ trades = [] }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Recent Trades</h2>

      <div className="space-y-2">
        <div className="grid grid-cols-4 text-sm font-medium text-gray-600">
          <span>Time</span>
          <span>Side</span>
          <span>Price</span>
          <span>Quantity</span>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {trades.map((trade, index) => (
            <div key={index} className="grid grid-cols-4 text-sm py-1">
              <span className="text-gray-600">
                {new Date(trade.timestamp).toLocaleTimeString()}
              </span>
              <span
                className={
                  trade.side === "buy" ? "text-green-600" : "text-red-600"
                }
              >
                {trade.side.toUpperCase()}
              </span>
              <span>${trade.price.toFixed(2)}</span>
              <span>{trade.quantity.toFixed(4)}</span>
            </div>
          ))}
        </div>

        {trades.length === 0 && (
          <div className="text-gray-500 text-center py-8">No trades yet</div>
        )}
      </div>
    </div>
  );
}
