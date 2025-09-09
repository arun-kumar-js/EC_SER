import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { LOGIN_OTP, API_ACCESS_KEY } from '../config/config';

const Login = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const navigation = useNavigation();

  const handleGetOtp = async () => {
    try {
      const formData = new FormData();
      formData.append('mobile', mobileNumber);
      formData.append('accesskey', API_ACCESS_KEY);
      formData.append('type', 'verify-user');

     const response = await axios.post(LOGIN_OTP, formData);
      console.log('Response:', response.data);
      Alert.alert('Success', 'OTP has been sent successfully.');
      navigation.navigate('OtpScreen', { mobileNumber });
    } catch (error) {
      if (error.response && error.response.data) {
        Alert.alert('Error', error.response.data.message || 'Failed to send OTP.');
        console.error('Error sending OTP:', error.response.data);
      } else {
        Alert.alert('Error', 'An error occurred. Please try again.');
        console.error('Error sending OTP:', error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#EE2737" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate("MainDrawer")}>
            <Image
              source={require('../Assets/Images/Arrow.png')}
              style={styles.backArrow}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Login</Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContentContainer}>
            <Image
              source={require('../Assets/Images/logo.png')}
              style={styles.companyLogo}
              resizeMode="contain"
            />

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.countryCode}>+60</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your mobile number"
                  placeholderTextColor="#A9A9A9"
                  keyboardType="phone-pad"
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  maxLength={10}
                />
              </View>

              <Text style={styles.otpInfoText}>
                You will receive a 6 digit OTP through SMS
              </Text>

              <TouchableOpacity style={styles.button} onPress={handleGetOtp}>
                <Text style={styles.buttonText}>GET OTP</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By logging in you agree to our Terms & Conditions
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: wp('4%'),
   // paddingTop: Platform.OS === 'android' ? hp('3.5%') : hp('2%'),
    //paddingBottom: hp('2%'),
  },
  headerTitle: {
    color: '#EE2737',
    marginLeft: wp('2%'),
    fontFamily: 'Poppins',
    fontWeight: '500',

    fontSize: hp('2.2%'),
    lineHeight: hp('3.3%'),
    letterSpacing: 0,
    textAlign: 'center',
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: wp('10%'),
    paddingVertical: hp('5%'),
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: hp('2.5%'),
    marginTop: hp('1%'),
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: hp('2%'),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#D3D3D3',
    width: '100%',
    paddingBottom: hp('1%'),
  },
  countryCode: {
    fontSize: hp('2.2%'),
    color: '#333333',
    marginRight: wp('2.5%'),
  },
  input: {
    flex: 1,
    fontSize: hp('2.2%'),
    color: '#333333',
    paddingVertical: 0,
  },
  otpInfoText: {
    color: '#8A8A8A',
    fontSize: hp('1.8%'),
    marginTop: hp('2%'),
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#EE2737',
    paddingVertical: hp('2.2%'),
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginTop: hp('4.5%'),
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: hp('2.2%'),
    fontWeight: '500',
  },
  footer: {
    padding: wp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: '#8A8A8A',
    fontSize: hp('1.8%'),
    textAlign: 'center',
  },
  backArrow: {
    width: wp('5.5%'),
    height: hp('3%'),

  },
  companyLogo: {
    width: wp('50%'),
    height: hp('20%'),
    //marginTop: hp('8%'),
    marginBottom: hp('6%'),
    alignSelf: 'center',
    resizeMode: 'contain',
  },
});

export default Login;