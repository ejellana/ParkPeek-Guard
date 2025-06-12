import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { DrawerActions, useNavigation } from '@react-navigation/native';

export default function Home() {
  const router = useRouter();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Title and Subtitle */}
      <Text style={styles.header}>Hi, Guard!</Text>
      <Text style={styles.subheader}>Here's the list of occupied parking slots</Text>

      {/* Rizal Card */}
      <View style={styles.card}>
        <Text style={styles.cardText}>Rizal Occupancy</Text>
        <Text style={styles.cardText}>0/50</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/scanRizal')}
        >
          <Text style={styles.buttonText}>Scan In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/ScanOutRizal')}
        >
          <Text style={styles.buttonText}>Scan Out</Text>
        </TouchableOpacity>
      </View>

      {/* Einstein Card */}
      <View style={styles.card}>
        <Text style={styles.cardText}>Einstein Occupancy</Text>
        <Text style={styles.cardText}>0/50</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/scanEinstein')}
        >
          <Text style={styles.buttonText}>Scan In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/ScanOutEinstein')}
        >
          <Text style={styles.buttonText}>Scan Out</Text>
        </TouchableOpacity>
      </View>
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
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
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
