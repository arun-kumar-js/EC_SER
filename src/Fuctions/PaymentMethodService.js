import axios from 'axios';
import { API_ACCESS_KEY, API_BASE_URL } from '../config/config';

/**
 * Fetch payment methods from API
 * @returns {Promise<Object>} Object containing success status and payment methods data
 */
export const getPaymentMethods = async () => {
  try {
    const formData = new FormData();
    formData.append('accesskey', API_ACCESS_KEY);
    formData.append('settings', '1');
    formData.append('get_payment_methods', '1');

    console.log('=== GET PAYMENT METHODS ===');
    console.log('Access Key:', API_ACCESS_KEY);
    console.log('API URL:', `${API_BASE_URL}settings.php`);
    console.log('Form Data:', {
      accesskey: API_ACCESS_KEY,
      settings: '1',
      get_payment_methods: '1',
    });

    const response = await axios.post(
      `${API_BASE_URL}settings.php`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('=== PAYMENT METHODS API RESPONSE ===');
    console.log('Response Status:', response.status);
    console.log('Full Response Data:', JSON.stringify(response.data, null, 2));

    if (response.data && response.data.error === false) {
      const paymentMethods = response.data.payment_methods;
      console.log('✅ Success: Payment methods fetched successfully');
      console.log('Payment Methods:', paymentMethods);

      // Parse and return enabled payment methods
      const enabledMethods = [];

      // Check COD
      if (paymentMethods.cod_payment_method === '1') {
        enabledMethods.push({
          id: 'cod',
          name: 'CASH ON DELIVERY',
          icon: 'cash-outline',
          enabled: true,
        });
      }

      // Check BillPlz
      if (paymentMethods.billplz_payment_method === '1') {
        enabledMethods.push({
          id: 'billplz',
          name: 'BILL PLZ',
          icon: 'phone-portrait-outline',
          enabled: true,
          config: {
            api_url: paymentMethods.billplz_api_url,
            app_api_url: paymentMethods.billplz_app_api_url,
            api_key: paymentMethods.billplz_api_key,
            collection_id: paymentMethods.billplz_collection_id,
          },
        });
      }

      // Check PayPal
      if (paymentMethods.paypal_payment_method === '1') {
        enabledMethods.push({
          id: 'paypal',
          name: 'PAYPAL',
          icon: 'logo-paypal',
          enabled: true,
          config: {
            mode: paymentMethods.paypal_mode,
            business_email: paymentMethods.paypal_business_email,
          },
        });
      }

      // Check Razorpay
      if (paymentMethods.razorpay_payment_method === '1') {
        enabledMethods.push({
          id: 'razorpay',
          name: 'RAZORPAY',
          icon: 'card-outline',
          enabled: true,
          config: {
            key: paymentMethods.razorpay_key,
            secret_key: paymentMethods.razorpay_secret_key,
          },
        });
      }

      // Check PayUMoney
      if (paymentMethods.payumoney_payment_method === '1') {
        enabledMethods.push({
          id: 'payumoney',
          name: 'PAYUMONEY',
          icon: 'card-outline',
          enabled: true,
          config: {
            merchant_key: paymentMethods.payumoney_merchant_key,
            merchant_id: paymentMethods.payumoney_merchant_id,
            salt: paymentMethods.payumoney_salt,
          },
        });
      }

      // Check Instamojo
      if (paymentMethods.instamojo_payment_method === '1') {
        enabledMethods.push({
          id: 'instamojo',
          name: 'INSTAMOJO',
          icon: 'card-outline',
          enabled: true,
          config: {
            client_id: paymentMethods.instamojo_client_id,
            client_secret: paymentMethods.instamojo_client_secret,
            api_key: paymentMethods.instamojo_api_key,
            auth_token: paymentMethods.instamojo_auth_token,
            salt: paymentMethods.instamojo_salt,
          },
        });
      }

      // Check CCAvenue
      if (paymentMethods.ccavenue_payment_method === '1') {
        enabledMethods.push({
          id: 'ccavenue',
          name: 'CCAVENUE',
          icon: 'card-outline',
          enabled: true,
          config: {
            merchant_id: paymentMethods.ccavenue_merchant_id,
            access_code: paymentMethods.ccavenue_access_code,
            working_key: paymentMethods.ccavenue_working_key,
            currency: paymentMethods.ccavenue_currency,
          },
        });
      }

      // Check UPI
      if (paymentMethods.upi_payment_method === '1') {
        enabledMethods.push({
          id: 'upi',
          name: 'UPI PAYMENT',
          icon: 'qr-code-outline',
          enabled: true,
          config: {
            merchant_id: paymentMethods.merchant_id,
            upi_id: paymentMethods.upi_id,
            secret_key: paymentMethods.upi_secret_key,
            notes: paymentMethods.upi_notes,
          },
        });
      }

      // Check PhonePe
      if (paymentMethods.phonepe_payment_method === '1') {
        enabledMethods.push({
          id: 'phonepe',
          name: 'PHONEPE',
          icon: 'phone-portrait-outline',
          enabled: true,
          config: {
            merchant_id: paymentMethods.phonepe_merchant_id,
            secret_key: paymentMethods.phonepe_secret_key,
          },
        });
      }

      console.log('✅ Enabled Payment Methods:', enabledMethods);

      return {
        success: true,
        data: enabledMethods,
        raw: paymentMethods,
      };
    } else {
      console.error('❌ Error: Payment methods API returned error');
      console.error('Error Message:', response.data?.message);
      return {
        success: false,
        message: response.data?.message || 'Failed to fetch payment methods',
        data: [],
      };
    }
  } catch (error) {
    console.error('=== PAYMENT METHODS API ERROR ===');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    } else if (error.request) {
      console.error('No Response Received:', error.request);
    }
    return {
      success: false,
      message: error.message,
      data: [],
    };
  }
};




