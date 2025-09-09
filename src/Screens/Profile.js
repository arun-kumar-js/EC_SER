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
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserData, getWalletBalance } from '../Fuctions/UserDataService';
import { updateUserProfile } from '../Fuctions/UserProfileService';
import Toast from 'react-native-toast-message';
import MapView, { Marker, PROVIDER_APPLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  ADD_NEW_ADDRESS_STATE,
  ADD_NEW_ADDRESS_CITY,
  API_ACCESS_KEY,
} from '../config/config';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
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
    state_id: '',
    city_id: '',
    area_id: '',
  });

  // State and city selection states
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [areaModalVisible, setAreaModalVisible] = useState(false);

  useEffect(() => {
    loadUserData();
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const formData = new FormData();
      formData.append('accesskey', API_ACCESS_KEY);

      const response = await axios.post(ADD_NEW_ADDRESS_STATE, formData);
      console.log('Fetched states:', response.data);
      setStates(response.data.data || []);
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const fetchCities = async (stateId) => {
    try {
      const formData = new FormData();
      formData.append('accesskey', API_ACCESS_KEY);
      formData.append('state_id', stateId);

      const response = await axios.post(ADD_NEW_ADDRESS_CITY, formData);
      console.log('Fetched cities:', response.data);
      setCities(response.data.data || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const handleStateSelect = (state) => {
    setSelectedState(state);
    setSelectedCity(null);
    setSelectedArea(null);
    setCities([]);
    setAreas([]);
    setStateModalVisible(false);

    // Update form data
    setFormData(prev => ({
      ...prev,
      state: state.name,
      state_id: state.id,
      city: '',
      city_id: '',
      area: '',
      area_id: '',
    }));

    // Fetch cities for selected state
    fetchCities(state.id);
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setSelectedArea(null);
    setAreas([]);
    setCityModalVisible(false);

    // Update form data
    setFormData(prev => ({
      ...prev,
      city: city.name,
      city_id: city.id,
      area: '',
      area_id: '',
    }));
  };

  const handleAreaSelect = (area) => {
    setSelectedArea(area);
    setAreaModalVisible(false);

    // Update form data
    setFormData(prev => ({
      ...prev,
      area: area.name,
      area_id: area.id,
    }));
  };

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
    setMapLoading(true);
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
              state_id: userResult.data.state_id || '',
              city_id: userResult.data.city_id || '',
              area_id: userResult.data.area_id || '',
            };

            // Set selected state and city if they exist
            if (userResult.data.state_id && userResult.data.state_name) {
              setSelectedState({
                id: userResult.data.state_id,
                name: userResult.data.state_name
              });
            }
            if (userResult.data.city_id && userResult.data.city_name) {
              setSelectedCity({
                id: userResult.data.city_id,
                name: userResult.data.city_name
              });
            }
            if (userResult.data.area_id && userResult.data.area_name) {
              setSelectedArea({
                id: userResult.data.area_id,
                name: userResult.data.area_name
              });
            }

            // Update current location with user's coordinates
            if (userResult.data.latitude && userResult.data.longitude) {
              setCurrentLocation({
                latitude: parseFloat(userResult.data.latitude),
                longitude: parseFloat(userResult.data.longitude),
              });
              console.log('Updated location from user data:', {
                latitude: parseFloat(userResult.data.latitude),
                longitude: parseFloat(userResult.data.longitude),
              });
            }
            
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
              style={[styles.input, !isEditMode && styles.readOnlyInput]}
              value={formData.name}
              onChangeText={isEditMode ? (text) => setFormData(prev => ({ ...prev, name: text })) : undefined}
              placeholder="Enter your name"
              editable={isEditMode}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, !isEditMode && styles.readOnlyInput]}
              value={formData.email}
              onChangeText={isEditMode ? (text) => setFormData(prev => ({ ...prev, email: text })) : undefined}
              placeholder="Enter your email"
              keyboardType="email-address"
              editable={isEditMode}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile No</Text>
            <TextInput
              style={[styles.input, !isEditMode && styles.readOnlyInput]}
              value={formData.mobile}
              onChangeText={isEditMode ? (text) => setFormData(prev => ({ ...prev, mobile: text })) : undefined}
              placeholder="Enter your mobile number"
              keyboardType="phone-pad"
              editable={isEditMode}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select State</Text>
            <TouchableOpacity 
              style={styles.dropdownContainer}
              onPress={isEditMode ? () => setStateModalVisible(true) : undefined}
              disabled={!isEditMode}
            >
              <TextInput
                style={[styles.input, !isEditMode && styles.readOnlyInput]}
                value={formData.state}
                editable={false}
                placeholder="Select State"
              />
              {isEditMode && (
                <Image 
                  source={require('../Assets/Images/drop.png')} 
                  style={styles.dropdownArrow}
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select City</Text>
            <TouchableOpacity 
              style={styles.dropdownContainer}
              onPress={isEditMode ? () => {
                if (cities.length > 0) {
                  setCityModalVisible(true);
                } else if (selectedState) {
                  fetchCities(selectedState.id);
                  setCityModalVisible(true);
                } else {
                  Alert.alert('Please select a state first');
                }
              } : undefined}
              disabled={!isEditMode}
            >
              <TextInput
                style={[styles.input, !isEditMode && styles.readOnlyInput]}
                value={formData.city}
                editable={false}
                placeholder="Select City"
              />
              {isEditMode && (
                <Image 
                  source={require('../Assets/Images/drop.png')} 
                  style={styles.dropdownArrow}
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Area</Text>
            <TouchableOpacity 
              style={styles.dropdownContainer}
              onPress={isEditMode ? () => {
                if (areas.length > 0) {
                  setAreaModalVisible(true);
                } else {
                  Alert.alert('Please select a city first');
                }
              } : undefined}
              disabled={!isEditMode}
            >
              <TextInput
                style={[styles.input, !isEditMode && styles.readOnlyInput]}
                value={formData.area}
                editable={false}
                placeholder="Select Area"
              />
              {isEditMode && (
                <Image 
                  source={require('../Assets/Images/drop.png')} 
                  style={styles.dropdownArrow}
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Zip Code</Text>
            <TextInput
              style={[styles.input, !isEditMode && styles.readOnlyInput]}
              value={formData.zipCode}
              onChangeText={isEditMode ? (text) => setFormData(prev => ({ ...prev, zipCode: text })) : undefined}
              placeholder="Enter zip code"
              keyboardType="numeric"
              editable={isEditMode}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea, !isEditMode && styles.readOnlyInput]}
              value={formData.address}
              onChangeText={isEditMode ? (text) => setFormData(prev => ({ ...prev, address: text })) : undefined}
              placeholder="Enter your address"
              multiline
              numberOfLines={3}
              editable={isEditMode}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.locationText}>{formData.location}</Text>
          </View>

          {/* Map View */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location Map:</Text>
            <View style={styles.mapContainer}>
              {mapLoading && (
                <View style={styles.mapLoadingContainer}>
                  <Text style={styles.mapLoadingText}>Loading map...</Text>
                </View>
              )}
              <MapView
                style={styles.map}
                provider={PROVIDER_APPLE}
                region={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                onPress={(event) => {
                  const coordinate = event.nativeEvent.coordinate;
                  setCurrentLocation(coordinate);
                  setFormData(prev => ({
                    ...prev,
                    location: `${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}`,
                  }));
                }}
                onMapReady={() => setMapLoading(false)}
                onError={(error) => {
                  console.error('Map error:', error);
                  setMapLoading(false);
                }}
                showsUserLocation={true}
                showsMyLocationButton={false}
                showsCompass={false}
                showsScale={false}
                scrollEnabled={true}
                zoomEnabled={true}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                <Marker
                  coordinate={currentLocation}
                  title="Your Location"
                  description="Tap map to update location"
                  pinColor="#e60023"
                />
              </MapView>
            </View>
            {isEditMode && (
              <TouchableOpacity style={styles.mapButton} onPress={openMapModal}>
                <Text style={styles.mapButtonText}>🗺️ Open Full Map View</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date Of Birth (Optional)</Text>
            <TextInput
              style={[styles.input, !isEditMode && styles.readOnlyInput]}
              value={formData.dateOfBirth}
              onChangeText={isEditMode ? (text) => setFormData(prev => ({ ...prev, dateOfBirth: text })) : undefined}
              placeholder="DD/MM/YYYY"
              editable={isEditMode}
            />
          </View>
        </View>

        {/* Action Buttons - Removed duplicate edit button as header already has edit functionality */}
      </ScrollView>

      {/* Bottom Edit Button */}
      <View style={styles.bottomButtonContainer}>
        {isEditMode ? (
          <TouchableOpacity onPress={toggleEditMode} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={toggleEditMode} style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Map Modal */}
      <Modal
        visible={mapModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={closeMapModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#e60023" />
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeMapModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Location</Text>
            <TouchableOpacity onPress={() => handleLocationSelect(currentLocation)} style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>✓</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.mapWrapper}>
            {mapLoading && (
              <View style={styles.fullMapLoadingContainer}>
                <Text style={styles.fullMapLoadingText}>Loading map...</Text>
              </View>
            )}
            <MapView
              style={styles.fullMap}
              provider={PROVIDER_APPLE}
              region={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onPress={(event) => {
                const coordinate = event.nativeEvent.coordinate;
                setCurrentLocation(coordinate);
              }}
              onMapReady={() => setMapLoading(false)}
              onError={(error) => {
                console.error('Full map error:', error);
                setMapLoading(false);
              }}
              showsUserLocation={true}
              showsMyLocationButton={true}
              showsCompass={true}
              showsScale={true}
            >
              <Marker
                coordinate={currentLocation}
                title="Selected Location"
                description="Tap map to change location"
                pinColor="#e60023"
              />
            </MapView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* State Modal */}
      <Modal
        visible={stateModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStateModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setStateModalVisible(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}>
            <View
              style={{
                backgroundColor: '#fff',
                marginHorizontal: wp('10%'),
                borderRadius: wp('2%'),
                maxHeight: hp('50%'),
              }}
            >
              <FlatList
                data={states}
                keyExtractor={(item, index) => item.id || index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      paddingVertical: hp('1.5%'),
                      paddingHorizontal: wp('4%'),
                      borderBottomWidth: 1,
                      borderBottomColor: '#EAEAEA',
                    }}
                    onPress={() => handleStateSelect(item)}
                  >
                    <Text style={{ fontSize: wp('4.5%'), color: '#333333' }}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* City Modal */}
      <Modal
        visible={cityModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCityModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setCityModalVisible(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}>
            <View
              style={{
                backgroundColor: '#fff',
                marginHorizontal: wp('10%'),
                borderRadius: wp('2%'),
                maxHeight: hp('50%'),
              }}
            >
              <FlatList
                data={cities}
                keyExtractor={(item, index) => item.id || index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      paddingVertical: hp('1.5%'),
                      paddingHorizontal: wp('4%'),
                      borderBottomWidth: 1,
                      borderBottomColor: '#EAEAEA',
                    }}
                    onPress={() => handleCitySelect(item)}
                  >
                    <Text style={{ fontSize: wp('4.5%'), color: '#333333' }}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Area Modal */}
      <Modal
        visible={areaModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAreaModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setAreaModalVisible(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}>
            <View
              style={{
                backgroundColor: '#fff',
                marginHorizontal: wp('10%'),
                borderRadius: wp('2%'),
                maxHeight: hp('50%'),
              }}
            >
              <FlatList
                data={areas}
                keyExtractor={(item, index) => item.id || index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      paddingVertical: hp('1.5%'),
                      paddingHorizontal: wp('4%'),
                      borderBottomWidth: 1,
                      borderBottomColor: '#EAEAEA',
                    }}
                    onPress={() => handleAreaSelect(item)}
                  >
                    <Text style={{ fontSize: wp('4.5%'), color: '#333333' }}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  readOnlyInput: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
    color: '#666',
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
    marginVertical: hp('2%'),
    overflow: 'hidden',
    position: 'relative',
  },
  mapLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  mapLoadingText: {
    fontSize: wp('4%'),
    color: '#666',
    fontFamily: 'Montserrat-Medium',
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
  // Map styles
  map: {
    flex: 1,
    width: '100%',
  },
  mapButton: {
    backgroundColor: '#e60023',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#fff',
    fontSize: wp('3.5%'),
    fontFamily: 'Montserrat-Medium',
    fontWeight: '500',
  },
  // Bottom button styles
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: hp('1.5%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#e60023',
    paddingVertical: hp('1.5%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  editButtonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#e60023',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    minWidth: 40,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: wp('5%'),
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
  },
  modalTitle: {
    color: '#fff',
    fontSize: wp('4.5%'),
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  confirmButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    minWidth: 40,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: wp('5%'),
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
  },
  mapWrapper: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  fullMapLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  fullMapLoadingText: {
    fontSize: wp('4.5%'),
    color: '#666',
    fontFamily: 'Montserrat-Medium',
  },
  fullMap: {
    flex: 1,
    width: '100%',
  },
});

export default ProfileScreen;
