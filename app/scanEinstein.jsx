import React, { useEffect, useRef } from 'react';
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

function ScanEinsteinScreen() {
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const router = useRouter();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
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
      console.log('Parsed QR code:', parsed);
    } catch {
      Alert.alert('Invalid QR code format');
      setTimeout(() => (qrLock.current = false), 3000);
      return;
    }

    const { student_number, parkinglocname, vehicle } = parsed;
    console.log('Validation checks:', {
      student_number,
      parkinglocname,
      vehicle_plate_number: vehicle?.plate_number,
    });

    if (!student_number || parkinglocname !== 'Einstein' || !vehicle?.plate_number) {
      Alert.alert(
        'Error',
        `QR code not for Einstein parking`
      );
      setTimeout(() => (qrLock.current = false), 3000);
      return;
    }

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('student_number', student_number)
        .maybeSingle();

      if (profileError || !profile) throw new Error('Profile not found');
      const user_id = profile.user_id;
      console.log('Fetched user_id:', user_id);

      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('id')
        .eq('plate_number', vehicle.plate_number)
        .eq('user_id', user_id)
        .maybeSingle();

      if (vehicleError || !vehicleData) throw new Error('Vehicle not found');
      const vehicle_id = vehicleData.id;
      console.log('Fetched vehicle_id:', vehicle_id);

      const now = new Date();

      const { data: existingTransaction, error: transactionCheckError } = await supabase
        .from('parking_transactions')
        .select('id')
        .eq('user_id', user_id)
        .eq('parking_slot_id', 1) // Einstein's slot ID
        .eq('status', 'active')
        .maybeSingle();

      if (transactionCheckError && transactionCheckError.code !== 'PGRST116') {
        throw new Error(`Transaction Check Error: ${transactionCheckError.message}`);
      }

      if (existingTransaction) {
        console.log('User already parked at Einstein!');
        Alert.alert('User already parked at Einstein!');
        setTimeout(() => (qrLock.current = false), 3000);
        return;
      }

      const { error: transactionError } = await supabase
        .from('parking_transactions')
        .insert([
          {
            user_id,
            vehicle_id,
            parking_slot_id: 1, // Hardcoded for Einstein
            time_in: now.toISOString(),
            status: 'active',
            created_at: now.toISOString(),
          },
        ]);

      if (transactionError) throw new Error(`Transaction Error: ${transactionError.message}`);
      console.log('✅ Successfully inserted new row in parking_transactions');

      Alert.alert('Clocked In Successfully! (Einstein)', `User: ${student_number}`, [
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

export default ScanEinsteinScreen;

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
