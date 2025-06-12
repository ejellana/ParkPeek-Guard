import { useEffect, useRef } from 'react';
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

export default function ScanOutRizal() {
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

    return () => {
      subscription.remove();
    };
  }, []);

  async function handleScan(data) {
    let parsed;
    try {
      parsed = JSON.parse(data);
    } catch {
      Alert.alert('Invalid QR code data');
      qrLock.current = false;
      return;
    }

    const { user_id, student_number, parkinglocname } = parsed;

    if (parkinglocname !== 'Rizal') {
      Alert.alert('QR code is not for Rizal parking');
      qrLock.current = false;
      return;
    }

    try {
      // Check if user is currently parked
      const { data: statusData, error: statusError } = await supabase
        .from('parking_status')
        .select('id, is_parked')
        .eq('user_id', user_id)
        .eq('parkinglocname', 'Rizal')
        .single();

      if (statusError) {
        throw statusError;
      }

      if (!statusData || !statusData.is_parked) {
        Alert.alert('User is not currently parked!');
        qrLock.current = false;
        return;
      }

      // Update parking_status to is_parked = false
      const { error: updateError } = await supabase
        .from('parking_status')
        .update({ is_parked: false, updated_at: new Date() })
        .eq('id', statusData.id);

      if (updateError) throw updateError;

      // Update parking_times with time_out for the latest session
      // Assume the latest session is the one with null time_out
      const { error: timeError } = await supabase
        .from('parking_times')
        .update({ time_out: new Date() })
        .eq('user_id', user_id)
        .eq('parkinglocname', 'Rizal')
        .is('time_out', null)
        .order('time_in', { ascending: false })
        .limit(1);

      if (timeError) throw timeError;

      Alert.alert('Clocked Out Successfully! (Rizal)', `User: ${student_number}`, [
        {
          text: 'OK',
          onPress: () => router.push('/drawer/home'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to clock out');
      qrLock.current = false;
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {Platform.OS === 'android' && <StatusBar hidden />}

      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={({ data }) => {
          if (data && !qrLock.current) {
            qrLock.current = true;
            handleScan(data);
          }
        }}
      />

      <View style={styles.scanBox} />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/drawer/home')}
      >
        <Text style={styles.backButtonText}>{'Back'}</Text>
      </TouchableOpacity>
    </View>
  );
}

// styles remain unchanged


const styles = StyleSheet.create({
  container: {
    flex: 1,
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
