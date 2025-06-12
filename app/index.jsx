import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in both fields');
      return;
    }

    const email = `${username}@parkpeek.com`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Login Failed', 'Incorrect username or password');
    } else {
      Alert.alert('Success', 'Logged in successfully!');
      router.push('/drawer/home'); // Replace with your actual home route
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.redTop} />

      <Text style={styles.title}>ParkPeek's Guard Page</Text>

      <TextInput
        placeholder="Enter Username"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Enter Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>LOGIN</Text>
      </TouchableOpacity>

      <Text style={styles.linkText}>
        Need help? <Text style={styles.link}>Contact Us</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 300,
    backgroundColor: '#fff',
  },
  redTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 200,
    height: 200,
    borderBottomRightRadius: 100,
    backgroundColor: '#FF5E5E',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    width: '80%',
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#D80000',
    width: '80%',
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  linkText: {
    marginTop: 4,
    fontSize: 13,
    color: '#444',
  },
  link: {
    color: '#007AFF',
  },
});
