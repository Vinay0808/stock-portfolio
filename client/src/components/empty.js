//Nav bar

// src/components/NavBar.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/NavBar.css';

const NavBar = () => {
  const [funds, setFunds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', amount: '', comment: '' });
  const [editId, setEditId] = useState(null);
  const [capital, setCapital] = useState(0);  // Current capital
  const [isCapitalMode, setIsCapitalMode] = useState(false); // Toggle state
  const popupRef = useRef();


  /*Enter to next */
  const dateRef = useRef();
const amountRef = useRef();
const commentRef = useRef();
const capitalRef = useRef();
const submitRef = useRef();

  useEffect(() => {
    fetchFunds();
    fetchCapital();

    const handleClickOutside = (e) => {
      if (showForm && popupRef.current && !popupRef.current.contains(e.target)) {
        setShowForm(false);
        setForm({ date: '', amount: '', comment: '' });
        setEditId(null);
        setIsCapitalMode(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showForm]);
useEffect(() => {
  if (showForm) {
    setTimeout(() => {
      if (isCapitalMode) {
        capitalRef.current?.focus();
      } else {
        dateRef.current?.focus();
      }
    }, 0);
  }
}, [showForm, isCapitalMode]);

  const fetchFunds = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/funds');
      setFunds(res.data);
    } catch (error) {
      console.error('Error fetching funds:', error);
    }
  };

  const fetchCapital = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/capital');
      setCapital(res.data?.amount || 0);
    } catch (err) {
      console.error('Error fetching capital:', err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.amount) {
      alert("Please fill in the amount.");
      return;
    }

    try {
      if (isCapitalMode) {
        // Save capital
        await axios.post('http://localhost:5000/api/capital', {
          amount: Number(form.amount),
        });
        fetchCapital();
      } else {
        if (!form.date || !form.comment) {
          alert("Please fill all fields");
          return;
        }

        if (editId) {
          await axios.put(`http://localhost:5000/api/funds/${editId}`, form);
          setEditId(null);
        } else {
          await axios.post('http://localhost:5000/api/funds', form);
        }

        fetchFunds();
      }

      setForm({ date: '', amount: '', comment: '' });
      setShowForm(false);
    } catch (err) {
      console.error('Error submitting data:', err.response?.data || err.message);
      alert('Submission failed. Check console.');
    }
  };

  const handleClear = () => {
    setForm({ date: '', amount: '', comment: '' });
    setEditId(null);
  };

  const handleEdit = (fund) => {
    setForm({ date: fund.date, amount: fund.amount, comment: fund.comment });
    setEditId(fund._id);
    setIsCapitalMode(false);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this fund?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/funds/${id}`);
      fetchFunds();
    } catch (err) {
      console.error('Error deleting fund:', err);
      alert('Failed to delete fund. See console.');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
{(() => {
  const totalFunds = funds.reduce((sum, f) => sum + Number(f.amount), 0);
  const es = capital - totalFunds ;
  return (
    <span className={`es ${es >= 0 ? 'positive' : 'negative'}`}>
      ES: ₹{es} {es >= 0 ? '↑' : '↓'}
    </span>
  );
})()}

      </div>
      <div className="navbar-center">
        <h2>Stock Portfolio</h2>
      </div>
      <div className="navbar-right">
        <button className="add-funds-btn" onClick={() => setShowForm(true)}>
          + Add Funds
        </button>
      </div>

      {showForm && (
        <div className="popup-overlay">
          <div className="funds-popup" ref={popupRef}>
            <div className="popup-header">
              <h3>{isCapitalMode ? 'Set Current Capital' : editId ? 'Edit Fund' : 'Add Fund'}</h3>
              <div className="toggle-wrapper">
                <label className="switch">
                  <input type="checkbox" checked={isCapitalMode} onChange={() => {
                    setIsCapitalMode(!isCapitalMode);
                    setEditId(null);
                    setForm({ date: '', amount: '', comment: '' });
                  }} />
                  <span className="slider"></span>
                </label>
                <span>{isCapitalMode ? 'Capital Mode' : 'Fund Mode'}</span>
              </div>
            </div>

            <div className="fund-form">
              {isCapitalMode ? (
                <>
                  <input
                    type="number"
                    name="amount"
                    placeholder="Current Capital"
                    value={form.amount}
                    onChange={handleChange}
                    ref={capitalRef}
                    onKeyDown={(e) => e.key === 'Enter' && submitRef.current.focus()}
                  />
                  <div className='current-capital-display'>
                    Current Capital: ₹{capital}
                  </div>
                </>
              ) : (
                <>
                  <input type="date" name="date" value={form.date} onChange={handleChange} max={new Date().toISOString().split('T')[0]}
                   ref={dateRef} onKeyDown={(e) => e.key === 'Enter' && amountRef.current.focus()}/>
                  <input type="number" name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} ref={amountRef} onKeyDown={(e) => e.key === 'Enter' && commentRef.current.focus()} />
                  <input type="text" name="comment" placeholder="Comment" value={form.comment} onChange={handleChange} ref={commentRef} onKeyDown={(e) => e.key === 'Enter' && submitRef.current.focus()}/>
                </>
              )}
              <button ref={submitRef} onClick={handleSubmit}>{isCapitalMode ? 'Save' : editId ? 'Update' : 'Submit'}</button>
              <button onClick={handleClear}>Clear</button>
            </div>

            {!isCapitalMode && (
              <div className="funds-list">
                {funds.map((fund) => (
                  <div key={fund._id} className="fund-item">
                    <span>{fund.date}</span>
                    <span>₹{fund.amount}</span>
                    <span>{fund.comment}</span>
                    <button onClick={() => handleEdit(fund)}>Edit</button>
                    <button onClick={() => handleDelete(fund._id)}>Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;






//stock details


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/StockDetails.css';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const StockDetails = () => {
  const [stocks, setStocks] = useState([]);
  const [sortedStocks, setSortedStocks] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectMultiple, setSelectMultiple] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteAllChecked, setDeleteAllChecked] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAllStocks();
  }, []);

  useEffect(() => {
    let sorted = [...stocks];
    switch (sortBy) {
      case 'date':
        sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'stockName':
        sorted.sort((a, b) => (a.stockName || a.companyName).localeCompare(b.stockName || b.companyName));
        break;
      case 'price':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'quantity':
        sorted.sort((a, b) => b.quantity - a.quantity);
        break;
      case 'charges':
        sorted.sort((a, b) => b.charges - a.charges);
        break;
      case 'type':
        sorted.sort((a, b) => a.type.localeCompare(b.type));
        break;
      default:
        break;
    }
    setSortedStocks(sorted);
  }, [stocks, sortBy]);

  const fetchAllStocks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/stocks');
      setStocks(res.data);
    } catch (err) {
      console.error('Error fetching stock details:', err);
    }
  };

  const handleEditClick = (stock) => {
    setEditingId(stock._id);
    setEditForm({
      _id: stock._id,
      date: stock.date || '',
      stockName: stock.stockName || stock.companyName || '',
      sector: stock.sector || '',
      price: stock.price || '',
      quantity: stock.quantity || '',
      charges: stock.charges || '',
      type: stock.type || 'Buy',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'quantity' && editForm.type === 'Sell') {
      const newQty = parseInt(value) || 0;
      const stockKey = editForm.stockName;

      const buyQty = stocks
        .filter(s => (s.stockName || s.companyName) === stockKey && s.type === 'Buy')
        .reduce((sum, s) => sum + parseInt(s.quantity || 0), 0);

      const sellQtyExclCurrent = stocks
        .filter(s => (s.stockName || s.companyName) === stockKey && s.type === 'Sell' && s._id !== editForm._id)
        .reduce((sum, s) => sum + parseInt(s.quantity || 0), 0);

      const remaining = buyQty - sellQtyExclCurrent;

      if (newQty > remaining) {
        alert(`Sell quantity exceeds available shares. Max allowed: ${remaining}`);
        return;
      }
    }

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    const { date, stockName, sector, price, quantity, charges, type, _id } = editForm;

    if (!date || !stockName || !sector || !price || !quantity || !type) {
      alert("All fields are required.");
      return;
    }

    const updatedPayload = {
      date,
      companyName: stockName,
      sector,
      price,
      quantity,
      charges,
      type,
    };

    try {
      await axios.put(`http://localhost:5000/api/stocks/${_id}`, updatedPayload);

      setEditingId(null);
      setEditForm({});
      fetchAllStocks();
    } catch (err) {
      console.error("Error updating stock:", err.message);
      alert("Update failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this stock entry?")) {
      try {
        await axios.delete(`http://localhost:5000/api/stocks/${id}`);
        fetchAllStocks();
      } catch (err) {
        console.error('Error deleting stock:', err);
      }
    }
  };

  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(stocks);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stocks');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'StockData.xlsx');
  };

  const handleDeleteMultiple = async () => {
    if (deleteAllChecked) {
      if (window.confirm("Delete ALL stock entries?")) {
        for (let stock of stocks) {
          await axios.delete(`http://localhost:5000/api/stocks/${stock._id}`);
        }
      }
    } else if (selectedIds.length > 0) {
      if (window.confirm("Delete selected stock entries?")) {
        for (let id of selectedIds) {
          await axios.delete(`http://localhost:5000/api/stocks/${id}`);
        }
      }
    }
    setShowDeleteModal(false);
    setDeleteAllChecked(false);
    setSelectedIds([]);
    fetchAllStocks();
  };

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const totalCharges = stocks.reduce((sum, stock) => sum + parseFloat(stock.charges || 0), 0);
  const grossTotal = stocks.reduce(
    (sum, stock) => sum + parseFloat(stock.price || 0) * parseFloat(stock.quantity || 0),
    0
  );
  const totalUnique = [...new Set(stocks.map((stock) => stock.stockName || stock.companyName))].length;

  return (
    <div className="stock-details">
      <button className="fixed-home-btn" onClick={() => navigate('/')}>⬅ Home</button>

      <div className="details-header">
        <h2>All Stock Details</h2>
      </div>

      <div className="stats">
        <span className="total-unique">Traded Companies: <strong>{totalUnique}</strong></span>
        <span className="gross-total">Traded Value: <strong>₹{grossTotal.toFixed(2)}</strong></span>
        <span className="total-charges">Total Charges: <strong>₹{totalCharges.toFixed(2)}</strong></span>
        <button className="download-btn" onClick={handleDownload}>⬇ Download Excel</button>
                    
                <select
                  value={sortBy}
                  className="sort-dropdown"
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ marginTop: '4px', fontSize: '12px' }}
                >
                  <option value="">-- Sort By --</option>
                  <option value="date">Date</option>
                  <option value="stockName">Stock Name</option>
                  <option value="price">Price</option>
                  <option value="quantity">Quantity</option>
                  <option value="charges">Charges</option>
                  <option value="type">Type</option>
                </select>
             
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Stock Name</th>
            <th>Sector</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Charges</th>
            <th>Type</th>
            <th>Total</th>
            <th>
              Actions

              <button className="bulk-delete-btn" onClick={() => setShowDeleteModal(true)}>🗑️</button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedStocks.map((stock) =>
            editingId === stock._id ? (
              <tr key={stock._id}>
                <td><input type="date" name="date" value={editForm.date} onChange={handleInputChange} /></td>
                <td><input name="stockName" value={editForm.stockName} onChange={handleInputChange} /></td>
                <td><input name="sector" value={editForm.sector} onChange={handleInputChange} /></td>
                <td><input name="price" type="number" value={editForm.price} onChange={handleInputChange} /></td>
                <td><input name="quantity" type="number" value={editForm.quantity} onChange={handleInputChange} /></td>
                <td><input name="charges" type="number" value={editForm.charges} onChange={handleInputChange} /></td>
                <td>
                  <select name="type" value={editForm.type} onChange={handleInputChange}>
                    <option value="Buy">Buy</option>
                    <option value="Sell">Sell</option>
                  </select>
                </td>
                <td>₹{(parseFloat(editForm.price || 0) * parseFloat(editForm.quantity || 0)).toFixed(2)}</td>
                <td>
                  <button className="save-btn" onClick={handleUpdate}>Save</button>
                  <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                </td>
              </tr>
            ) : (
              <tr key={stock._id}>
                <td>{stock.date}</td>
                <td
                  style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }}
                  onClick={() => navigate(`/stock/${encodeURIComponent(stock.stockName || stock.companyName)}`)}
                >
                  {stock.stockName || stock.companyName}
                </td>
                <td>{stock.sector}</td>
                <td>₹{parseFloat(stock.price || 0).toFixed(2)}</td>
                <td>{stock.quantity}</td>
                <td>{stock.charges}</td>
                <td className={stock.type === 'Buy' ? 'buy' : 'sell'}>{stock.type}</td>
                <td>₹{(parseFloat(stock.price || 0) * parseFloat(stock.quantity || 0)).toFixed(2)}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEditClick(stock)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(stock._id)}>Delete</button>
                  {selectMultiple && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(stock._id)}
                      onChange={() => toggleSelection(stock._id)}
                    />
                  )}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Options</h3>
            <label>
              <input
                type="checkbox"
                checked={deleteAllChecked}
                onChange={() => {
                  setDeleteAllChecked(!deleteAllChecked);
                  setSelectMultiple(false);
                  setSelectedIds([]);
                  setShowDeleteModal(false);
                }}
              />
              Delete All
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                checked={selectMultiple}
                onChange={() => {
                  setSelectMultiple(!selectMultiple);
                  setDeleteAllChecked(false);
                  setSelectedIds([]);
                  setShowDeleteModal(false);
                }}
              />
              Select Multiple
            </label>
            <div className="modal-actions">
              <button className="delete-btn" onClick={handleDeleteMultiple}>Delete</button>
              <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockDetails;





