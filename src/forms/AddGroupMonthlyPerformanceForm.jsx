import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './css/AddGroupMonthlyPerformanceForm.css'; // Import the CSS file for styling

const AddGroupMonthlyPerformanceForm = ({ onClose, group_id, token, group_name }) => {
    // console.log("Received props in AddGroupMonthlyPerformanceForm:", { group_id, group_name });
    // Initialize state with the received group_id and groupName
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [formData, setFormData] = useState({
        group_id: group_id || '', // Use the passed group_id
        member_details: '',
        group_name: group_name || '', // Set the group_name from props
        date: new Date(), // Initialize with current date
        savings_shares_bf: '',
        loan_balance_bf: '',
        total_paid: '',
        this_month_shares: '',
        fine_and_charges: '',
    });

    useEffect(() => {
        // Log groupName to see if it's received correctly
        // console.log('Received groupName prop:', group_name);

        setFormData(prev => ({
            ...prev,
            group_name: group_name || '' // Update group_name if groupName prop changes
        }));
    }, [group_name]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date) => {
        setFormData(prev => ({
            ...prev,
            date: date
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const monthName = formData.date.toLocaleString('default', { month: 'long' }); // Get full month name
        const year = formData.date.getFullYear();

        const requestBody = { 
            ...formData, 
            month: monthName, 
            year 
        };

        // console.log('Submitting data:', requestBody);

        try {
            const response = await axios.post(`${apiUrl}/group_performances`, requestBody, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            // console.log('Success:', response.data);
            onClose(); // Close the form on successful submission
        } catch (error) {
            // console.error('Error:', error.response?.data || error.message); // Log detailed error response
            alert(`Error: ${error.response?.data?.error || 'An unexpected error occurred.'}`);
        }
    };

    return (
        <div className="form-overlay">
            <div className="form-container">
                <h2>Add Group Monthly Performance</h2>
                <form onSubmit={handleSubmit}>
                    {/* Hidden field for group_id */}
                    <input 
                        type="hidden" 
                        name="group_id" 
                        value={formData.group_id} 
                    />
                    <label>
                        Member Details:
                        <input 
                            type="text" 
                            name="member_details" 
                            value={formData.member_details} 
                            onChange={handleChange} 
                            required 
                        />
                    </label>
                    <label>
                        Group Name:
                        <input 
                            type="text" 
                            name="group_name" 
                            value={formData.group_name} 
                            readOnly 
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
                        Savings Shares Before:
                        <input 
                            type="number" 
                            name="savings_shares_bf" 
                            value={formData.savings_shares_bf} 
                            onChange={handleChange} 
                            required 
                        />
                    </label>
                    <label>
                        Loan Balance Before:
                        <input 
                            type="number" 
                            name="loan_balance_bf" 
                            value={formData.loan_balance_bf} 
                            onChange={handleChange} 
                            required 
                        />
                    </label>
                    <label>
                        Total Paid:
                        <input 
                            type="number" 
                            name="total_paid" 
                            value={formData.total_paid} 
                            onChange={handleChange} 
                            required 
                        />
                    </label>
                    <label>
                        This Month Shares:
                        <input 
                            type="number" 
                            name="this_month_shares" 
                            value={formData.this_month_shares} 
                            onChange={handleChange} 
                            required 
                        />
                    </label>
                    <label>
                        Fine and Charges:
                        <input 
                            type="number" 
                            name="fine_and_charges" 
                            value={formData.fine_and_charges} 
                            onChange={handleChange} 
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

export default AddGroupMonthlyPerformanceForm;
