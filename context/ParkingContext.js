import React, { createContext, useContext, useEffect, useState } from 'react';

export const ParkingContext = createContext();

export const ParkingProvider = ({ children }) => {
  const [slotCounts, setSlotCounts] = useState({ Rizal: 0, Einstein: 0 });
  const [loading, setLoading] = useState(false);

  const incrementCount = (location) => {
    setSlotCounts((prev) => ({
      ...prev,
      [location]: Math.min((prev[location] || 0) + 1, 50),
    }));
  };

  const decrementCount = (location) => {
    setSlotCounts((prev) => ({
      ...prev,
      [location]: Math.max((prev[location] || 0) - 1, 0),
    }));
  };

  return (
    <ParkingContext.Provider
      value={{
        slotCounts,
        loading,
        incrementCount,
        decrementCount,
      }}
    >
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = () => useContext(ParkingContext);