//stock form


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/StockForm.css';

const StockForm = ({ onAdd }) => {
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

  const [stockNames, setStockNames] = useState([]);
  const [sectorOptions, setSectorOptions] = useState([
    'IT', 'Finance', 'Telecom','Pharma', 'Energy', 'Auto', 'FMCG', 'Banking','Food App','Core','Oil & Gas','Logistics','Trading'
  ]);

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
      // Validate quantity for Sell type
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
          alert(`You only have ${activeQty} active shares. Cannot sell ${enteredQty}.`);
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
    } catch (error) {
      console.error('Submit error:', error.response?.data || error.message);
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

  return (
    <form className="stock-form" onSubmit={handleSubmit}>
      <h3>Add Stock</h3>

      <label>Date:</label>
      <input
        type="date"
        value={form.date}
        max={new Date().toISOString().split('T')[0]}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
        required
      />

      <label>Stock Name Type:</label>
      <label className="switch">
        <input
          type="checkbox"
          checked={!form.isNew}
          onChange={(e) => setForm({ ...form, isNew: !e.target.checked, stockName: '' })}
        />
        <span className="slider round"></span>
      </label>
      <span>{form.isNew ? 'New' : 'Existing'}</span>

      {form.isNew ? (
        <>
          <label>Enter New Stock Name:</label>
          <input
            type="text"
            value={form.stockName}
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

      <label>Price:</label>
      <input
        type="number"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        required
      />

      <label>Quantity:</label>
      <input
        type="number"
        value={form.quantity}
        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        required
      />

      <label>Charges:</label>
      <input
        type="number"
        value={form.charges}
        onChange={(e) => setForm({ ...form, charges: e.target.value })}
      />

      <label>Type:</label>
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
        <button type="submit" className="submit-btn">Submit</button>
        <button type="button" onClick={handleClear} className="clear-btn">Clear</button>
      </div>
    </form>
  );
};

export default StockForm;



//stocklist

import React, { useEffect, useState } from 'react';
import '../styles/StockList.css';
import { useNavigate } from 'react-router-dom';

const StockList = ({ stocks }) => {
  const [summary, setSummary] = useState([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (stocks && stocks.length > 0) {
      summarizeStocks();
    } else {
      setSummary([]);
    }
  }, [stocks, search, sortKey]);

  const summarizeStocks = () => {
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

  return (
    <div className="stock-list">
      <button className="fixed-details-btn" onClick={() => navigate('/stock-details')}>
        📋 Details
      </button>

      <h3>Stock List</h3>

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

      <table>
        <thead>
          <tr>
            <th>Recent Date</th>
            <th>Stock Name</th>
            <th>Profit/Loss</th>
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





//stock page

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
        const filtered = res.data.filter(stock => (stock.stockName || stock.companyName) === stockName);
        setStockData(filtered);
      } catch (err) {
        console.error('Error fetching stock:', err);
      }
    };

    fetchStockData();
  }, [stockName]);

  const buyEntries = stockData.filter(entry => entry.type === 'Buy');
  const sellEntries = stockData.filter(entry => entry.type === 'Sell');
  const maxLength = Math.max(buyEntries.length, sellEntries.length);

  const calculateTotal = (entries, isSell = false) => {
    return entries.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const qty = parseInt(item.quantity) || 0;
      const charges = parseFloat(item.charges) || 0;
      const total = isSell ? (price * qty - charges) : (price * qty + charges);
      return sum + total;
    }, 0);
  };

  const totalBuyValue = calculateTotal(buyEntries, false);
  const totalSellValue = calculateTotal(sellEntries, true);
  const profitLoss = totalSellValue - totalBuyValue;

  const formatTotal = (price, quantity, charges, isSell = false) => {
    const total = isSell
      ? (parseFloat(price) * parseInt(quantity)) - parseFloat(charges || 0)
      : (parseFloat(price) * parseInt(quantity)) + parseFloat(charges || 0);
    return total.toFixed(2);
  };

  const totalBuyQty = buyEntries.reduce((sum, entry) => sum + parseInt(entry.quantity || 0), 0);
  const totalSellQty = sellEntries.reduce((sum, entry) => sum + parseInt(entry.quantity || 0), 0);
  const activeQuantity = totalBuyQty - totalSellQty;

  return (
    <div className="stock-page">
      <button className="fixed-back-btn" onClick={() => navigate(-1)}>⬅ Back</button>

      <div className="stock-header">
        <h2>{stockName} - Detailed View</h2>

        <div className="summary-info">
          {activeQuantity === 0 && (
            <span className={`profit-loss ${profitLoss >= 0 ? 'profit' : 'loss'}`}>
              {profitLoss >= 0
                ? `Profit: ₹${profitLoss.toFixed(2)}`
                : `Loss: ₹${Math.abs(profitLoss).toFixed(2)}`}
            </span>
          )}

          <span className="active-quantity">
            Active Quantity: <strong>{activeQuantity}</strong>
          </span>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="stock-table">
          <thead>
            <tr className="header-totals">
              <th colSpan="5" className="buy-header">Buy Total: ₹{totalBuyValue.toFixed(2)}</th>
              <th colSpan="5" className="sell-header">Sell Total: ₹{totalSellValue.toFixed(2)}</th>
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
            </tr>
          </thead>
          <tbody>
            {[...Array(maxLength)].map((_, idx) => {
              const buy = buyEntries[idx];
              const sell = sellEntries[idx];
              return (
                <tr key={idx}>
                  <td>{buy?.date || ''}</td>
                  <td>{buy ? `₹${parseFloat(buy.price).toFixed(2)}` : ''}</td>
                  <td>{buy?.quantity || ''}</td>
                  <td>{buy?.charges || ''}</td>
                  <td>{buy ? `₹${formatTotal(buy.price, buy.quantity, buy.charges)}` : ''}</td>

                  <td>{sell?.date || ''}</td>
                  <td>{sell ? `₹${parseFloat(sell.price).toFixed(2)}` : ''}</td>
                  <td>{sell?.quantity || ''}</td>
                  <td>{sell?.charges || ''}</td>
                  <td>{sell ? `₹${formatTotal(sell.price, sell.quantity, sell.charges, true)}` : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockPage;



//stock row

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










//ROUTES

//capital routes

// routes/capitalRoutes.js
const express = require('express');
const router = express.Router();
const Capital = require('../models/Capital');  // Make sure path is correct

// GET current capital
router.get('/', async (req, res) => {
  try {
    const latest = await Capital.findOne().sort({ createdAt: -1 });
    res.json(latest || { amount: 0 });
  } catch (err) {
    console.error("Error in GET /capital:", err); // add logging
    res.status(500).json({ error: 'Failed to fetch capital' });
  }
});

// POST or update capital
router.post('/', async (req, res) => {
  try {
    const { amount } = req.body;

    await Capital.deleteMany({}); // replace previous entry

    const newCapital = new Capital({ amount });
    await newCapital.save();

    res.json({ message: 'Capital saved', capital: newCapital });
  } catch (err) {
    console.error("Error in POST /capital:", err); // add logging
    res.status(500).json({ error: 'Failed to save capital' });
  }
});

module.exports = router;


///fund routes

const express = require('express');
const router = express.Router();
const Fund = require('../models/Fund');
const Capital = require('../models/Capital');

// Get all funds
router.get('/', async (req, res) => {
  try {
    const funds = await Fund.find().sort({ date: -1 });
    res.json(funds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new fund
router.post('/', async (req, res) => {
  try {
    const newFund = new Fund(req.body);
    await newFund.save();
    res.status(201).json(newFund);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a fund
router.put('/:id', async (req, res) => {
  try {
    const updated = await Fund.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a fund
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Fund.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted', deleted });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;


////stcok routes

const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock');

// POST: Save new stock
router.post('/', async (req, res) => {
  try {
    const newStock = new Stock(req.body);
    await newStock.save();
    res.status(201).json(newStock);
  } catch (err) {
    console.error('Error in POST /api/stocks:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// GET: All stocks
router.get('/', async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET: Unique fields (stockNames + sectors)
router.get('/unique-fields', async (req, res) => {
  try {
    const stocks = await Stock.find({}, 'companyName sector');
    const stockNames = [...new Set(stocks.map(s => s.companyName).filter(Boolean))];
    const sectors = [...new Set(stocks.map(s => s.sector).filter(Boolean))];
    res.json({ stockNames, sectors });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch unique fields' });
  }
});

// PUT: Update a stock by ID ✅
// PUT: Update a stock by ID ✅
router.put('/:id', async (req, res) => {
  try {
    const updatedStock = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedStock) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    res.json(updatedStock);
  } catch (err) {
    console.error('Error updating stock:', err.message);
    res.status(500).json({ error: 'Error updating stock' });
  }
});


// DELETE: single stock by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Stock.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting stock:', err.message);
    res.status(500).json({ error: 'Server error while deleting stock' });
  }
});

// DELETE: multiple stocks by IDs
router.post('/delete-multiple', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: 'Invalid request: ids must be an array' });
    }

    const result = await Stock.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error('Error deleting multiple stocks:', err.message);
    res.status(500).json({ error: 'Server error while deleting stocks' });
  }
});

module.exports = router;




///models

//capital model
// models/Capital.js
const mongoose = require('mongoose');

const capitalSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Capital', capitalSchema);


///fund model

// models/Fund.js
const mongoose = require('mongoose');

const fundSchema = new mongoose.Schema({
  date: { type: String, required: true },
  amount: { type: Number, required: true },
  comment: { type: String }
});

module.exports = mongoose.model('Fund', fundSchema);



///stock model

const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  date: String,
  companyName: { type: String, required: true },
  sector: String,
  price: Number,
  charges: Number,
  quantity: Number,
  type: String,
});

module.exports = mongoose.models.Stock || mongoose.model('Stock', stockSchema);










//server

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Routes
const stockRoutes = require('./routes/stocks');
const fundRoutes = require('./routes/fundsRoutes');
const capitalRoutes = require('./routes/capitalRoutes');

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// MongoDB config
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stockPortfolio', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Use Routes
app.use('/api/stocks', stockRoutes);
app.use('/api/funds', fundRoutes);
app.use('/api/capital', capitalRoutes);

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));




/////.env
MONGO_URI=mongodb://localhost:27017/stockPortfolio



///app.js
// src/App.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Routes, Route } from 'react-router-dom';

import NavBar from './components/NavBar';
import StockForm from './components/StockForm';
import StockList from './components/StockList';
import StockDetails from './components/StockDetails';
import StockPage from './components/StockPage';

import './App.css';

function App() {
  const [stocks, setStocks] = useState([]);

  // Fetch all stocks from backend
  const fetchStocks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/stocks');
      setStocks(res.data);
    } catch (err) {
      console.error('Error fetching stocks:', err);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  return (
    <>
      <NavBar stocks={stocks} />
      <Routes>
        <Route
          path="/"
          element={
            <div className="main-container">
              <div className="form-section">
                <StockForm onAdd={fetchStocks} />
              </div>
              <div className="list-section">
                <StockList stocks={stocks} />
              </div>
            </div>
          }
        />
        <Route
          path="/stock-details"
          element={<StockDetails />}
        />
        <Route
          path="/stock/:stockName"
          element={<StockPage />}
        />
      </Routes>
    </>
  );
}

export default App;

