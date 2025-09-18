import axios from 'axios';
import { API_ACCESS_KEY, API_BASE_URL } from '../config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchCartItems } from './CartService';

export const placeOrder = async orderData => {
  try {
    console.log('=== ORDER SERVICE - PLACE ORDER ===');
    console.log('📋 Complete Order Data Received:', JSON.stringify(orderData, null, 2));
    
    // Get cart items from local storage
    const cartItems = await fetchCartItems();
    console.log('🛒 Cart Items from Storage:', JSON.stringify(cartItems, null, 2));

    // Extract product IDs and quantities
    const productIds = cartItems.map(item => item.product_id || item.id);
    const quantities = cartItems.map(item => item.quantity || 1);
    console.log('📦 Product IDs:', productIds);
    console.log('🔢 Quantities:', quantities);

    // Get user data from AsyncStorage
    const storedUser = await AsyncStorage.getItem('userData');
    const user = storedUser ? JSON.parse(storedUser) : null;
    console.log('👤 User Data from Storage:', JSON.stringify(user, null, 2));
    console.log('📍 Selected Address Data:', JSON.stringify(orderData.selectedAddress, null, 2));

    // Prepare form data for order placement
    const formData = new FormData();
    console.log("formData", formData);
    
    // Required fields as per your specification
    formData.append('accesskey', '90336');
    formData.append('place_order', '1');
    formData.append('user_id', user?.user_id || user?.id || 'non');
    
    // Tax amount from data
    formData.append('tax_amount', orderData.totals?.tax?.toString() || 'non');
    
    // Delivery notes
    formData.append('notes', orderData.deliveryNotes || '');
    
    // Loyalty points
    formData.append('loyalty_Points_used', 'false');
    formData.append('loyalty_Points', '0.0');
    
    // Location data from selected address
    formData.append('latitude', orderData.selectedAddress?.latitude || 'non');
    formData.append('longitude', orderData.selectedAddress?.longitude || 'non');
    
    // Delivery time from selected data
    const timeSlotId = orderData.selectedDeliveryTime || 'non';
    const timeSlotDetails = orderData.timeSlots?.find(slot => slot.id === timeSlotId);
    formData.append('delivery_time', timeSlotDetails?.title || 'non');
    
    // Total items from data
    formData.append('total_items', cartItems.length.toString());
    
    // Total from data
    formData.append('total', orderData.totals?.subtotal?.toString() || 'non');
    
    // Delivery method from data
    formData.append('delivery_method', orderData.deliveryMethod?.toLowerCase().replace(/\s+/g, '_') || 'non');
    
    // Payment method
    formData.append('payment_method', 'cod');
    
    // Complete address data - pass all fields dynamically
    formData.append('email', orderData.selectedAddress?.email || 'non');
    formData.append('mobile', orderData.selectedAddress?.mobile || 'non');
    formData.append('address', orderData.selectedAddress?.address || 'non');
    formData.append('name', orderData.selectedAddress?.name || 'non');
    formData.append('landmark', orderData.selectedAddress?.landmark || 'non');
    formData.append('pincode', orderData.selectedAddress?.pincode || 'non');
    formData.append('address_id', orderData.selectedAddress?.id || 'non');
    
    // Wallet balance from data
    formData.append('wallet_balance', orderData.walletBalance?.toString() || 'non');
    
    // Delivery state from data
    formData.append('delivery_state', orderData.selectedAddress?.state_id || orderData.selectedAddress?.state || 'non');
    formData.append('state_id', orderData.selectedAddress?.state_id || orderData.selectedAddress?.state || 'non');
    
    // Delivery date from selected address - format as YYYY-MM-DD
    const formatDateForAPI = (dateString) => {
      if (!dateString || dateString === 'non') return 'non';
      
      // Parse the date string "September 21, 2025" manually
      const dateMatch = dateString.match(/(\w+)\s+(\d+),\s+(\d+)/);
      if (dateMatch) {
        const [, monthName, day, year] = dateMatch;
        
        // Month name to number mapping
        const monthMap = {
          'January': 0, 'February': 1, 'March': 2, 'April': 3,
          'May': 4, 'June': 5, 'July': 6, 'August': 7,
          'September': 8, 'October': 9, 'November': 10, 'December': 11
        };
        
        const monthNumber = monthMap[monthName];
        
        if (monthNumber !== undefined) {
          // Create date object manually
          const date = new Date(parseInt(year), monthNumber, parseInt(day));
          
          if (!isNaN(date.getTime())) {
            const formattedDate = `${year}-${String(monthNumber + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            return formattedDate;
          }
        }
      }
      
      return 'non';
    };
    
    formData.append('delivery_date', formatDateForAPI(orderData.selectedDate));
    
    // Delivery charge from data
    formData.append('delivery_charge', orderData.totals?.deliveryCharge?.toString() || 'non');
    
    // Final total from data
    formData.append('final_total', orderData.totals?.total?.toString() || 'non');
    
    // Tax percentage from data
    formData.append('tax_percentage', orderData.storeSettings?.tax?.toString() || 'non');
    
    // Wallet used
    formData.append('wallet_used', 'false');
    
    // Product variant ID from data
    formData.append('product_variant_id', JSON.stringify(productIds));
    
    // Delivery city from data
    formData.append('delivery_city', orderData.selectedAddress?.city_id || orderData.selectedAddress?.city || 'non');
    formData.append('city_id', orderData.selectedAddress?.city_id || orderData.selectedAddress?.city || 'non');
    
    // Delivery district from data
    formData.append('delivery_district', orderData.selectedAddress?.district_id || orderData.selectedAddress?.district || 'non');
    
    // Delivery zone from data
    formData.append('delivery_zone', orderData.selectedAddress?.zone_id || orderData.selectedAddress?.zone || 'non');
    
    // GST number from data
    formData.append('gst_no', orderData.selectedAddress?.gst_no || orderData.gst_no || 'non');
    
    // From date (current date) - format as YYYY-MM-DD
    formData.append('from_date', formatDateForAPI(orderData.selectedDate));
    
    // Quantity from data
    formData.append('quantity', JSON.stringify(quantities));

    // Log form data for debugging
    console.log('=== PLACE ORDER API ===');
    console.log('Base URL:', API_BASE_URL);
    console.log('Endpoint:', 'order-process.php');
    console.log('User ID:', user?.user_id || user?.id);
    console.log('Selected Address:', orderData.selectedAddress);
    console.log('Cart Items:', cartItems);
    console.log('Order Data:', orderData);
    
    // Log all form data fields
    console.log('📝 Form Data Fields:');
    console.log('🔑 Access Key:', API_ACCESS_KEY);
    console.log('👤 User ID:', user?.user_id || user?.id);
    console.log('📧 Email:', user?.email || orderData.selectedAddress?.email || '');
    console.log('📱 Mobile:', orderData.selectedAddress?.mobile || user?.mobile || '');
    console.log('📍 Address:', orderData.selectedAddress?.address || '');
    console.log('👤 Name:', orderData.selectedAddress?.name || '');
    console.log('🏷️ Landmark:', orderData.selectedAddress?.landmark || '');
    console.log('📮 Pincode:', orderData.selectedAddress?.pincode || '');
    console.log('🆔 Address ID:', orderData.selectedAddress?.id || '');
    console.log('🏛️ State ID:', orderData.selectedAddress?.state_id || orderData.selectedAddress?.state || '');
    console.log('🏙️ City ID:', orderData.selectedAddress?.city_id || orderData.selectedAddress?.city || '');
    console.log('🚚 Delivery Method:', orderData.deliveryMethod?.toLowerCase().replace(/\s+/g, '_') || 'in_person_delivery');
    console.log('📅 Delivery Date (Original):', orderData.selectedDate || '');
    console.log('📅 Delivery Date (Formatted):', formatDateForAPI(orderData.selectedDate));
    console.log('📅 From Date (Formatted):', formatDateForAPI(orderData.selectedDate));
    console.log('⏰ Delivery Time ID:', orderData.selectedDeliveryTime || '');
    console.log('🕐 Time Slot Details:', timeSlotDetails || 'Not found');
    console.log('📋 Available Time Slots:', orderData.timeSlots || 'Not provided');
    console.log('💳 Payment Method:', orderData.selectedPaymentMethod || '');
    console.log('💰 Wallet Balance Used:', orderData.useWalletBalance || false);
    console.log('🏙️ Delivery City:', orderData.selectedAddress?.city_id || orderData.selectedAddress?.city || 'Not found');
    console.log('🏛️ Delivery State:', orderData.selectedAddress?.state_id || orderData.selectedAddress?.state || 'Not found');
    console.log('🏘️ Delivery District:', orderData.selectedAddress?.district_id || orderData.selectedAddress?.district || 'Not found');
    console.log('🌍 Delivery Zone:', orderData.selectedAddress?.zone_id || orderData.selectedAddress?.zone || 'Not found');
    console.log('📄 GST Number:', orderData.selectedAddress?.gst_no || orderData.gst_no || 'Not found');
    console.log('💵 Wallet Balance Amount:', orderData.walletBalance || '0.00');
    console.log('📦 Product IDs:', productIds.join(','));
    console.log('🔢 Quantities:', quantities.join(','));
    console.log('🧾 Subtotal:', orderData.totals?.subtotal?.toString() || '0.00');
    console.log('📊 Tax Amount:', orderData.totals?.tax?.toString() || '0.00');
    console.log('📊 Tax Percentage:', orderData.storeSettings?.tax?.toString() || '0.0');
    console.log('🚚 Delivery Charge:', orderData.totals?.deliveryCharge?.toString() || '0.0');
    console.log('💯 Final Total:', orderData.totals?.total?.toString() || '0.00');
    console.log('🌍 Latitude:', orderData.selectedAddress?.latitude || '0.0');
    console.log('🌍 Longitude:', orderData.selectedAddress?.longitude || '0.0');
    console.log('📝 Delivery Notes:', orderData.deliveryNotes || '');
    console.log('🏪 Store Settings:', orderData.storeSettings);
    
    console.log('Form Data Keys:', {
      accesskey: API_ACCESS_KEY,
      place_order: '1',
      user_id: user?.user_id || user?.id,
      email: user?.email || orderData.selectedAddress?.email,
      mobile: orderData.selectedAddress?.mobile || user?.mobile,
      address: orderData.selectedAddress?.address,
      name: orderData.selectedAddress?.name,
      landmark: orderData.selectedAddress?.landmark,
      pincode: orderData.selectedAddress?.pincode,
      address_id: orderData.selectedAddress?.id,
      state_id: orderData.selectedAddress?.state_id || orderData.selectedAddress?.state,
      city_id: orderData.selectedAddress?.city_id || orderData.selectedAddress?.city,
      delivery_method: orderData.deliveryMethod
        ?.toLowerCase()
        .replace(/\s+/g, '_'),
      delivery_date:
        orderData.selectedDate ||"",
      from_date:
        orderData.selectedDate || "",
      delivery_time: orderData.selectedDeliveryTime,
      payment_method: orderData.selectedPaymentMethod,
      wallet_used: orderData.useWalletBalance ? 'true' : 'false',
      wallet_balance: orderData.walletBalance?.toString(),
      notes: orderData.deliveryNotes || '',
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
    console.log('✅ Response Status:', response.status);
    console.log('📋 Response Headers:', response.headers);
    console.log('📄 Full Response Data:', response.data);
    console.log('🔍 Response Data Type:', typeof response.data);
    console.log('📊 Response Data Length:', response.data?.length || 'N/A');
    
    if (response.data) {
      console.log('🔍 Response Data Keys:', Object.keys(response.data));
      if (response.data.error !== undefined) {
        console.log('❌ Error Flag:', response.data.error);
      }
      if (response.data.message) {
        console.log('💬 Message:', response.data.message);
      }
      if (response.data.data) {
        console.log('📦 Response Data Object:', response.data.data);
      }
    }
    
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
    console.log('Response Status get order:', response.status);
    
    console.log('Full Response Data get  order:', response.data);

    if (response.data && response.data.error === false) {
      console.log('✅ Success: Orders fetched successfully');
      const orders = response.data.data || [];
      return {
        success: true,
        orders: orders,
        message: response.data?.message || 'Orders fetched successfully',
      };
    } else {
      console.error('❌ Error: Get orders API returned error');
      console.error('Error Message:', response.data?.message || 'Unknown error');
      return {
        success: false,
        orders: [],
        message: response.data?.message || 'Failed to fetch orders',
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

// Fetch a single order's details by order id using existing getUserOrders API
export const getOrderDetails = async (userId, orderId) => {
  try {
    if (!userId || !orderId) {
      return { success: false, order: null, message: 'Missing userId or orderId' };
    }

    const result = await getUserOrders(userId);
    if (!result.success) {
      return { success: false, order: null, message: result.message || 'Failed to fetch orders' };
    }

    console.log('=== SEARCHING FOR ORDER IN USER ORDERS ===');
    console.log('Looking for order ID:', orderId);
    console.log('Total orders found:', result.orders?.length || 0);
    console.log('All order IDs:', result.orders?.map(o => ({ id: o.id, order_id: o.order_id })) || []);

    const normalizedOrderId = String(orderId);
    const found = (result.orders || []).find(o => {
      const matchesId = String(o.id) === normalizedOrderId;
      const matchesOrderId = String(o.order_id) === normalizedOrderId;
      console.log(`Checking order: id=${o.id}, order_id=${o.order_id}, matchesId=${matchesId}, matchesOrderId=${matchesOrderId}`);
      return matchesId || matchesOrderId;
    });

    if (found) {
      console.log('✅ Order found:', found);
      return { success: true, order: found };
    } else {
      console.log('❌ Order not found with ID:', orderId);
    }

    return { success: false, order: null, message: 'Order not found' };
  } catch (error) {
    console.error('Error in getOrderDetails:', error);
    return { success: false, order: null, message: 'Unexpected error' };
  }
};
