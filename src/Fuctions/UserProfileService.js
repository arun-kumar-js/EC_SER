import axios from 'axios';
import { API_ACCESS_KEY, API_BASE_URL } from '../config/config';

// Profile edit endpoint
const PROFILE_EDIT_ENDPOINT = `${API_BASE_URL}user-registration.php`;

export const updateUserProfile = async (profileData) => {
  try {
    const formData = new FormData();
    formData.append('accesskey', API_ACCESS_KEY);
    formData.append('type', 'edit-profile');
    formData.append('id', profileData.user_id || profileData.id);
    formData.append('fcm_id', profileData.fcm_id || '');
    formData.append('name', profileData.name);
    formData.append('mobile', profileData.mobile);
    formData.append('email', profileData.email);
    formData.append('street', profileData.address || profileData.street);
    formData.append('state_id', profileData.state_id || '');
    formData.append('city_id', profileData.city_id || '');
    formData.append('area_id', profileData.area_id || '');
    formData.append('pincode', profileData.zipCode || profileData.pincode || '');
    formData.append('gst_no', profileData.gst_no || '');
    formData.append('landmark', profileData.landmark || '');
    formData.append('latitude', profileData.latitude || '');
    formData.append('longitude', profileData.longitude || '');
    formData.append('dob', profileData.dateOfBirth || profileData.dob || '');
    formData.append('district_id', profileData.district_id || '');

    // Log form data
    console.log('=== UPDATE USER PROFILE ===');
    console.log('Base URL:', API_BASE_URL);
    console.log('Endpoint:', 'user-registration.php');
    console.log('Profile Data:', profileData);
    console.log('Form Data:', {
      accesskey: API_ACCESS_KEY,
      type: 'edit-profile',
      id: profileData.user_id || profileData.id,
      fcm_id: profileData.fcm_id || '',
      name: profileData.name,
      mobile: profileData.mobile,
      email: profileData.email,
      street: profileData.address || profileData.street,
      state_id: profileData.state_id || '',
      city_id: profileData.city_id || '',
      area_id: profileData.area_id || '',
      pincode: profileData.zipCode || profileData.pincode || '',
      gst_no: profileData.gst_no || '',
      landmark: profileData.landmark || '',
      latitude: profileData.latitude || '',
      longitude: profileData.longitude || '',
      dob: profileData.dateOfBirth || profileData.dob || '',
      district_id: profileData.district_id || '',
    });

    const response = await axios.post(
      PROFILE_EDIT_ENDPOINT,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
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

// Test function to verify API call
export const testEditProfileAPI = async () => {
  try {
    const testData = {
      id: '28', // Test user ID matching your example
      fcm_id: '',
      name: 'babu',
      mobile: '9150469997',
      email: 'av12spider@gmail.com',
      street: 'no 5th, gothamedu housing board,',
      state_id: '31',
      city_id: '2',
      area_id: '25',
      pincode: '600015',
      gst_no: '',
      landmark: '',
      latitude: '13.0144823',
      longitude: '80.2227202',
      dob: '',
      district_id: '2',
    };

    console.log('=== TESTING EDIT PROFILE API ===');
    const result = await updateUserProfile(testData);
    console.log('Test result:', result);
    return result;
  } catch (error) {
    console.error('Test API error:', error);
    return { success: false, message: error.message };
  }
};
