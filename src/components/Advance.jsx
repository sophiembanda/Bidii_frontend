import React, {useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave, faPlus, faExpandArrowsAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import './css/Advance.css';
import AddAdvanceForm from '../forms/AddAdvanceForm'; // Import the AddAdvanceForm component
import { useRefresh } from '../components/RefreshContext';

const Advance = ({ groupId }) => {
  const tableContainerRef = useRef(null);
  const [isFormVisible, setFormVisible] = useState(false);
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formGenerationStatus, setFormGenerationStatus] = useState('');
  const [editMode, setEditMode] = useState(null);  // Track which record is being edited
  const [editedPaidAmount, setEditedPaidAmount] = useState(''); // Track the edited paid amount
  const [groupName, setGroupName] = useState('');
  const { triggerRefresh } = useRefresh();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  // useEffect(() => {
    // console.log('Group ID in Advance Component:', groupId);
  // }, [groupId]);
  

  // Memoize fetchAdvances using useCallback
  const fetchAdvances = useCallback(async () => {
    if (!groupId) {
      setError('Group ID is not provided');
      setLoading(false);
      return;
    }

    try {
      const url = `${apiUrl}/advances?group_id=${groupId}`;
      const token = localStorage.getItem('authToken');

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Extract the group_name and advances from the response data
      const { group_name, advances } = response.data;

      // Set the state for advances and optionally for group_name
      setAdvances(advances);
      setGroupName(group_name); // Store the group name if needed in your UI
      setLoading(false);
    } catch (err) {
      setError('Failed to load advances. Please try again later.');
      setLoading(false);
    }
  }, [groupId, apiUrl]); // `groupId` is included as a dependency

  useEffect(() => {
    fetchAdvances();
  }, [fetchAdvances]); // Now `fetchAdvances` is a stable dependency
  

  const handleGenerateForm = async () => {
    if (!groupId) {
      setFormGenerationStatus('Group ID is not provided');
      return;
    }

    try {
      setFormGenerationStatus('Generating form...');
      const url = `${apiUrl}/generate_monthly_form`;
      const token = localStorage.getItem('authToken');

      // Generate form
      const response = await axios.post(url, { group_id: groupId }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setFormGenerationStatus(response.data.message || 'Form generated successfully');

        // Extract the user ID from the response
        const userId = response.data.user_id;

      // Create notification
      const notificationData = {
        user_id: userId, // Replace with actual user ID or retrieve from context
        message: `Advance form generated successfully for group ${groupName}`,
        created_at: new Date().toISOString() // ISO format for created_at
      };

      await axios.post(`${apiUrl}/notifications`, 
        notificationData, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
      });

      // console.log("Notification created successfully.");
      // window.location.reload(); // Refresh the page after creating the notification

      // Refresh the advances data without reloading the page
      fetchAdvances();

      // Notify all subscribed components to refresh
      triggerRefresh(); // Trigger the refresh context

    } catch (err) {
      setFormGenerationStatus('Failed to generate form. Please try again later.');
      // console.error("Error:", err);
    }
  };

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      tableContainerRef.current.requestFullscreen().catch(err => {
        // console.error("Failed to enter fullscreen mode:", err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        // console.error("Failed to exit fullscreen mode:", err);
      });
    }
  };

  const handleAddAdvanceClick = () => {
    setFormVisible(true);
  };

  const handleCloseForm = () => {
    setFormVisible(false);
  };

  const handleAddAdvance = (newAdvance) => {
    setAdvances(prevAdvances => [...prevAdvances, newAdvance]);
  };

  const handleEditClick = (id, paidAmount) => {
    setEditMode(id);
    setEditedPaidAmount(''); // Clear the input field when editing begins
  };

  const handleSaveClick = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.patch(`${apiUrl}/advances/${id}`, { paid_amount: editedPaidAmount }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // Refetch data to reflect the changes
      fetchAdvances();
      setEditMode(null);
    } catch (err) {
      setError('Failed to save changes. Please try again later.');
    }
  };

  const handleCancelClick = () => {
    setEditMode(null); // Reset edit mode
    setEditedPaidAmount(''); // Reset the input field
  };

  const handlePaidAmountChange = (e) => {
    setEditedPaidAmount(e.target.value);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="advance-table">
      <div className="main-content">
        <div className="content">
          <div className="table-container" ref={tableContainerRef}>
            <div className="table-header-container">
              <button className="add-record-button" onClick={handleAddAdvanceClick}>
                <FontAwesomeIcon icon={faPlus} className="add-record-icon" />
                Add Advance
              </button>
              <button className="generate-form-button" onClick={handleGenerateForm}>
                <FontAwesomeIcon icon={faPlus} className="generate-form-icon" />
                Generate Form
              </button>
              <button className="fullscreen-button" onClick={handleFullscreenToggle}>
                <FontAwesomeIcon icon={faExpandArrowsAlt} className="fullscreen-icon" />
              </button>
            </div>
            <div className="table">
              <div className="table-header">
                <div>Member Name</div>
                <div>Advance ID</div>
                <div>Initial Amount</div>
                <div>Payment Amount</div>
                <div>Status</div>
                <div>Created At</div>
                <div>Updated At</div>
                <div>Interest Rate</div>
                <div>Paid Amount</div>
                <div>Total Amount Due</div>
                <div></div>
              </div>
              {advances.map((advance) => (
                <div className="table-row" key={advance.id}>
                  <div>{advance.member_name || '-'}</div>
                  <div>{`ADV${advance.id}`}</div>
                  <div>Ksh{advance.initial_amount.toFixed(2)}</div>
                  <div>Ksh{advance.payment_amount.toFixed(2)}</div>
                  <div>{advance.status}</div>
                  <div>{new Date(advance.created_at).toLocaleDateString()}</div>
                  <div>{new Date(advance.updated_at).toLocaleDateString()}</div>
                  <div>{advance.interest_rate}%</div>
                  <div>Ksh{advance.paid_amount.toFixed(2)}</div>
                  <div>Ksh{advance.total_amount_due.toFixed(2)}</div>
                  <div className="actions">
                    {editMode === advance.id ? (
                      <>
                        <input
                          type="number"
                          value={editedPaidAmount} // Controlled input
                          onChange={handlePaidAmountChange}
                          placeholder="Enter Paid amount"
                        />
                        <button onClick={() => handleSaveClick(advance.id)} className="action-icon">
                          <FontAwesomeIcon icon={faSave} className="save-icon" />
                        </button>
                        <button onClick={handleCancelClick} className="action-icon">
                          <FontAwesomeIcon icon={faTimes} className="cancel-icon" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEditClick(advance.id, advance.paid_amount)} className="action-icon">
                          <FontAwesomeIcon icon={faEdit} className="edit-icon" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {formGenerationStatus && <div className="form-generation-status">{formGenerationStatus}</div>}
          {isFormVisible && (
            <AddAdvanceForm
              onClose={handleCloseForm}
              onAdd={handleAddAdvance}
              groupId={groupId} // Pass groupId to the form
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Advance;
