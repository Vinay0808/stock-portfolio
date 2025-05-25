import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StockForm = () => {
  const [stocks, setStocks] = useState([]);
  const [editId, setEditId] = useState(null);
  const [stockNames, setStockNames] = useState([]);
  const [isNewStock, setIsNewStock] = useState(true);
  const [formData, setFormData] = useState({
    date: '',
    stockName: '',
    price: '',
    charges: '',
    quantity: '',
    type: ''
  });

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    const response = await axios.get('http://localhost:5000/api/stocks');
    setStocks(response.data);

    const uniqueNames = [...new Set(response.data.map(stock => stock.stockName))];
    setStockNames(uniqueNames);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await axios.put(`http://localhost:5000/api/stocks/${editId}`, formData);
      setEditId(null);
    } else {
      await axios.post('http://localhost:5000/api/stocks', formData);
    }
    fetchStocks();
    clearForm();
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/stocks/${id}`);
    fetchStocks();
  };

  const handleEdit = (stock) => {
    setFormData(stock);
    setEditId(stock._id);
    setIsNewStock(true);
  };

  const clearForm = () => {
    setFormData({
      date: '',
      stockName: '',
      price: '',
      charges: '',
      quantity: '',
      type: ''
    });
    setEditId(null);
    setIsNewStock(true);
  };

  return (
    <div id="form-d">
      <h1>Stock Manager</h1>
      <div className="container">
        <div id="form-data">
          <form onSubmit={handleSubmit}>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
            
            {/* Toggle for New/Old StockName */}
            <label>
              <input
                type="checkbox"
                checked={!isNewStock}
                onChange={() => setIsNewStock(prev => !prev)}
              />
              {isNewStock ? 'Old' : 'New'}
            </label>

            {isNewStock ? (
              <input
                type="text"
                name="stockName"
                value={formData.stockName}
                onChange={handleChange}
                placeholder="Stock Name"
                required
              />
            ) : (
              <select
                name="stockName"
                value={formData.stockName}
                onChange={handleChange}
                required
              >
                <option value="">Select Stock</option>
                {stockNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            )}

            <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} placeholder="Price" required />
            <input type="number" step="0.01" name="charges" value={formData.charges} onChange={handleChange} placeholder="Charges" required />
            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Quantity" required />
  
            <label>
              <input type="radio" name="type" value="Buy" checked={formData.type === 'Buy'} onChange={handleChange} required />
              Buy
            </label>
            <label>
              <input type="radio" name="type" value="Sell" checked={formData.type === 'Sell'} onChange={handleChange} required />
              Sell
            </label>
  
            <button type="submit">{editId ? 'Update' : 'Submit'}</button>
            <button type="button" onClick={clearForm}>Clear</button>
            <a href="http://localhost:5000/api/download" download>
              <button type="button">Download All Data</button>
            </a>
          </form>
        </div>
  
        <div id="form-btns">
          <ul>
            {stocks.map(stock => (
              <li key={stock._id}>
                <div id="list-area">
                  <button onClick={() => handleEdit(stock)}>Edit</button>
                  <button onClick={() => handleDelete(stock._id)}>Delete</button>
                </div>
                <div id="list-area">
                  {stock.stockName} - {stock.date} - ₹{stock.price} - Charges: ₹{stock.charges} - Qty: {stock.quantity} - {stock.type}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StockForm;
