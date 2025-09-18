import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  Clipboard,
  Dimensions,
  ActivityIndicator,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const ReferAndEarn = ({ navigation }) => {
  const [referralCode, setReferralCode] = useState('DB3MFZWY14');
  const [referralData, setReferralData] = useState({
    earningPercentage: 10,
    minimumOrder: 500,
    maxEarning: 100
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserReferralCode();
    fetchReferralData();
  }, []);

  const loadUserReferralCode = async () => {
    try {
      console.log('Loading referral code from user data...');
      const storedUser = await AsyncStorage.getItem('userData');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        console.log('User data from AsyncStorage:', userObj);
        
        if (userObj.referral_code) {
          console.log('Found referral code in user data:', userObj.referral_code);
          setReferralCode(userObj.referral_code);
          return true; // Successfully loaded from AsyncStorage
        }
      }
      return false; // No referral code found in AsyncStorage
    } catch (error) {
      console.error('Error loading referral code from AsyncStorage:', error);
      return false;
    }
  };

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      console.log('Fetching referral data...');
      
      const formData = new FormData();
      formData.append('settings', '1');
      formData.append('accesskey', '90336');
      formData.append('get_referral_settings', '1');

      const response = await axios.post(
        'https://spiderekart.in/ec_service/api-firebase/settings.php',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Referral API Response:', response.data);

      if (response.data && !response.data.error && response.data.referral_settings) {
        const settings = response.data.referral_settings;
        setReferralData({
          earningPercentage: settings.earning_percentage || 10,
          minimumOrder: settings.minimum_order || 500,
          maxEarning: settings.max_earning || 100
        });
        
        // Only update referral code from API if not already set from AsyncStorage
        if (settings.referral_code) {
          setReferralCode(settings.referral_code);
        }
      } else {
        console.log('No referral data received, using defaults');
        // Use default values if API fails
        setReferralData({
          earningPercentage: 10,
          minimumOrder: 500,
          maxEarning: 100
        });
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
      // Use default values on error
      setReferralData({
        earningPercentage: 10,
        minimumOrder: 500,
        maxEarning: 100
      });
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    Clipboard.setString(referralCode);
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  const shareReferral = async () => {
    try {
      const message = `Join me on EC Service! Use my referral code: ${referralCode} and get amazing deals!`;
      
      const result = await Share.share({
        message: message,
        title: 'EC Service Referral',
      });

      if (result.action === Share.sharedAction) {
        // Content was shared successfully
        console.log('Referral shared successfully');
      } else if (result.action === Share.dismissedAction) {
        // Sharing was dismissed
        console.log('Sharing dismissed');
      }
    } catch (error) {
      console.error('Error sharing referral:', error);
      Alert.alert('Error', 'Failed to share referral. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
            <Image source={require('../Assets/Images/Arrow.png')} style={{width:16, height:16, tintColor: '#fff'}} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite friends</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e53e3e" />
            <Text style={styles.loadingText}>Loading referral data...</Text>
          </View>
        ) : (
          <>
            {/* Referral Information Box */}
            <View style={styles.infoBox}>
              <View style={styles.infoIconContainer}>
                <Image source={require('../Assets/Images/gift.png')} style={styles.infoIcon} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoText}>
                  Refer a friend and earn upto {referralData.earningPercentage}% when your friend's first order is successfully delivered. Minimum order amount should be ₹{referralData.minimumOrder}. Which allows you to earn upto ₹{referralData.maxEarning}.
                </Text>
              </View>
            </View>

        {/* Refer & Earn Section */}
        <View style={styles.referSection}>
          {/* Gift Icon */}
          <View style={styles.giftIconContainer}>
          <Image source={require('../Assets/Images/gift.png')} style={{width: 80, height: 80}} />
          </View>

          {/* Title */}
          <Text style={styles.referTitle}>Refer & Earn</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>Your Referral Code</Text>

          {/* Referral Code Box */}
          <TouchableOpacity style={styles.codeContainer} onPress={copyReferralCode}>
            <Text style={styles.referralCode}>{referralCode}</Text>
          </TouchableOpacity>

          {/* Tap to copy text */}
          <Text style={styles.tapToCopy}>Tap to copy</Text>
        </View>

            {/* Refer Now Button */}
            <TouchableOpacity style={styles.referButton} onPress={shareReferral}>
           
              <Text style={styles.referButtonText}>REFER NOW</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#e53e3e',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  infoBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIconContainer: {
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIcon: {
    width: 24,
    height: 24,
    tintColor: '#e53e3e',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontFamily: 'Montserrat-Regular',
  },
  referSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  giftIconContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  referTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Montserrat-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
    marginBottom: 16,
  },
  codeContainer: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e53e3e',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  referralCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 2,
  },
  tapToCopy: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  referButton: {
    backgroundColor: '#e53e3e',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    minWidth: 200,
  },
  referButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    fontFamily: 'Montserrat-Regular',
  },
});

export default ReferAndEarn;
