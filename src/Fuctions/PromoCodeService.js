import axios from 'axios';
import { API_ACCESS_KEY, GET_ALL_ADDRESSES } from '../config/config';

export const validatePromoCode = async (promoCode, total, userId) => {
  try {
    // Validate input parameters
    if (!promoCode || !total || !userId) {
      console.error('❌ Error: Missing required parameters');
      console.error('Promo Code:', promoCode);
      console.error('Total:', total);
      console.error('User ID:', userId);
      return {
        success: false,
        message: 'Missing required parameters',
        discount: 0,
        finalTotal: total || 0,
      };
    }

    const formData = new FormData();
    formData.append('accesskey', '90336');
    formData.append('validate_promo_code', '1');
    formData.append('total', total.toString());
    formData.append('user_id', userId.toString());
    formData.append('promo_code', promoCode);

    // Log form data
    console.log('=== VALIDATE PROMO CODE ===');
    console.log('Promo Code:', promoCode);
    console.log('Total:', total);
    console.log('User ID:', userId);
    console.log('Access Key:', '90336');
    console.log('Form Data:', {
      accesskey: '90336',
      validate_promo_code: '1',
      total: total.toString(),
      user_id: userId,
      promo_code: promoCode,
    });

    const response = await axios.post(
      `https://spiderekart.in/ec_service/api-firebase/validate-promo-code.php`,
      formData,
    );

    console.log('=== PROMO CODE API RESPONSE ===');
    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);
    console.log('Full Response Data:', response.data);
    console.log('Content Length:', response.headers['content-length']);
console.log("response.data",response.data)
    // Check if response is empty
    if (!response.data || response.data === '' || response.headers['content-length'] === '0') {
      console.error('❌ Error: Empty response from server');
      return {
        success: false,
        message: 'Server returned empty response. Please check promo code.',
        discount: 0,
        finalTotal: total,
      };
    }

    // Try to parse response data
    let responseData;
    try {
      responseData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    } catch (parseError) {
      console.error('❌ Error: Failed to parse response data');
      console.error('Parse Error:', parseError);
      console.error('Raw Response:', response.data);
      return {
        success: false,
        message: 'Invalid response format from server',
        discount: 0,
        finalTotal: total,
      };
    }

    console.log('Parsed Response Data:', responseData);
    console.log('Error Field:', responseData.error);
    console.log('Message Field:', responseData.message);

    // Check if response has error field
    if (responseData && responseData.error === false) {
      console.log('✅ Success: Promo code validated successfully');
      
      // Calculate discount amount in currency
      const discountPercentage = parseFloat(responseData.discount) || 0;
      const originalTotal = parseFloat(responseData.total) || 0;
      const discountAmount = (originalTotal * discountPercentage) / 100;
      
      console.log('=== PROMO DISCOUNT CALCULATION ===');
      console.log('Discount Percentage:', discountPercentage + '%');
      console.log('Original Total:', originalTotal);
      console.log('Discount Amount:', discountAmount);
      console.log('Final Amount:', responseData.discounted_amount);
      
      return {
        success: true,
        message: responseData.message || 'Promo code applied successfully',
        discountPercentage: discountPercentage,
        discountAmount: discountAmount,
        finalTotal: responseData.discounted_amount || responseData.total || total,
        promoCode: responseData.promo_code,
        promoCodeMessage: responseData.promo_code_message,
        originalTotal: responseData.total,
        discountedAmount: responseData.discounted_amount,
      };
    } else if (responseData && responseData.error === true) {
      console.error('❌ Error: Promo code validation failed');
      console.error('Error Message:', responseData.message);
      return {
        success: false,
        message: responseData.message || 'Invalid promo code',
        discount: 0,
        finalTotal: total,
      };
    } else {
      // Handle unexpected response format
      console.error('❌ Error: Unexpected response format');
      console.error('Response Data:', responseData);
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
