import axios from 'axios';
import { API_ACCESS_KEY, API_BASE_URL } from '../config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchCartItems } from './CartService';

export const placeOrder = async orderData => {
  try {
    // Get cart items from local storage
    const cartItems = await fetchCartItems();

    // Extract product IDs and quantities
    const productIds = cartItems.map(item => item.product_id || item.id);
    const quantities = cartItems.map(item => item.quantity || 1);

    // Get user data from AsyncStorage
    const storedUser = await AsyncStorage.getItem('userData');
    const user = storedUser ? JSON.parse(storedUser) : null;

    // Prepare form data for order placement
    const formData = new FormData();

    // Basic order data
    formData.append('accesskey', API_ACCESS_KEY);
    formData.append('place_order', '1');
    formData.append('user_id', user?.user_id || user?.id || '');
    formData.append(
      'email',
      user?.email || orderData.selectedAddress?.email || '',
    );
    formData.append(
      'mobile',
      orderData.selectedAddress?.mobile || user?.mobile || '',
    );

    // Address data from selected address
    formData.append('address', orderData.selectedAddress?.address || '');
    formData.append(
      'delivery_state',
      orderData.selectedAddress?.state_id || '',
    );
    formData.append('delivery_city', orderData.selectedAddress?.city_id || '');

    // Delivery details
    formData.append(
      'delivery_method',
      orderData.deliveryMethod?.toLowerCase().replace(/\s+/g, '_') ||
        'in_person_delivery',
    );
    formData.append(
      'delivery_date',
      orderData.selectedDate || new Date().toISOString().split('T')[0],
    );
    formData.append('delivery_time', orderData.selectedDeliveryTime || '');

    // Payment details
    formData.append('payment_method', orderData.selectedPaymentMethod || 'cod');
    formData.append(
      'wallet_used',
      orderData.useWalletBalance ? 'true' : 'false',
    );
    formData.append(
      'wallet_balance',
      orderData.walletBalance?.toString() || '0.0',
    );

    // Cart data
    formData.append('total_items', cartItems.length.toString());
    formData.append('product_variant_id', JSON.stringify(productIds));
    formData.append('quantity', JSON.stringify(quantities));

    // Pricing details
    formData.append('total', orderData.totals?.subtotal?.toString() || '0.00');
    formData.append('tax_amount', orderData.totals?.tax?.toString() || '0.00');
    formData.append(
      'tax_percentage',
      orderData.storeSettings?.tax?.toString() || '0.0',
    );
    formData.append(
      'delivery_charge',
      orderData.totals?.deliveryCharge?.toString() || '0.0',
    );
    formData.append(
      'final_total',
      orderData.totals?.total?.toString() || '0.00',
    );

    // Additional fields
    formData.append('latitude', orderData.selectedAddress?.latitude || '0.0');
    formData.append('longitude', orderData.selectedAddress?.longitude || '0.0');
    formData.append('loyalty_Points', '0.0');
    formData.append('loyalty_Points_used', 'false');

    // Log form data for debugging
    console.log('=== PLACE ORDER API ===');
    console.log('Base URL:', API_BASE_URL);
    console.log('Endpoint:', 'order-process.php');
    console.log('User ID:', user?.user_id || user?.id);
    console.log('Selected Address:', orderData.selectedAddress);
    console.log('Cart Items:', cartItems);
    console.log('Order Data:', orderData);
    console.log('Form Data Keys:', {
      accesskey: API_ACCESS_KEY,
      place_order: '1',
      user_id: user?.user_id || user?.id,
      email: user?.email || orderData.selectedAddress?.email,
      mobile: orderData.selectedAddress?.mobile || user?.mobile,
      address: orderData.selectedAddress?.address,
      delivery_method: orderData.deliveryMethod
        ?.toLowerCase()
        .replace(/\s+/g, '_'),
      delivery_date:
        orderData.selectedDate || new Date().toISOString().split('T')[0],
      delivery_time: orderData.selectedDeliveryTime,
      payment_method: orderData.selectedPaymentMethod,
      wallet_used: orderData.useWalletBalance ? 'true' : 'false',
      wallet_balance: orderData.walletBalance?.toString(),
      total_items: cartItems.length.toString(),
      product_variant_id: JSON.stringify(productIds),
      quantity: JSON.stringify(quantities),
      total: orderData.totals?.subtotal?.toString(),
      tax_amount: orderData.totals?.tax?.toString(),
      delivery_charge: orderData.totals?.deliveryCharge?.toString(),
      final_total: orderData.totals?.total?.toString(),
    });

    const response = await axios.post(
      `${API_BASE_URL}order-process.php`,
      formData,
    );

    console.log('=== ORDER PLACEMENT API RESPONSE ===');
    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);
    console.log('Full Response Data:', response.data);
    console.log('Response Data Type:', typeof response.data);
    
    // Extract JSON from mixed HTML/JSON response
    let responseData;
    if (typeof response.data === 'string') {
      // Find the JSON part in the response (look for the last occurrence of {)
      const jsonStart = response.data.lastIndexOf('{');
      if (jsonStart !== -1) {
        const jsonString = response.data.substring(jsonStart);
        try {
          responseData = JSON.parse(jsonString);
          console.log('✅ Successfully extracted JSON from mixed response');
          console.log('Extracted JSON:', responseData);
        } catch (parseError) {
          console.error('❌ Failed to parse extracted JSON:', parseError);
          responseData = response.data;
        }
      } else {
        console.error('❌ No JSON found in response');
        responseData = response.data;
      }
    } else {
      responseData = response.data;
    }
    
    console.log('Parsed Response Data:', responseData);
    console.log('Response Data Type:', typeof responseData);
    console.log('Response Data Keys:', responseData && typeof responseData === 'object' ? Object.keys(responseData) : 'N/A');
    console.log('Error Field:', responseData?.error);
    console.log('Error Field Type:', typeof responseData?.error);
    console.log('Message Field:', responseData?.message);
    console.log('Order ID Field:', responseData?.order_id);

    if (
      responseData &&
      (responseData.error === false || responseData.error === 'false')
    ) {
      console.log('✅ Success: Order placed successfully');
      return {
        success: true,
        data: responseData,
        orderId: responseData.order_id || responseData.id,
      };
    } else {
      console.error('❌ Error: Order placement failed');
      console.error('Error Message:', responseData?.message);
      return {
        success: false,
        data: null,
        message: responseData?.message || 'Order placement failed',
      };
    }
  } catch (error) {
    console.error('=== ORDER PLACEMENT API ERROR ===');
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
      message: 'Network error occurred',
    };
  }
};

