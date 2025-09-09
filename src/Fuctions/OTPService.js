import axios from 'axios';
import { API_ACCESS_KEY, API_BASE_URL } from '../config/config';

// Send OTP to mobile number
export const sendOTP = async (mobileNumber, countryCode = '+60') => {
  try {
    console.log('=== SEND OTP API ===');
    console.log('Mobile Number:', mobileNumber);
    console.log('Country Code:', "+60");
    console.log('Base URL:', API_BASE_URL);
    console.log('Access Key:', API_ACCESS_KEY);

    const formData = new FormData();
    formData.append('mobile', mobileNumber);
    formData.append('accesskey', API_ACCESS_KEY);
    formData.append('type', 'login-user');
    formData.append('country_code', countryCode);

    console.log('Form Data:', {
      mobile: mobileNumber,
      accesskey: API_ACCESS_KEY,
      type: 'login-user',
      country_code: countryCode,
    });

    const response = await axios.post(
      `${API_BASE_URL}otp-login.php`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('=== SEND OTP API RESPONSE ===');
    console.log('Response Status:', response.status);
    console.log('Response Data:', response.data);

    if (response.data && response.data.error === false) {
      console.log('✅ Success: OTP sent successfully');
      return {
        success: true,
        message: response.data.message,
        data: response.data,
      };
    } else {
      console.error('❌ Error: Send OTP API returned error');
      console.error('Error Message:', response.data?.message);
      return {
        success: false,
        message: response.data?.message || 'Failed to send OTP',
        data: null,
      };
    }
  } catch (error) {
    console.error('=== SEND OTP API ERROR ===');
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

// Verify OTP
export const verifyOTP = async (mobileNumber, otp, countryCode = '+60') => {
  try {
    console.log('=== VERIFY OTP API ===');
    console.log('Mobile Number:', mobileNumber);
    console.log('OTP:', otp);
    console.log('Country Code:', countryCode);
    console.log('Base URL:', API_BASE_URL);
    console.log('Access Key:', API_ACCESS_KEY);

    const formData = new FormData();
    formData.append('mobile', mobileNumber);
    formData.append('accesskey', API_ACCESS_KEY);
    formData.append('type', 'verify-user');
    formData.append('country_code', countryCode);
    formData.append('otp', otp);

    console.log('Form Data:', {
      mobile: mobileNumber,
      accesskey: API_ACCESS_KEY,
      type: 'verify-user',
      country_code: countryCode,
      otp: otp,
    });

    const response = await axios.post(
      `${API_BASE_URL}otp-login.php`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('=== VERIFY OTP API RESPONSE ===');
    console.log('Response Status:', response.status);
    console.log('Response Data:', response.data);
    console.log('Error Field:', response.data?.error);
    console.log('Message Field:', response.data?.message);
    console.log('User Data:', response.data?.data);
    console.log('User Object:', response.data?.user);
    console.log('Token Field:', response.data?.data?.token);
    console.log('Access Token Field:', response.data?.data?.access_token);
    console.log('Full Response Structure:', JSON.stringify(response.data, null, 2));

    // Check if response exists and has data
    if (!response.data) {
      console.error('❌ No response data received');
      return {
        success: false,
        message: 'No response from server',
        data: null,
      };
    }

    // Log the exact error field value and type
    console.log('Error field value:', response.data.error);
    console.log('Error field type:', typeof response.data.error);
    console.log('Error field === false:', response.data.error === false);
    console.log('Error field == false:', response.data.error == false);
    console.log('Error field === "false":', response.data.error === "false");
    console.log('Error field === true:', response.data.error === true);
    console.log('Error field === "true":', response.data.error === "true");

    // Check if error is false (boolean) or "false" (string)
    if (response.data.error === false || response.data.error === "false") {
      console.log('✅ Success: OTP verified successfully');
      console.log('API says error is false, proceeding with login');
      return {
        success: true,
        message: response.data.message,
        data: response.data,
        user: response.data.data || response.data.user || null,
      };
    } else {
      console.error('❌ Error: Verify OTP API returned error');
      console.error('Error Field Value:', response.data?.error);
      console.error('Error Message:', response.data?.message);
      console.error('Full Error Response:', JSON.stringify(response.data, null, 2));
      return {
        success: false,
        message: response.data?.message || 'Invalid OTP',
        data: null,
      };
    }
  } catch (error) {
    console.error('=== VERIFY OTP API ERROR ===');
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

// Resend OTP (same as send OTP)
export const resendOTP = async (mobileNumber, countryCode = '+60') => {
  console.log('=== RESEND OTP ===');
  return await sendOTP(mobileNumber, countryCode);
};
