import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSort, faFileCsv, faSun, faMoon, faExpand, faCompress, faRedo, faPrint, faFilter, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import "./css/FormRecordsWindow.css";

const FormRecordsWindow = ({ historyId, onClose }) => {
  const [formRecords, setFormRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("group_id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchFormRecords = async () => {
      try {
        const response = await axios.get(`${apiUrl}/form_records/${historyId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        setFormRecords(response.data);
      } catch (error) {
        // console.error("Error fetching form records:", error);
      }
    };

    fetchFormRecords();
  }, [historyId, apiUrl]);

  const handleSort = (field) => {
    // Toggle sort direction if the same field is clicked
    const newSortDirection = (sortField === field && sortDirection === "asc") ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newSortDirection);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleExport = () => {
    // Export logic remains the same
    const csvRows = [];
    const headers = ["Member Details", "Savings Shares BF", "Loan Balance BF", "Total Paid", "Principal", "Loan Interest", "This Month Shares", "Fine and Charges", "Savings Shares CF", "Loan CF", "Month", "Year"];
    csvRows.push(headers.join(","));
    
    formRecords.forEach(record => {
      const values = [
        record.member_details,
        record.savings_shares_bf,
        record.loan_balance_bf,
        record.total_paid,
        record.principal,
        record.loan_interest,
        record.this_month_shares,
        record.fine_and_charges,
        record.savings_shares_cf,
        record.loan_cf,
        record.month,
        record.year
      ];
      csvRows.push(values.join(","));
    });
    
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "form_records.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRefresh = async () => {
    try {
      const response = await axios.get(`${apiUrl}/form_records/${historyId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      setFormRecords(response.data);
    } catch (error) {
      // console.error("Error refreshing form records:", error);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.open();
    printWindow.document.write(`
      <html>
      <head>
        <title>Print Form Records</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h2>Form Records</h2>
        ${document.querySelector(".window-body").innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleFilter = () => {
    // Implement filter logic
  };

  const handleHelp = () => {
    setShowHelp(true);
  };

  const handleCloseHelp = () => {
    setShowHelp(false);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleThemeToggle = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  const handleFullscreenToggle = () => {
    setIsFullScreen(prevState => !prevState);
  };

  const filteredRecords = formRecords.filter(record =>
    record.member_details.toLowerCase().includes(searchQuery.toLowerCase())
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
        <h2>Form Records</h2>
        <button className="theme-toggle-button" onClick={handleThemeToggle}>
          <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
        </button>
        <button className="fullscreen-toggle-button" onClick={handleFullscreenToggle}>
          <FontAwesomeIcon icon={isFullScreen ? faCompress : faExpand} />
        </button>
        <button className="refresh-button" onClick={handleRefresh}>
          <FontAwesomeIcon icon={faRedo} />
        </button>
        <button className="print-button" onClick={handlePrint}>
          <FontAwesomeIcon icon={faPrint} />
        </button>
        <button className="filter-button" onClick={handleFilter}>
          <FontAwesomeIcon icon={faFilter} />
        </button>
        <button className="help-button" onClick={handleHelp}>
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
          placeholder="Search by member details..."
          value={searchQuery}
          onChange={handleSearch}
        />
        <button className="export-button" onClick={handleExport}>
          <FontAwesomeIcon icon={faFileCsv} /> Export to CSV
        </button>
        <table className="records-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("member_details")}>
                Member Details 
                <FontAwesomeIcon icon={faSort} className={sortField === "member_details" ? "active-sort" : ""} />
              </th>
              <th onClick={() => handleSort("savings_shares_bf")}>
                Savings Shares BF 
                <FontAwesomeIcon icon={faSort} className={sortField === "savings_shares_bf" ? "active-sort" : ""} />
              </th>
              <th onClick={() => handleSort("loan_balance_bf")}>
                Loan Balance BF 
                <FontAwesomeIcon icon={faSort} className={sortField === "loan_balance_bf" ? "active-sort" : ""} />
              </th>
              <th onClick={() => handleSort("total_paid")}>
                Total Paid 
                <FontAwesomeIcon icon={faSort} className={sortField === "total_paid" ? "active-sort" : ""} />
              </th>
              <th onClick={() => handleSort("principal")}>
                Principal 
                <FontAwesomeIcon icon={faSort} className={sortField === "principal" ? "active-sort" : ""} />
              </th>
              <th onClick={() => handleSort("loan_interest")}>
                Loan Interest 
                <FontAwesomeIcon icon={faSort} className={sortField === "loan_interest" ? "active-sort" : ""} />
              </th>
              <th onClick={() => handleSort("this_month_shares")}>
                This Month Shares 
                <FontAwesomeIcon icon={faSort} className={sortField === "this_month_shares" ? "active-sort" : ""} />
              </th>
              <th onClick={() => handleSort("fine_and_charges")}>
                Fine and Charges 
                <FontAwesomeIcon icon={faSort} className={sortField === "fine_and_charges" ? "active-sort" : ""} />
              </th>
              <th onClick={() => handleSort("savings_shares_cf")}>
                Savings Shares CF 
                <FontAwesomeIcon icon={faSort} className={sortField === "savings_shares_cf" ? "active-sort" : ""} />
              </th>
              <th onClick={() => handleSort("loan_cf")}>
                Loan CF 
                <FontAwesomeIcon icon={faSort} className={sortField === "loan_cf" ? "active-sort" : ""} />
              </th>
              <th onClick={() => handleSort("month")}>
                Month 
                <FontAwesomeIcon icon={faSort} className={sortField === "month" ? "active-sort" : ""} />
              </th>
              <th onClick={() => handleSort("year")}>
                Year 
                <FontAwesomeIcon icon={faSort} className={sortField === "year" ? "active-sort" : ""} />
              </th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((record, index) => (
              <tr key={index}>
                <td>{record.member_details}</td>
                <td>{record.savings_shares_bf}</td>
                <td>{record.loan_balance_bf}</td>
                <td>{record.total_paid}</td>
                <td>{record.principal}</td>
                <td>{record.loan_interest}</td>
                <td>{record.this_month_shares}</td>
                <td>{record.fine_and_charges}</td>
                <td>{record.savings_shares_cf}</td>
                <td>{record.loan_cf}</td>
                <td>{record.month}</td>
                <td>{record.year}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
              onClick={() => handlePageChange(index + 1)}
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
            <button className="close-help-modal" onClick={handleCloseHelp}>
                <FontAwesomeIcon icon={faTimes} /> Close
            </button>
            </div>
            <p><strong>General Information:</strong> This page displays all records for the selected history. You can use the search, sort, and filter options to find specific records.</p>
            <p><strong>Search:</strong> Use the search input to filter records based on member details.</p>
            <p><strong>Sorting:</strong> Click on column headers to sort records. Clicking the same header toggles between ascending and descending order.</p>
            <p><strong>Pagination:</strong> Navigate through pages using the pagination controls at the bottom of the page.</p>
            <p><strong>Exporting Data:</strong> Click the Export to CSV button to download the current records as a CSV file.</p>
            <p><strong>Printing Records:</strong> Click the Print button to print the current view of records.</p>
            <p><strong>Filtering:</strong> Use the filter button to apply additional filters to the records.</p>
            <p><strong>Theme Toggle:</strong> Switch between dark and light modes using the theme toggle button.</p>
            <p><strong>Fullscreen Mode:</strong> Enter or exit fullscreen mode using the fullscreen toggle button.</p>
            <p><strong>Refreshing Data:</strong> Click the Refresh button to reload the records.</p>
        </div>
      )}
    </div>
  );
};

export default FormRecordsWindow;
