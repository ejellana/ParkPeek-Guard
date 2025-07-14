import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ParkingContext } from '../../context/ParkingContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function Home() {
  const router = useRouter();
  const context = useContext(ParkingContext);
  console.log('ParkingContext in Home:', context);
  const { slotCounts } = context || {};

  // Fallback for slotCounts
  const rizalSlots = slotCounts?.Rizal || { current: 0, total: 100 };
  const einsteinSlots = slotCounts?.Einstein || { current: 0, total: 100 };

  const getProgress = (current, total) => (current / total) * 200;
  const getStatusColor = (current, total) => {
    const percentage = getProgress(current, total);
    if (percentage >= 190) return '#e63946'; // Red for nearly full
    if (percentage >= 100) return '#f4a261'; // Orange for half full
    return '#2a9d8f'; // Green for available
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Guard Dashboard</Text>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="car-outline" size={24} color="#264653" />
          <Text style={styles.locationText}>Rizal Parking</Text>
        </View>
        <View style={styles.slotInfo}>
          <Text style={styles.slotText}>
            Slots: {rizalSlots.current}/{rizalSlots.total}
          </Text>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${getProgress(rizalSlots.current, rizalSlots.total)}%`,
                  backgroundColor: getStatusColor(rizalSlots.current, rizalSlots.total),
                },
              ]}
            />
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={() => router.push('/scanRizal')}
          >
            <LinearGradient
              colors={['#D80000', '#E63946']}
              style={styles.scanButton}
            >
              <Ionicons name="qr-code-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Scan In</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={() => router.push('/ScanOutRizal')}
          >
            <LinearGradient
              colors={['#D80000', '#E63946']}
              style={styles.scanButton}
            >
              <Ionicons name="exit-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Scan Out</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="car-outline" size={24} color="#264653" />
          <Text style={styles.locationText}>Einstein Parking</Text>
        </View>
        <View style={styles.slotInfo}>
          <Text style={styles.slotText}>
            Slots: {einsteinSlots.current}/{einsteinSlots.total}
          </Text>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${getProgress(einsteinSlots.current, einsteinSlots.total)}%`,
                  backgroundColor: getStatusColor(einsteinSlots.current, einsteinSlots.total),
                },
              ]}
            />
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={() => router.push('/scanEinstein')}
          >
            <LinearGradient
              colors={['#D80000', '#E63946']}
              style={styles.scanButton}
            >
              <Ionicons name="qr-code-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Scan In</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={() => router.push('/ScanOutEinstein')}
          >
            <LinearGradient
              colors={['#D80000', '#E63946']}
              style={styles.scanButton}
            >
              <Ionicons name="exit-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Scan Out</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#264653',
    textAlign: 'center',
    marginVertical: 54,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 46,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#264653',
    marginLeft: 8,
  },
  slotInfo: {
    marginBottom: 16,
  },
  slotText: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});