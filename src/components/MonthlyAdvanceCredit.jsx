import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faTimes, faExpandArrowsAlt } from '@fortawesome/free-solid-svg-icons';
import { CSSTransition } from 'react-transition-group';
import './css/MonthlyAdvanceCredit.css';
import Advance from './Advance';
import AddMonthlyAdvanceCreditForm from '../forms/AddMonthlyAdvanceCreditForm'; // Import the form component

const MonthlyAdvanceCredit = () => {
  const tableContainerRef = useRef(null);
  const [isFormVisible, setFormVisible] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [monthlyCredits, setMonthlyCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchMonthlyAdvanceCredits = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${apiUrl}/monthly_advance_credits`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        setMonthlyCredits(response.data);
      } catch (err) {
        setError('Failed to fetch data.');
        // console.error('Error fetching monthly advance credits:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyAdvanceCredits();
  }, [apiUrl]);

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
    setFormVisible(!isFormVisible);
  };

  const handleRowClick = (credit) => {
    setSelectedCredit(credit); // Set the selected credit and display the Advance component
  };

  const handleCloseAdvance = () => {
    setSelectedCredit(null); // Hide the Advance component
  };

  const handleAddRecord = (record) => {
    setMonthlyCredits(prevCredits => [...prevCredits, record]); // Add new record to the list
    setFormVisible(false); // Hide the form after adding the record
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="monthly-advance-credit">
      <div className="main-content">
        <div className="content">
          {!selectedCredit ? (
            <div className="table-container" ref={tableContainerRef}>
              <div className="table-header-container">
                <button className="add-record-button" onClick={handleGenerateForm}>
                  <FontAwesomeIcon icon={faPlus} className="add-record-icon" />
                  Add Record
                </button>
                {/* <button className="generate-form-button" onClick={handleGenerateForm}>
                  <FontAwesomeIcon icon={faPlus} className="generate-form-icon" />
                  Generate Form
                </button> */}
                <button className="fullscreen-button" onClick={handleFullscreenToggle}>
                  <FontAwesomeIcon icon={faExpandArrowsAlt} className="fullscreen-icon" />
                </button>
              </div>
              <div className="table-wrapper">
                <div className="table">
                  <div className="table-header">
                    <div>Group ID</div>
                    <div>Group Name</div>
                    <div>Date</div>
                    <div>Total Advance Amount</div>
                    <div>Deductions</div>
                    <div></div>
                  </div>
                  {monthlyCredits.map((credit, index) => (
                    <div className="table-row" key={index} onClick={() => handleRowClick(credit)}>
                      <div>{credit.group_id}</div>
                      <div>{credit.group_name}</div>
                      <div>{new Date(credit.date).toLocaleDateString()}</div>
                      <div>Ksh{credit.total_advance_amount.toFixed(2)}</div>
                      <div>Ksh{credit.deductions.toFixed(2)}</div>
                      <div>
                        <FontAwesomeIcon icon={faEdit} className="action-icon edit-icon" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <CSSTransition
              in={!!selectedCredit}
              timeout={300}
              classNames="advance-display"
              unmountOnExit
            >
              <div className="advance-display">
                <button className="close-button" onClick={handleCloseAdvance}>
                  <FontAwesomeIcon icon={faTimes} className="close-icon" />
                </button>
                <Advance groupId={selectedCredit.group_id} />
              </div>
            </CSSTransition>
          )}

          {/* Render the form when isFormVisible is true */}
          {isFormVisible && (
            <CSSTransition
              in={isFormVisible}
              timeout={300}
              classNames="form-transition"
              unmountOnExit
            >
              <AddMonthlyAdvanceCreditForm onClose={() => setFormVisible(false)} onAdd={handleAddRecord} />
            </CSSTransition>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthlyAdvanceCredit;
