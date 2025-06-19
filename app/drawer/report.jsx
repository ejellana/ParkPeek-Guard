import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Picker } from '@react-native-picker/picker';

export default function Report() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [parkingSlot, setParkingSlot] = useState('');
  const [isGuard, setIsGuard] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const checkGuardRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'You must be logged in to submit a report');
        router.replace('/');
        return;
      }

      const { data, error } = await supabase
        .from('roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error || data?.role !== 'guard') {
        Alert.alert('Error', 'Only guards can submit reports');
        router.replace('/(drawer)/home');
        return;
      }

      setIsGuard(true);
    };

    checkGuardRole();
  }, []);

  const handleSubmit = async () => {
    if (!isGuard) {
      Alert.alert('Error', 'Only guards can submit reports');
      return;
    }

    if (!title.trim() || !details.trim()) {
      Alert.alert('Error', 'Please fill in both title and details');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const reportData = {
        user_id: user.id,
        title: title.trim(),
        details: details.trim(),
        parking_slot_id: parkingSlot ? parseInt(parkingSlot) : null,
        status: 'active',
      };

      const { error } = await supabase
        .from('incident_reports')
        .insert([reportData]);

      if (error) {
        console.log('Error inserting report:', error.message);
        throw new Error('Failed to submit report: ' + error.message);
      }

      Alert.alert('Success', 'Report submitted successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setTitle('');
            setDetails('');
            setParkingSlot('');
            router.replace('/drawer/home');
          },
        },
      ]);
    } catch (err) {
      console.log('Submission error:', err.message);
      Alert.alert('Error', err.message || 'Something went wrong');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Did something happen?{'\n'}Report it!</Text>

        <TextInput
          style={styles.input}
          placeholder="Title of Report"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#555"
        />

        <TextInput
          style={styles.textArea}
          placeholder="Report Details"
          value={details}
          onChangeText={setDetails}
          multiline
          numberOfLines={6}
          placeholderTextColor="#555"
        />

        <TouchableOpacity
          style={[styles.input, showPicker && styles.inputActive]}
          onPress={() => {
            setShowPicker(!showPicker);
            Animated.timing(fadeAnim, {
              toValue: showPicker ? 0 : 1,
              duration: 200,
              useNativeDriver: true,
            }).start();
          }}
        >
          <Text style={[styles.inputText, parkingSlot ? { color: '#000' } : { color: '#999' }]}>
            {parkingSlot === '1' ? 'Einstein Parking' :
              parkingSlot === '2' ? 'Rizal Parking' :
              'Select Parking Location (Optional)'}
          </Text>
        </TouchableOpacity>

        {showPicker && (
          <Animated.View style={[styles.pickerContainer, { opacity: fadeAnim }]}>
            <Picker
              selectedValue={parkingSlot}
              onValueChange={(itemValue) => {
                setParkingSlot(itemValue);
                setShowPicker(false);
                Animated.timing(fadeAnim, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
                }).start();
              }}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Select Parking Location (Optional)" value="" />
              <Picker.Item label="Einstein Parking" value="1" />
              <Picker.Item label="Rizal Parking" value="2" />
            </Picker>
          </Animated.View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>SUBMIT REPORT</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 100,
    paddingBottom: 50,
    alignItems: 'center',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  inputActive: {
    borderColor: '#1e90ff',
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#1e90ff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  inputText: {
    fontSize: 16,
    color: '#999',
  },
  textArea: {
    width: '100%',
    backgroundColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#1e90ff',
    borderRadius: 5,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  picker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 150 : 50,
    color: '#000',
  },
  pickerItem: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
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
