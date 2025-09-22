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
import { useUserProfile } from '../Context/UserProfileContext';
import Toast from 'react-native-toast-message';
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import { getMapProvider, getMapProviderName } from '../utils/mapUtils';
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
  const { userData, updateUserData, isLoading: userLoading } = useUserProfile();
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Separate display values for TextInput components
  const [displayValues, setDisplayValues] = useState({
    name: '',
    email: '',
    mobile: '',
    state: '',
    city: '',
    zipCode: '',
    address: '',
    dateOfBirth: '',
    gst_no: '',
    landmark: '',
  });

  // Debug form data changes
  useEffect(() => {
    console.log('Form data changed:', formData);
    // Update display values when form data changes
    setDisplayValues({
      name: formData.name || '',
      email: formData.email || '',
      mobile: formData.mobile || '',
      state: formData.state || '',
      city: formData.city || '',
      zipCode: formData.zipCode || '',
      address: formData.address || '',
      dateOfBirth: formData.dateOfBirth || '',
      gst_no: formData.gst_no || '',
      landmark: formData.landmark || '',
    });
  }, [formData]);
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
    zipCode: '',
    address: '',
    location: '',
    dateOfBirth: '',
    state_id: '',
    city_id: '',
    area_id: '',
    gst_no: '',
    landmark: '',
  });

  // State and city selection states
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);

  useEffect(() => {
    loadUserData();
    fetchStates();
  }, [userData]);

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
    setCities([]);
    setStateModalVisible(false);

    // Update form data
    setFormData(prev => ({
      ...prev,
      state: state.name,
      state_id: state.id,
      city: '',
      city_id: '',
    }));
    
    // Update display values
    setDisplayValues(prev => ({
      ...prev,
      state: state.name,
      city: '',
    }));

    // Fetch cities for selected state
    fetchCities(state.id);
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setCityModalVisible(false);

    // Update form data
    setFormData(prev => ({
      ...prev,
      city: city.name,
      city_id: city.id,
    }));
    
    // Update display values
    setDisplayValues(prev => ({
      ...prev,
      city: city.name,
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
      
      // User data is now managed by UserProfileContext
      if (userData) {
        console.log('User data from context:', userData);
        const userId = userData.user_id || userData.id;
        console.log('User ID:', userId);
        
        if (userId) {
          // Update form data with user data from context
          const updatedFormData = {
            name: userData.name || '',
            email: userData.email || '',
            mobile: userData.mobile || '',
            state: userData.state_name || selectedState?.name || '',
            city: userData.city_name || selectedCity?.name || '',
            zipCode: userData.pincode || '',
            address: userData.street || '',
            location: `${userData.street || ''}, ${userData.city_name || selectedCity?.name || ''}, ${userData.state_name || selectedState?.name || ''}`.replace(/^,\s*|,\s*$/g, ''),
            dateOfBirth: userData.dob || '',
            state_id: userData.state_id || selectedState?.id || '',
            city_id: userData.city_id || selectedCity?.id || '',
            area_id: userData.area_id || '',
            gst_no: userData.gst_no || '',
            landmark: userData.landmark || '',
          };

          // Set selected state and city if they exist
          if (userData.state_id) {
            const stateName = userData.state_name || 
              (states.find(s => s.id === userData.state_id)?.name) || 
              '';
            setSelectedState({
              id: userData.state_id,
              name: stateName
            });
          }
          if (userData.city_id) {
            const cityName = userData.city_name || 
              (cities.find(c => c.id === userData.city_id)?.name) || 
              '';
            setSelectedCity({
              id: userData.city_id,
              name: cityName
            });
          }

          // Update current location with user's coordinates
          if (userData.latitude && userData.longitude) {
            setCurrentLocation({
              latitude: parseFloat(userData.latitude),
              longitude: parseFloat(userData.longitude),
            });
            console.log('Updated location from user data:', {
              latitude: parseFloat(userData.latitude),
              longitude: parseFloat(userData.longitude),
            });
          }
          
          console.log('=== PROFILE DATA MAPPING ===');
          console.log('Context User Data:', userData);
          console.log('Mapped Form Data:', updatedFormData);
          
          setFormData(prev => {
            const newData = {
              ...prev,
              ...updatedFormData,
            };
            console.log('New form data after setState:', newData);
            return newData;
          });
          
          // Force update display values immediately
          setDisplayValues({
            name: updatedFormData.name || '',
            email: updatedFormData.email || '',
            mobile: updatedFormData.mobile || '',
            state: updatedFormData.state || '',
            city: updatedFormData.city || '',
            zipCode: updatedFormData.zipCode || '',
            address: updatedFormData.address || '',
            dateOfBirth: updatedFormData.dateOfBirth || '',
            gst_no: updatedFormData.gst_no || '',
            landmark: updatedFormData.landmark || '',
          });
          
          // Force update to ensure TextInput components re-render
          setForceUpdate(prev => prev + 1);

          // Get wallet balance
          console.log('Getting wallet balance for userId:', userId);
          const balanceResult = await getWalletBalance(userId);
          console.log('Wallet balance result:', balanceResult);
          if (balanceResult.success) {
            setWalletBalance(balanceResult.balance);
            console.log('Wallet balance set to:', balanceResult.balance);
          }
        }
      } else {
        console.log('No user data found in context');
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
      console.log('Selected State:', selectedState);
      console.log('Selected City:', selectedCity);
      console.log('Current Location:', currentLocation);
      
      if (!userData || !userData.user_id) {
        Alert.alert('Error', 'User data not available');
        return;
      }

      // Validate required fields
      if (!formData.name || !formData.email || !formData.mobile) {
        Alert.alert('Error', 'Please fill in all required fields (Name, Email, Mobile)');
        return;
      }

      // Prepare profile data for API
      const profileData = {
        user_id: userData.user_id,
        fcm_id: userData.fcm_id || '',
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        address: formData.address,
        state_id: formData.state_id || selectedState?.id || '',
        city_id: formData.city_id || selectedCity?.id || '',
        area_id: formData.area_id || '',
        zipCode: formData.zipCode,
        gst_no: formData.gst_no || '',
        landmark: formData.landmark || '',
        latitude: currentLocation.latitude.toString(),
        longitude: currentLocation.longitude.toString(),
        dateOfBirth: formData.dateOfBirth,
      };

      console.log('Profile Data for API:', profileData);
      console.log('Calling updateUserProfile with:', profileData);

      const result = await updateUserProfile(profileData);
      console.log('Update result:', result);

      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Profile Updated',
          text2: result.message,
          position: 'top',
        });
        
        // Update user data in context
        const updatedUserData = {
          ...userData,
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          street: formData.address,
          pincode: formData.zipCode,
          state_name: formData.state,
          city_name: formData.city,
          state_id: formData.state_id,
          city_id: formData.city_id,
          area_id: formData.area_id,
          gst_no: formData.gst_no,
          landmark: formData.landmark,
          dob: formData.dateOfBirth,
          latitude: currentLocation.latitude.toString(),
          longitude: currentLocation.longitude.toString(),
        };
        
        // Update user data in context (this will also update AsyncStorage)
        await updateUserData(updatedUserData);
        console.log('Updated user data in context:', updatedUserData);

        // Exit edit mode
        setIsEditMode(false);
        
        // Force update display values
        setDisplayValues({
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          state: formData.state,
          city: formData.city,
          zipCode: formData.zipCode,
          address: formData.address,
          dateOfBirth: formData.dateOfBirth,
          gst_no: formData.gst_no,
          landmark: formData.landmark,
        });
        
        // Force re-render
        setForceUpdate(prev => prev + 1);
        
        console.log('=== PROFILE UPDATE SUCCESS ===');
        console.log('Updated user data:', updatedUserData);
        console.log('Updated display values:', {
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
        });
        console.log('Profile updated successfully. New name:', formData.name);
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
              key={`name-${forceUpdate}`}
              style={[styles.input, !isEditMode && styles.readOnlyInput]}
              value={displayValues.name}
              onChangeText={isEditMode ? (text) => {
                setFormData(prev => ({ ...prev, name: text }));
                setDisplayValues(prev => ({ ...prev, name: text }));
              } : undefined}
              placeholder="Enter your name"
              editable={isEditMode}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              key={`email-${forceUpdate}`}
              style={[styles.input, !isEditMode && styles.readOnlyInput]}
              value={displayValues.email}
              onChangeText={isEditMode ? (text) => {
                setFormData(prev => ({ ...prev, email: text }));
                setDisplayValues(prev => ({ ...prev, email: text }));
              } : undefined}
              placeholder="Enter your email"
              keyboardType="email-address"
              editable={isEditMode}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile No</Text>
            <TextInput
              key={`mobile-${forceUpdate}`}
              style={[styles.input, !isEditMode && styles.readOnlyInput]}
              value={displayValues.mobile}
              onChangeText={isEditMode ? (text) => {
                setFormData(prev => ({ ...prev, mobile: text }));
                setDisplayValues(prev => ({ ...prev, mobile: text }));
              } : undefined}
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
                value={displayValues.state}
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
                value={displayValues.city}
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
            <Text style={styles.label}>Zip Code</Text>
            <TextInput
              style={[styles.input, !isEditMode && styles.readOnlyInput]}
              value={displayValues.zipCode}
              onChangeText={isEditMode ? (text) => {
                setFormData(prev => ({ ...prev, zipCode: text }));
                setDisplayValues(prev => ({ ...prev, zipCode: text }));
              } : undefined}
              placeholder="Enter zip code"
              keyboardType="numeric"
              editable={isEditMode}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea, !isEditMode && styles.readOnlyInput]}
              value={displayValues.address}
              onChangeText={isEditMode ? (text) => {
                setFormData(prev => ({ ...prev, address: text }));
                setDisplayValues(prev => ({ ...prev, address: text }));
              } : undefined}
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
                provider={getMapProvider()}
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
              value={displayValues.dateOfBirth}
              onChangeText={isEditMode ? (text) => {
                setFormData(prev => ({ ...prev, dateOfBirth: text }));
                setDisplayValues(prev => ({ ...prev, dateOfBirth: text }));
              } : undefined}
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
              provider={getMapProvider()}
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
