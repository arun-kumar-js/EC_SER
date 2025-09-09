import axios from 'axios';
import { API_ACCESS_KEY, API_BASE_URL, GET_ALL_ADDRESSES } from '../config/config';

export const updateUserProfile = async (profileData) => {
  try {
    const formData = new FormData();
    formData.append('accesskey', API_ACCESS_KEY);
    formData.append('id', profileData.user_id);
    formData.append('fcm_id', profileData.fcm_id || '');
    formData.append('name', profileData.name);
    formData.append('mobile', profileData.mobile);
    formData.append('email', profileData.email);
    formData.append('street', profileData.address);
    formData.append('state_id', profileData.state_id || '');
    formData.append('city_id', profileData.city_id || '');
    formData.append('pincode', profileData.zipCode);
    formData.append('gst_no', profileData.gst_no || '');
    formData.append('landmark', profileData.landmark || '');
    formData.append('latitude', profileData.latitude || '');
    formData.append('longitude', profileData.longitude || '');
    formData.append('type', 'edit-profile');
    formData.append('dob', profileData.dateOfBirth || '');

    // Log form data
    console.log('=== UPDATE USER PROFILE ===');
    console.log('Base URL:', API_BASE_URL);
    console.log('Endpoint:', 'user_addresses.php');
    console.log('Profile Data:', profileData);
    console.log('Form Data:', {
      accesskey: API_ACCESS_KEY,
      id: profileData.user_id,
      fcm_id: profileData.fcm_id || '',
      name: profileData.name,
      mobile: profileData.mobile,
      email: profileData.email,
      street: profileData.address,
      state_id: profileData.state_id,
      city_id: profileData.city_id,
      pincode: profileData.zipCode,
      gst_no: profileData.gst_no || '',
      landmark: profileData.landmark || '',
      latitude: profileData.latitude,
      longitude: profileData.longitude,
      type: 'edit-profile',
      dob: profileData.dateOfBirth,
    });

    const response = await axios.post(
      GET_ALL_ADDRESSES,
      formData,
    );

    console.log('=== UPDATE PROFILE API RESPONSE ===');
    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);
    console.log('Full Response Data:', response.data);

    // Check if response is successful (status 200) and either has no data or success data
    if (response.status === 200) {
      // If response is empty or has success data, consider it successful
      if (!response.data || response.data === '' || (response.data && response.data.error === false)) {
        console.log('✅ Success: Profile updated successfully');
        return {
          success: true,
          message: (response.data && response.data.message) || 'Profile updated successfully',
          data: response.data || {},
        };
      } else if (response.data && response.data.error === true) {
        console.error('❌ Error: Profile update API returned error');
        console.error('Error Message:', response.data.message);
        return {
          success: false,
          message: response.data.message || 'Failed to update profile',
          data: null,
        };
      } else {
        // Empty response with status 200 is considered success
        console.log('✅ Success: Profile updated successfully (empty response)');
        return {
          success: true,
          message: 'Profile updated successfully',
          data: {},
        };
      }
    } else {
      console.error('❌ Error: Profile update API returned non-200 status');
      console.error('Status:', response.status);
      return {
        success: false,
        message: 'Failed to update profile',
        data: null,
      };
    }
  } catch (error) {
    console.error('=== UPDATE PROFILE API ERROR ===');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    } else if (error.request) {
      console.error('No Response Received:', error.request);
    }
    console.error('Full Error Object:', error);
    return {
      success: false,
      message: 'Network error occurred',
      data: null,
    };
  }
};
