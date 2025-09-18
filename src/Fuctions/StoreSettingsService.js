import axios from 'axios';
import { API_BASE_URL } from '../config/config';

export const getStoreSettings = async () => {
  try {
    const formData = new FormData();
    formData.append('accesskey', '90336');
    formData.append('get_timezone', '1');
    formData.append('settings', '1');

    // Log form data
    console.log('=== GET STORE SETTINGS ===');
    console.log('Access Key:', '90336');
    console.log('Form Data:', {
      accesskey: '90336',
      get_timezone: '1',
      settings: '1',
    });

    const response = await axios.post(`${API_BASE_URL}/settings.php`, formData);

    console.log('=== STORE SETTINGS API RESPONSE ===');
    console.log('Full Response Data:', response.data);
    console.log('Response Type:', typeof response.data);
    console.log('Response Keys:', Object.keys(response.data || {}));
    
    // Log specific fields we're interested in
    if (response.data && typeof response.data === 'object') {
      console.log('=== STORE SETTINGS FIELDS ===');
      console.log('delivery_charge:', response.data.delivery_charge);
      console.log('tax:', response.data.tax);
      console.log('currency:', response.data.currency);
      console.log('min_amount:', response.data.min_amount);
      console.log('free_delivery_amount:', response.data.free_delivery_amount);
      
      // Check if settings are nested
      if (response.data.settings) {
        console.log('=== NESTED SETTINGS ===');
        console.log('Nested delivery_charge:', response.data.settings.delivery_charge);
        console.log('Nested tax:', response.data.settings.tax);
        console.log('Nested currency:', response.data.settings.currency);
      }
    }

    // Check if response is a string error message
    if (typeof response.data === 'string' && response.data.includes('Something Wrong')) {
      console.error('❌ Error: Store settings API returned error message');
      console.error('Error Message:', response.data);
      return {
        success: false,
        data: null,
        error: response.data,
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
      console.error('Error Message:', response.data.message || response.data);
      return {
        success: false,
        data: null,
        error: response.data.message || response.data,
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
