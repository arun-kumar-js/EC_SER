import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
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
  Image,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const Login = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleGetOtp = async () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid mobile number');
      return;
    }

    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);
      // Mock successful OTP send
      Alert.alert('Success', 'OTP has been sent successfully.');
      navigation.navigate('OtpScreen', { mobileNumber });
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#EE2737" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
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

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleGetOtp}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'SENDING...' : 'GET OTP'}
                </Text>
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
    fontFamily: 'Montserrat-Medium',
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
    fontFamily: 'Montserrat-Regular',
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
    fontFamily: 'Montserrat-Regular',
  },
  input: {
    flex: 1,
    fontSize: hp('2.2%'),
    color: '#333333',
    paddingVertical: 0,
    fontFamily: 'Montserrat-Regular',
  },
  otpInfoText: {
    color: '#8A8A8A',
    fontSize: hp('1.8%'),
    marginTop: hp('2%'),
    textAlign: 'center',
    fontFamily: 'Montserrat-Regular',
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
    fontFamily: 'Montserrat-Medium',
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
    fontFamily: 'Montserrat-Regular',
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
  buttonDisabled: {
    backgroundColor: '#D3D3D3',
    opacity: 0.7,
  },
});

export default Login;
