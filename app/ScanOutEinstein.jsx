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
import { ParkingContext } from '../context/ParkingContext';

function ScanOutEinsteinScreen() {
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const router = useRouter();
  const { decrementCount } = useContext(ParkingContext);
  console.log('ParkingContext in ScanOutEinsteinScreen:', { decrementCount });

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

  const lockScanner = (duration = 3000) => {
    setTimeout(() => {
      qrLock.current = false;
    }, duration);
  };

  async function handleScan(data) {
    if (qrLock.current) return;
    qrLock.current = true;

    let parsed;
    try {
      parsed = JSON.parse(data);
      console.log('Parsed QR code:', parsed);
    } catch {
      console.log('Failed to parse QR:', 'Invalid format');
      Alert.alert('Error', 'Invalid QR code format');
      lockScanner();
      return;
    }

    const { student_number, parkinglocname, vehicle } = parsed;
    console.log('Validation checks:', {
      student_number,
      parkinglocname,
      vehicle_plate_number: vehicle?.plate_number,
    });

    if (!student_number || parkinglocname !== 'Einstein' || !vehicle?.plate_number) {
      console.log('Invalid QR Data:', { student_number, parkinglocname, vehicle });
      Alert.alert('Error', 'QR code not valid for Einstein scan out');
      lockScanner();
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Authenticated user in ScanOutEinstein:', user);

      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_user_and_vehicle_ids', {
          student_number,
          plate_number: vehicle.plate_number,
        })
        .maybeSingle();

      console.log('RPC response:', { rpcData, rpcError });

      if (rpcError || !rpcData) {
        throw new Error('Profile or vehicle not found');
      }

      const { user_id, vehicle_id } = rpcData;
      console.log('Fetched user_id:', user_id, 'vehicle_id:', vehicle_id);

      // Find active parking transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('parking_transactions')
        .select('id')
        .eq('user_id', user_id)
        .eq('vehicle_id', vehicle_id)
        .eq('parking_slot_id', 1) // Einstein
        .eq('status', 'active')
        .is('time_out', null)
        .order('time_in', { ascending: false })
        .maybeSingle();

      if (transactionError || !transaction) {
        console.log('No active transaction found:', transactionError?.message);
        throw new Error('No active parking session found for this user at Einstein');
      }

      console.log('Active transaction:', transaction);

      // Check current_occupancy
      const { data: slotData, error: slotError } = await supabase
        .from('parking_slots')
        .select('current_occupancy')
        .eq('id', 1) // Einstein
        .single();

      if (slotError || !slotData) {
        throw new Error('Failed to fetch parking slot data');
      }

      if (slotData.current_occupancy <= 0) {
        throw new Error('No occupied slots to decrement in Einstein');
      }

      // Update transaction to clock out
      const now = new Date();
      const { data: updateData, error: updateError } = await supabase
        .from('parking_transactions')
        .update({
          time_out: now.toISOString(),
          status: 'completed',
          updated_at: now.toISOString(),
        })
        .eq('id', transaction.id)
        .select('id, time_out, status')
        .single();

      if (updateError || !updateData) {
        console.log('Failed to update transaction:', updateError?.message);
        throw new Error('Failed to clock out');
      }

      console.log('Updated transaction:', updateData);

      // Decrement current_occupancy
      const { data: updatedSlot, error: slotUpdateError } = await supabase
        .from('parking_slots')
        .update({ current_occupancy: slotData.current_occupancy - 1 })
        .eq('id', 1)
        .select('current_occupancy, total_capacity')
        .single();

      if (slotUpdateError || !updatedSlot) {
        console.log('Failed to decrement slot:', slotUpdateError?.message);
        throw new Error('Failed to update parking slot occupancy');
      }

      console.log('Updated parking slot:', updatedSlot);

      // Update slotCounts
      if (decrementCount) {
        decrementCount('Einstein');
      } else {
        console.warn('decrementCount is undefined');
      }

      Alert.alert('Clocked Out Successfully!', `User: ${student_number}`, [
        {
          text: 'OK',
          onPress: () => router.replace('/drawer/home'),
        },
      ]);
    } catch (err) {
      console.log('General Error:', err.message);
      Alert.alert('Error', err.message || 'Something went wrong');
      lockScanner();
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
        onPress={() => router.replace('/drawer/home')}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

export default ScanOutEinsteinScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
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