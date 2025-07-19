import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AppState } from 'react-native';

export const ParkingContext = createContext();

export const ParkingProvider = ({ children }) => {
  const [slotCounts, setSlotCounts] = useState({
    Rizal: { current: 0, total: 100 },
    Einstein: { current: 0, total: 100 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const attemptLogin = async () => {
    try {
      // Replace with your guard app's credentials or service role key
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'guard@parkpeek.com', 
        password: 'guard123', 
      });
      if (error) {
        console.error('Login error:', error.message);
        return false;
      }
      console.log('Login successful:', data.session);
      return true;
    } catch (err) {
      console.error('Unexpected login error:', err.message);
      return false;
    }
  };

  const fetchSlotCounts = async (retryCount = 0, maxRetries = 3) => {
    setLoading(true);
    setError(null);
    try {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Supabase session:', session ? 'Authenticated' : 'Not authenticated');

      if (!session) {
        console.log('Attempting to log in...');
        const loggedIn = await attemptLogin();
        if (!loggedIn) {
          throw new Error('No active session. Login failed.');
        }
     }

      const { data, error } = await supabase
        .from('parking_slots')
        .select('location_name, current_occupancy, total_capacity');

      console.log('Raw parking_slots data:', data);
      if (error) {
        console.error('Supabase error fetching slot counts:', error.message, error.details);
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn('No parking slots found in database');
        throw new Error('No parking slots data available');
      }

      const counts = data.reduce(
        (acc, slot) => {
          if (!slot.location_name || slot.current_occupancy == null || slot.total_capacity == null) {
            console.warn('Invalid slot data:', slot);
            return acc;
          }
          return {
            ...acc,
            [slot.location_name]: {
              current: slot.current_occupancy,
              total: slot.total_capacity,
            },
          };
        },
        { ...slotCounts } // Preserve current counts as fallback
      );

      console.log('Fetched slot counts:', counts);
      setSlotCounts(counts);
      setError(null);
    } catch (err) {
      /*console.error('Error fetching slot counts:', err.message);*/
      if (retryCount < maxRetries) {
        console.log(`Retrying fetch (${retryCount + 1}/${maxRetries})...`);
        setTimeout(() => fetchSlotCounts(retryCount + 1, maxRetries), 1000);
      } else {
        setError('Failed to fetch parking slots. Using local counts.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlotCounts();

    // Real-time subscription
    const subscription = supabase
      .channel('parking_slots_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'parking_slots' },
        (payload) => {
          console.log('Real-time update received:', payload);
          fetchSlotCounts();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // App state listener
    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('App resumed, re-fetching slot counts');
        fetchSlotCounts();
      }
    });

    return () => {
      supabase.removeChannel(subscription);
      appStateSubscription.remove();
    };
  }, []);

  const incrementCount = async (locationName) => {
    setSlotCounts((prev) => {
      const newCounts = {
        ...prev,
        [locationName]: {
          ...prev[locationName],
          current: (prev[locationName]?.current || 0) + 1,
        },
      };
      console.log('Updated slot counts (increment):', newCounts);
      supabase
        .from('parking_slots')
        .update({ current_occupancy: newCounts[locationName].current })
        .eq('location_name', locationName)
        .then(({ error }) => {
          if (error) {
            console.error('Error updating parking_slots:', error.message);
            fetchSlotCounts();
          }
        });
      return newCounts;
    });
  };

  const decrementCount = async (locationName) => {
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
      supabase
        .from('parking_slots')
        .update({ current_occupancy: newCounts[locationName].current })
        .eq('location_name', locationName)
        .then(({ error }) => {
          if (error) {
            console.error('Error updating parking_slots:', error.message);
            fetchSlotCounts();
          }
        });
      return newCounts;
    });
  };

  return (
    <ParkingContext.Provider value={{ slotCounts, incrementCount, decrementCount, loading, error, fetchSlotCounts }}>
      {children}
    </ParkingContext.Provider>
  );
};