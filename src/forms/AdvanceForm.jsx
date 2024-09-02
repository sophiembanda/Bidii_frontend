import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSort, faSearch, faFileCsv, faSun, faMoon, faExpand, faCompress, faRedo, faPrint, faFilter, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import "./css/AdvanceForm.css";

const FormRecordsWindow = ({ groupId, onClose }) => {
  const [historyRecords, setHistoryRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("member_name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchHistoryRecords = async () => {
      try {
        const response = await axios.get(`${apiUrl}/query_advance_history`, {
          params: { group_id: groupId },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        setHistoryRecords(response.data.advance_history || []);
      } catch (error) {
        // console.error("Error fetching history records:", error);
      }
    };

    fetchHistoryRecords();
  }, [groupId]);

  const handleSort = (field) => {
    const newSortDirection = (sortField === field && sortDirection === "asc") ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newSortDirection);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleExport = () => {
    const csvRows = [];
    const headers = ["Member Name", "Initial Amount", "Payment Amount", "Paid Amount", "Total Amount Due", "Status", "Interest Rate", "Created At", "Updated At"];
    csvRows.push(headers.join(","));
    
    historyRecords.forEach(record => {
      const values = [
        record.member_name,
        record.initial_amount,
        record.payment_amount,
        record.paid_amount,
        record.total_amount_due,
        record.status,
        record.interest_rate,
        record.created_at,
        record.updated_at
      ];
      csvRows.push(values.join(","));
    });
    
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "advance_history_records.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRefresh = async () => {
    try {
      const response = await axios.get(`${apiUrl}/query_advance_history`, {
        params: { group_id: groupId },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      setHistoryRecords(response.data.advance_history || []);
    } catch (error) {
      // console.error("Error refreshing history records:", error);
    }
  };

  const filteredRecords = historyRecords.filter(record =>
    record.member_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (sortDirection === "asc") {
      return (a[sortField] > b[sortField] ? 1 : -1);
    } else {
      return (a[sortField] < b[sortField] ? 1 : -1);
    }
  });

  const totalPages = Math.ceil(sortedRecords.length / recordsPerPage);
  const currentRecords = sortedRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <div className={`form-records-window ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isFullScreen ? 'full-screen' : ''}`}>
      <div className="window-header">
        <h2>Advance History Records</h2>
        <button className="theme-toggle-button" onClick={() => setIsDarkMode(prevMode => !prevMode)}>
          <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
        </button>
        <button className="fullscreen-toggle-button" onClick={() => setIsFullScreen(prevState => !prevState)}>
          <FontAwesomeIcon icon={isFullScreen ? faCompress : faExpand} />
        </button>
        <button className="refresh-button" onClick={handleRefresh}>
          <FontAwesomeIcon icon={faRedo} />
        </button>
        <button className="print-button">
          <FontAwesomeIcon icon={faPrint} />
        </button>
        <button className="filter-button">
          <FontAwesomeIcon icon={faFilter} />
        </button>
        <button className="help-button" onClick={() => setShowHelp(true)}>
          <FontAwesomeIcon icon={faQuestionCircle} />
        </button>
        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <div className="window-body">
        <input
          type="text"
          className="search-input"
          placeholder="Search by member name..."
          value={searchQuery}
          onChange={handleSearch}
        />
        <button className="export-button" onClick={handleExport}>
          <FontAwesomeIcon icon={faFileCsv} /> Export to CSV
        </button>
        <table className="records-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("member_name")}>Member Name <FontAwesomeIcon icon={faSort} /></th>
              <th onClick={() => handleSort("initial_amount")}>Initial Amount <FontAwesomeIcon icon={faSort} /></th>
              <th onClick={() => handleSort("payment_amount")}>Payment Amount <FontAwesomeIcon icon={faSort} /></th>
              <th onClick={() => handleSort("paid_amount")}>Paid Amount <FontAwesomeIcon icon={faSort} /></th>
              <th onClick={() => handleSort("total_amount_due")}>Total Amount Due <FontAwesomeIcon icon={faSort} /></th>
              <th onClick={() => handleSort("status")}>Status <FontAwesomeIcon icon={faSort} /></th>
              <th onClick={() => handleSort("interest_rate")}>Interest Rate <FontAwesomeIcon icon={faSort} /></th>
              <th onClick={() => handleSort("created_at")}>Created At <FontAwesomeIcon icon={faSort} /></th>
              <th onClick={() => handleSort("updated_at")}>Updated At <FontAwesomeIcon icon={faSort} /></th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((record, index) => (
              <tr key={index}>
                <td>{record.member_name}</td>
                <td>{record.initial_amount}</td>
                <td>{record.payment_amount}</td>
                <td>{record.paid_amount}</td>
                <td>{record.total_amount_due}</td>
                <td>{record.status}</td>
                <td>{record.interest_rate}</td>
                <td>{record.created_at}</td>
                <td>{record.updated_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
      {showHelp && (
        <div className="help-modal">
          <div className="modal-header">
            <h3>Help Information</h3>
            <button className="close-help-modal" onClick={() => setShowHelp(false)}>
              <FontAwesomeIcon icon={faTimes} /> Close
            </button>
          </div>
          <p><strong>General Information:</strong> This page displays all advance history records for the selected group. Use the search, sort, and filter options to find specific records.</p>
        </div>
      )}
    </div>
  );
};

export default FormRecordsWindow;
