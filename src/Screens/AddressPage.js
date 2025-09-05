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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStackNavigator } from '@react-navigation/stack';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { fetchUserAddresses, deleteAddress, editAddress } from '../Fuctions/AddressService';

const ChooseAddressScreen = ({ navigation }) => {
  const route = useRoute();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editAddressData, setEditAddressData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('=== ADDRESS PAGE LOADED ===');

        // Check all AsyncStorage keys
        const allKeys = await AsyncStorage.getAllKeys();
        console.log('All AsyncStorage keys:', allKeys);

        const storedUser = await AsyncStorage.getItem('userData');
        console.log('Raw stored user data:', storedUser);

        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          setUser(userObj);
          console.log('Parsed user object:', userObj);
          console.log('User ID:', userObj.user_id || userObj.id);

          // Test with hardcoded user ID first
          console.log('=== TESTING WITH USER ID 1 ===');
          const testAddresses = await fetchUserAddresses('1');
          console.log('Test addresses result:', testAddresses);

          // Now try with actual user ID
          console.log('=== CALLING FETCH USER ADDRESSES ===');
          console.log('User Object:', userObj);
          console.log('User ID being passed:', userObj.user_id || userObj.id);
          const addressesData = await fetchUserAddresses(
            userObj.user_id || userObj.id,
          );
          setAddresses(addressesData);
          // Set first address as default selected
          if (addressesData.length > 0) {
            setSelectedAddressId(addressesData[0].id);
          }
          console.log('=== ADDRESSES SET IN STATE ===');
          console.log('Addresses Data:', addressesData);
          console.log('Addresses Count:', addressesData.length);
        } else {
          console.warn('No user data found in AsyncStorage');
          console.log('=== TESTING WITHOUT USER DATA ===');
          // Test with hardcoded user ID
          const testAddresses = await fetchUserAddresses('1');
          console.log('Test addresses without user data:', testAddresses);
          setAddresses(testAddresses);
          // Set first address as default selected
          if (testAddresses.length > 0) {
            setSelectedAddressId(testAddresses[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        Alert.alert('Error', 'Failed to fetch addresses');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
              {item.city}, {item.state} - {item.pincode}
            </Text>
            <Text style={styles.addressText}>Mobile: {item.mobile}</Text>

            <View style={styles.addressActions}>
              <TouchableOpacity
                style={[styles.actionButton, editingAddressId === item.id && styles.actionButtonDisabled]}
                onPress={() => handleEditAddress(item)}
                disabled={editingAddressId === item.id}
              >
                {editingAddressId === item.id ? (
                  <ActivityIndicator size="small" color="#EF3340" />
                ) : (
                  <Icon name="pencil" size={16} color="#EF3340" />
                )}
                <Text style={styles.actionButtonText}>
                  {editingAddressId === item.id ? 'Updating...' : 'Edit'}
                </Text>
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

  const handleEditAddress = async (addressData) => {
    try {
      setEditingAddressId(addressData.id);
      console.log('=== EDITING ADDRESS ===');
      console.log('Address Data:', addressData);
      console.log('User ID:', user?.user_id || user?.id);

      // Prepare the address data for the API call based on the API screenshot
      const editData = {
        id: addressData.id,
        user_id: user?.user_id || user?.id,
        name: addressData.name || '',
        mobile: addressData.mobile || '',
        email: addressData.email || '',
        address: addressData.address || '',
        street: addressData.street || addressData.address || '', // Use address as street if street not available
        landmark: addressData.landmark || '',
        city_id: addressData.city_id || addressData.city_id || '',
        state_id: addressData.state_id || addressData.state_id || '',
        area_id: addressData.area_id || addressData.area_id || '',
        pincode: addressData.pincode || '',
        latitude: addressData.latitude || '13.0144823', // Default latitude if not available
        longitude: addressData.longitude || '80.2227202', // Default longitude if not available
        gst_no: addressData.gst_no || '',
      };

      console.log('Prepared Edit Data for API:', editData);
      console.log('API Parameters:');
      console.log('- accesskey: 90336');
      console.log('- type: update_address');
      console.log('- id:', editData.id);
      console.log('- user_id:', editData.user_id);
      console.log('- name:', editData.name);
      console.log('- mobile:', editData.mobile);
      console.log('- email:', editData.email);
      console.log('- address:', editData.address);
      console.log('- street:', editData.street);
      console.log('- landmark:', editData.landmark);
      console.log('- city_id:', editData.city_id);
      console.log('- state_id:', editData.state_id);
      console.log('- area_id:', editData.area_id);
      console.log('- pincode:', editData.pincode);
      console.log('- latitude:', editData.latitude);
      console.log('- longitude:', editData.longitude);
      console.log('- gst_no:', editData.gst_no);

      const result = await editAddress(editData);
      
      if (result.success) {
        console.log('✅ Address updated successfully');
        Toast.show({
          type: 'success',
          text1: 'Address Updated',
          text2: 'Your address has been updated successfully',
          position: 'top',
        });
        
        // Refresh the addresses list
        const updatedAddresses = await fetchUserAddresses(user?.user_id || user?.id);
        setAddresses(updatedAddresses);
      } else {
        console.error('❌ Failed to update address:', result.message);
        Toast.show({
          type: 'error',
          text1: 'Update Failed',
          text2: result.message || 'Failed to update address',
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Error editing address:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update address',
        position: 'top',
      });
    } finally {
      setEditingAddressId(null);
    }
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

  const handleContinue = () => {
    // Find the selected address
    const selectedAddress = addresses.find(
      addr => addr.id === selectedAddressId,
    );
    if (selectedAddress) {
      // Navigate back to Home with selected address details
      navigation.navigate('MainApp', {
        selectedAddress: {
          name: selectedAddress.name,
          address: selectedAddress.address,
          mobile: selectedAddress.mobile,
          email: selectedAddress.email || 'user@example.com', // fallback if email not available
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
        
        <Text style={styles.headerTitle}>Choose Address</Text>
        
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
            <Text style={styles.title}>No Address Found</Text>
            <Text style={styles.subtitle}>
              Add your first address to continue
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
              }
            }}
          >
            <Text style={styles.addButtonText}>Add New Address</Text>
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
