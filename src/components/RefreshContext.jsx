// RefreshContext.js
import React, { createContext, useState, useContext } from 'react';

const RefreshContext = createContext();

export const RefreshProvider = ({ children }) => {
  const [refresh, setRefresh] = useState(false);

  const triggerRefresh = () => {
    setRefresh(prev => !prev);
  };

  return (
    <RefreshContext.Provider value={{ refresh, triggerRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => useContext(RefreshContext);
