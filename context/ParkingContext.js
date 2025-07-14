import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const ParkingContext = createContext();

export const ParkingProvider = ({ children }) => {
  const [slotCounts, setSlotCounts] = useState({
    Rizal: { current: 0, total: 100 },
    Einstein: { current: 0, total: 100 },
  });

  useEffect(() => {
    const fetchSlotCounts = async () => {
      try {
        const { data, error } = await supabase
          .from('parking_slots')
          .select('location_name, current_occupancy, total_capacity');

        if (error) {
          console.error('Supabase error fetching slot counts:', error.message);
          return;
        }

        if (!data || data.length === 0) {
          console.warn('No parking slots found in database');
          return;
        }

        const counts = data.reduce(
          (acc, slot) => ({
            ...acc,
            [slot.location_name]: {
              current: slot.current_occupancy || 0,
              total: slot.total_capacity || 100,
            },
          }),
          { Rizal: { current: 0, total: 100 }, Einstein: { current: 0, total: 100 } }
        );
        console.log('Fetched slot counts:', counts);
        setSlotCounts(counts);
      } catch (err) {
        console.error('Unexpected error fetching slot counts:', err.message);
      }
    };

    fetchSlotCounts();
  }, []);

  const incrementCount = (locationName) => {
    setSlotCounts((prev) => {
      const newCounts = {
        ...prev,
        [locationName]: {
          ...prev[locationName],
          current: (prev[locationName]?.current || 0) + 1,
        },
      };
      console.log('Updated slot counts (increment):', newCounts);
      return newCounts;
    });
  };

  const decrementCount = (locationName) => {
    setSlotCounts((prev) => {
      const current = prev[locationName]?.current || 0;
      if (current <= 0) {
        console.warn(`Cannot decrement ${locationName} below 0`);
        return prev;
      }
      const newCounts = {
        ...prev,
        [locationName]: {
          ...prev[locationName],
          current: current - 1,
        },
      };
      console.log('Updated slot counts (decrement):', newCounts);
      return newCounts;
    });
  };

  return (
    <ParkingContext.Provider value={{ slotCounts, incrementCount, decrementCount }}>
      {children}
    </ParkingContext.Provider>
  );
};