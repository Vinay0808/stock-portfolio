import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// We will assume a utility function for unique IDs is available for key purposes, but use index for simplicity here.
import '../styles/StockForm.css';
const StockForm = ({ onAdd }) => {
  // Initialize the navigate function
  const navigate = useNavigate();

  // State for form data
  const [form, setForm] = useState({
    date: '',
    isNew: true,
    stockName: '',
    sector: '',
    price: '',
    charges: '',
    quantity: '',
    type: 'Buy',
  });

  // State for the custom message modal (replacing alert())
  const [message, setMessage] = useState({ text: '', type: '' });
  const showMessage = (text, type) => setMessage({ text, type });
  const closeModal = () => setMessage({ text: '', type: '' });

  const [stockNames, setStockNames] = useState([]);
  const [sectorOptions] = useState([
    'IT', 'Finance', 'Telecom','Pharma', 'Energy', 'Auto', 'FMCG', 'Banking','Food App','Core','Oil & Gas','Logistics','Trading'
  ]);

  // Firebase setup is intentionally omitted here as the provided code uses localhost/axios,
  // but in a real-world multi-user app, this would be handled via Firestore.

  const fetchUniqueFields = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/stocks/unique-fields');
      if (res.data.stockNames) setStockNames(res.data.stockNames);
    } catch (err) {
      console.error('Error fetching unique fields:', err);
    }
  };

  useEffect(() => {
    fetchUniqueFields();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate quantity for Sell type (Existing logic)
      if (form.type === 'Sell') {
        const res = await axios.get('http://localhost:5000/api/stocks');
        const relevantStocks = res.data.filter(
          s => (s.stockName || s.companyName) === form.stockName
        );

        const totalBuy = relevantStocks
          .filter(s => s.type === 'Buy')
          .reduce((sum, s) => sum + parseInt(s.quantity || 0), 0);

        const totalSell = relevantStocks
          .filter(s => s.type === 'Sell')
          .reduce((sum, s) => sum + parseInt(s.quantity || 0), 0);

        const activeQty = totalBuy - totalSell;
        const enteredQty = parseInt(form.quantity);

        if (enteredQty > activeQty) {
          // *** Replaced alert() with showMessage() ***
          showMessage(`You only have ${activeQty} active shares of ${form.stockName}. Cannot sell ${enteredQty}.`, 'error');
          return;
        }
      }

      const payload = {
        ...form,
        companyName: form.stockName,
      };
      delete payload.stockName;

      await axios.post('http://localhost:5000/api/stocks', payload);

      setForm({
        date: '',
        isNew: true,
        stockName: '',
        sector: '',
        price: '',
        charges: '',
        quantity: '',
        type: 'Buy',
      });

      onAdd();
      fetchUniqueFields();
      // *** Added success message via modal ***
      showMessage('Stock entry added successfully!', 'success'); 

    } catch (error) {
      console.error('Submit error:', error.response?.data || error.message);
      showMessage('An error occurred while submitting the stock entry.', 'error');
    }
  };

  const handleClear = () => {
    setForm({
      date: '',
      isNew: true,
      stockName: '',
      sector: '',
      price: '',
      charges: '',
      quantity: '',
      type: 'Buy',
    });
  };

  // Handler for Home button click
  const handleHomeClick = () => {
    // Navigate to the root path (Home Page)
    navigate('/');
  };

  return (
    <div className="p-4 sm:p-8 flex justify-center items-center min-h-screen bg-gray-50">
      {/* Custom Message Modal */}
      {message.text && (
        <div className="message-modal-overlay">
          <div className={`message-modal ${message.type}`}>
            <p>{message.text}</p>
            <button onClick={closeModal} className="modal-close-btn">
              Close
            </button>
          </div>
        </div>
      )}
      
      <form className="stock-form" onSubmit={handleSubmit}>
        
        {/* --- Form Header with Home Button --- */}
        <div className="form-header">
          <h3 className="text-xl font-bold text-gray-800">Add Stock Transaction</h3>
          <button 
            type="button" 
            onClick={handleHomeClick} 
            className="home-btn"
            aria-label="Go to Home Page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 inline-block" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Home
          </button>
        </div>
        {/* ------------------------------------ */}

        <label>Date:</label>
        <input
          type="date"
          value={form.date}
          max={new Date().toISOString().split('T')[0]}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />

        <div className='flex items-center justify-between'>
            <label>Stock Name Type: <span className="text-sm font-normal text-gray-500">({form.isNew ? 'New' : 'Existing'})</span></label>
            <label className="switch">
              <input
                type="checkbox"
                checked={!form.isNew}
                onChange={(e) => setForm({ ...form, isNew: !e.target.checked, stockName: '' })}
              />
              <span className="slider round"></span>
            </label>
        </div>

        {form.isNew ? (
          <>
            <label>Enter New Stock Name:</label>
            <input
              type="text"
              value={form.stockName}
              placeholder="e.g., Apple Inc."
              onChange={(e) => setForm({ ...form, stockName: e.target.value })}
              required
            />
          </>
        ) : (
          <>
            <label>Select Existing Stock Name:</label>
            <select
              value={form.stockName}
              onChange={(e) => setForm({ ...form, stockName: e.target.value })}
              required
            >
              <option value="">Select</option>
              {stockNames.map((name, idx) => (
                <option key={idx} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </>
        )}

        <label>Sector:</label>
        <select
          value={form.sector}
          onChange={(e) => setForm({ ...form, sector: e.target.value })}
          required
        >
          <option value="">Select</option>
          {sectorOptions.map((sector, index) => (
            <option key={index} value={sector}>
              {sector}
            </option>
          ))}
        </select>

        <label>Price (per share):</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={form.price}
          placeholder="0.00"
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />

        <label>Quantity:</label>
        <input
          type="number"
          min="1"
          value={form.quantity}
          placeholder="100"
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          required
        />

        <label>Charges/Brokerage:</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={form.charges}
          placeholder="0.00 (Optional)"
          onChange={(e) => setForm({ ...form, charges: e.target.value })}
        />

        <label>Transaction Type:</label>
        <div className="toggle-section">
          <button
            type="button"
            className={`toggle-button-buy ${form.type === 'Buy' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, type: 'Buy' })}
          >
            Buy
          </button>
          <button
            type="button"
            className={`toggle-button-sell ${form.type === 'Sell' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, type: 'Sell' })}
          >
            Sell
          </button>
        </div>

        <div className="form-buttons">
          <button type="submit" className="submit-btn">Record Transaction</button>
          <button type="button" onClick={handleClear} className="clear-btn">Clear Form</button>
        </div>
      </form>
    </div>
  );
};

export default StockForm;