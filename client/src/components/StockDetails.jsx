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
