import axios from 'axios';
import { API_ACCESS_KEY, GET_ALL_ADDRESSES } from '../config/config';

export const fetchUserAddresses = async userId => {
  try {
    const formData = new FormData();
    formData.append('accesskey', API_ACCESS_KEY);
    formData.append('type', 'list_address');
    formData.append('user_id', userId);

    // Log form data
    console.log('=== FETCH USER ADDRESSES ===');
    console.log('User ID:', userId);
    console.log('Access Key:', API_ACCESS_KEY);
    console.log('Type:', 'list_address');
    console.log('Form Data:', {
      accesskey: API_ACCESS_KEY,
      type: 'list_address',
      user_id: userId,
    });

    const response = await axios.post(GET_ALL_ADDRESSES, formData);

    console.log('=== ADDRESS API RESPONSE ===');
    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);
    console.log('Full Response Data:', response.data);
    console.log('Error Field:', response.data.error);
    console.log('Message Field:', response.data.message);
    console.log('Data Field:', response.data.data);

    if (response.data && response.data.error === false) {
      console.log('✅ Success: Addresses fetched successfully');
      console.log('Addresses Count:', response.data.data?.length || 0);
      return response.data.data || [];
    } else {
      console.error('❌ Error: Address API returned error');
      console.error('Error Message:', response.data.message);
      console.error('Error Data:', response.data);
      return [];
    }
  } catch (error) {
    console.error('=== ADDRESS API ERROR ===');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    } else if (error.request) {
      console.error('No Response Received:', error.request);
    }
    console.error('Full Error Object:', error);
    return [];
  }
};

export const addNewAddress = async addressData => {
  try {
    const formData = new FormData();
    formData.append('accesskey', API_ACCESS_KEY);
    formData.append('type', 'add_address');
    formData.append('user_id', addressData.user_id);
    formData.append('name', addressData.name);
    formData.append('mobile', addressData.mobile);
    formData.append('address', addressData.address);
    formData.append('landmark', addressData.landmark);
    formData.append('city_id', addressData.city_id);
    formData.append('state_id', addressData.state_id);
    formData.append('area_id', addressData.area_id);
    formData.append('pincode', addressData.pincode);
    formData.append('address_type', addressData.address_type);

    const response = await axios.post(GET_ALL_ADDRESSES, formData);

    console.log('Add Address API Response:', response.data);

    if (response.data && response.data.error === false) {
      return { success: true, message: response.data.message };
    } else {
      return {
        success: false,
        message: response.data.message || 'Failed to add address',
      };
    }
  } catch (error) {
    console.error('Error adding new address:', error);
    return { success: false, message: 'Network error occurred' };
  }
};

export const editAddress = async (addressData) => {
  try {
    const formData = new FormData();
    formData.append('accesskey', API_ACCESS_KEY);
    formData.append('type', 'update_address');
    formData.append('id', addressData.id);
    formData.append('user_id', addressData.user_id);
    formData.append('name', addressData.name);
    formData.append('mobile', addressData.mobile);
    formData.append('email', addressData.email || '');
    formData.append('address', addressData.address);
    formData.append('street', addressData.street || '');
    formData.append('landmark', addressData.landmark || '');
    formData.append('city_id', addressData.city_id);
    formData.append('state_id', addressData.state_id);
    formData.append('area_id', addressData.area_id);
    formData.append('pincode', addressData.pincode);
    formData.append('latitude', addressData.latitude || '');
    formData.append('longitude', addressData.longitude || '');
    formData.append('gst_no', addressData.gst_no || '');

    // Log form data entries individually
    console.log('=== EDIT ADDRESS FORM DATA ENTRIES ===');
    console.log('accesskey:', API_ACCESS_KEY);
    console.log('type:', 'update_address');
    console.log('id:', addressData.id);
    console.log('user_id:', addressData.user_id);
    console.log('name:', addressData.name);
    console.log('mobile:', addressData.mobile);
    console.log('email:', addressData.email || '');
    console.log('address:', addressData.address);
    console.log('street:', addressData.street || '');
    console.log('landmark:', addressData.landmark || '');
    console.log('city_id:', addressData.city_id);
    console.log('state_id:', addressData.state_id);
    console.log('area_id:', addressData.area_id);
    console.log('pincode:', addressData.pincode);
    console.log('latitude:', addressData.latitude || '');
    console.log('longitude:', addressData.longitude || '');
    console.log('gst_no:', addressData.gst_no || '');
    
    // Also log the complete form data object
    console.log('=== COMPLETE FORM DATA OBJECT ===');
    console.log('Form Data Object:', {
      accesskey: API_ACCESS_KEY,
      type: 'update_address',
      id: addressData.id,
      user_id: addressData.user_id,
      name: addressData.name,
      mobile: addressData.mobile,
      email: addressData.email,
      address: addressData.address,
      street: addressData.street,
      landmark: addressData.landmark,
      city_id: addressData.city_id,
      state_id: addressData.state_id,
      area_id: addressData.area_id,
      pincode: addressData.pincode,
      latitude: addressData.latitude,
      longitude: addressData.longitude,
      gst_no: addressData.gst_no,
    });

    const response = await axios.post(GET_ALL_ADDRESSES, formData);

    console.log('=== EDIT ADDRESS API RESPONSE ===');
    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);
    console.log('Full Response Data:', response.data);
    console.log('Error Field:', response.data.error);
    console.log('Message Field:', response.data.message);

    if (response.data && response.data.error === false) {
      console.log('✅ Success: Address updated successfully');
      return { success: true, message: response.data.message };
    } else {
      console.error('❌ Error: Edit address API returned error');
      console.error('Error Message:', response.data.message);
      console.error('Error Data:', response.data);
      return {
        success: false,
        message: response.data.message || 'Failed to update address',
      };
    }
  } catch (error) {
    console.error('=== EDIT ADDRESS API ERROR ===');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    } else if (error.request) {
      console.error('No Response Received:', error.request);
    }
    console.error('Full Error Object:', error);
    return { success: false, message: 'Network error occurred' };
  }
};

export const deleteAddress = async (addressId, userId) => {
  try {
    const formData = new FormData();
    formData.append('accesskey', API_ACCESS_KEY);
    formData.append('type', 'delete_address');
    formData.append('id', addressId);
    formData.append('user_id', userId);

    // Log form data
    console.log('=== DELETE ADDRESS ===');
    console.log('Address ID:', addressId);
    console.log('User ID:', userId);
    console.log('Access Key:', API_ACCESS_KEY);
    console.log('Type:', 'delete_address');
    console.log('Form Data:', {
      accesskey: API_ACCESS_KEY,
      type: 'delete_address',
      id: addressId,
      user_id: userId,
    });

    const response = await axios.post(GET_ALL_ADDRESSES, formData);

    console.log('=== DELETE ADDRESS API RESPONSE ===');
    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);
    console.log('Full Response Data:', response.data);
    console.log('Error Field:', response.data.error);
    console.log('Message Field:', response.data.message);

    if (response.data && response.data.error === false) {
      console.log('✅ Success: Address deleted successfully');
      return { success: true, message: response.data.message };
    } else {
      console.error('❌ Error: Delete address API returned error');
      console.error('Error Message:', response.data.message);
      console.error('Error Data:', response.data);
      return {
        success: false,
        message: response.data.message || 'Failed to delete address',
      };
    }
  } catch (error) {
    console.error('=== DELETE ADDRESS API ERROR ===');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    } else if (error.request) {
      console.error('No Response Received:', error.request);
    }
    console.error('Full Error Object:', error);
    return { success: false, message: 'Network error occurred' };
  }
};
