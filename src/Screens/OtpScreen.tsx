import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
  Keyboard,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OTP_LENGTH = 6;

const OtpScreen = () => {
  const [otp, setOtp] = useState('');
  const inputRef = useRef<TextInput>(null);
  const route = useRoute();
  const { mobileNumber }: { mobileNumber: string } = route.params as {
    mobileNumber: string;
  };
  console.log('Mobile Number from params:', mobileNumber);
  const navigation = useNavigation();

  const handleOtpChange = (text: string) => {
    setOtp(text);
  };

  const handlePress = () => {
    inputRef.current?.focus();
  };

  const handleResend = () => {
    console.log('Resend OTP');
  };

  const handleVerify = async () => {
    console.log('Verify OTP:', otp);

    // Simulate API call delay
    setTimeout(() => {
      // Mock successful verification - accept any 6-digit OTP
      if (otp.length === 6) {
        const mockUserData = {
          user_id: '1',
          name: 'Demo User',
          mobile: mobileNumber,
          email: 'demo@spiderekart.com',
          token: 'mock_token_12345',
        };

        AsyncStorage.setItem('userData', JSON.stringify(mockUserData));
        AsyncStorage.setItem('userToken', mockUserData.token);

        Alert.alert('Success', 'OTP verified successfully!');
        navigation.replace('MainApp');
      } else {
        Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      }
    }, 1000);
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
    fontFamily: 'Montserrat-Regular',

    lineHeight: 30,
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: 16,
    color: '#6C6C6C',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 40,
    fontFamily: 'Montserrat-Regular',
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
    fontFamily: 'Montserrat-SemiBold',
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
    fontFamily: 'Montserrat-Regular',
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
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: 21,
    letterSpacing: 0,
  },
});

export default OtpScreen;
