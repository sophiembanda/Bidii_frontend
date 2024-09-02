import React, { useRef, useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave, faPlus, faTimes, faExpandArrowsAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import AddGroupMonthlyPerformanceForm from '../forms/AddGroupMonthlyPerformanceForm'; // Import your form component
import "./css/Groups.css";
import { useRefresh } from '../components/RefreshContext';

const Groups = ({ selectedGroupId, selectedGroupName }) => {
  const tableContainerRef = useRef(null);
  const [isFormVisible, setFormVisible] = useState(false);
  const [groupPerformances, setGroupPerformances] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null); // State to manage the row being edited
  const [formFields, setFormFields] = useState({}); // State for form fields
  const [groupName, setGroupName] = useState ({});
  const { triggerRefresh } = useRefresh();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const fetchGroupPerformances = useCallback(() => {
    const token = localStorage.getItem('authToken');
  
    if (token && selectedGroupId) {
      axios
        .get(`${apiUrl}/group_performances?group_id=${selectedGroupId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          const { group_name, performances } = response.data;
          setGroupName(group_name); // Store the group name if needed
          setGroupPerformances(performances); // Store the performances data
        })
        .catch((error) => {
          // Handle any errors that occur during the fetch
          console.error("There was an error fetching the group performance data!", error);
        });
    } else {
      console.warn("No auth token or selectedGroupId found.");
    }
  }, [selectedGroupId, apiUrl]);
  
  useEffect(() => {
    fetchGroupPerformances();
  }, [fetchGroupPerformances]);
  

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

  const handleGenerateForm = () => {
    const token = localStorage.getItem('authToken');
    
    if (token && selectedGroupId) {
      axios.post(`${apiUrl}/generate_form`, 
        { group_id: selectedGroupId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      .then(response => {
        setFormFields(response.data.fields); // Set the form fields from response
        alert(response.data.message); // Optionally show a success message
        fetchGroupPerformances(); // Reload the records by calling the function

        // Extract the user ID from the response
        const userId = response.data.user_id;

        // Create a notification after successfully generating the form
        const notificationData = {
          user_id: userId, // Replace with actual user ID or retrieve from context
          message: "Group form generated successfully for group " + groupName,
          created_at: new Date().toISOString() // ISO format for created_at
        };

        axios.post(`${apiUrl}/notifications`, 
          notificationData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        .then(() => {
          // console.log("Notification created successfully.");
          // window.location.reload(); // Refresh the page after creating the notification
          fetchGroupPerformances();
          // Notify all subscribed components to refresh
          triggerRefresh(); // Trigger the refresh context
        })
        .catch(error => {
          // console.error("There was an error creating the notification!", error);
        });

      })
      .catch(error => {
        // console.error("There was an error generating the form!", error);
      });
    } else {
      // console.warn("No auth token or selectedGroupId found.");
    }
  };

  const handleAddGroup = () => {
    setFormVisible(true); // Show the form
  };
  
  const handleCancelClick = () => {
    setEditingRowId(null); // Reset the editing row ID
    setFormFields({}); // Clear form fields
  };
  

  const handleEditClick = (id, fields) => {
    setEditingRowId(id);
    setFormFields(fields); // Set form fields for editing
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSaveClick = (id) => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      // Prepare the data to be sent to the backend
      const requestData = { id, ...formFields, group_id: selectedGroupId };

      // Log the data being sent
      // console.log("Data being sent to the backend:", requestData);

      axios.post(`${apiUrl}/group_performances`, 
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      .then(response => {
        alert("Record updated successfully!");
        fetchGroupPerformances(); // Reload the records by calling the function
        setEditingRowId(null); // Hide the input fields after saving
      })
      .catch(error => {
        // console.error("There was an error updating the record!", error);
        // Log the response error for further inspection
        if (error.response) {
          // console.error("Response data:", error.response.data);
          // console.error("Response status:", error.response.status);
          // console.error("Response headers:", error.response.headers);
        }
      });
    } else {
      // console.warn("No auth token found.");
    }
  };

  return (
    <div className="groups">
      <div className="main-content">
        <div className="content">
          <div className="table-container" ref={tableContainerRef}>
            <div className="table-header-container">
              <button className="add-record-button" onClick={handleAddGroup}>
                <FontAwesomeIcon icon={faPlus} className="add-record-icon" />
                Add Group
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
                <div></div>
                <div>Group ID</div>
                <div>Member Details</div>
                <div>Savings & Shares B/F</div>
                <div>Loan Bal B/F</div>
                <div>Total Paid</div>
                <div>Principal</div>
                <div>Loan Interest</div>
                <div>This Month's Shares</div>
                <div>Fine & Charges</div>
                <div>Savings & Shares C/F</div>
                <div>Loan Bal C/F</div>
                <div>Actions</div>
              </div>
              {groupPerformances.map((group) => (
                <div className="table-row" key={group.id}>
                  <input type="checkbox" className="row-checkbox" />
                  <div>{group.id}</div>
                  <div>{group.member_details}</div>
                  <div>{group.savings_shares_bf}</div>
                  <div>{group.loan_balance_bf}</div>
                  <div>
                    {editingRowId === group.id ? (
                      <input
                        type="number"
                        name="total_paid"
                        value={formFields.total_paid || ''}
                        onChange={handleInputChange}
                      />
                    ) : (
                      group.total_paid
                    )}
                  </div>
                  <div>{group.principal}</div>
                  <div>{group.loan_interest}</div>
                  <div>
                    {editingRowId === group.id ? (
                      <input
                        type="number"
                        name="this_month_shares"
                        value={formFields.this_month_shares || ''}
                        onChange={handleInputChange}
                      />
                    ) : (
                      group.this_month_shares
                    )}
                  </div>
                  <div>
                    {editingRowId === group.id ? (
                      <input
                        type="number"
                        name="fine_and_charges"
                        value={formFields.fine_and_charges || ''}
                        onChange={handleInputChange}
                      />
                    ) : (
                      group.fine_and_charges
                    )}
                  </div>
                  <div>{group.savings_shares_cf}</div>
                  <div>{group.loan_cf}</div>
                  <div>
                    {editingRowId === group.id ? (
                      <>
                        <button onClick={() => handleSaveClick(group.id)} className="action-icon">
                          <FontAwesomeIcon icon={faSave} className="save-icon" />
                        </button>
                        <button onClick={handleCancelClick} className="action-icon">
                          <FontAwesomeIcon icon={faTimes} className="cancel-icon" />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleEditClick(group.id, group)} className="action-icon">
                        <FontAwesomeIcon icon={faEdit} className="edit-icon" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {isFormVisible && (
        <div className="form-overlay">
          <div className="form-container">
          <AddGroupMonthlyPerformanceForm 
          group_id={selectedGroupId} 
          group_name={selectedGroupName}
          onClose={() => {
            setFormVisible(false); // Close the form
            fetchGroupPerformances(); // Refresh the table data
          }}
           />
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
