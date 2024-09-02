import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './css/AddMonthlyPerformanceForm.css'; // Import the CSS file for styling

const AddMonthlyPerformanceForm = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    group_name: '',
    date: new Date(), // Initialize with current date
    banking: '',
    service_fee: '',
    loan_form: '',
    passbook: '',
    office_debt_paid: '',
    office_banking: '',
  });
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prevData => ({
      ...prevData,
      date: date
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const monthName = formData.date.toLocaleString('default', { month: 'long' }); // Get full month name
    const year = formData.date.getFullYear();
  
    const token = localStorage.getItem('token'); // Replace with your token retrieval logic
    const requestBody = { ...formData, month: monthName, year };
  
    // console.log('Submitting data:', requestBody);
  
    try {
      const response = await fetch(`${apiUrl}/monthly_performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
  
    //   console.log('Response status:', response.status);
    //   console.log('Response headers:', [...response.headers.entries()]);
  
      if (response.ok) {
        const result = await response.json();
        // console.log('Response body:', result);
        onAdd(result);
        onClose();
        window.location.reload();
      } else {
        const errorText = await response.text();
        console.error('Failed to add monthly performance:', response.status, response.statusText, errorText);
      }
    } catch (error) {
      // console.error('Error:', error);
    }
  };
  

  return (
    <div className="form-overlay">
      <div className="form-container">
        <h2>Add Monthly Performance</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Group Name:
            <input
              type="text"
              name="group_name"
              value={formData.group_name}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Month & Year:
            <DatePicker
              selected={formData.date}
              onChange={handleDateChange}
              dateFormat="MM/yyyy"
              showMonthYearPicker
              className="datepicker"
              placeholderText="Select month and year"
            />
          </label>
          <label>
            Banking:
            <input
              type="number"
              name="banking"
              value={formData.banking}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Service Fee:
            <input
              type="number"
              name="service_fee"
              value={formData.service_fee}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Loan Form:
            <input
              type="number"
              name="loan_form"
              value={formData.loan_form}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            PassBook:
            <input
              type="number"
              name="passbook"
              value={formData.passbook}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Office Debt Paid:
            <input
              type="number"
              name="office_debt_paid"
              value={formData.office_debt_paid}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Office Banking:
            <input
              type="number"
              name="office_banking"
              value={formData.office_banking}
              onChange={handleChange}
              required
            />
          </label>
          <div className="form-buttons">
            <button type="submit" className="submit-button">Add Performance</button>
            <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMonthlyPerformanceForm;
