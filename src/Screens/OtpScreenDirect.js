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
import { API_BASE_URL, API_ACCESS_KEY } from '../config/config';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  MainDrawer: { screen?: string } | undefined;
  AddressPage: undefined;
  AddAddress: undefined;
  SubCategory: undefined;
  ProductDetails: undefined;
  Login: undefined;
  OtpScreen: { mobileNumber: string };
  Cart: undefined;
};

type OtpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OtpScreen'>;

const OTP_LENGTH = 6;

const OtpScreenDirect = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const route = useRoute();
  const { mobileNumber }: { mobileNumber: string } = route.params;
  console.log('Mobile Number from params:', mobileNumber);
  const navigation = useNavigation<OtpScreenNavigationProp>();

  const handleOtpChange = (text: string) => {
    setOtp(text);
  };

  const handlePress = () => {
    inputRef.current?.focus();
  };

  const handleResend = async () => {
    console.log('Resend OTP');
    setResendLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('mobile', mobileNumber);
      formData.append('accesskey', API_ACCESS_KEY);
      formData.append('type', 'login-user');
      formData.append('country_code', '+60');

      console.log('=== RESENDING OTP ===');
      console.log('Mobile Number:', mobileNumber);

      const response = await axios.post(`${API_BASE_URL}otp-login.php`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('=== RESEND OTP RESPONSE ===');
      console.log('Response Status:', response.status);
      console.log('Response Data:', response.data);

      if (response.data && response.data.error === false) {
        Alert.alert('Success', response.data.message || 'OTP has been resent successfully');
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerify = async () => {
    console.log('Verify OTP:', otp);

    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('mobile', mobileNumber);
      formData.append('accesskey', API_ACCESS_KEY);
      formData.append('type', 'verify-user');
      formData.append('country_code', '+60');
      formData.append('otp', otp);

      console.log('=== VERIFY OTP API ===');
      console.log('Mobile Number:', mobileNumber);
      console.log('OTP:', otp);
      console.log('API Endpoint:', `${API_BASE_URL}otp-login.php`);

      const response = await axios.post(`${API_BASE_URL}otp-login.php`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('=== VERIFY OTP RESPONSE ===');
      console.log('Response Status:', response.status);
      console.log('Response Data:', response.data);
      console.log('Error Field:', response.data?.error);
      console.log('Message Field:', response.data?.message);

      if (response.data && response.data.error === false) {
        // Save user data to AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify(response.data));
        await AsyncStorage.setItem('userToken', response.data.fcm_id || `temp_${mobileNumber}_${Date.now()}`);
        
        Alert.alert('Success', response.data.message || 'OTP verified successfully');
        navigation.replace('MainDrawer', { screen: 'Home' });
      } else {
        Alert.alert('Verification Failed', response.data?.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
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
          Please Enter OTP sent via SMS on {mobileNumber}
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

        <TouchableOpacity 
          onPress={handleResend}
          disabled={resendLoading}
        >
          <Text style={[styles.resendText, resendLoading && styles.resendTextDisabled]}>
            {resendLoading ? 'Resending...' : 'Resend'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.verifyButton, loading && styles.verifyButtonDisabled]} 
          onPress={handleVerify}
          disabled={loading}
        >
          <Text style={styles.verifyButtonText}>
            {loading ? 'VERIFYING...' : 'VERIFY'}
          </Text>
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
  resendTextDisabled: {
    color: '#CCCCCC',
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
  verifyButtonDisabled: {
    backgroundColor: '#CCCCCC',
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

export default OtpScreenDirect;

