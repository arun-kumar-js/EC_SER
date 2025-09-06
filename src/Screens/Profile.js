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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserData, getWalletBalance } from '../Fuctions/UserDataService';
import { updateUserProfile } from '../Fuctions/UserProfileService';
import Toast from 'react-native-toast-message';
import MapView, { Marker, PROVIDER_APPLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 3.4300291,
    longitude: 101.55816659999999,
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    state: '',
    city: '',
    area: '',
    zipCode: '',
    address: '',
    location: '',
    dateOfBirth: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const refreshProfileData = async () => {
    console.log('=== REFRESHING PROFILE DATA ===');
    await loadUserData();
  };

  const toggleEditMode = async () => {
    if (isEditMode) {
      // Currently in edit mode, save changes
      await handleUpdate();
    } else {
      // Currently in view mode, enter edit mode
      setIsEditMode(true);
      console.log('Entered edit mode');
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        console.log('Current location:', { latitude, longitude });
      },
      error => {
        console.error('Error getting location:', error);
        Alert.alert('Location Error', 'Unable to get current location');
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  const openMapModal = () => {
    getCurrentLocation();
    setMapModalVisible(true);
  };

  const closeMapModal = () => {
    setMapModalVisible(false);
  };

  const handleLocationSelect = (coordinate) => {
    setCurrentLocation(coordinate);
    setFormData(prev => ({
      ...prev,
      location: `${coordinate.latitude}, ${coordinate.longitude}`,
    }));
    closeMapModal();
  };

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
            
            // Update form data with fresh user data from API response
            const updatedFormData = {
              name: userResult.data.name || '',
              email: userResult.data.email || '',
              mobile: userResult.data.mobile || '',
              state: userResult.data.state_name || '',
              city: userResult.data.city_name || '',
              area: userResult.data.area_name || '',
              zipCode: userResult.data.pincode || '',
              address: userResult.data.street || '',
              location: `${userResult.data.street || ''}, ${userResult.data.city_name || ''}, ${userResult.data.state_name || ''}`.replace(/^,\s*|,\s*$/g, ''),
              dateOfBirth: userResult.data.dob || '',
            };
            
            console.log('=== PROFILE API DATA MAPPING ===');
            console.log('API Response Data:', userResult.data);
            console.log('Mapped Form Data:', updatedFormData);
            console.log('User ID:', userResult.data.user_id);
            console.log('Name:', userResult.data.name);
            console.log('Email:', userResult.data.email);
            console.log('Mobile:', userResult.data.mobile);
            console.log('Balance:', userResult.data.balance);
            console.log('City:', userResult.data.city_name);
            console.log('State:', userResult.data.state_name);
            console.log('Pincode:', userResult.data.pincode);
            console.log('Street:', userResult.data.street);
            console.log('Referral Code:', userResult.data.referral_code);
            console.log('Status:', userResult.data.status);
            console.log('Created At:', userResult.data.created_at);
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
              state: userObj.state_name || '',
              city: userObj.city_name || '',
              area: userObj.area_name || '',
              zipCode: userObj.pincode || '',
              address: userObj.street || '',
              location: userObj.location || '',
              dateOfBirth: userObj.dob || '',
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
            state: userObj.state_name || '',
            city: userObj.city_name || '',
            area: userObj.area_name || '',
            zipCode: userObj.pincode || '',
            address: userObj.street || '',
            location: userObj.location || '',
            dateOfBirth: userObj.dob || '',
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

  const handleUpdate = async () => {
    try {
      console.log('=== UPDATING PROFILE ===');
      console.log('Form Data:', formData);
      console.log('User Data:', userData);
      
      if (!userData || !userData.user_id) {
        Alert.alert('Error', 'User data not available');
        return;
      }

      // Prepare profile data for API
      const profileData = {
        user_id: userData.user_id,
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        address: formData.address,
        zipCode: formData.zipCode,
        city_id: formData.city_id || '',
        state_id: formData.state_id || '',
        area_id: formData.area_id || '',
        latitude: currentLocation.latitude.toString(),
        longitude: currentLocation.longitude.toString(),
        dateOfBirth: formData.dateOfBirth,
      };

      console.log('Profile Data for API:', profileData);

      const result = await updateUserProfile(profileData);

      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Profile Updated',
          text2: result.message,
          position: 'top',
        });
        
        // Update local user data
        setUserData(prev => ({
          ...prev,
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          street: formData.address,
          pincode: formData.zipCode,
        }));

        // Exit edit mode
        setIsEditMode(false);
        
        // Refresh profile data
        await refreshProfileData();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Update Failed',
          text2: result.message,
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update profile',
        position: 'top',
      });
    }
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
        <Text style={styles.headerTitle}>
          {isEditMode ? 'Edit Profile' : 'Profile'}
        </Text>
        <View style={styles.headerRight}>
          {isEditMode ? (
            <TouchableOpacity onPress={toggleEditMode} style={styles.editButton}>
              <Text style={styles.editButtonText}>Save</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={toggleEditMode} style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Image 
              source={require('../Assets/icon/logout.png')} 
              style={styles.logoutIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
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
          <TouchableOpacity style={styles.mapContainer} onPress={openMapModal}>
            <Text style={styles.mapText}>Map View</Text>
            <Text style={styles.mapSubtext}>Tap to view/select location</Text>
          </TouchableOpacity>

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

        {/* Action Buttons - Removed duplicate edit button as header already has edit functionality */}
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
