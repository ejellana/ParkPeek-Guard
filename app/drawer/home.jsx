import React, { useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ParkingContext } from '../../context/ParkingContext';

const MAX_SLOTS = 50;

export default function Home() {
  const router = useRouter();
  const { slotCounts, loading } = useContext(ParkingContext);
  const rizalCount = slotCounts.Rizal || 0;
  const einsteinCount = slotCounts.Einstein || 0;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Hi, Guard!</Text>
      <Text style={styles.subheader}>Here's the list of occupied parking slots</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#D80000" style={{ marginVertical: 20 }} />
      ) : (
        <>
          {['Rizal', 'Einstein'].map((location) => {
            const count = slotCounts[location] || 0;
            return (
              <View style={styles.card} key={location}>
                <Text style={styles.cardText}>{location} Occupancy</Text>
                <Text style={styles.cardText}>{count}/{MAX_SLOTS}</Text>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => router.push(`/scan${location}`)}
                  disabled={count >= MAX_SLOTS} 
                >
                  <Text style={styles.buttonText}>Scan In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => router.push(`/ScanOut${location}`)}
                >
                  <Text style={styles.buttonText}>Scan Out</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 60,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subheader: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
  },
  card: {
    width: '85%',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#D80000',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
