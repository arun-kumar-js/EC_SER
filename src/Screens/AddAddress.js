import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  StatusBar,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Alert,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { WebView } from 'react-native-webview';
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import { getMapProvider, getMapProviderName } from '../utils/mapUtils';
import axios from 'axios';
// Icon import removed - using images from Assets/icon instead
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  ADD_NEW_ADDRESS_STATE,
  ADD_NEW_ADDRESS_CITY,
  ADD_NEW_ADDRESS_AREA,
  API_ACCESS_KEY,
} from '../config/config';
import { addNewAddress, editAddress } from '../Fuctions/AddressService';
import Toast from 'react-native-toast-message';

const HEADER_COLOR = '#F40612';
const BACKGROUND_COLOR = '#FFFFFF';
const BORDER_COLOR = '#C5C5C5';
const TEXT_COLOR_DARK = '#333333';
const TEXT_COLOR_MEDIUM = '#555555';
const BORDER_BOTTOM_COLOR = '#EAEAEA';

const DropdownSelector = ({ label, onPress }) => (
  <TouchableOpacity style={styles.dropdownContainer} onPress={onPress}>
    <Text style={styles.dropdownText}>{label}</Text>
    <Image 
      source={require('../Assets/Images/drop.png')} 
      style={styles.dropdownArrow}
      resizeMode="contain"
    />
  </TouchableOpacity>
);

