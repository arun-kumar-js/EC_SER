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
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { 
  TEXT_STYLES, 
  BUTTON_STYLES, 
  INPUT_STYLES, 
  COLORS, 
  SPACING, 
  BORDER_RADIUS,
  CONTAINER_STYLES,
  SHADOWS 
} from '../styles/globalStyles';

const LoginUpdated = () => {
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
      <StatusBar barStyle="light-content" backgroundColor={COLORS.accent} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Welcome to EC Services</Text>
          <View style={{ width: 24 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.logoContainer}>
              <Image
                source={require('../Assets/Images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.welcomeText}>Welcome Back!</Text>
              <Text style={styles.subtitleText}>
                Enter your mobile number to continue
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Mobile Number</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.countryCode}>+91</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your mobile number"
                    placeholderTextColor={COLORS.textSecondary}
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    keyboardType="phone-pad"
                    maxLength={10}
                    autoFocus
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  loading && styles.loginButtonDisabled
                ]}
                onPress={handleGetOtp}
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? 'Sending OTP...' : 'Get OTP'}
                </Text>
              </TouchableOpacity>

              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By continuing, you agree to our{' '}
                  <Text style={styles.linkText}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.linkText}>Privacy Policy</Text>
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default LoginUpdated;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.accent,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.accent,
  },
  headerTitle: {
    ...TEXT_STYLES.h5,
    color: COLORS.white,
    textAlign: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  logo: {
    width: wp('40%'),
    height: hp('15%'),
    marginBottom: SPACING.lg,
  },
  welcomeText: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitleText: {
    ...TEXT_STYLES.bodyLarge,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    paddingTop: SPACING.lg,
  },
  inputContainer: {
    marginBottom: SPACING.xl,
  },
  inputLabel: {
    ...TEXT_STYLES.labelLarge,
    marginBottom: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  countryCode: {
    ...TEXT_STYLES.body,
    paddingHorizontal: SPACING.md,
    color: COLORS.textSecondary,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  textInput: {
    flex: 1,
    ...TEXT_STYLES.body,
    paddingHorizontal: SPACING.md,
    paddingVertical: verticalScale(12),
    color: COLORS.text,
  },
  loginButton: {
    ...BUTTON_STYLES.primary,
    ...BUTTON_STYLES.large,
    marginBottom: SPACING.lg,
  },
  loginButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  loginButtonText: {
    ...TEXT_STYLES.buttonLarge,
  },
  termsContainer: {
    paddingHorizontal: SPACING.sm,
  },
  termsText: {
    ...TEXT_STYLES.bodySmall,
    textAlign: 'center',
    lineHeight: moderateScale(20),
  },
  linkText: {
    ...TEXT_STYLES.link,
    fontSize: TEXT_STYLES.bodySmall.fontSize,
  },
});

