import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Import axios for API calls
import './css/NotificationWindow.css'; // Ensure this CSS file is created for styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faBell, faTrash, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useRefresh } from '../components/RefreshContext';

const NotificationWindow = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { triggerRefresh } = useRefresh();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  // Fetch notifications from the backend
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${apiUrl}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setNotifications(response.data);
      // Calculate unread count
      const countUnread = response.data.filter(notification => !notification.read).length;
      setUnreadCount(countUnread);
    } catch (err) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  },[apiUrl]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Filter notifications based on filter and search criteria
  useEffect(() => {
    const filterNotifications = () => {
      let filtered = notifications;

      if (filter === 'unread') {
        filtered = filtered.filter(notification => !notification.read);
      }

      if (search) {
        filtered = filtered.filter(notification =>
          notification.message.toLowerCase().includes(search.toLowerCase())
        );
      }

      setFilteredNotifications(filtered);
    };

    filterNotifications();
  }, [filter, search, notifications]);

  // Mark a notification as read
  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`${apiUrl}/notifications/${id}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setNotifications(notifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      ));
      setUnreadCount(unreadCount - 1); // Update unread count
      triggerRefresh();
    } catch (err) {
      setError('Failed to mark notification as read');
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`${apiUrl}/notifications/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Fetch updated notifications and count
      triggerRefresh();
      await fetchNotifications();
    } catch (err) {
      setError('Failed to mark all notifications as read');
    }
  };

  // Delete a notification
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete(`${apiUrl}/notifications/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setNotifications(notifications.filter(notification => notification.id !== id));
        if (notifications.find(notification => notification.id === id && !notification.read)) {
          setUnreadCount(unreadCount - 1); // Update unread count if deleted notification was unread
        }
      } catch (err) {
        setError('Failed to delete notification');
      }
    }
  };

  return (
    <div className="notification-window">
      <div className="notification-header">
        <h2 className="notification-title">
          <FontAwesomeIcon icon={faBell} /> Notifications
          {unreadCount > 0 && (
            <div className="unread-count">{unreadCount}</div>
          )}
        </h2>
        <div className="notification-controls">
          <button onClick={handleMarkAllAsRead} className="mark-all-read-btn">
            Mark All as Read
          </button>
          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
          </select>
        </div>
      </div>
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && (
        <div className="notification-list">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notification => (
              <div key={notification.id} className={`notification-card ${notification.read ? 'read' : 'unread'}`}>
                <div className="notification-card-header">
                  <span className="notification-date">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </span>
                  <div className="notification-actions">
                    {!notification.read && (
                      <button onClick={() => handleMarkAsRead(notification.id)} className="mark-read-btn">
                        <FontAwesomeIcon icon={faCheck} /> Mark as Read
                      </button>
                    )}
                    <button onClick={() => handleDelete(notification.id)} className="delete-btn">
                      <FontAwesomeIcon icon={faTrash} /> Delete
                    </button>
                  </div>
                </div>
                <div className="notification-message">
                  {notification.message}
                </div>
              </div>
            ))
          ) : (
            <div className="no-notifications">
              <FontAwesomeIcon icon={faEnvelope} /> No notifications to display
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationWindow;
