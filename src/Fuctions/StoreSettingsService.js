import axios from 'axios';
import { API_ACCESS_KEY, API_BASE_URL } from '../config/config';

export const getStoreSettings = async () => {
  try {
    const formData = new FormData();
    formData.append('accesskey', API_ACCESS_KEY);

    // Log form data
    console.log('=== GET STORE SETTINGS ===');
    console.log('Access Key:', API_ACCESS_KEY);
    console.log('Form Data:', {
      accesskey: API_ACCESS_KEY,
    });

    const response = await axios.post(`${API_BASE_URL}/settings.php`, formData);

    console.log('=== STORE SETTINGS API RESPONSE ===');
    console.log('Full Response Data:', response.data);

    // Check if response is a string error message
    if (typeof response.data === 'string' && response.data.includes('Something Wrong')) {
      console.error('❌ Error: Store settings API returned error message');
      console.error('Error Message:', response.data);
      return {
        success: false,
        data: null,
      };
    }

    if (response.data.error === false) {
      console.log('✅ Success: Store settings fetched successfully');
      return {
        success: true,
        data: response.data.settings || response.data.data || response.data,
      };
    } else {
      console.error('❌ Error: Store settings API returned error');
      console.error('Error Message:', response.data.message);
      return {
        success: false,
        data: null,
      };
    }
  } catch (error) {
    console.error('=== STORE SETTINGS API ERROR ===');
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
      data: null,
    };
  }
};
