// src/components/NavBar.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from '../utils/axiosInstance';
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
      const res = await axios.get('/api/funds');
      setFunds(res.data);
    } catch (error) {
      console.error('Error fetching funds:', error);
    }
  };

  const fetchCapital = async () => {
    try {
      const res = await axios.get('/api/capital');
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
        await axios.post('/api/capital', {
          amount: Number(form.amount),
        });
        fetchCapital();
      } else {
        if (!form.date || !form.comment) {
          alert("Please fill all fields");
          return;
        }

        if (editId) {
          await axios.put(`/api/funds/${editId}`, form);
          setEditId(null);
        } else {
          await axios.post('/api/funds', form);
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
      await axios.delete(`/api/funds/${id}`);
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
      ES: ₹{es.toFixed(2)} {es >= 0 ? '↑' : '↓'}
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
