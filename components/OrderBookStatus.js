// components/OrderBookStats.js - New component
export default function OrderBookStats({ orderbook, bestBid, bestAsk }) {
  const spread = bestAsk && bestBid ? bestAsk - bestBid : null;
  const spreadPercent = spread && bestBid ? (spread / bestBid) * 100 : null;

  const bidLevels = orderbook?.bids?.length || 0;
  const askLevels = orderbook?.asks?.length || 0;
  const totalBidVolume =
    orderbook?.bids?.reduce((sum, [, qty]) => sum + qty, 0) || 0;
  const totalAskVolume =
    orderbook?.asks?.reduce((sum, [, qty]) => sum + qty, 0) || 0;

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3">Market Statistics</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Spread:</span>
          <div className="font-medium">
            {spread ? `$${spread.toFixed(2)}` : "N/A"}
            {spreadPercent && (
              <span className="text-xs text-gray-500 ml-1">
                ({spreadPercent.toFixed(2)}%)
              </span>
            )}
          </div>
        </div>

        <div>
          <span className="text-gray-600">Bid Levels:</span>
          <div className="font-medium text-green-600">{bidLevels}</div>
        </div>

        <div>
          <span className="text-gray-600">Ask Levels:</span>
          <div className="font-medium text-red-600">{askLevels}</div>
        </div>

        <div>
          <span className="text-gray-600">Total Volume:</span>
          <div className="font-medium">
            <span className="text-green-600">{totalBidVolume.toFixed(2)}</span>
            <span className="text-gray-400"> / </span>
            <span className="text-red-600">{totalAskVolume.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
