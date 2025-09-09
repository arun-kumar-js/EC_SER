import axios from 'axios';
import { API_ACCESS_KEY, GET_ALL_ADDRESSES } from '../config/config';

export const validatePromoCode = async (promoCode, total, userId) => {
  try {
    const formData = new FormData();
    formData.append('accesskey', API_ACCESS_KEY);
    formData.append('validate_promo_code', '1');
    formData.append('total', total.toString());
    formData.append('user_id', userId);
    formData.append('promo_code', promoCode);

    // Log form data
    console.log('=== VALIDATE PROMO CODE ===');
    console.log('Promo Code:', promoCode);
    console.log('Total:', total);
    console.log('User ID:', userId);
    console.log('Access Key:', API_ACCESS_KEY);
    console.log('Form Data:', {
      accesskey: API_ACCESS_KEY,
      validate_promo_code: '1',
      total: total.toString(),
      user_id: userId,
      promo_code: promoCode,
    });

    const response = await axios.post(
      `${GET_ALL_ADDRESSES}/validate-promo-code.php`,
      formData,
    );

    console.log('=== PROMO CODE API RESPONSE ===');
    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);
    console.log('Full Response Data:', response.data);
    console.log('Error Field:', response.data.error);
    console.log('Message Field:', response.data.message);

    // Check if response has error field
    if (response.data && response.data.error === false) {
      console.log('✅ Success: Promo code validated successfully');
      return {
        success: true,
        message: response.data.message || 'Promo code applied successfully',
        discount: response.data.discount || 0,
        finalTotal: response.data.final_total || total,
      };
    } else if (response.data && response.data.error === true) {
      console.error('❌ Error: Promo code validation failed');
      console.error('Error Message:', response.data.message);
      return {
        success: false,
        message: response.data.message || 'Invalid promo code',
        discount: 0,
        finalTotal: total,
      };
    } else {
      // Handle unexpected response format
      console.error('❌ Error: Unexpected response format');
      console.error('Response Data:', response.data);
      return {
        success: false,
        message: 'Invalid response from server',
        discount: 0,
        finalTotal: total,
      };
    }
  } catch (error) {
    console.error('=== PROMO CODE API ERROR ===');
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
      discount: 0,
      finalTotal: total,
    };
  }
};
