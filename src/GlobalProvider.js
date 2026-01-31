import React, { createContext, useState } from 'react';

// Create a context
export const GlobalContext = createContext();

const GlobalProvider = ({ children }) => {
  // Create a state to store the key-value pairs
  const [globalVariable, setGlobalVariable] = useState({});

  // Function to update a specific key in the globalVariable object
  const updateGlobalVariable = (key, value) => {
    setGlobalVariable((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <GlobalContext.Provider value={{ globalVariable, updateGlobalVariable }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
