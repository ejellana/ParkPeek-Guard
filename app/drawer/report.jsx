import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function Report() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');

  const handleSubmit = () => {
    Alert.alert('Report submitted!', '', [
      {
        text: 'OK',
        onPress: () => router.push('/drawer/home'),
      },
    ]);
  };

  return (
    <View style={styles.container}>
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
        style={styles.button}
        onPress={handleSubmit}>
        <Text style={styles.buttonText}>SUBMIT REPORT</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 100,
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
    marginBottom: 30,
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