const AddAddress = ({ route, navigation }) => {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);

  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [originalAddressData, setOriginalAddressData] = useState(null);
  const [formInitialized, setFormInitialized] = useState(false);

  // Get route parameters
  const { editMode = false, addressData = null, user_id = null } = route?.params || {};

  // Form state variables
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    landmark: '',
    pincode: '',
    latitude: '',
    longitude: ''
  });

  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  // Check user authentication on component mount
  useEffect(() => {
    checkUserAuthentication();
  }, []);

  // Check if user is authenticated
  const checkUserAuthentication = async () => {
    try {
      setIsLoading(true);
      const storedUser = await AsyncStorage.getItem('userData');
      
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        setUserData(userObj);
        setIsAuthenticated(true);
        console.log('User authenticated:', userObj);
        
        // Fetch states after authentication
        fetchStates();
      } else {
        setIsAuthenticated(false);
        setIsLoading(false);
        console.log('User not authenticated');
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  // Fetch states function
  const fetchStates = () => {
      const formData = new FormData();
      formData.append('accesskey', API_ACCESS_KEY);

      axios
        .post(ADD_NEW_ADDRESS_STATE, formData)
        .then(res => {
          console.log('Fetched states:', res.data);
          setStates(res.data.data || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching states:', err);
        setIsLoading(false);
      });
  };

  // Pull to refresh function
  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Re-check authentication
      await checkUserAuthentication();
      
      // If authenticated, refresh states
      if (isAuthenticated) {
        fetchStates();
      }
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Navigate to login screen
  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  // Store original address data when in edit mode
  useEffect(() => {
    if (editMode && addressData && !originalAddressData) {
      console.log('=== STORING ORIGINAL ADDRESS DATA ===');
      console.log('Original Address Data:', addressData);
      console.log('Original Address ID:', addressData.id);
      setOriginalAddressData(addressData);
    }
  }, [editMode, addressData, originalAddressData]);

  // Populate form data when in edit mode and states are loaded (only once)
  useEffect(() => {
    if (editMode && originalAddressData && states.length > 0 && !formInitialized) {
      console.log('=== POPULATING EDIT FORM DATA (INITIAL) ===');
      console.log('Original Address Data:', originalAddressData);
      console.log('Available States:', states);
      console.log('Available Cities:', cities);
      console.log('Form Initialized:', formInitialized);
      
      setFormData({
        name: originalAddressData.name || '',
        mobile: originalAddressData.mobile || '',
        email: originalAddressData.email || '',
        address: originalAddressData.address || '',
        landmark: originalAddressData.landmark || '',
        pincode: originalAddressData.pincode || '',
        latitude: originalAddressData.latitude || '',
        longitude: originalAddressData.longitude || ''
      });

      // Set selected state and city if available
      // Handle both state_id and state field names
      const stateId = originalAddressData.state_id || originalAddressData.state;
      const cityId = originalAddressData.city_id || originalAddressData.city;
      
      console.log('State ID from data:', stateId);
      console.log('City ID from data:', cityId);
      console.log('Original Address ID:', originalAddressData.id);
      
      if (stateId && stateId !== "0" && stateId !== "") {
        // Find and set the state
        const state = states.find(s => s.id === stateId || s.id === parseInt(stateId));
        if (state) {
          console.log('Found state:', state);
          setSelectedState(state);
        } else {
          console.log('State not found in states list');
        }
      } else {
        console.log('No valid state ID found');
      }

      if (cityId && cityId !== "0" && cityId !== "") {
        // Find and set the city
        const city = cities.find(c => c.id === cityId || c.id === parseInt(cityId));
        if (city) {
          console.log('Found city:', city);
          setSelectedCity(city);
        } else {
          console.log('City not found in cities list');
        }
      } else {
        console.log('No valid city ID found');
      }

      // Mark form as initialized to prevent overwriting user changes
      setFormInitialized(true);
      console.log('Form marked as initialized');
    }
  }, [editMode, originalAddressData, states, cities, formInitialized]);

  // Request location permission
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to set your address.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS permissions are handled in Info.plist
  };

  // Handle save/update address
  const handleSaveAddress = async () => {
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: 'Please enter your name',
          position: 'top',
        });
        return;
      }

      if (!formData.mobile.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: 'Please enter your mobile number',
          position: 'top',
        });
        return;
      }

      if (!formData.address.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: 'Please enter your address',
          position: 'top',
        });
        return;
      }

      if (!selectedState) {
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: 'Please select a state',
          position: 'top',
        });
        return;
      }

      if (!selectedCity) {
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: 'Please select a city',
          position: 'top',
        });
        return;
      }

      if (!formData.pincode.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: 'Please enter pincode',
          position: 'top',
        });
        return;
      }

      // Prepare address data
      const addressData = {
        user_id: userData?.user_id || userData?.id,
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        landmark: formData.landmark.trim(),
        city_id: selectedCity.id,
        state_id: selectedState.id,
        area_id: selectedCity.id, // Using city_id as area_id for now
        pincode: formData.pincode.trim(),
        latitude: formData.latitude || currentLocation.latitude.toString(),
        longitude: formData.longitude || currentLocation.longitude.toString(),
        address_type: 'home', // Default address type
        street: formData.address.trim(), // Using address as street
        gst_no: '', // Empty for now
        // Include original address ID when in edit mode
        ...(editMode && originalAddressData && { id: originalAddressData.id }),
      };

      console.log('=== FORM DATA PREPARATION ===');
      console.log('Edit Mode:', editMode);
      console.log('Original Address Data:', originalAddressData);
      console.log('Original Address ID:', originalAddressData?.id);
      console.log('Selected State:', selectedState);
      console.log('Selected City:', selectedCity);
      console.log('State ID:', selectedState.id);
      console.log('City ID:', selectedCity.id);
      console.log('Form Data:', formData);
      console.log('Prepared Address Data:', addressData);
      console.log('Address ID in prepared data:', addressData.id);

      console.log('=== SAVING ADDRESS ===');
      console.log('Edit Mode:', editMode);
      console.log('Address Data:', addressData);

      let result;
      if (editMode) {
        // Update existing address
        const updateData = {
          ...addressData,
          id: addressData.id, // Use the original address ID from route params
        };
        console.log('=== UPDATING ADDRESS ===');
        console.log('Edit Mode:', editMode);
        console.log('Original Address Data from Route:', addressData);
        console.log('Form Data Prepared:', addressData);
        console.log('Update Data with ID:', updateData);
        console.log('Address ID being updated:', updateData.id);
        console.log('User ID:', updateData.user_id);
        result = await editAddress(updateData);
      } else {
        // Add new address
        console.log('=== ADDING NEW ADDRESS ===');
        console.log('Address Data:', addressData);
        result = await addNewAddress(addressData);
      }

      if (result.success) {
        Toast.show({
          type: 'success',
          text1: editMode ? 'Address Updated' : 'Address Added',
          text2: result.message,
          position: 'top',
        });

        // Navigate back to AddressPage
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: result.message || 'Failed to save address',
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Error saving address:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An error occurred while saving address',
        position: 'top',
      });
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    setIsLocationLoading(true);
    requestLocationPermission().then(hasPermission => {
      if (hasPermission) {
        Geolocation.getCurrentPosition(
          position => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ latitude, longitude });
            setFormData(prev => ({
              ...prev,
              latitude: latitude.toString(),
              longitude: longitude.toString(),
            }));
            setIsLocationLoading(false);
            setMapModalVisible(true);
          },
          error => {
            console.log('Location error:', error);
            Alert.alert('Error', 'Unable to get your current location');
            setIsLocationLoading(false);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
      } else {
        Alert.alert('Permission Denied', 'Location permission is required to get your current location');
        setIsLocationLoading(false);
      }
    });
  };

  // Handle map marker drag
  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setCurrentLocation({ latitude, longitude });
    setFormData(prev => ({
      ...prev,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    }));
  };

  const handleStateSelect = state => {
    console.log('=== STATE SELECTED ===');
    console.log('Selected State:', state);
    console.log('State ID:', state.id);
    console.log('State Name:', state.name);
    setSelectedState(state);
    setSelectedCity(null);
    setCities([]);
    setStateModalVisible(false);

    // Fetch cities for selected state
    const formData = new FormData();
    formData.append('accesskey', API_ACCESS_KEY);
    formData.append('state_id', state.id);

    axios
      .post(ADD_NEW_ADDRESS_CITY, formData)
      .then(res => {
        console.log('Fetched cities:', res.data); // Added console.log for debugging
        setCities(res.data.data || []);
      })
      .catch(err => console.error('Error fetching cities:', err));
  };

  const handleCitySelect = city => {
    console.log('=== CITY SELECTED ===');
    console.log('Selected City:', city);
    console.log('City ID:', city.id);
    console.log('City Name:', city.name);
    setSelectedCity(city);
    setCityModalVisible(false);
  };

