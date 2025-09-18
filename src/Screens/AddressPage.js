import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Platform,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStackNavigator } from '@react-navigation/stack';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { fetchUserAddresses, deleteAddress, editAddress } from '../Fuctions/AddressService';
import { ADD_NEW_ADDRESS_STATE, ADD_NEW_ADDRESS_CITY, API_ACCESS_KEY } from '../config/config';
import axios from 'axios';

const ChooseAddressScreen = ({ navigation }) => {
  const route = useRoute();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editAddressData, setEditAddressData] = useState(null);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Handle route parameters for edit mode
  useEffect(() => {
    console.log('=== ADDRESS PAGE ROUTE PARAMETERS ===');
    console.log('Route:', route);
    console.log('Route Params:', route.params);
    console.log('All Route Keys:', Object.keys(route.params || {}));
    
    if (route.params?.editAddress) {
      setIsEditMode(true);
      setEditAddressData(route.params.editAddress);
      console.log('Edit mode activated with data:', route.params.editAddress);
      console.log('Edit Address ID:', route.params.editAddress.id);
      console.log('Edit Address Name:', route.params.editAddress.name);
      console.log('Edit Address Mobile:', route.params.editAddress.mobile);
      console.log('Edit Address Email:', route.params.editAddress.email);
      console.log('Edit Address Full Data:', JSON.stringify(route.params.editAddress, null, 2));
    } else {
      console.log('No edit address data found in route params');
    }
  }, [route.params]);

  // Fetch states and cities for name mapping
  const fetchStatesAndCities = async () => {
    try {
      // Fetch states
      const stateFormData = new FormData();
      stateFormData.append('accesskey', API_ACCESS_KEY);
      const stateResponse = await axios.post(ADD_NEW_ADDRESS_STATE, stateFormData);
      setStates(stateResponse.data.data || []);

      // Fetch cities for all states (we'll need this for mapping)
      const cityFormData = new FormData();
      cityFormData.append('accesskey', API_ACCESS_KEY);
      // We'll fetch cities when we need them for specific states
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  // Fetch cities for a specific state
  const fetchCitiesForState = async (stateId) => {
    try {
      const cityFormData = new FormData();
      cityFormData.append('accesskey', API_ACCESS_KEY);
      cityFormData.append('state_id', stateId);
      const cityResponse = await axios.post(ADD_NEW_ADDRESS_CITY, cityFormData);
      return cityResponse.data.data || [];
    } catch (error) {
      console.error('Error fetching cities for state:', stateId, error);
      return [];
    }
  };

  // Map address data with state and city names
  const mapAddressWithNames = async (addressList) => {
    const mappedAddresses = await Promise.all(
      addressList.map(async (address) => {
        let stateName = address.state_name || address.state;
        let cityName = address.city_name || address.city;

        // If names are null, try to find them from our states/cities data
        if (!stateName || stateName === address.state) {
          const state = states.find(s => s.id === address.state || s.id === parseInt(address.state));
          stateName = state ? state.name : address.state;
        }

        if (!cityName || cityName === address.city) {
          // Try to find city in our cities list first
          let city = cities.find(c => c.id === address.city || c.id === parseInt(address.city));
          
          // If not found, fetch cities for this state
          if (!city && address.state) {
            const stateCities = await fetchCitiesForState(address.state);
            city = stateCities.find(c => c.id === address.city || c.id === parseInt(address.city));
          }
          
          cityName = city ? city.name : address.city;
        }

        return {
          ...address,
          state_name: stateName,
          city_name: cityName,
        };
      })
    );
    return mappedAddresses;
  };

  // Pull to refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Function to fetch data
  const fetchData = async () => {
    try {
      console.log('=== ADDRESS PAGE LOADED ===');

      // Fetch states first for name mapping
      await fetchStatesAndCities();

      const storedUser = await AsyncStorage.getItem('userData');
      console.log('Raw stored user data:', storedUser);

      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        setUser(userObj);
        console.log('Parsed user object:', userObj);
        console.log('User ID:', userObj.user_id || userObj.id);

        // Only fetch addresses if user is logged in and has valid ID
        if (userObj.user_id || userObj.id) {
          console.log('=== CALLING FETCH USER ADDRESSES ===');
          console.log('User ID being passed:', userObj.user_id || userObj.id);
          const addressesData = await fetchUserAddresses(
            userObj.user_id || userObj.id,
          );
          
          // Map addresses with proper state and city names
          const mappedAddresses = await mapAddressWithNames(addressesData);
          setAddresses(mappedAddresses);
          
          // Set first address as default selected
          if (mappedAddresses.length > 0) {
            setSelectedAddressId(mappedAddresses[0].id);
          }
          console.log('=== ADDRESSES SET IN STATE ===');
          console.log('Mapped Addresses Data:', mappedAddresses);
          console.log('Addresses Count:', mappedAddresses.length);
        } else {
          console.warn('No valid user ID found');
          setAddresses([]);
        }
      } else {
        console.warn('No user data found in AsyncStorage - User not logged in');
        setUser(null);
        setAddresses([]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      Alert.alert('Error', 'Failed to fetch addresses');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh when screen comes into focus (when returning from AddAddress)
  useFocusEffect(
    React.useCallback(() => {
      console.log('=== ADDRESS PAGE FOCUSED - REFRESHING DATA ===');
      // Only refresh if user is authenticated and not in initial loading state
      if (user && (user.user_id || user.id) && !loading) {
        // Add a small delay to prevent unnecessary refreshes during navigation
        const timeoutId = setTimeout(() => {
          fetchData();
        }, 100);
        
        return () => clearTimeout(timeoutId);
      }
    }, [user, loading])
  );

  const renderItem = ({ item }) => {
    const isSelected = selectedAddressId === item.id;

    return (
      <TouchableOpacity
        style={[styles.addressCard, isSelected && styles.selectedAddressCard]}
        onPress={() => setSelectedAddressId(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.addressContent}>
          <TouchableOpacity
            style={[
              styles.radioButton,
              isSelected && styles.selectedRadioButton,
            ]}
            onPress={() => setSelectedAddressId(item.id)}
            activeOpacity={0.7}
          >
            {isSelected && <View style={styles.radioDot} />}
          </TouchableOpacity>

          <View style={styles.addressDetails}>
            <Text style={styles.addressName}>{item.name}</Text>
            <Text style={styles.addressText}>
              {item.address}, {item.landmark}
            </Text>
            <Text style={styles.addressText}>
              {item.city_name || item.city}, {item.state_name || item.state} - {item.pincode}
            </Text>
            <Text style={styles.addressText}>Mobile: {item.mobile}</Text>

            <View style={styles.addressActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEditAddress(item)}
              >
                <Icon name="pencil" size={16} color="#EF3340" />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteAddress(item.id)}
              >
                <Icon name="trash-outline" size={16} color="#EF3340" />
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleEditAddress = (addressData) => {
    console.log('=== NAVIGATING TO EDIT ADDRESS ===');
    console.log('Full Address Data Object:', addressData);
    console.log('Address ID:', addressData.id);
    console.log('Address Name:', addressData.name);
    console.log('Address Mobile:', addressData.mobile);
    console.log('Address Email:', addressData.email);
    console.log('Address Street:', addressData.street);
    console.log('Address Landmark:', addressData.landmark);
    console.log('Address Pincode:', addressData.pincode);
    console.log('Address Latitude:', addressData.latitude);
    console.log('Address Longitude:', addressData.longitude);
    console.log('Address State:', addressData.state);
    console.log('Address City:', addressData.city);
    console.log('Address Area:', addressData.area);
    console.log('Address User ID:', addressData.user_id);
    console.log('JSON Stringified:', JSON.stringify(addressData, null, 2));
    
    // Navigate to AddAddress page with the address data for editing
    navigation.navigate('AddAddress', {
      addressData: addressData,
      editMode: true
    });
  };

  const handleDeleteAddress = async addressId => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (user && (user.user_id || user.id)) {
              const result = await deleteAddress(
                addressId,
                user.user_id || user.id,
              );
              if (result.success) {
                // Refresh addresses after deletion
                const updatedAddresses = await fetchUserAddresses(
                  user.user_id || user.id,
                );
                setAddresses(updatedAddresses);
                Alert.alert('Success', 'Address deleted successfully');
              } else {
                Alert.alert('Error', result.message);
              }
            }
          },
        },
      ],
    );
  };

  const handleContinue = async () => {
    // Find the selected address
    const selectedAddress = addresses.find(
      addr => addr.id === selectedAddressId,
    );
    if (selectedAddress) {
      console.log('=== NAVIGATING TO CHECKOUT ===');
      console.log('Selected Address:', selectedAddress);
      
      // Save selected address to AsyncStorage for home page
      await AsyncStorage.setItem('selectedAddress', JSON.stringify({
        id: selectedAddress.id,
        name: selectedAddress.name,
        address: selectedAddress.address,
        mobile: selectedAddress.mobile,
        email: selectedAddress.email || 'user@example.com',
        pincode: selectedAddress.pincode,
        city: selectedAddress.city,
        state: selectedAddress.state,
        landmark: selectedAddress.landmark,
        latitude: selectedAddress.latitude,
        longitude: selectedAddress.longitude,
      }));
      
      // Navigate to CheckOut page with selected address details
      navigation.navigate('CheckOut', {
        selectedAddress: {
          id: selectedAddress.id,
          name: selectedAddress.name,
          address: selectedAddress.address,
          mobile: selectedAddress.mobile,
          email: selectedAddress.email || 'user@example.com',
          pincode: selectedAddress.pincode,
          city: selectedAddress.city,
          state: selectedAddress.state,
          landmark: selectedAddress.landmark,
          latitude: selectedAddress.latitude,
          longitude: selectedAddress.longitude,
        },
      });
    } else {
      Alert.alert('Error', 'Please select an address to continue');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#F70D24" />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image 
            source={require('../Assets/Images/Arrow.png')} 
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {isEditMode ? 'Edit Address' : 'Choose Address'}
        </Text>
        
        <View style={styles.headerRight} />
      </View>

      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#EF3340" />
        ) : addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image
              source={require('../Assets/Images/No-Address.png')}
              style={styles.image}
            />
            <Text style={styles.title}>
              {user ? 'No Address Found' : 'Login Required'}
            </Text>
            <Text style={styles.subtitle}>
              {user 
                ? 'Add your first address to continue'
                : 'Please login to view your addresses'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            <FlatList
              data={addresses}
              keyExtractor={item => item.id.toString()}
              renderItem={renderItem}
              removeClippedSubviews={false}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#F70D24']} // Android
                  tintColor="#F70D24" // iOS
                />
              }
              windowSize={10}
              contentContainerStyle={{ paddingBottom: 20 }}
              style={{ width: '100%' }}
            />
          </View>
        )}

        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              if (user && (user.user_id || user.id)) {
                navigation.navigate('AddAddress', {
                  user_id: user.user_id || user.id,
                });
              } else {
                navigation.navigate('Login');
              }
            }}
          >
            <Text style={styles.addButtonText}>
              {user ? 'Add New Address' : 'Login'}
            </Text>
          </TouchableOpacity>

          {addresses.length > 0 && (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <Icon name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const Stack = createStackNavigator();

const AddressPage = () => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#EF3340" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="ChooseAddress" component={ChooseAddressScreen} />
      </Stack.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F70D24',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F70D24',
    paddingTop: hp('1%'),
    paddingBottom: hp('1%'),
    paddingHorizontal: wp('4%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('1%'),
    justifyContent: 'center',
    alignItems: 'center',
    width: wp('9%'),
    height: hp('5%'),
  },
  backIcon: {
    width: wp('5%'),
    height: hp('2.5%'),
    tintColor: '#fff',
  },
  headerTitle: {
    color: '#fff',
    fontSize: wp('5.5%'),
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    fontFamily: 'Montserrat-Bold',
  },
  headerRight: {
    width: wp('9%'),
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  listContainer: {
    flex: 1,
    padding: 20,
  },
  image: {
    width: 160,
    height: 160,
    marginBottom: 40,
  },
  title: {
    fontSize: 18,
    color: '#333333',
    marginBottom: 10,
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontFamily: 'Montserrat-Regular',
  },
  addressCard: {
    backgroundColor: '#f8f9fa',
    padding: 6,
    borderRadius: 4,
    marginBottom: 6,
  },
  selectedAddressCard: {
    backgroundColor: '#fff5f5',
  },
  addressContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    marginTop: 2,
  },
  selectedCircle: {
    borderColor: '#28a745',
    backgroundColor: '#28a745',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    marginTop: 2,
  },
  selectedRadioButton: {
    borderColor: '#EF3340',
    backgroundColor: '#fff',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF3340',
  },
  addressDetails: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressType: {
    fontSize: 12,
    color: '#EF3340',
    backgroundColor: '#ffe6e6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#EF3340',
    gap: 5,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#EF3340',
    backgroundColor: '#fff',
    gap: 3,
  },
  actionButtonDisabled: {
    opacity: 0.6,
    backgroundColor: '#e9ecef',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#EF3340',
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 5,
  },
  editButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#EF3340',
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
  addressName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 5,
    fontFamily: 'Montserrat-Regular',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
    lineHeight: 20,
    fontFamily: 'Montserrat-Regular',
  },
  bottomButtons: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 15,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#EF3340',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#EF3340',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
  },
});

export default AddressPage;