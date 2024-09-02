import React, { useState, useEffect } from 'react';
import './css/AddMonthlyAdvanceCreditForm.css'; // Import the CSS file for styling

const AddMonthlyAdvanceCreditForm = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    group_id: '',
    group_name: '',
    date: '',
    total_advance_amount: '',
    deductions: ''
  });
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [groupOptions, setGroupOptions] = useState([]);
  const [filteredGroupOptions, setFilteredGroupOptions] = useState([]);

  useEffect(() => {
    const fetchGroupNames = async () => {
      try {
        const response = await fetch(`${apiUrl}/monthly_performance/filter`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (response.ok) {
          const data = await response.json();

          // Ensure data is an array and contains objects with 'id' and 'group_name'
          if (Array.isArray(data)) {
            setGroupOptions(data);
            setFilteredGroupOptions(data);
          } else {
            // console.error('Unexpected data format:', data);
          }
        } else {
          // console.error('Failed to fetch group names');
        }
      } catch (error) {
        // console.error('Error fetching group names:', error);
      }
    };

    fetchGroupNames();
  }, [apiUrl]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    if (name === 'group_name') {
      setFilteredGroupOptions(groupOptions.filter(option =>
        option.group_name && option.group_name.toLowerCase().includes(value.toLowerCase())
      ));
      // Automatically set group_id based on selected group_name
      const selectedGroup = groupOptions.find(option => option.group_name.toLowerCase() === value.toLowerCase());
      if (selectedGroup) {
        setFormData(prevData => ({
          ...prevData,
          group_id: String(selectedGroup.id) // Ensure group_id is a string
        }));
      } else {
        setFormData(prevData => ({
          ...prevData,
          group_id: ''
        }));
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${apiUrl}/monthly_advance_credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        onAdd(result);
        onClose();
      } else {
        const errorText = await response.text();
        console.error('Failed to add record:', response.status, response.statusText, errorText);
      }
    } catch (error) {
      // console.error('Error:', error);
    }
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        <h2>Add Monthly Advance Credit</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Group Name:
            <input
              type="text"
              name="group_name"
              value={formData.group_name}
              onChange={handleChange}
              required
              list="group-names"
            />
            <datalist id="group-names">
              {filteredGroupOptions.map((option, index) => (
                <option key={index} value={option.group_name} />
              ))}
            </datalist>
          </label>
          <label>
            Date:
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Total Advance Amount:
            <input
              type="number"
              name="total_advance_amount"
              value={formData.total_advance_amount}
              onChange={handleChange}
              step="0.01"
              required
            />
          </label>
          <label>
            Deductions:
            <input
              type="number"
              name="deductions"
              value={formData.deductions}
              onChange={handleChange}
              step="0.01"
              required
            />
          </label>
          <div className="form-buttons">
            <button type="submit" className="submit-button">Add Record</button>
            <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMonthlyAdvanceCreditForm;
