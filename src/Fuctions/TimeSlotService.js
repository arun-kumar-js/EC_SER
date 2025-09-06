import axios from 'axios';
import { API_ACCESS_KEY, API_BASE_URL } from '../config/config';

export const getTimeSlots = async () => {
  try {
    const formData = new FormData();
    formData.append('accesskey', API_ACCESS_KEY);

    // Log form data
    console.log('=== GET TIME SLOTS ===');
    console.log('Base URL:', API_BASE_URL);
    console.log('Endpoint:', 'settings.php');
    console.log('Access Key:', API_ACCESS_KEY);
    console.log('Form Data:', {
      accesskey: API_ACCESS_KEY,
    });

    const response = await axios.post(`${API_BASE_URL}settings.php`, formData);

    console.log('=== TIME SLOTS API RESPONSE ===');
    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);
    console.log('Full Response Data:', response.data);

    if (response.data && response.data.error === false) {
      console.log('✅ Success: Time slots fetched successfully');
      return {
        success: true,
        data: response.data.time_slots || [],
      };
    } else {
      console.error('❌ Error: Time slots API returned error');
      console.error('Error Message:', response.data.message);
      return {
        success: false,
        data: [],
      };
    }
  } catch (error) {
    console.error('=== TIME SLOTS API ERROR ===');
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
      data: [],
    };
  }
};
