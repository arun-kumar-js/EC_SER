import axios from 'axios';
import { API_ACCESS_KEY, API_BASE_URL } from '../config/config';

export const getUserData = async userId => {
  try {
    const formData = new FormData();
    formData.append('accesskey', API_ACCESS_KEY);
    formData.append('get_user_data', '1');
    formData.append('user_id', userId);

    // Log form data
    console.log('=== GET USER DATA ===');
    console.log('Base URL:', API_BASE_URL);
    console.log('Endpoint:', 'get-user-data.php');
    console.log('User ID:', userId);
    console.log('Access Key:', API_ACCESS_KEY);
    console.log('Form Data:', {
      accesskey: API_ACCESS_KEY,
      get_user_data: '1',
      user_id: userId,
    });

    const response = await axios.post(
      `${API_BASE_URL}get-user-data.php`,
      formData,
    );

    console.log('=== USER DATA API RESPONSE ===');
    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);
    console.log('Full Response Data:', response.data);

    if (response.data && response.data.error === false) {
      console.log('✅ Success: User data fetched successfully');
      return {
        success: true,
        data: response.data,
      };
    } else {
      console.error('❌ Error: User data API returned error');
      console.error('Error Message:', response.data.message);
      return {
        success: false,
        data: null,
      };
    }
  } catch (error) {
    console.error('=== USER DATA API ERROR ===');
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

export const getWalletBalance = async userId => {
  try {
    const result = await getUserData(userId);
    if (result.success && result.data) {
      return {
        success: true,
        balance: parseFloat(result.data.balance) || 0,
        userData: result.data,
      };
    } else {
      return {
        success: false,
        balance: 0,
        userData: null,
      };
    }
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    return {
      success: false,
      balance: 0,
      userData: null,
    };
  }
};