const renderModalItem = (item, onSelect) => (
    <TouchableOpacity
      style={{
        paddingVertical: hp('1.5%'),
        paddingHorizontal: wp('4%'),
        borderBottomWidth: 1,
        borderBottomColor: BORDER_BOTTOM_COLOR,
      }}
      onPress={() => onSelect(item)}
    >
      <Text style={{ fontSize: wp('4.5%'), color: TEXT_COLOR_DARK }}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Loading screen
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#F70D24" />
        <View style={styles.customHeader}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => {
              if (navigation && navigation.goBack) {
                navigation.goBack();
              }
            }}
          >
            <Text style={styles.headerBackText}>{'\u2190'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{editMode ? 'Edit Address' : 'Add Address'}</Text>
          <View style={{ width: wp('9%') }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F40612" />
          <Text style={styles.loadingText}>Checking authentication...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Login prompt screen
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#F70D24" />
        <View style={styles.customHeader}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => {
              if (navigation && navigation.goBack) {
                navigation.goBack();
              }
            }}
          >
            <Text style={styles.headerBackText}>{'\u2190'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{editMode ? 'Edit Address' : 'Add Address'}</Text>
          <View style={{ width: wp('9%') }} />
        </View>
        <View style={styles.loginPromptContainer}>
          <Image 
            source={require('../Assets/icon/profile.png')} 
            style={styles.loginPromptIcon}
            resizeMode="contain"
          />
          <Text style={styles.loginPromptTitle}>Login Required</Text>
          <Text style={styles.loginPromptMessage}>
            You need to be logged in to add or edit addresses. Please login to continue.
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={navigateToLogin}>
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#F70D24" />
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => {
            if (navigation && navigation.goBack) {
              navigation.goBack();
            }
          }}
        >
          <Text style={styles.headerBackText}>{'\u2190'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editMode ? 'Edit Address' : 'Add Address'}</Text>
        <View style={{ width: wp('9%') }} />
        {/* Placeholder for symmetry */}
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#F40612']} // Android
            tintColor="#F40612" // iOS
            title="Pull to refresh"
            titleColor="#666666"
          />
        }
      >
        <View style={styles.formContainer}>
          {/* Name, Phone, Email Inputs */}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Name"
              placeholderTextColor={TEXT_COLOR_DARK}
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Phone number"
              placeholderTextColor={TEXT_COLOR_DARK}
              style={styles.input}
              keyboardType="phone-pad"
              value={formData.mobile}
              onChangeText={(text) => setFormData({...formData, mobile: text})}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Email"
              placeholderTextColor={TEXT_COLOR_DARK}
              style={styles.input}
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
            />
          </View>

          {/* Address */}
          <View style={[styles.inputContainer, styles.addressInputContainer]}>
            <TextInput
              placeholder="Address"
              placeholderTextColor={TEXT_COLOR_DARK}
              style={[styles.input, styles.addressInput]}
              multiline
              value={formData.address}
              onChangeText={(text) => setFormData({...formData, address: text})}
            />
          </View>

          {/* Dropdowns */}
          <DropdownSelector
            label={selectedState ? selectedState.name : 'Select State'}
            onPress={() => setStateModalVisible(true)}
          />
          <DropdownSelector
            label={selectedCity ? selectedCity.name : 'Select City'}
            onPress={() => {
              if (cities.length > 0) {
                setCityModalVisible(true);
              }
            }}
          />

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Pin Code"
              placeholderTextColor={TEXT_COLOR_DARK}
              style={styles.input}
              keyboardType="number-pad"
              value={formData.pincode}
              onChangeText={(text) => setFormData({...formData, pincode: text})}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Landmark (Optional)"
              placeholderTextColor={TEXT_COLOR_DARK}
              style={styles.input}
              value={formData.landmark}
              onChangeText={(text) => setFormData({...formData, landmark: text})}
            />
          </View>

          {/* Location Picker */}
          <TouchableOpacity 
            style={styles.locationButton} 
            onPress={getCurrentLocation}
            disabled={isLocationLoading}
          >
            <Image 
              source={require('../Assets/icon/track.png')} 
              style={styles.locationIcon}
              resizeMode="contain"
            />
            <Text style={styles.locationButtonText}>
              {isLocationLoading ? 'Getting Location...' : 'Pick Location on Map'}
            </Text>
          </TouchableOpacity>

          {/* Location Display */}
          {formData.latitude && formData.longitude && (
            <View style={styles.locationDisplay}>
              <Text style={styles.locationText}>
                Lat: {parseFloat(formData.latitude).toFixed(6)}, 
                Lng: {parseFloat(formData.longitude).toFixed(6)}
              </Text>
            </View>
          )}

          <Text style={styles.locationLabel}>
            Location : {selectedState ? selectedState.name : 'Select State'},
            India
          </Text>

          {formData.latitude && formData.longitude ? (
            <MapView
              provider={getMapProvider()}
              style={styles.mapImage}
              region={{
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
              mapType="standard"
            >
              <Marker
                coordinate={{
                  latitude: parseFloat(formData.latitude),
                  longitude: parseFloat(formData.longitude),
                }}
                title="Selected Location"
              />
            </MapView>
          ) : (
          <Image
            source={{ uri: 'https://placehold.co/800x400/f0f0f0/666666' }}
            style={styles.mapImage}
            alt="Map"
          />
          )}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
          <Text style={styles.saveButtonText}>{editMode ? 'Update Address' : 'Save Address & Continue'}</Text>
        </TouchableOpacity>
      </View>

      {/* State Modal */}
      <Modal
        visible={stateModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStateModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setStateModalVisible(false)}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                backgroundColor: BACKGROUND_COLOR,
                marginHorizontal: wp('10%'),
                borderRadius: wp('2%'),
                maxHeight: hp('50%'),
              }}
            >
              <FlatList
                data={states}
                keyExtractor={(item, index) => item.id || index.toString()}
                renderItem={({ item }) =>
                  renderModalItem(item, handleStateSelect)
                }
                removeClippedSubviews={false}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
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
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                backgroundColor: BACKGROUND_COLOR,
                marginHorizontal: wp('10%'),
                borderRadius: wp('2%'),
                maxHeight: hp('50%'),
              }}
            >
              <FlatList
                data={cities}
                keyExtractor={(item, index) => item.id || index.toString()}
                renderItem={({ item }) =>
                  renderModalItem(item, handleCitySelect)
                }
                removeClippedSubviews={false}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Map Modal */}
      <Modal
        visible={mapModalVisible}
        animationType="slide"
        onRequestClose={() => setMapModalVisible(false)}
      >
        <SafeAreaView style={styles.mapModalContainer}>
          <View style={styles.mapHeader}>
            <TouchableOpacity 
              onPress={() => setMapModalVisible(false)}
              style={styles.mapCloseButton}
            >
              <Text style={styles.mapCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.mapHeaderTitle}>Select Location</Text>
            <TouchableOpacity 
              onPress={() => setMapModalVisible(false)}
              style={styles.mapConfirmButton}
            >
              <Text style={styles.mapConfirmText}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.mapContainer}>
            <MapView
              provider={getMapProvider()}
              style={styles.map}
              region={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onPress={handleMapPress}
              showsUserLocation={true}
              showsMyLocationButton={true}
              showsCompass={true}
              showsScale={true}
              mapType="standard"
            >
              <Marker
                coordinate={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                }}
                title="Selected Location"
                description={`Lat: ${currentLocation.latitude.toFixed(6)}, Lng: ${currentLocation.longitude.toFixed(6)}`}
                draggable={true}
                onDragEnd={(event) => {
                  const { latitude, longitude } = event.nativeEvent.coordinate;
                  setCurrentLocation({ latitude, longitude });
                  setFormData(prev => ({
                    ...prev,
                    latitude: latitude.toString(),
                    longitude: longitude.toString(),
                  }));
                }}
              />
            </MapView>
            
            <View style={styles.mapOverlay}>
              <TouchableOpacity 
                style={styles.updateLocationButton}
                onPress={getCurrentLocation}
              >
                <Image 
                  source={require('../Assets/icon/track.png')} 
                  style={styles.locationIcon}
                  resizeMode="contain"
                />
                <Text style={styles.updateLocationButtonText}>Get Current Location</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.mapFooter}>
            <Text style={styles.mapFooterText}>
              Location coordinates will be automatically saved to your address
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Keep your previous styles
  safeArea: { flex: 1,  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F70D24',
    paddingTop: hp('1%'),
    paddingBottom: hp('1%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    color: '#fff',
    fontSize: wp('5.5%'),
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    fontFamily: 'Montserrat-Bold',
  },
  headerBackButton: {
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('1%'),
    justifyContent: 'center',
    alignItems: 'center',
    width: wp('9%'),
    height: hp('5%'),
  },
  headerBackText: {
    color: '#fff',
    fontSize: wp('6%'),
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  scrollView: { flex: 1 },
  scrollViewContent: { paddingBottom: hp('2.5%') },
  formContainer: { paddingHorizontal: wp('4%'), paddingTop: hp('3%') },
  inputContainer: {
    backgroundColor: BACKGROUND_COLOR,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 8,
    marginBottom: hp('2.5%'),
    paddingHorizontal: wp('4%'),
  },
  input: { fontSize: wp('4.5%'), color: TEXT_COLOR_DARK, height: hp('6.5%') },
  addressInputContainer: { height: hp('13%'), paddingVertical: hp('1.5%') },
  addressInput: { height: '100%', textAlignVertical: 'top' },
  dropdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: BORDER_BOTTOM_COLOR,
    paddingBottom: hp('2.2%'),
    marginBottom: hp('2.5%'),
  },
  dropdownText: { fontSize: wp('4.5%'), color: TEXT_COLOR_DARK },
  dropdownArrow: {
    width: wp('4%'),
    height: hp('2%'),
    tintColor: TEXT_COLOR_MEDIUM,
  },
  locationLabel: {
    fontSize: wp('4%'),
    color: TEXT_COLOR_MEDIUM,
    marginTop: hp('2%'),
    marginBottom: hp('1.5%'),
  },
  mapImage: {
    width: '100%',
    height: hp('22%'),
    borderRadius: wp('2%'),
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    overflow: 'hidden',
  },
  footer: {
    paddingHorizontal: wp('4%'),
    paddingTop: hp('1.2%'),
    paddingBottom: hp('1.2%'),
    backgroundColor: BACKGROUND_COLOR,
  },
  saveButton: {
    backgroundColor: HEADER_COLOR,
    borderRadius: wp('2%'),
    paddingVertical: hp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: BACKGROUND_COLOR,
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
  },
  // Location picker styles
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#F40612',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    marginBottom: hp('1%'),
  },
  locationButtonText: {
    marginLeft: wp('3%'),
    color: '#F40612',
    fontSize: wp('4%'),
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
  locationIcon: {
    width: wp('5%'),
    height: hp('2.5%'),
    tintColor: '#F40612',
  },
  locationDisplay: {
    backgroundColor: '#e8f5e8',
    borderWidth: 1,
    borderColor: '#4caf50',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
    marginBottom: hp('1%'),
  },
  locationText: {
    color: '#2e7d32',
    fontSize: wp('3.5%'),
    fontFamily: 'Montserrat-Regular',
  },
  // Map modal styles
  mapModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F40612',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
  },
  mapCloseButton: {
    padding: wp('2%'),
  },
  mapCloseText: {
    color: '#FFFFFF',
    fontSize: wp('5%'),
    fontWeight: 'bold',
  },
  mapHeaderTitle: {
    color: '#FFFFFF',
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  mapConfirmButton: {
    padding: wp('2%'),
  },
  mapConfirmText: {
    color: '#FFFFFF',
    fontSize: wp('4%'),
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
  },
  map: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapOverlay: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1000,
  },
  updateLocationButton: {
    backgroundColor: '#F40612',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.2%'),
    borderRadius: wp('2%'),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  updateLocationButtonText: {
    color: '#FFFFFF',
    fontSize: wp('3.5%'),
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
    marginLeft: wp('2%'),
  },
  mapFooter: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  mapFooterText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: wp('3.5%'),
    fontFamily: 'Montserrat-Regular',
  },
  // Loading screen styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND_COLOR,
  },
  loadingText: {
    marginTop: hp('2%'),
    fontSize: wp('4%'),
    color: TEXT_COLOR_MEDIUM,
    fontFamily: 'Montserrat-Regular',
  },
  // Login prompt styles
  loginPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND_COLOR,
    paddingHorizontal: wp('8%'),
  },
  loginPromptTitle: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: TEXT_COLOR_DARK,
    marginTop: hp('3%'),
    marginBottom: hp('2%'),
    textAlign: 'center',
    fontFamily: 'Montserrat-Bold',
  },
  loginPromptIcon: {
    width: wp('20%'),
    height: hp('10%'),
    tintColor: '#F40612',
  },
  loginPromptMessage: {
    fontSize: wp('4%'),
    color: TEXT_COLOR_MEDIUM,
    textAlign: 'center',
    lineHeight: wp('5.5%'),
    marginBottom: hp('4%'),
    fontFamily: 'Montserrat-Regular',
  },
  loginButton: {
    backgroundColor: HEADER_COLOR,
    paddingHorizontal: wp('8%'),
    paddingVertical: hp('2%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: BACKGROUND_COLOR,
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
});

export default AddAddress;