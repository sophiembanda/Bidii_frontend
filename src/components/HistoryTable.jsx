import React, { useRef, useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpandArrowsAlt, faTable, faSort, faFilter } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import FormRecordsWindow from "../forms/FormRecordsWindow";
import "./css/HistoryTable.css";

const HistoryTable = () => {
  const tableContainerRef = useRef(null);
  const [isFormVisible, setFormVisible] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // State for filtered data
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  const [isSortMenuVisible, setSortMenuVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all"); // State to track selected filter
  const apiUrl = process.env.REACT_APP_API_BASE_URL;


  // Fetch all history data initially
  const fetchHistoryData = useCallback(async () => {
    const token = localStorage.getItem("authToken");

    if (token) {
      axios
        .get(`${apiUrl}/histories`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setHistoryData(response.data);
          setFilteredData(response.data); // Set the initial data to filteredData as well
        })
        .catch((error) => {
          console.error("There was an error fetching the history data!", error);
        });
    } else {
      console.warn("No auth token found.");
    }
  },[apiUrl]);

  useEffect(() => {
    fetchHistoryData();
  }, [fetchHistoryData]);

  // Filter data based on selected option
  const filterData = (filter) => {
    const token = localStorage.getItem("authToken");

    if (filter === "performance") {
      // Fetch data from the /histories endpoint when Group Monthly Performance is clicked
      axios
        .get(`${apiUrl}/histories`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setFilteredData(response.data); // Update the filtered data with the response from the endpoint
        })
        .catch((error) => {
          console.error("Error fetching monthly performance data:", error);
        });
    } else if (filter === "advance") {
      // Fetch data from the /query_advance_summary endpoint when Group Advance Performance is clicked
      axios
        .get(`${apiUrl}/query_advance_summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setFilteredData(response.data); // Update the filtered data with the response from the endpoint
        })
        .catch((error) => {
          console.error("Error fetching advance performance data:", error);
        });
    } else {
      // Fetch data from both endpoints when Show All is clicked
      const performanceRequest = axios.get(`${apiUrl}/histories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const advanceRequest = axios.get(`${apiUrl}/query_advance_summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Run both requests concurrently
      Promise.all([performanceRequest, advanceRequest])
        .then(([performanceResponse, advanceResponse]) => {
          setFilteredData([...performanceResponse.data, ...advanceResponse.data]); // Combine both sets of data
        })
        .catch((error) => {
          console.error("Error fetching combined data:", error);
        });
    }
  };

  const handleSortIconClick = () => {
    setSortMenuVisible((prev) => !prev); // Toggle the visibility of the sort menu
  };

  const handleRowClick = (id) => {
    setSelectedHistoryId(id);
    setFormVisible(true);
  };

  const handleCloseForm = () => {
    setFormVisible(false);
    setSelectedHistoryId(null);
  };

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      tableContainerRef.current.requestFullscreen().catch((err) => {
        console.error("Failed to enter fullscreen mode:", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("Failed to exit fullscreen mode:", err);
      });
    }
  };

  return (
    <div className="history-table">
      <div className="main-content">
        <div className="content">
          <div className="table-container" ref={tableContainerRef}>
            <div className="table-header-container">
              <div className="table-header-title">
                <FontAwesomeIcon icon={faTable} className="table-icon" />
                <h2>History Table</h2>
                <div className="header-icons">
                  <FontAwesomeIcon
                    icon={faSort}
                    className="icon sort-icon"
                    title="Sort"
                    onClick={handleSortIconClick}
                  />
                  {isSortMenuVisible && (
                    <div className="sort-dropdown">
                      <ul>
                        <li
                          onClick={() => {
                            setSelectedFilter("performance");
                            filterData("performance");
                          }}
                        >
                          Group Monthly Performance
                        </li>
                        <li
                          onClick={() => {
                            setSelectedFilter("advance");
                            filterData("advance");
                          }}
                        >
                          Group Advance Performance
                        </li>
                        <li
                          onClick={() => {
                            setSelectedFilter("all");
                            filterData("all");
                          }}
                        >
                          Show All
                        </li>
                      </ul>
                    </div>
                  )}
                  <FontAwesomeIcon icon={faFilter} className="icon filter-icon" title="Filter" />
                </div>
              </div>
              <button className="fullscreen-button" onClick={handleFullscreenToggle}>
                <FontAwesomeIcon icon={faExpandArrowsAlt} className="fullscreen-icon" />
              </button>
            </div>
            <div className="table">
              <div className="table-header">
                <div className="header-group-name">
                  Group Name
                  <FontAwesomeIcon icon={faSort} className="icon sort-icon" title="Sort" />
                </div>
                <div className="header-date">
                  Date
                  <FontAwesomeIcon icon={faSort} className="icon sort-icon" title="Sort" />
                </div>
              </div>
              {filteredData.map((entry) => (
                <div
                  className="table-row"
                  key={entry.id}
                  onClick={() => handleRowClick(entry.id)}
                >
                  <div>{entry.group_name}</div>
                  <div>{entry.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {isFormVisible && <FormRecordsWindow historyId={selectedHistoryId} onClose={handleCloseForm} />}
    </div>
  );
};

export default HistoryTable;
