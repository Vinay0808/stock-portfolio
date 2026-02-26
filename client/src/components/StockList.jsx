// src/components/StockList.jsx
import React, { useEffect, useState } from 'react';
import '../styles/StockList.css';
import { useNavigate } from 'react-router-dom';

const StockList = ({ stocks }) => {
  const [summary, setSummary] = useState([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('');
  const navigate = useNavigate();

  // ... (Summarization logic remains the same) ...
  useEffect(() => {
    if (stocks && stocks.length > 0) {
      summarizeStocks();
    } else {
      setSummary([]);
    }
  }, [stocks, search, sortKey]);

  const summarizeStocks = () => {
    // ... (Your existing summarizeStocks function is here, unchanged) ...
    const grouped = {};

    stocks.forEach(stock => {
      const name = stock.stockName || stock.companyName || 'Unnamed';

      if (!grouped[name]) {
        grouped[name] = {
          stockName: name,
          latestDate: stock.date,
          buyEntries: [],
          sellEntries: [],
        };
      }

      if (new Date(stock.date) > new Date(grouped[name].latestDate)) {
        grouped[name].latestDate = stock.date;
      }

      if (stock.type === 'Buy') grouped[name].buyEntries.push(stock);
      else if (stock.type === 'Sell') grouped[name].sellEntries.push(stock);
    });

    const summaryArr = Object.values(grouped).map(item => {
      const { buyEntries, sellEntries } = item;

      const totalBuyValue = buyEntries.reduce((sum, e) => {
        const price = parseFloat(e.price) || 0;
        const qty = parseInt(e.quantity) || 0;
        const charges = parseFloat(e.charges) || 0;
        return sum + price * qty + charges;
      }, 0);

      const totalSellValue = sellEntries.reduce((sum, e) => {
        const price = parseFloat(e.price) || 0;
        const qty = parseInt(e.quantity) || 0;
        const charges = parseFloat(e.charges) || 0;
        return sum + (price * qty - charges);
      }, 0);

      const profit = totalSellValue - totalBuyValue;
      const quantityBuy = buyEntries.reduce((sum, e) => sum + (parseInt(e.quantity) || 0), 0);
      const quantitySell = sellEntries.reduce((sum, e) => sum + (parseInt(e.quantity) || 0), 0);
      const activeQty = quantityBuy - quantitySell;
      const returnsPct = totalBuyValue ? ((profit / totalBuyValue) * 100).toFixed(2) : '0.00';

      return {
        stockName: item.stockName,
        latestDate: item.latestDate,
        profit,
        returnsPct,
        activeQty,
      };
    });

    let filtered = summaryArr;
    if (search) {
      filtered = filtered.filter(s => s.stockName.toLowerCase().includes(search.toLowerCase()));
    }

    if (sortKey === 'date') filtered.sort((a, b) => new Date(b.latestDate) - new Date(a.latestDate));
    else if (sortKey === 'profit') filtered.sort((a, b) => a.profit - b.profit);
    else if (sortKey === 'returns') filtered.sort((a, b) => parseFloat(a.returnsPct) - parseFloat(b.returnsPct));

    setSummary(filtered);
  };
  // End of summarizeStocks function

  // Calculate GROSS P/L only for settled stocks
  const grossPL = summary.reduce((sum, s) => {
    return sum + (s.activeQty === 0 ? s.profit : 0);
  }, 0);

  return (
    <div className="stock-list-container">
      {/* Removed fixed-details-btn to keep only the main list content */}
      
      <h3>Stock Summary</h3>

      <div className="controls">
        <input
          type="text"
          placeholder="Search stock..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={sortKey} onChange={e => setSortKey(e.target.value)}>
          <option value="">Sort By</option>
          <option value="date">Recent Date</option>
          <option value="profit">Profit/Loss</option>
          <option value="returns">Returns (%)</option>
        </select>
      </div>

      <div className="gross-pl-section">
        <div className="gross-pl">
          Gross P/L (Settled Stocks):{' '}
          <span className={grossPL >= 0 ? 'profit' : 'loss'}>
            {grossPL >= 0 ? `₹${grossPL.toFixed(2)} Profit` : `₹${Math.abs(grossPL).toFixed(2)} Loss`}
          </span>
        </div>
        <button className="details-btn" onClick={() => navigate('/stock-details')}>
           View All Transactions
        </button>
      </div>


      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Stock Name</th>
            <th>P/L</th>
            <th>Returns (%)</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((s, idx) => (
            <tr key={idx}>
              <td>{s.latestDate}</td>
              <td className="link" onClick={() => navigate(`/stock/${encodeURIComponent(s.stockName)}`)}>
                {s.stockName}
              </td>
              <td className={s.profit >= 0 ? 'profit' : 'loss'}>
                {s.activeQty === 0 ? `₹${s.profit.toFixed(2)}` : 'Active'}
              </td>
              <td>{s.returnsPct}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockList;