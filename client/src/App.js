// src/App.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Routes, Route } from 'react-router-dom';

// Import all components
import NavBar from './components/NavBar';
import StockForm from './components/StockForm'; // Used on its own page
import StockList from './components/StockList'; // Used on the main page
import StockDetails from './components/StockDetails';
import StockPage from './components/StockPage';
import AddStockButton from './components/AddStockButton'; // New component

import './App.css';

function App() {
  const [stocks, setStocks] = useState([]);

  // Fetch all stocks from backend
  const fetchStocks = async () => {
    try {
      // Adjusted to use relative path if possible, but keeping localhost for consistency
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
      <div className="main-content-area">
        <Routes>
          {/* Main/Home Page Route: Shows the StockList */}
          <Route
            path="/"
            element={
              <>
                <StockList stocks={stocks} />
                <AddStockButton /> {/* Floating button for the Form page */}
              </>
            }
          />
          {/* Stock Form Route: Shows the StockForm */}
          <Route
            path="/add-stock"
            element={
              <div className="form-page-container">
                <StockForm onAdd={fetchStocks} />
              </div>
            }
          />
          {/* Existing Routes */}
          <Route path="/stock-details" element={<StockDetails stocks={stocks} />} /> 
          <Route path="/stock/:stockName" element={<StockPage stocks={stocks} />} />
        </Routes>
      </div>
    </>
  );
}

export default App;