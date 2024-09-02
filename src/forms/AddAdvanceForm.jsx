import React, { useState, useEffect } from 'react';
import './css/AddAdvanceForm.css'; // Import the CSS file for styling

const AddAdvanceForm = ({ onClose, onAdd, groupId }) => { // Receive groupId as prop
  const [formData, setFormData] = useState({
    member_name: '',
    initial_amount: ''
  });

  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  // Retrieve the token from localStorage
  const getToken = () => localStorage.getItem('authToken');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(`${apiUrl}/member_details`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          const uniqueMembers = Array.from(new Set(result.map(member => member.toLowerCase())));
          setMembers(uniqueMembers);
          setFilteredMembers(uniqueMembers);
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch members:', response.status, response.statusText, errorText);
        }
      } catch (error) {
        // console.error('Error fetching members:', error);
      }
    };

    fetchMembers();
  }, [apiUrl]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    if (name === 'member_name') {
      setFilteredMembers(members.filter(member =>
        member.toLowerCase().includes(value.toLowerCase())
      ));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Include groupId in the request body
      const response = await fetch(`${apiUrl}/advances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ ...formData, group_id: groupId }) // Add group_id to the form data
      });

      if (response.ok) {
        const result = await response.json();
        onAdd(result);
        onClose();
      } else {
        const errorText = await response.text();
        console.error('Failed to add advance:', response.status, response.statusText, errorText);
      }
    } catch (error) {
      // console.error('Error:', error);
    }
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        <h2>Add New Advance</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Member Name:
            <input
              type="text"
              name="member_name"
              value={formData.member_name}
              onChange={handleChange}
              list="member-list"
              required
            />
            <datalist id="member-list">
              {filteredMembers.map((member, index) => (
                <option key={index} value={member} />
              ))}
            </datalist>
          </label>
          <label>
            Initial Amount:
            <input
              type="number"
              name="initial_amount"
              value={formData.initial_amount}
              onChange={handleChange}
              required
            />
          </label>
          <div className="form-buttons">
            <button type="submit" className="submit-button">Add Advance</button>
            <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdvanceForm;
