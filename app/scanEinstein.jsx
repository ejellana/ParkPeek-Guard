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

export default function ScanEinstein() {
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

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {Platform.OS === 'android' && <StatusBar hidden />}

      {/* Camera View */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={({ data }) => {
          if (data && !qrLock.current) {
            qrLock.current = true;
            Alert.alert('Clocked In Successfully! (Einstein)', `${data}`, [
              {
                text: 'OK',
                onPress: () => router.push('/drawer/home'),
              },
            ]);// TODO: Send this to Einstein's backend
          }
        }}
      />

      {/* Scan Frame */}
      <View style={styles.scanBox} />

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/drawer/home')}>
        <Text style={styles.backButtonText}>{'Back'}</Text>
      </TouchableOpacity>
    </View>
  );
}

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
