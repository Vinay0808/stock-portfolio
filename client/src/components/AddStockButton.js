// src/components/AddStockButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AddStockButton.css'; // New CSS file

const AddStockButton = () => {
  const navigate = useNavigate();
  
  return (
    <button 
      className="add-stock-fixed-btn" 
      onClick={() => navigate('/add-stock')}
      title="Add New Stock Entry"
    >
      + Add Stock
    </button>
  );
};

export default AddStockButton;