export const getUserOrders = async userId => {
  try {
    const formData = new FormData();
    formData.append('accesskey', API_ACCESS_KEY);
    formData.append('get_orders', '1');
    formData.append('user_id', userId.toString());

    // Log form data
    console.log('=== GET USER ORDERS ===');
    console.log('Base URL:', API_BASE_URL);
    console.log('Endpoint:', 'order-process.php');
    console.log('User ID:', userId);
    console.log('Access Key:', API_ACCESS_KEY);
    console.log('Form Data:', {
      accesskey: API_ACCESS_KEY,
      get_orders: '1',
      user_id: userId,
    });

    const response = await axios.post(
      `${API_BASE_URL}order-process.php`,
      formData,
    );

    console.log('=== GET ORDERS API RESPONSE ===');
    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);
    console.log('Full Response Data:', response.data);

    if (response.data && response.data.error === false) {
      console.log('✅ Success: Orders fetched successfully');
      const orders = response.data.data || [];
      return {
        success: true,
        orders: orders,
        message: response.data.message || 'Orders fetched successfully',
      };
    } else {
      console.error('❌ Error: Get orders API returned error');
      console.error('Error Message:', response.data.message);
      return {
        success: false,
        orders: [],
        message: response.data.message || 'Failed to fetch orders',
      };
    }
  } catch (error) {
    console.error('=== GET ORDERS API ERROR ===');
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
      orders: [],
      message: 'Network error occurred',
    };
  }
};
