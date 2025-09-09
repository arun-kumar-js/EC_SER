
import React, { useState, useRef } from 'react';
import axios from 'axios';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Keyboard,
  Platform,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { LOGIN_OTP, API_ACCESS_KEY } from '../config/config';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OTP_LENGTH = 6;

const OtpScreen = () => {
  const [otp, setOtp] = useState('');
  const inputRef = useRef(null);
  const route = useRoute();
  const { mobileNumber } = route.params;
  console.log('Mobile Number from params:', mobileNumber);
  const navigation = useNavigation();
  const handleOtpChange = (text) => {
    setOtp(text);
  };

  const handlePress = () => {
    inputRef.current?.focus();
  };

const handleResend = async () => {
  try {
    const formData = new FormData();
      formData.append('mobile', mobileNumber);
      formData.append('accesskey', API_ACCESS_KEY);
      formData.append('type', 'verify-user');

     const response = await axios.post(LOGIN_OTP, formData);
    console.log('Response:', response.data);
    Alert.alert('Success', 'OTP has been sent successfully.');
  
  } catch (error) {
    if (error.response && error.response.data) {
      Alert.alert('Error', error.response.data.message || 'Failed to send OTP.');
      console.error('Error sending OTP:', error.response.data);
    } else {
      Alert.alert('Error', 'An error occurred. Please try again.');
      console.error('Error sending OTP:', error);
    }
  }
}



  const handleVerify = async () => {
    console.log('Verify OTP:', otp);
    try {
      const formData = new FormData();
      formData.append('mobile', mobileNumber);
      formData.append('accesskey', API_ACCESS_KEY);
      formData.append('type', 'login-user');
      formData.append('country_code', '60');
      formData.append('otp', otp);
      formData.append('fcm_id', '');

      const response = await axios.post(LOGIN_OTP, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('OTP verification :', response?.data?.message);
      if (response?.data?.error === false) {
        await AsyncStorage.setItem('userData', JSON.stringify(response.data));
        navigation.replace('MainDrawer', { screen: 'Home' });
        
      }
    } catch (error) {
      Alert.alert('OTP verification error:', error.message || 'An error occurred');
    }
  };

  const renderOtpInputs = () => {
    const inputs = [];
    for (let i = 0; i < OTP_LENGTH; i++) {
      inputs.push(
        <View key={i} style={styles.otpBox}>
          <Text style={styles.otpText}>{otp[i] || ''}</Text>
        </View>,
      );
    }
    return inputs;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#E53935" barStyle="light-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>
          Please Enter OTP sent via SMS on{'\n'}+60 {mobileNumber}
        </Text>

        <TouchableOpacity
          style={styles.otpInputContainer}
          onPress={handlePress}
          activeOpacity={1}
        >
          {renderOtpInputs()}
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={otp}
          onChangeText={handleOtpChange}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          caretHidden={true}
          onBlur={() => Keyboard.dismiss()}
        />

        <TouchableOpacity onPress={handleResend}>
          <Text style={styles.resendText}>Resend</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
          <Text style={styles.verifyButtonText}>VERIFY</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  title: {
    fontSize: 30,
    color: '#000000',
    fontWeight: '400',
    marginBottom: 80,
    fontFamily: 'Poppins-Regular',
  
    lineHeight: 30,
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: 16,
    color: '#6C6C6C',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 40,
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
    letterSpacing: 0,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpBox: {
    width: 45,
    height: 50,
    borderBottomWidth: 2,
    borderBottomColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpText: {
    fontSize: 24,
    color: '#000000',
    fontWeight: '600',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  resendText: {
    fontSize: 16,
    color: '#000000',
    textDecorationLine: 'underline',
    textAlign: 'right',
    marginBottom: 60,
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
    lineHeight: 15,
    letterSpacing: 0,
  },
  verifyButton: {
    backgroundColor: '#E53935',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: 21,
    letterSpacing: 0,
  },
});

export default OtpScreen;
