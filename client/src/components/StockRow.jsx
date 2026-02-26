import React from 'react';

const StockRow = ({ stock }) => {
  return (
<tr key={idx}>
  {/* Buy entry */}
  <td>{buy?.date || ''}</td>
  <td>{buy ? `₹${parseFloat(buy.price).toFixed(2)}` : ''}</td>
  <td>{buy?.quantity || ''}</td>
  <td>{buy?.charges || ''}</td>
  <td>{buy ? `₹${formatTotal(buy.price, buy.quantity, buy.charges)}` : ''}</td>

  {/* Sell entry */}
  <td>{sell?.date || ''}</td>
  <td>{sell ? `₹${parseFloat(sell.price).toFixed(2)}` : ''}</td>
  <td>{sell?.quantity || ''}</td>
  <td>{sell?.charges || ''}</td>
  <td>{sell ? `₹${formatTotal(sell.price, sell.quantity, sell.charges)}` : ''}</td>
</tr>
  );
};

export default StockRow;
