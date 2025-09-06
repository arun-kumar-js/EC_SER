import axios from 'axios';
import { API_ACCESS_KEY, API_BASE_URL } from '../config/config';

export const updateUserProfile = async (profileData) => {
  try {
    const formData = new FormData();
    formData.append('accesskey', API_ACCESS_KEY);
    formData.append('type', 'update_profile');
    formData.append('user_id', profileData.user_id);
    formData.append('name', profileData.name);
    formData.append('email', profileData.email);
    formData.append('mobile', profileData.mobile);
    formData.append('street', profileData.address);
    formData.append('pincode', profileData.zipCode);
    formData.append('city_id', profileData.city_id || '');
    formData.append('state_id', profileData.state_id || '');
    formData.append('area_id', profileData.area_id || '');
    formData.append('latitude', profileData.latitude || '');
    formData.append('longitude', profileData.longitude || '');
    formData.append('dob', profileData.dateOfBirth || '');

    // Log form data
    console.log('=== UPDATE USER PROFILE ===');
    console.log('Base URL:', API_BASE_URL);
    console.log('Endpoint:', 'user-profile.php');
    console.log('Profile Data:', profileData);
    console.log('Form Data:', {
      accesskey: API_ACCESS_KEY,
      type: 'update_profile',
      user_id: profileData.user_id,
      name: profileData.name,
      email: profileData.email,
      mobile: profileData.mobile,
      street: profileData.address,
      pincode: profileData.zipCode,
      city_id: profileData.city_id,
      state_id: profileData.state_id,
      area_id: profileData.area_id,
      latitude: profileData.latitude,
      longitude: profileData.longitude,
      dob: profileData.dateOfBirth,
    });

    const response = await axios.post(
      `${API_BASE_URL}user-profile.php`,
      formData,
    );

    console.log('=== UPDATE PROFILE API RESPONSE ===');
    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);
    console.log('Full Response Data:', response.data);

    if (response.data && response.data.error === false) {
      console.log('✅ Success: Profile updated successfully');
      return {
        success: true,
        message: response.data.message || 'Profile updated successfully',
        data: response.data,
      };
    } else {
      console.error('❌ Error: Profile update API returned error');
      console.error('Error Message:', response.data.message);
      return {
        success: false,
        message: response.data.message || 'Failed to update profile',
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
