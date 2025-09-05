import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserData, getWalletBalance } from '../Fuctions/UserDataService';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    state: 'Tamil Nadu',
    city: 'Chennai',
    area: 'Saidapet',
    zipCode: '600015',
    address: 'No 23, 5th street, little mount, Chennai',
    location: 'Little Mount, Kotturpuram, Chennai, Tamil Nadu, India',
    dateOfBirth: '23/10/2000',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      console.log('=== PROFILE USER DATA LOADING ===');
      
      // Get user data from AsyncStorage first
      const storedUser = await AsyncStorage.getItem('userData');
      console.log('Stored user from AsyncStorage:', storedUser);
      
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        console.log('Parsed user object:', userObj);
        const userId = userObj.user_id || userObj.id;
        console.log('User ID:', userId);
        
        if (userId) {
          // Get fresh user data from API using UserDataService
          console.log('Calling getUserData API with userId:', userId);
          const userResult = await getUserData(userId);
          console.log('UserDataService API result:', userResult);
          
          if (userResult.success && userResult.data) {
            console.log('Fresh user data from API:', userResult.data);
            // Use fresh data from API
            setUserData(userResult.data);
            
            // Update form data with fresh user data
            const updatedFormData = {
              name: userResult.data.name || userResult.data.username || '',
              email: userResult.data.email || '',
              mobile: userResult.data.mobile || userResult.data.phone || '',
              state: userResult.data.state || 'Tamil Nadu',
              city: userResult.data.city || 'Chennai',
              area: userResult.data.area || 'Saidapet',
              zipCode: userResult.data.zipcode || userResult.data.zip_code || '600015',
              address: userResult.data.address || 'No 23, 5th street, little mount, Chennai',
              location: userResult.data.location || 'Little Mount, Kotturpuram, Chennai, Tamil Nadu, India',
              dateOfBirth: userResult.data.date_of_birth || userResult.data.dob || '23/10/2000',
            };
            console.log('Updated form data:', updatedFormData);
            setFormData(prev => ({
              ...prev,
              ...updatedFormData,
            }));

            // Get wallet balance
            console.log('Getting wallet balance for userId:', userId);
            const balanceResult = await getWalletBalance(userId);
            console.log('Wallet balance result:', balanceResult);
            if (balanceResult.success) {
              setWalletBalance(balanceResult.balance);
              console.log('Wallet balance set to:', balanceResult.balance);
            }
          } else {
            console.log('UserDataService API failed or no data returned, using stored data');
            // Fallback to stored data if API fails
            setUserData(userObj);
            setFormData(prev => ({
              ...prev,
              name: userObj.name || userObj.username || '',
              email: userObj.email || '',
              mobile: userObj.mobile || userObj.phone || '',
            }));
          }
        } else {
          console.log('No user ID found in stored user data, using stored data');
          // No user ID, use stored data
          setUserData(userObj);
          setFormData(prev => ({
            ...prev,
            name: userObj.name || userObj.username || '',
            email: userObj.email || '',
            mobile: userObj.mobile || userObj.phone || '',
          }));
        }
      } else {
        console.log('No stored user data found in AsyncStorage');
        setUserData(null);
        setWalletBalance(0);
      }
      console.log('=== PROFILE USER DATA LOADING COMPLETE ===');
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = () => {
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('userData');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#e60023" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image 
            source={require('../Assets/Images/Arrow.png')} 
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Image 
            source={require('../Assets/icon/logout.png')} 
            style={styles.logoutIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Icon Section */}
        <View style={styles.profileIconSection}>
          <View style={styles.profileIconContainer}>
            <Image 
              source={require('../Assets/icon/profile.png')} 
              style={styles.profileIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.roleText}>Customer</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Enter your name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              placeholder="Enter your email"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile No</Text>
            <TextInput
              style={styles.input}
              value={formData.mobile}
              onChangeText={(text) => setFormData(prev => ({ ...prev, mobile: text }))}
              placeholder="Enter your mobile number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select State</Text>
            <View style={styles.dropdownContainer}>
              <TextInput
                style={styles.input}
                value={formData.state}
                editable={false}
              />
              <Image 
                source={require('../Assets/Images/drop.png')} 
                style={styles.dropdownArrow}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select City</Text>
            <View style={styles.dropdownContainer}>
              <TextInput
                style={styles.input}
                value={formData.city}
                editable={false}
              />
              <Image 
                source={require('../Assets/Images/drop.png')} 
                style={styles.dropdownArrow}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Area</Text>
            <View style={styles.dropdownContainer}>
              <TextInput
                style={styles.input}
                value={formData.area}
                editable={false}
              />
              <Image 
                source={require('../Assets/Images/drop.png')} 
                style={styles.dropdownArrow}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Zip Code</Text>
            <TextInput
              style={styles.input}
              value={formData.zipCode}
              onChangeText={(text) => setFormData(prev => ({ ...prev, zipCode: text }))}
              placeholder="Enter zip code"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.address}
              onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
              placeholder="Enter your address"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.locationText}>{formData.location}</Text>
          </View>

          {/* Map Placeholder */}
          <View style={styles.mapContainer}>
            <Text style={styles.mapText}>Map View</Text>
            <Text style={styles.mapSubtext}>Location will be displayed here</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date Of Birth (Optional)</Text>
            <TextInput
              style={styles.input}
              value={formData.dateOfBirth}
              onChangeText={(text) => setFormData(prev => ({ ...prev, dateOfBirth: text }))}
              placeholder="DD/MM/YYYY"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
            <Text style={styles.updateButtonText}>Edit profile</Text>
          </TouchableOpacity>
          
        
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  header: {
    backgroundColor: '#e60023',
    paddingVertical: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  headerTitle: {
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    flex: 1,
  },
  logoutButton: {
    padding: 8,
  },
  logoutIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  profileIconSection: {
    alignItems: 'center',
    paddingVertical: hp('3%'),
    backgroundColor: '#fff',
    marginBottom: hp('2%'),
  },
  profileIconContainer: {
    width: wp('20%'),
    height: wp('20%'),
    backgroundColor: '#e60023',
    borderRadius: wp('3%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  profileIcon: {
    width: wp('12%'),
    height: wp('12%'),
    tintColor: '#fff',
  },
  roleText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontFamily: 'Montserrat-Medium',
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    marginBottom: hp('2%'),
  },
  inputGroup: {
    marginBottom: hp('2%'),
  },
  label: {
    fontSize: wp('4%'),
    color: '#333',
    fontFamily: 'Montserrat-Medium',
    fontWeight: '500',
    marginBottom: hp('1%'),
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    fontSize: wp('4%'),
    fontFamily: 'Montserrat-Regular',
    backgroundColor: '#fff',
  },
  textArea: {
    height: hp('8%'),
    textAlignVertical: 'top',
  },
  dropdownContainer: {
    position: 'relative',
  },
  dropdownArrow: {
    position: 'absolute',
    right: wp('4%'),
    top: hp('2%'),
    width: wp('4%'),
    height: hp('2%'),
    tintColor: '#666',
  },
  locationText: {
    fontSize: wp('4%'),
    color: '#666',
    fontFamily: 'Montserrat-Regular',
    marginTop: hp('1%'),
  },
  mapContainer: {
    height: hp('20%'),
    backgroundColor: '#f0f0f0',
    borderRadius: wp('2%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: hp('2%'),
  },
  mapText: {
    fontSize: wp('4%'),
    color: '#666',
    fontFamily: 'Montserrat-Medium',
    fontWeight: '500',
  },
  mapSubtext: {
    fontSize: wp('3.5%'),
    color: '#999',
    fontFamily: 'Montserrat-Regular',
    marginTop: hp('0.5%'),
  },
  buttonContainer: {
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('4%'),
  },
  updateButton: {
    backgroundColor: '#e60023',
    borderRadius: wp('2%'),
    paddingVertical: hp('2%'),
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  updateButtonText: {
    color: '#fff',
    fontSize: wp('4.5%'),
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
  },
  changePasswordButton: {
    alignItems: 'center',
  },
  changePasswordText: {
    color: '#e60023',
    fontSize: wp('4%'),
    fontFamily: 'Montserrat-Medium',
    fontWeight: '500',
  },
});

export default ProfileScreen;
