import { Stack } from 'expo-router';
import { ParkingProvider } from '../context/ParkingContext';

export default function Layout() {
  return (
    <ParkingProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(drawer)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="scanRizal" />
        <Stack.Screen name="ScanOutRizal" />
        <Stack.Screen name="scanEinstein" />
        <Stack.Screen name="ScanOutEinstein" />
      </Stack>
    </ParkingProvider>
  );
}