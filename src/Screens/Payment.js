import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getTimeSlots } from '../Fuctions/TimeSlotService';
import { getWalletBalance } from '../Fuctions/UserDataService';
import { placeOrder } from '../Fuctions/OrderService';
import { clearCart, fetchCartItems, getCartSummary } from '../Fuctions/CartService';
import { createBillPlzBill, createBillPlzBillDirect, testBillPlzAPI } from '../Fuctions/BillPlzService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const PaymentScreen = ({ route }) => {
  const navigation = useNavigation();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [selectedDeliveryDay, setSelectedDeliveryDay] = useState('');
  const [selectedDeliveryTime, setSelectedDeliveryTime] = useState('');
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [user, setUser] = useState(null);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotals, setCartTotals] = useState({
    subtotal: 0,
    tax: 0,
    deliveryCharge: 0,
    total: 0,
    taxable_amount: 0
  });

  // Get checkout data from route params
  const checkoutData = route.params || {};
  
  // Debug: Log the received checkout data
  console.log('=== PAYMENT SCREEN CHECKOUT DATA ===');
  console.log('Selected Address:', checkoutData.selectedAddress);
  console.log('Delivery Method:', checkoutData.deliveryMethod);
  console.log('Store Settings:', checkoutData.storeSettings);
  console.log('User:', checkoutData.user);

  const deliveryDays = [];

  // Load cart data from SQLite storage
  const loadCartData = async () => {
    try {
      console.log('=== LOADING CART DATA FROM SQLITE ===');
      const cartData = await fetchCartItems();
      console.log('Cart items from SQLite:', cartData);
      
      if (cartData && cartData.length > 0) {
        setCartItems(cartData);
        
        // Calculate totals
        console.log('=== CALCULATING TOTALS ===');
        const subtotal = cartData.reduce((sum, item) => {
          // Handle price with currency symbols or without
          let priceStr = item.price || item.variants?.[0]?.product_price || item.product_price || '0';
          // Remove currency symbols
          priceStr = priceStr.toString().replace(/[₹$€£¥RM]/g, '').trim();
          const price = parseFloat(priceStr) || 0;
          const quantity = parseInt(item.quantity || 0);
          const itemTotal = price * quantity;
          console.log(`Item: ${item.name || 'Unknown'}, Price String: ${item.price}, Parsed Price: ${price}, Qty: ${quantity}, Total: ${itemTotal}`);
          return sum + itemTotal;
        }, 0);
        console.log('Calculated subtotal:', subtotal);
        
        // Use checkout data for delivery charge and tax if available, otherwise use defaults
        const deliveryCharge = checkoutData.totals?.deliveryCharge || checkoutData.storeSettings?.delivery_charge;
        const taxRate = (checkoutData.storeSettings?.tax) / 100; // Convert percentage to decimal
        const taxableAmount = subtotal;
        const tax = taxableAmount * taxRate;
        const total = subtotal + deliveryCharge + tax;
        
        console.log('Delivery charge:', deliveryCharge);
        console.log('Tax rate:', taxRate);
        console.log('Tax amount:', tax);
        console.log('Total:', total);
        
        const totals = {
          subtotal: subtotal,
          tax: tax,
          deliveryCharge: deliveryCharge,
          total: total,
          taxable_amount: taxableAmount
        };
        
        console.log('Calculated totals:', totals);
        console.log('Setting cartTotals state with:', totals);
        setCartTotals(totals);
      } else {
        console.log('No cart items found');
        setCartItems([]);
        setCartTotals({
          subtotal: 0,
          tax: 0,
          deliveryCharge: 0,
          total: 0,
          taxable_amount: 0
        });
      }
    } catch (error) {
      console.error('Error loading cart data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load cart data'
      });
    }
  };

  // Refresh cart data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadCartData();
    }, [])
  );

  // Load time slots and wallet balance on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load cart data from SQLite
        await loadCartData();
        
        // Set current date as default
        const today = new Date();
        const formattedToday = today.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        setSelectedDate(formattedToday);

        // Load user data from AsyncStorage
        const storedUser = await AsyncStorage.getItem('userData');
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          setUser(userObj);

          // Get wallet balance
          const userId = userObj.user_id || userObj.id;
          if (userId) {
            const balanceResult = await getWalletBalance(userId);
            if (balanceResult.success) {
              setWalletBalance(balanceResult.balance);
            }
          }
        }

        // Load time slots
        const result = await getTimeSlots();
        if (result.success && result.data) {
          setTimeSlots(result.data);
          // Set first time slot as default if available
          if (result.data.length > 0) {
            setSelectedDeliveryTime(result.data[0].id);
          }
        } else {
          // Fallback data if API fails
          console.log('Using fallback time slots');
          const fallbackSlots = [
            {
              id: '29',
              title: 'Afternoon 2PM - 7PM',
              from_time: '14:00:00',
              to_time: '19:00:00',
              last_order_time: '18:00:00',
              status: '1',
            },
            {
              id: '31',
              title: 'Morning 8AM - 5PM',
              from_time: '00:00:08',
              to_time: '00:00:05',
              last_order_time: '00:00:10',
              status: '1',
            },
          ];
          setTimeSlots(fallbackSlots);
          setSelectedDeliveryTime(fallbackSlots[0].id);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const paymentMethods = [
    { id: 'cod', name: 'CASH ON DELIVERY', icon: 'cash-outline' },
    { id: 'billplz', name: 'BILL PLZ', icon: 'phone-portrait-outline' },
  ];

  const handlePaymentMethodSelect = methodId => {
    setSelectedPaymentMethod(methodId);
  };

  const handleBillPlzPayment = async () => {
    try {
      // Prepare order data for BillPlz
      const orderData = {
        orderId: `ORDER_${Date.now()}`, // Generate temporary order ID
        user: user,
        selectedAddress: checkoutData.selectedAddress,
        totals: cartTotals,
        deliveryMethod: checkoutData.deliveryMethod,
        selectedDate: selectedDate,
        selectedDeliveryTime: selectedDeliveryTime,
        timeSlots: timeSlots,
        deliveryNotes: deliveryNotes,
        storeSettings: checkoutData.storeSettings,
        cartItems: cartItems,
      };

      // Console log the BillPlz order form data
      console.log('=== BILLPLZ ORDER FORM DATA ===');
      console.log('📋 BillPlz Order Data:', JSON.stringify(orderData, null, 2));
      console.log('🆔 Order ID:', orderData.orderId);
      console.log('📍 Selected Address:', orderData.selectedAddress);
      console.log('🚚 Delivery Method:', orderData.deliveryMethod);
      console.log('📅 Selected Date:', orderData.selectedDate);
      console.log('⏰ Selected Time:', orderData.selectedDeliveryTime);
      console.log('📝 Delivery Notes:', orderData.deliveryNotes);
      console.log('🏪 Store Settings:', orderData.storeSettings);
      console.log('👤 User Data:', orderData.user);
      console.log('🧾 Cart Totals:', orderData.totals);
      console.log('🛒 Cart Items Count:', orderData.cartItems?.length || 0);
      console.log('🛒 Cart Items:', orderData.cartItems);
      console.log('================================');

      console.log('=== LAUNCHING BILLPLZ PAYMENT ===');
      console.log('Order Data:', orderData);

      // Try to create BillPlz bill first
      console.log('=== CREATING BILLPLZ BILL ===');
      const billResult = await createBillPlzBill(orderData);
      
      if (billResult.success && billResult.paymentUrl) {
        console.log('✅ BillPlz bill created successfully');
        console.log('Payment URL:', billResult.paymentUrl);
        
        // Navigate to BillPlz WebView with the payment URL
        navigation.navigate('BillPlzWebView', {
          orderData: orderData,
          paymentUrl: billResult.paymentUrl,
          billId: billResult.billId,
          returnToPayment: true,
        });
      } else {
        console.log('❌ BillPlz bill creation failed:', billResult.message);
        console.log('🔄 Trying direct API as fallback...');
        
        // Automatically try direct API without showing alert
        handleBillPlzPaymentDirect(orderData);
      }
    } catch (error) {
      console.error('Error launching BillPlz payment:', error);
      // Navigate to PaymentFailure screen
      navigation.navigate('PaymentFailure', {
        errorMessage: 'Failed to launch payment. Please try again.',
        orderId: orderData?.order_id,
        amount: orderData?.amount,
      });
      setSelectedPaymentMethod('');
    }
  };

  const handleBillPlzPaymentDirect = async (orderData) => {
    try {
      console.log('=== TRYING DIRECT BILLPLZ API ===');
      const billResult = await createBillPlzBillDirect(orderData);
      
      if (billResult.success && billResult.paymentUrl) {
        console.log('✅ Direct BillPlz API successful');
        navigation.navigate('BillPlzWebView', {
          orderData: orderData,
          paymentUrl: billResult.paymentUrl,
          billId: billResult.billId,
          returnToPayment: true,
        });
      } else {
        console.log('❌ Direct BillPlz API also failed:', billResult.message);
        console.log('💡 Please check your BillPlz configuration and Collection ID');
        // Navigate to BillPlz WebView anyway with order data for manual handling
        navigation.navigate('BillPlzWebView', {
          orderData: orderData,
          returnToPayment: true,
        });
      }
    } catch (error) {
      console.error('Direct API error:', error);
      console.log('🔄 Proceeding with manual payment flow...');
      // Navigate to BillPlz WebView for manual handling
      navigation.navigate('BillPlzWebView', {
        orderData: orderData,
        returnToPayment: true,
      });
    }
  };

  const handleBillPlzPaymentSuccess = async orderData => {
    try {
      console.log('=== BILLPLZ PAYMENT SUCCESS ===');
      console.log('Processing successful payment...');

      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Payment Successful!',
        text2: 'Processing your order...',
        visibilityTime: 1000,
      });

      // Create the actual order in your system
      const finalOrderData = {
        selectedAddress: orderData.selectedAddress,
        deliveryMethod: orderData.deliveryMethod,
        selectedDate: orderData.selectedDate,
        selectedDeliveryTime: orderData.selectedDeliveryTime,
        selectedPaymentMethod: 'billplz', // Mark as BillPlz payment
        useWalletBalance: useWalletBalance,
        walletBalance: walletBalance,
        totals: orderData.totals,
        storeSettings: orderData.storeSettings,
        deliveryNotes: orderData.deliveryNotes,
        user: orderData.user,
        paymentStatus: 'paid', // Mark as paid
      };

      // Call order placement API
      const result = await placeOrder(finalOrderData);
      console.log('=== ORDER PLACEMENT RESULT ===');
      console.log('Result:', result);

      if (result.success && result.data) {
        // Clear cart data from SQLite storage
        try {
          await clearCart();
          console.log('✅ Cart cleared successfully');
        } catch (error) {
          console.error('❌ Error clearing cart:', error);
        }

        // Show order confirmation toast with order ID for 1 second
        const orderId = result.data?.order_id || result.orderId || 'N/A';
        Toast.show({
          type: 'success',
          text1: 'Order Placed Successfully!',
          text2: `Order ID: ${orderId}`,
          visibilityTime: 1000,
        });

        // Navigate to order confirmation after 1 second (non-returnable)
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'OrderConfirmed',
                params: {
                  orderId: orderId,
                  orderData: finalOrderData,
                  orderResult: result.data,
                  paymentMethod: 'BillPlz',
                },
              },
            ],
          });
        }, 1000);
      } else {
        // Navigate to PaymentFailure screen
        navigation.navigate('PaymentFailure', {
          errorMessage: result.message || result.data?.message || 'Failed to place order. Please try again.',
          orderId: orderData?.order_id,
          amount: orderData?.amount,
        });
      }
    } catch (error) {
      console.error('Error processing BillPlz payment success:', error);
      // Navigate to PaymentFailure screen
      navigation.navigate('PaymentFailure', {
        errorMessage: 'An error occurred while processing your payment. Please contact support.',
        orderId: orderData?.order_id,
        amount: orderData?.amount,
      });
    }
  };

  // Handle BillPlz payment success when returning from WebView
  useFocusEffect(
    React.useCallback(() => {
      const checkBillPlzPaymentSuccess = () => {
        // Check if we have BillPlz payment success data
        const billPlzSuccess = route.params?.billPlzPaymentSuccess;
        const billPlzOrderData = route.params?.orderData;
        const billPlzBillId = route.params?.billId;
        
        if (billPlzSuccess && billPlzOrderData) {
          console.log('✅ BillPlz payment success detected, processing order...');
          handleBillPlzPaymentSuccess(billPlzOrderData);
          
          // Clear the params to prevent re-processing
          navigation.setParams({
            billPlzPaymentSuccess: undefined,
            orderData: undefined,
            billId: undefined
          });
        }
      };
      
      checkBillPlzPaymentSuccess();
    }, [route.params])
  );

  // Calculate remaining amount when wallet balance or useWalletBalance changes
  useEffect(() => {
    const totalAmount = cartTotals.total || 0;
    if (useWalletBalance) {
      const remaining = Math.max(0, totalAmount - walletBalance);
      setRemainingAmount(remaining);
    } else {
      setRemainingAmount(totalAmount);
    }
  }, [useWalletBalance, walletBalance, cartTotals.total]);

  const calculateRemainingAmount = () => {
    return remainingAmount;
  };

  const handleWalletToggle = () => {
    const newWalletState = !useWalletBalance;
    setUseWalletBalance(newWalletState);

    // If wallet is being used and covers full amount, clear payment method
    if (newWalletState) {
      const totalAmount = cartTotals.total || 0;
      if (walletBalance >= totalAmount) {
        setSelectedPaymentMethod('');
      }
    }
  };

  const handlePlaceOrder = async () => {
    // Validate selected date
    if (!selectedDate) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select a delivery date',
        visibilityTime: 3000,
      });
      return;
    }

    // Check if selected date is in the past
    const today = new Date();
    const selectedDateObj = new Date(selectedDate);
    const isToday = today.toDateString() === selectedDateObj.toDateString();
    const isPast = selectedDateObj < today && !isToday;
    
    if (isPast) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Date',
        text2: 'Cannot select past dates for delivery',
        visibilityTime: 3000,
      });
      return;
    }

    // Validate selected time
    if (!selectedDeliveryTime) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select a delivery time',
        visibilityTime: 3000,
      });
      return;
    }

    // Check if selected time slot is disabled (for today's orders)
    if (isToday) {
      const selectedSlot = timeSlots.find(slot => slot.id === selectedDeliveryTime);
      if (selectedSlot && isTimeSlotDisabled(selectedSlot)) {
        Toast.show({
          type: 'error',
          text1: 'Time Slot Unavailable',
          text2: 'The selected time slot is no longer available',
          visibilityTime: 3000,
        });
        return;
      }
    }

    if (remainingAmount > 0 && !selectedPaymentMethod) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select a payment method for the remaining amount',
        visibilityTime: 3000,
      });
      return;
    }

    // Show confirmation modal for all payment methods
    setShowConfirmationModal(true);
  };

  const handleConfirmOrder = async () => {
    // Close the modal
    setShowConfirmationModal(false);

    // Handle BillPlz payment differently
    if (selectedPaymentMethod === 'billplz') {
      handleBillPlzPayment();
      return;
    }

    // Process order without showing alert

    try {
      // Prepare order data
      const orderData = {
        selectedAddress: checkoutData.selectedAddress,
        deliveryMethod: checkoutData.deliveryMethod,
        selectedDate: selectedDate,
        selectedDeliveryTime: selectedDeliveryTime,
        timeSlots: timeSlots,
        selectedPaymentMethod: selectedPaymentMethod,
        useWalletBalance: useWalletBalance,
        walletBalance: walletBalance,
        totals: cartTotals,
        storeSettings: checkoutData.storeSettings,
        deliveryNotes: deliveryNotes,
        user: user,
        cartItems: cartItems,
      };

      // Console log the complete order form data
      console.log('=== ORDER PLACE FORM DATA ===');
      console.log('📋 Complete Order Data:', JSON.stringify(orderData, null, 2));
      console.log('📍 Selected Address:', orderData.selectedAddress);
      console.log('🚚 Delivery Method:', orderData.deliveryMethod);
      console.log('📅 Selected Date:', orderData.selectedDate);
      console.log('⏰ Selected Time:', orderData.selectedDeliveryTime);
      console.log('💳 Payment Method:', orderData.selectedPaymentMethod);
      console.log('💰 Wallet Balance Used:', orderData.useWalletBalance);
      console.log('💵 Wallet Balance Amount:', orderData.walletBalance);
      console.log('🧾 Cart Totals:', orderData.totals);
      console.log('🏪 Store Settings:', orderData.storeSettings);
      console.log('📝 Delivery Notes:', orderData.deliveryNotes);
      console.log('👤 User Data:', orderData.user);
      console.log('🛒 Cart Items Count:', orderData.cartItems?.length || 0);
      console.log('🛒 Cart Items:', orderData.cartItems);
      console.log('================================');

      // Call order placement API
      const result = await placeOrder(orderData);
      console.log('=== FULL API RESPONSE ===');
      console.log('Result:', result);
      console.log('Result Type:', typeof result);
      console.log('Result Keys:', Object.keys(result));
      console.log('Error Value:', result.error);
      console.log('Error Type:', typeof result.error);
      console.log('Message:', result.message);
      console.log('Order ID:', result.order_id);
      console.log('Full Response Data:', result);

      if (result.success && result.data) {
        // Clear cart data from SQLite storage
        try {
          await clearCart();
          console.log('✅ Cart cleared successfully');
        } catch (error) {
          console.error('❌ Error clearing cart:', error);
        }

        // Show order confirmation toast for 1 second
        const orderId = result.data?.order_id || result.orderId || 'N/A';
        Toast.show({
          type: 'success',
          text1: 'Order Placed Successfully!',
          text2: `Order ID: ${orderId}`,
          visibilityTime: 1000,
        });

        // Navigate to order confirmation after 1 second (non-returnable)
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'OrderConfirmed',
                params: {
                  orderId: orderId,
                  orderData: orderData,
                  orderResult: result.data,
                },
              },
            ],
          });
        }, 1000);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Order Failed',
          text2: result.message || result.data?.message || 'Failed to place order. Please try again.',
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An error occurred while placing your order. Please try again.',
        visibilityTime: 3000,
      });
    }
  };

  const handleTestBillPlzAPI = async () => {
    try {
      console.log('=== TESTING BILLPLZ API FROM PAYMENT SCREEN ===');
      const result = await testBillPlzAPI();
      console.log('Test result:', result);
      Toast.show({
        type: 'success',
        text1: 'Test Complete',
        text2: 'Check console for detailed results',
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error('Test failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Test Failed',
        text2: 'Check console for error details',
        visibilityTime: 2000,
      });
    }
  };

  // Check if a time slot should be disabled based on current time
  const isTimeSlotDisabled = (timeSlot) => {
    // Only apply restrictions if today is selected
    if (!selectedDate) return false;
    
    const today = new Date();
    const selectedDateObj = new Date(selectedDate);
    
    // Check if selected date is today
    const isToday = today.toDateString() === selectedDateObj.toDateString();
    
    if (!isToday) return false;
    
    const currentTime = today.getHours() * 100 + today.getMinutes(); // Convert to HHMM format
    
    // Get time slot start time
    const fromTime = timeSlot.from_time || timeSlot.start_time;
    if (!fromTime) return false;
    
    // Parse time slot start time (format: "14:00:00" or "08:00:00")
    const [hours, minutes] = fromTime.split(':').map(Number);
    const timeSlotStart = hours * 100 + minutes;
    
    // Apply restrictions:
    // 1. If current time is 2pm (14:00) or later, disable 8am slot (08:00)
    // 2. If current time is 8am (08:00) or later, disable 8am slot (08:00)
    // 3. If current time is past the time slot start time, disable that slot
    
    // Disable 8am slot if current time is 8am or later
    if (timeSlotStart === 800 && currentTime >= 800) {
      return true;
    }
    
    // Disable any time slot if current time is past its start time
    if (currentTime >= timeSlotStart) {
      return true;
    }
    
    return false;
  };

  // Effect to clear selected time slot if it becomes disabled
  useEffect(() => {
    if (selectedDeliveryTime && selectedDate) {
      const selectedSlot = timeSlots.find(slot => slot.id === selectedDeliveryTime);
      if (selectedSlot && isTimeSlotDisabled(selectedSlot)) {
        setSelectedDeliveryTime('');
        Toast.show({
          type: 'info',
          text1: 'Time Slot Unavailable',
          text2: 'The selected time slot is no longer available for today',
          visibilityTime: 3000,
        });
      }
    }
  }, [selectedDate, selectedDeliveryTime, timeSlots]);

  const handleDateSelect = date => {
    // Check if the selected date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
    const selectedDateOnly = new Date(date);
    selectedDateOnly.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
    
    if (selectedDateOnly < today) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Date',
        text2: 'Cannot select past dates for delivery',
        visibilityTime: 3000,
      });
      return;
    }
    
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    setSelectedDate(formattedDate);
    setShowCalendar(false);
  };

  const getCurrentMonthDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const days = [];

    // Add empty days for padding
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: '', disabled: true });
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const isToday = i === today.getDate();
      const isPast = date < today;
      days.push({
        day: i,
        date: date,
        isToday,
        disabled: isPast,
      });
    }

    return days;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#EF3340" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={1}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={styles.progressContent}>
            <Image
              source={require('../Assets/Images/red.png')}
              style={styles.progressIcon}
            />
            <Text style={styles.progressText}>Delivery</Text>
          </View>
        </View>
        <View style={styles.progressArrow}></View>
        <View style={styles.progressStep}>
          <View style={styles.progressContent}>
            <Image
              source={require('../Assets/Images/green.png')}
              style={styles.progressIcon}
            />
            <Text style={[styles.progressText, styles.activeProgressText]}>
              Payment
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Wallet Balance */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderContent}>
              <Icon name="wallet-outline" size={24} color="#666" />
              <Text style={styles.cardTitle}>Wallet Balance</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.checkbox,
                useWalletBalance && styles.checkboxSelected,
              ]}
              onPress={handleWalletToggle}
              activeOpacity={1}
            >
              {useWalletBalance && (
                <Icon name="checkmark" size={16} color="white" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.walletBalance}>
            Total Balance: RM{walletBalance.toFixed(2)}
          </Text>
          {useWalletBalance && (
            <View style={styles.walletUsageContainer}>
              <Text style={styles.walletUsageText}>
                Wallet Used: RM
                {Math.min(
                  walletBalance,
                  cartTotals.total || 0,
                ).toFixed(2)}
              </Text>
              <Text style={styles.remainingAmountText}>
                Remaining Amount: RM{remainingAmount.toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {/* Delivery Options */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardHeader}
            onPress={() => setShowCalendar(true)}
            activeOpacity={1}
          >
            <Text style={styles.cardTitle}>Select Delivery Day</Text>
            <Icon name="calendar-outline" size={20} color="#EF3340" />
          </TouchableOpacity>

          {selectedDate && (
            <View style={styles.selectedDateContainer}>
              <Text style={styles.selectedDateText}>
                Selected: {selectedDate}
              </Text>
            </View>
          )}

          {/* Notes Section */}
          <Text style={styles.notesLabel}>
            Notes (Instruction for delivery)
          </Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Enter delivery instructions..."
            value={deliveryNotes}
            onChangeText={setDeliveryNotes}
            multiline
            numberOfLines={3}
          />

          {/* Time Slots - Moved to bottom */}
          <Text style={styles.cardTitle}>Delivery Time Slot</Text>
          {timeSlots.map(timeSlot => {
            const isDisabled = isTimeSlotDisabled(timeSlot);
            return (
              <TouchableOpacity
                key={timeSlot.id}
                style={[
                  styles.radioOption,
                  isDisabled && styles.disabledOption
                ]}
                onPress={() => !isDisabled && setSelectedDeliveryTime(timeSlot.id)}
                disabled={isDisabled}
              >
                <View style={[
                  styles.radioButton,
                  isDisabled && styles.disabledRadioButton
                ]}>
                  {selectedDeliveryTime === timeSlot.id && !isDisabled && (
                    <View style={styles.radioDot} />
                  )}
                </View>
                <Text style={[
                  styles.radioText,
                  isDisabled && styles.disabledText
                ]}>
                  {timeSlot.title}
                  {isDisabled && ' (Not Available)'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Payment Methods */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Method</Text>
          {remainingAmount > 0 && (
            <Text style={styles.remainingAmountLabel}>
              Select payment method for remaining amount: RM
              {remainingAmount.toFixed(2)}
            </Text>
          )}
          {remainingAmount === 0 && (
            <Text style={styles.noPaymentNeededLabel}>
              No payment method needed - Wallet covers full amount
            </Text>
          )}
          {remainingAmount > 0 &&
            paymentMethods.map(method => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentOption,
                  selectedPaymentMethod === method.id &&
                    styles.selectedPaymentOption,
                ]}
                onPress={() => handlePaymentMethodSelect(method.id)}
                activeOpacity={1}
              >
                <View style={styles.paymentOptionContent}>
                  <View style={styles.radioContainer}>
                    <View style={styles.radioButton}>
                      {selectedPaymentMethod === method.id && (
                        <View style={styles.radioButtonSelected} />
                      )}
                    </View>
                  </View>
                  <Icon name={method.icon} size={24} color="#666" />
                  <Text style={styles.paymentOptionText}>{method.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
        </View>

        {/* Test BillPlz API Button */}
       
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomBar}>
        <View style={styles.totalSection}>
          <Icon name="information-circle-outline" size={20} color="#666" />
          <Text style={styles.totalText}>
            Total : RM
            {useWalletBalance
              ? remainingAmount.toFixed(2)
              : cartTotals.total?.toFixed(2) || '0.00'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.placeOrderButton}
          onPress={handlePlaceOrder}
          activeOpacity={1}
        >
          <Text style={styles.placeOrderButtonText}>PROCEED</Text>
          <Icon name="chevron-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Calendar Modal */}
      {showCalendar && (
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModal}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>Select Delivery Date</Text>
              <TouchableOpacity
                onPress={() => setShowCalendar(false)}
                style={styles.closeButton}
                activeOpacity={1}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarBody}>
              <View style={styles.calendarDaysHeader}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <Text key={day} style={styles.calendarDayHeader}>
                    {day}
                  </Text>
                ))}
              </View>

              <View style={styles.calendarGrid}>
                {getCurrentMonthDays().map((dayObj, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.calendarDay,
                      dayObj.disabled && styles.calendarDayDisabled,
                      dayObj.isToday && styles.calendarDayToday,
                    ]}
                    onPress={() =>
                      !dayObj.disabled &&
                      dayObj.date &&
                      handleDateSelect(dayObj.date)
                    }
                    disabled={dayObj.disabled}
                    activeOpacity={1}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        dayObj.disabled && styles.calendarDayTextDisabled,
                        dayObj.isToday && styles.calendarDayTextToday,
                      ]}
                    >
                      {dayObj.day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Order Confirmation Modal */}
      {showConfirmationModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <View style={styles.confirmationHeader}>
              <Text style={styles.confirmationTitle}>Confirm Order</Text>
              <View style={styles.confirmationDivider} />
            </View>

            <View style={styles.confirmationContent}>
              <View style={styles.paymentMethodRow}>
                <Text style={styles.paymentMethodLabel}>Payment Method:</Text>
                <Text style={styles.paymentMethodValue}>
                  {selectedPaymentMethod === 'cod'
                    ? 'CASH ON DELIVERY'
                    : 'BILL PLZ'}
                </Text>
              </View>

              <View style={styles.orderSummaryRow}>
                <Text style={styles.summaryLabel}>Items Amount</Text>
                <Text style={styles.summaryValue}>
                  RM{cartTotals.taxable_amount?.toFixed(2) || cartTotals.subtotal?.toFixed(2) || '0.00'}
                </Text>
              </View>

              <View style={styles.orderSummaryRow}>
                <Text style={styles.summaryLabel}>Delivery Charge</Text>
                <Text style={styles.summaryValue}>
                  RM{cartTotals.deliveryCharge?.toFixed(2) || '0.00'}
                </Text>
              </View>

              <View style={styles.orderSummaryRow}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryValue}>
                  + RM{cartTotals.tax?.toFixed(2) || '0.00'}
                </Text>
              </View>

              <View style={styles.orderSummaryRow}>
                <Text style={styles.summaryLabel}>Total</Text>
                <Text style={styles.summaryValue}>
                  RM{cartTotals.total?.toFixed(2) || '0.00'}
                </Text>
              </View>

              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Grand Total :</Text>
                <Text style={styles.grandTotalValue}>
                  RM{cartTotals.total?.toFixed(2) || '0.00'}
                </Text>
              </View>
            </View>

            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowConfirmationModal(false)}
                activeOpacity={1}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmOrder}
                activeOpacity={1}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#EF3340',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  progressContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  activeDot: {
    backgroundColor: '#EF3340',
  },
  progressNumber: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  activeProgressText: {
    color: '#EF3340',
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
  },
  progressArrow: {
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
    padding: 16,
    removeClippedSubviews: false,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF3340',
    marginBottom: 12,
    fontFamily: 'Montserrat',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletBalance: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Montserrat',
  },
  walletUsageContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  walletUsageText: {
    fontSize: 12,
    color: '#28a745',
    fontFamily: 'Montserrat',
    fontWeight: '500',
  },
  remainingAmountText: {
    fontSize: 12,
    color: '#EF3340',
    fontFamily: 'Montserrat',
    fontWeight: '500',
    marginTop: 2,
  },
  remainingAmountLabel: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  noPaymentNeededLabel: {
    fontSize: 12,
    color: '#28a745',
    fontFamily: 'Montserrat',
    marginBottom: 8,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#EF3340',
    borderColor: '#EF3340',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF3340',
  },
  radioText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Montserrat',
  },
  disabledOption: {
    opacity: 0.5,
  },
  disabledRadioButton: {
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  disabledText: {
    color: '#999',
  },
  notesLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
    marginBottom: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Montserrat',
    marginBottom: 16,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  selectedDateContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  selectedDateText: {
    fontSize: 14,
    color: '#EF3340',
    fontFamily: 'Montserrat',
    fontWeight: '500',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  calendarModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 350,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat',
  },
  closeButton: {
    padding: 4,
  },
  calendarBody: {
    alignItems: 'center',
  },
  calendarDaysHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  calendarDayHeader: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  calendarDay: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 20,
  },
  calendarDayDisabled: {
    opacity: 0.3,
  },
  calendarDayToday: {
    backgroundColor: '#EF3340',
  },
  calendarDayText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Montserrat',
  },
  calendarDayTextDisabled: {
    color: '#ccc',
  },
  calendarDayTextToday: {
    color: 'white',
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
  },
  discountValue: {
    color: '#28a745',
    fontFamily: 'Montserrat',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF3340',
    fontFamily: 'Montserrat',
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'Montserrat',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'Montserrat',
  },
  deliveryText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Montserrat',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedPaymentOption: {
    borderColor: '#EF3340',
    backgroundColor: '#fff5f5',
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioContainer: {
    marginRight: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF3340',
  },
  paymentOptionText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Montserrat',
  },
  bottomBar: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat',
  },
  placeOrderButton: {
    backgroundColor: '#EF3340',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    gap: 8,
  },
  placeOrderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
  },
  // Confirmation Modal Styles
  confirmationModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmationHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF3340',
    fontFamily: 'Montserrat',
    marginBottom: 8,
  },
  confirmationDivider: {
    height: 1,
    backgroundColor: '#ddd',
    width: '100%',
  },
  confirmationContent: {
    marginBottom: 20,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 12,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  paymentMethodLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  paymentMethodValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#EF3340',
    fontFamily: 'Montserrat',
  },
  orderSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Montserrat',
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Montserrat',
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#EF3340',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
  },
  testButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
  },
});

export default PaymentScreen;
