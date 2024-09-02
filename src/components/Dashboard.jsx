import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faCompress, faExpand, faHistory, faMoneyBillWave, faBell, faCog, faSearch, faEdit, faChartLine, faPlus } from '@fortawesome/free-solid-svg-icons';
import Notification from "./Notification";
import Groups from "./Groups"; 
import AddMonthlyPerformanceForm from '../forms/AddMonthlyPerformanceForm';
import Settings from "./Settings";
import NotificationWindow from "./NotificationWindow";
import ProfileDropdown from "./ProfileDropdown";
import MonthlyAdvanceCredit from "./MonthlyAdvanceCredit";
import HistoryTable from "./HistoryTable";

import "./css/Dashboard.css";

const Dashboard = () => {
  const [activeComponent, setActiveComponent] = useState('dashboard');
  const [showLoansMenu, setShowLoansMenu] = useState(false);
  const [showSavingsMenu, setShowSavingsMenu] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null); // Add state for selected group ID
  const [selectedGroupName, setSelectedGroupName] = useState(''); // Add state for selected group name
  const [isFullScreen] = useState(false);
  const tableContainerRef = useRef(null);
  const [groupPerformances, setGroupPerformances] = useState([]);
  const [editingPerformanceId, setEditingPerformanceId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [totalLoans, setTotalLoans] = useState(0);
  const [total_active_users, setTotalActiveUsers] = useState(0);
  const [current_user, setTotalCurrentUser] = useState(0);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  // const backendUrl = process.env.REACT_APP_BACKEND_URL; // Use the environment variable

  
  // const [selectedGroup, setSelectedGroup] = useState(''); 

  useEffect(() => {
    if (activeComponent === 'dashboard') {
      const token = localStorage.getItem('authToken');

      if (token) {
        axios.get(`${apiUrl}/monthly_performances`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then(response => {
          setGroupPerformances(response.data);
        })
        .catch(error => {
          console.error("There was an error fetching the group performances!", error);
        });
     // Fetch total members
     axios.get(`${apiUrl}/member_names`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      setTotalUsers(response.data.total_member_details);
      setTotalSavings(response.data.total_savings_shares_bf);
      setTotalLoans(response.data.total_loan_balance_bf);
      setTotalActiveUsers(response.data.total_active_users);
      setTotalCurrentUser(response.data.current_first_name);
    })
    .catch(error => {
      // console.error("There was an error fetching total members!", error);
    });
  } else {
    // console.warn("No auth token found in localStorage.");
  }
    }
  }, [activeComponent, apiUrl]);

  const handleMenuClick = (component) => {
    setActiveComponent(component);
    if (component === 'loans') {
      setShowLoansMenu(!showLoansMenu);
      setShowSavingsMenu(false);
    } else if (component === 'savings') {
      setShowSavingsMenu(!showSavingsMenu);
      setShowLoansMenu(false);
    } else {
      setShowLoansMenu(false);
      setShowSavingsMenu(false);
    }
    if (component === 'settings') {
      setShowLoansMenu(false);
      setShowSavingsMenu(false);
    }
  };

  const handleGroupClick = (groupId, groupName) => {
    setSelectedGroupId(groupId);
    setSelectedGroupName(groupName);
    setActiveComponent('groups');
  };

  const handleEditClick = (performance) => {
    setEditingPerformanceId(performance.id);
    setEditFormData({ ...performance });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const token = localStorage.getItem('authToken');

    if (editingPerformanceId) {
      // Update existing performance
      if (token) {
        axios.put(`${apiUrl}/monthly_performances/${editingPerformanceId}`, editFormData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        })
        .then(response => {
          setGroupPerformances(prevPerformances =>
            prevPerformances.map(performance =>
              performance.id === editingPerformanceId ? response.data : performance
            )
          );
          setEditingPerformanceId(null);
          setEditFormData({});
        })
        .catch(error => {
          // console.error("There was an error updating the performance!", error);
        });
      }
    }
};


  const handleFullscreenToggle = () => {
    if (tableContainerRef.current) {
      if (!document.fullscreenElement) {
        tableContainerRef.current.requestFullscreen().catch(err => console.log(err));
      } else {
        document.exitFullscreen().catch(err => console.log(err));
      }
      // setIsFullScreen(prevState => !prevState);
    }
  };  

  const handleAddFormToggle = () => {
    setShowAddForm(!showAddForm);
  };

  const handleAddPerformance = (newPerformance) => {
    setGroupPerformances(prevPerformances => [...prevPerformances, newPerformance]);
  };
  
  const renderContent = () => {
    switch (activeComponent) {
      case 'dashboard':
        return (
          <div className="dashboard-container">
            <div className="table-header-container">
              <button className="test-group-button">
                <FontAwesomeIcon icon={faChartLine} className="test-group-icon" />
                Monthly Performance
              </button>
              <button className="add-record-button" onClick={handleAddFormToggle}>
                <FontAwesomeIcon icon={faPlus} className="add-record-icon" />
              </button>
              <div className="fullscreen-icon-container">
                <button className="fullscreen-toggle-button" onClick={handleFullscreenToggle}>
                  <FontAwesomeIcon icon={isFullScreen ? faCompress : faExpand} />
                </button>
              </div>
              {showAddForm && (
                <AddMonthlyPerformanceForm 
                  onClose={handleAddFormToggle}
                  onAdd={handleAddPerformance}
                />
              )}
            </div>
            <div 
              className={`table-container ${isFullScreen ? 'fullscreen' : ''}`} 
              ref={tableContainerRef}
            >
              <div className="table">
                <div className="table-header">
                  <div></div>
                  <div>Group Name</div>
                  <div>Date</div>
                  <div>Banking</div>
                  <div>Service Fee</div>
                  <div>Loan Form</div>
                  <div>PassBook</div>
                  <div>Office Debt Paid</div>
                  <div>Office Banking</div>
                  <div></div>
                </div>
                {groupPerformances.map((performance, index) => (
                  <div className="table-row" key={index}>
                    <input type="checkbox" className="row-checkbox" />
                    <div onClick={() => handleGroupClick(performance.id, performance.group_name)}>
                      {performance.group_name}
                    </div>
                    <div>{performance.month} {performance.year}</div>
                    <div>
                      {editingPerformanceId === performance.id ? (
                        <input
                          type="text"
                          name="banking"
                          value={editFormData.banking || ''}
                          onChange={handleFormChange}
                        />
                      ) : (
                        performance.banking
                      )}
                    </div>
                    <div>
                      {editingPerformanceId === performance.id ? (
                        <input
                          type="number"
                          name="service_fee"
                          value={editFormData.service_fee || ''}
                          onChange={handleFormChange}
                        />
                      ) : (
                        performance.service_fee
                      )}
                    </div>
                    <div>
                      {editingPerformanceId === performance.id ? (
                        <input
                          type="number"
                          name="loan_form"
                          value={editFormData.loan_form || ''}
                          onChange={handleFormChange}
                        />
                      ) : (
                        performance.loan_form
                      )}
                    </div>
                    <div>
                      {editingPerformanceId === performance.id ? (
                        <input
                          type="number"
                          name="passbook"
                          value={editFormData.passbook || ''}
                          onChange={handleFormChange}
                        />
                      ) : (
                        performance.passbook
                      )}
                    </div>
                    <div>
                      {editingPerformanceId === performance.id ? (
                        <input
                          type="number"
                          name="office_debt_paid"
                          value={editFormData.office_debt_paid || ''}
                          onChange={handleFormChange}
                        />
                      ) : (
                        performance.office_debt_paid
                      )}
                    </div>
                    <div>
                      {editingPerformanceId === performance.id ? (
                        <input
                          type="number"
                          name="office_banking"
                          value={editFormData.office_banking || ''}
                          onChange={handleFormChange}
                        />
                      ) : (
                        performance.office_banking
                      )}
                    </div>
                    <div>
                      {editingPerformanceId === performance.id ? (
                        <button onClick={handleFormSubmit}>Save</button>
                      ) : (
                        <>
                          <FontAwesomeIcon
                            icon={faEdit}
                            className="action-icon edit-icon"
                            onClick={() => handleEditClick(performance)}
                          />
                          {/* <FontAwesomeIcon
                            icon={faTrashAlt}
                            className="action-icon delete-icon"
                            onClick={() => handleDeleteClick(performance.id)}
                          /> */}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      // case 'loan-agreement':
      //   return <LoanAgreement />;
      // case 'loans-repayment':
      //   return <LoanRepayment />;
      case 'advance':
        return <MonthlyAdvanceCredit />;
      // case 'savings-accounts':
      //   return <SavingsAccounts />;
      // case 'savings-transactions':
      //   return <SavingsTransactions />;
      case 'settings':
        return <Settings />;
      case 'history':
        return <HistoryTable />;
      case 'notifications':
        return <NotificationWindow />;
      // case 'members':
      //   return <MembersWindow />;
      case 'groups':
        return <Groups selectedGroupId={selectedGroupId} selectedGroupName={selectedGroupName}/>;
      default:
        return <div>Welcome to your dashboard!</div>;
    }
  };

  return (
    <div className="admin">
      <div className="sidebar">
        <div className="logo">
          <div className="text-wrapper-5">Logo</div>
          <p className="BIDII-MEN-AND-WOMEN">
            BIDII MEN AND <br /> WOMEN LTD
          </p>
        </div>
        <div className="menu">
          <div className={`menu-item ${activeComponent === 'dashboard' ? 'active' : ''}`} onClick={() => handleMenuClick('dashboard')}>
            <FontAwesomeIcon icon={faTachometerAlt} className="menu-icon" />
            Dashboard
          </div>
          {/* <div className={`menu-item ${activeComponent === 'groups' ? 'active' : ''}`} onClick={() => handleMenuClick('groups')}>
            <FontAwesomeIcon icon={faUsers} className="menu-icon" />
            Groups
          </div> */}
          <div className={`menu-item ${activeComponent === 'advance' ? 'active' : ''}`} onClick={() => handleMenuClick('advance')}>
            <FontAwesomeIcon icon={faMoneyBillWave} className="menu-icon" />
            Advance
          </div>
          <div className={`menu-item ${activeComponent === 'notifications' ? 'active' : ''}`} onClick={() => handleMenuClick('notifications')}>
            <FontAwesomeIcon icon={faBell} className="menu-icon" />
            Notifications
          </div>
          <div className={`menu-item ${activeComponent === 'settings' ? 'active' : ''}`} onClick={() => handleMenuClick('settings')}>
            <FontAwesomeIcon icon={faCog} className="menu-icon" />
            Settings
          </div>
          <div className={`menu-item ${activeComponent === 'history' ? 'active' : ''}`} onClick={() => handleMenuClick('history')}>
            <FontAwesomeIcon icon={faHistory} className="menu-icon" />
            History
          </div>
        </div>
      </div>
      <div className="main-content">
        <div className="top-header">
        <div className="search-bar">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input className="search-input" type="text" placeholder="Search" />
        </div>
          <div className="profile-section">
            <Notification />
            <ProfileDropdown />
            {/* {profileImageSrc ? (
              <img className="profile-avatar" alt="Profile avatar" src={profileImageSrc} />
            ) : (
              <FontAwesomeIcon icon={faUser} className="profile-avatar-placeholder" />
            )} */}
          </div>
        </div>
        <div className="content">
        {activeComponent !== 'settings' && activeComponent !== 'notifications' && (
        <div className="header">
          <div className="welcome-message">
            <h1>Welcome back, {current_user}</h1>
          </div>
          <div className="stats">
            <button className="stat-button pink">Total Loans<br />{totalLoans}</button>
            <button className="stat-button blue">Total Savings<br />{totalSavings}</button>
            <button className="stat-button orange">Total Members<br />{totalUsers}</button>
            <button className="stat-button green">Active Users<br />{total_active_users}</button>
          </div>
        </div>
      )}
          <div className="component">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
