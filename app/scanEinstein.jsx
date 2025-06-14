import React, { useEffect, useRef, useContext } from 'react';
import {
  View,
  Alert,
  AppState,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { CameraView } from 'expo-camera';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { ParkingProvider, ParkingContext } from '../context/ParkingContext';

function ScanEinsteinScreen() {
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const router = useRouter();
  const { incrementCount } = useContext(ParkingContext);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  async function handleScan(data) {
    if (qrLock.current) return;
    qrLock.current = true;

    let parsed;
    try {
      parsed = JSON.parse(data);
    } catch {
      Alert.alert('Invalid QR code format');
      setTimeout(() => (qrLock.current = false), 3000);
      return;
    }

    const { studentNumber, parkinglocname } = parsed;
    if (!studentNumber || parkinglocname !== 'Einstein') {
      Alert.alert('Invalid QR code');
      setTimeout(() => (qrLock.current = false), 3000);
      return;
    }

    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('user_id')
        .eq('student_number', studentNumber)
        .maybeSingle();

      if (userError || !user) throw new Error('User not found');
      const user_id = user.user_id;
      const now = new Date();

      const { data: status, error: statusError } = await supabase
        .from('parking_status')
        .select('id, is_parked')
        .eq('user_id', user_id)
        .eq('parkinglocname', 'Einstein')
        .maybeSingle();

      if (statusError && statusError.code !== 'PGRST116') throw statusError;

      if (status?.is_parked) {
        Alert.alert('User already parked!');
        qrLock.current = false;
        return;
      }

      if (status) {
        await supabase
          .from('parking_status')
          .update({ is_parked: true, updated_at: now })
          .eq('id', status.id);
      } else {
        await supabase.from('parking_status').insert([{
          user_id,
          student_number: studentNumber,
          parkinglocname: 'Einstein',
          is_parked: true,
          updated_at: now,
        }]);
      }

      await supabase.from('parking_times').insert([{
        user_id,
        student_number: studentNumber,
        parkinglocname: 'Einstein',
        time_in: now,
      }]);

      incrementCount('Einstein');

      Alert.alert('Clocked In Successfully! (Einstein)', `User: ${studentNumber}`, [
        {
          text: 'OK',
          onPress: () => router.push('/drawer/home'),
        },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong');
      setTimeout(() => (qrLock.current = false), 3000);
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {Platform.OS === 'android' && <StatusBar hidden />}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={({ data }) => handleScan(data)}
      />
      <View style={styles.scanBox} />
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/drawer/home')}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ScanEinstein() {
  return (
    <ParkingProvider>
      <ScanEinsteinScreen />
    </ParkingProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scanBox: {
    position: 'absolute',
    top: '30%',
    left: '20%',
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    zIndex: 10,
  },
  backButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: '#D80000',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
