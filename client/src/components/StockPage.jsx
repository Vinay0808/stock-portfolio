import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/StockPage.css';

const StockPage = () => {
  const { stockName } = useParams();
  const [stockData, setStockData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/stocks');
        const filtered = res.data.filter(
          stock => (stock.stockName || stock.companyName) === stockName
        );
        setStockData(filtered);
      } catch (err) {
        console.error('Error fetching stock:', err);
      }
    };

    fetchStockData();
  }, [stockName]);

  const buys = stockData.filter(entry => entry.type === 'Buy');
  const sells = stockData.filter(entry => entry.type === 'Sell');

  const calcTotal = (price, qty, charges, isSell = false) => {
    return isSell
      ? parseFloat(price) * qty - parseFloat(charges || 0)
      : parseFloat(price) * qty + parseFloat(charges || 0);
  };

  const totalBuy = buys.reduce(
    (sum, b) => sum + calcTotal(b.price, parseInt(b.quantity), b.charges),
    0
  );
  const totalSell = sells.reduce(
    (sum, s) => sum + calcTotal(s.price, parseInt(s.quantity), s.charges, true),
    0
  );
  const profitLoss = totalSell - totalBuy;
  const tradedValue = totalBuy + totalSell;

  const totalBuyQty = buys.reduce((sum, b) => sum + parseInt(b.quantity), 0);
  const totalSellQty = sells.reduce((sum, s) => sum + parseInt(s.quantity), 0);
  const totalCharges = buys.reduce((sum, b) => sum + parseFloat(b.charges || 0), 0) +
    sells.reduce((sum, s) => sum + parseFloat(s.charges || 0), 0);
  const activeQty = totalBuyQty - totalSellQty;

  // Group Buys for each Sell row
  const groups = [];
  let buyIdx = 0;

  sells.forEach(sell => {
    let sellQty = parseInt(sell.quantity);
    let matchedBuys = [];
    let matchedBuyTotal = 0;

    while (sellQty > 0 && buyIdx < buys.length) {
      const buy = buys[buyIdx];
      let buyQty = parseInt(buy.quantity);

      if (buyQty <= sellQty) {
        matchedBuys.push(buy);
        matchedBuyTotal += calcTotal(buy.price, buyQty, buy.charges);
        sellQty -= buyQty;
        buyIdx++;
      } else {
        // Partial match
        const partialBuy = {
          ...buy,
          quantity: sellQty,
          charges: (parseFloat(buy.charges) * sellQty) / buyQty
        };
        matchedBuys.push(partialBuy);
        matchedBuyTotal += calcTotal(
          buy.price,
          sellQty,
          partialBuy.charges
        );
        buys[buyIdx].quantity = buyQty - sellQty;
        buys[buyIdx].charges = parseFloat(buy.charges) - partialBuy.charges;
        sellQty = 0;
      }
    }

    const sellTotal = calcTotal(
      sell.price,
      parseInt(sell.quantity),
      sell.charges,
      true
    );
    const pl = sellTotal - matchedBuyTotal;

    groups.push({ buys: matchedBuys, sell, pl });
  });

  return (
    <div className="stock-page">
      <button
        className="fixed-back-btn"
        onClick={() => navigate(-1)}
      >
        ⬅ Back
      </button>

      <div className="stock-header">
        <h2>{stockName} - Detailed View</h2>

        <div className="summary-info">
          {activeQty === 0 && (
            <span
              className={`profit-loss ${
                profitLoss >= 0 ? 'profit' : 'loss'
              }`}
            >
              {profitLoss >= 0
                ? `Profit: ₹${profitLoss.toFixed(2)}`
                : `Loss: ₹${Math.abs(profitLoss).toFixed(2)}`}
              <b
                className="tooltip-icon"
                title="The profit or loss is excluding the charges"
              >
                ℹ️
              </b>
            </span>
          )}

          <span className="active-quantity">
            Active Quantity: <strong>{activeQty}</strong>
          </span>

          <span className="total-charges">
            Total Charges: <strong>₹{totalCharges.toFixed(2)}</strong>
          </span>

          <span className="traded-value-box">
            Traded Value: <strong>₹{tradedValue.toFixed(2)}</strong>
            <b
              className="tooltip-icon"
              title="Sum of sell and buy transactions"
            >
              ℹ️
            </b>
          </span>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="stock-table">
          <thead>
            <tr className="header-totals">
              <th colSpan="5" className="buy-header">
                Buy Total: ₹{totalBuy.toFixed(2)}
              </th>
              <th colSpan="5" className="sell-header">
                Sell Total: ₹{totalSell.toFixed(2)}
              </th>
              <th>P/L</th>
            </tr>
            <tr>
              <th>Date</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Charges</th>
              <th>Total</th>
              <th>Date</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Charges</th>
              <th>Total</th>
              <th>P/L</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group, gIdx) =>
              group.buys.map((buy, bIdx) => (
                <tr key={`${gIdx}-${bIdx}`}>
                  <td>{buy.date}</td>
                  <td>₹{parseFloat(buy.price).toFixed(2)}</td>
                  <td>{buy.quantity}</td>
                  <td>₹{parseFloat(buy.charges).toFixed(2)}</td>
                  <td>
                    ₹
                    {calcTotal(
                      buy.price,
                      parseInt(buy.quantity),
                      buy.charges
                    ).toFixed(2)}
                  </td>

                  {bIdx === 0 && (
                    <>
                      <td rowSpan={group.buys.length}>
                        {group.sell.date}
                      </td>
                      <td rowSpan={group.buys.length}>
                        ₹{parseFloat(group.sell.price).toFixed(2)}
                      </td>
                      <td rowSpan={group.buys.length}>
                        {group.sell.quantity}
                      </td>
                      <td rowSpan={group.buys.length}>
                        ₹{parseFloat(group.sell.charges).toFixed(2)}
                      </td>
                      <td rowSpan={group.buys.length}>
                        ₹
                        {calcTotal(
                          group.sell.price,
                          parseInt(group.sell.quantity),
                          group.sell.charges,
                          true
                        ).toFixed(2)}
                      </td>
                      <td
                        rowSpan={group.buys.length}
                        className={group.pl >= 0 ? 'profit' : 'loss'}
                      >
                        ₹{group.pl.toFixed(2)}
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockPage;
