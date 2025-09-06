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
import { clearCart } from '../Fuctions/CartService';
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

  // Get checkout data from route params
  const checkoutData = route.params || {};

  const deliveryDays = [];

  // Load time slots and wallet balance on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
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
        totals: checkoutData.totals,
        deliveryMethod: checkoutData.deliveryMethod,
        selectedDate: selectedDate,
        selectedDeliveryTime: selectedDeliveryTime,
        deliveryNotes: deliveryNotes,
        storeSettings: checkoutData.storeSettings,
      };

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

        // Show order confirmation toast with order ID
        const orderId = result.data?.order_id || result.orderId || 'N/A';
        Toast.show({
          type: 'success',
          text1: 'Order Placed Successfully!',
          text2: `Order ID: ${orderId}`,
          visibilityTime: 1000,
        });

        // Navigate to order confirmation after 1 second
        setTimeout(() => {
          navigation.replace('OrderConfirmed', {
            orderId: orderId,
            orderData: finalOrderData,
            orderResult: result.data,
            paymentMethod: 'BillPlz',
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
    const totalAmount = checkoutData.totals?.total || 0;
    if (useWalletBalance) {
      const remaining = Math.max(0, totalAmount - walletBalance);
      setRemainingAmount(remaining);
    } else {
      setRemainingAmount(totalAmount);
    }
  }, [useWalletBalance, walletBalance, checkoutData.totals?.total]);

  const calculateRemainingAmount = () => {
    return remainingAmount;
  };

  const handleWalletToggle = () => {
    const newWalletState = !useWalletBalance;
    setUseWalletBalance(newWalletState);

    // If wallet is being used and covers full amount, clear payment method
    if (newWalletState) {
      const totalAmount = checkoutData.totals?.total || 0;
      if (walletBalance >= totalAmount) {
        setSelectedPaymentMethod('');
      }
    }
  };

  const handlePlaceOrder = async () => {
    if (remainingAmount > 0 && !selectedPaymentMethod) {
      Alert.alert(
        'Error',
        'Please select a payment method for the remaining amount',
      );
      return;
    }

    if (!selectedDeliveryTime) {
      Alert.alert('Error', 'Please select a delivery time');
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

    // Show loading indicator for COD payments
    Alert.alert(
      'Processing Order',
      'Please wait while we process your order...',
      [],
      { cancelable: false },
    );

    try {
      // Prepare order data
      const orderData = {
        selectedAddress: checkoutData.selectedAddress,
        deliveryMethod: checkoutData.deliveryMethod,
        selectedDate: selectedDate,
        selectedDeliveryTime: selectedDeliveryTime,
        selectedPaymentMethod: selectedPaymentMethod,
        useWalletBalance: useWalletBalance,
        walletBalance: walletBalance,
        totals: checkoutData.totals,
        storeSettings: checkoutData.storeSettings,
        deliveryNotes: deliveryNotes,
        user: user,
      };

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

        // Navigate directly to order confirmation with result data (replace current screen)
        navigation.replace('OrderConfirmed', {
          orderId: result.data?.order_id || result.orderId || 'N/A',
          orderData: orderData,
          orderResult: result.data,
        });
      } else {
        Alert.alert(
          'Order Failed',
          result.message ||
            result.data?.message ||
            'Failed to place order. Please try again.',
          [{ text: 'OK' }],
        );
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert(
        'Error',
        'An error occurred while placing your order. Please try again.',
        [{ text: 'OK' }],
      );
    }
  };

  const handleTestBillPlzAPI = async () => {
    try {
      console.log('=== TESTING BILLPLZ API FROM PAYMENT SCREEN ===');
      const result = await testBillPlzAPI();
      console.log('Test result:', result);
      Alert.alert('Test Complete', 'Check console for detailed results');
    } catch (error) {
      console.error('Test failed:', error);
      Alert.alert('Test Failed', 'Check console for error details');
    }
  };

  const handleDateSelect = date => {
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
            Total Balance: ₹{walletBalance.toFixed(2)}
          </Text>
          {useWalletBalance && (
            <View style={styles.walletUsageContainer}>
              <Text style={styles.walletUsageText}>
                Wallet Used: ₹
                {Math.min(
                  walletBalance,
                  checkoutData.totals?.total || 0,
                ).toFixed(2)}
              </Text>
              <Text style={styles.remainingAmountText}>
                Remaining Amount: ₹{remainingAmount.toFixed(2)}
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
          {timeSlots.map(timeSlot => (
            <TouchableOpacity
              key={timeSlot.id}
              style={styles.radioOption}
              onPress={() => setSelectedDeliveryTime(timeSlot.id)}
            >
              <View style={styles.radioButton}>
                {selectedDeliveryTime === timeSlot.id && (
                  <View style={styles.radioDot} />
                )}
              </View>
              <Text style={styles.radioText}>{timeSlot.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Methods */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Method</Text>
          {remainingAmount > 0 && (
            <Text style={styles.remainingAmountLabel}>
              Select payment method for remaining amount: ₹
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
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestBillPlzAPI}
            activeOpacity={1}
          >
            <Text style={styles.testButtonText}>Test BillPlz API</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomBar}>
        <View style={styles.totalSection}>
          <Icon name="information-circle-outline" size={20} color="#666" />
          <Text style={styles.totalText}>
            Total : ₹
            {useWalletBalance
              ? remainingAmount.toFixed(2)
              : checkoutData.totals?.total?.toFixed(2) || '0.00'}
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
                  ₹
                  {checkoutData.totals?.taxable_amount?.toFixed(2) ||
                    (checkoutData.totals?.subtotal && checkoutData.totals?.tax
                      ? (
                          checkoutData.totals.subtotal - checkoutData.totals.tax
                        ).toFixed(2)
                      : checkoutData.totals?.subtotal?.toFixed(2)) ||
                    '0.00'}
                </Text>
              </View>

              <View style={styles.orderSummaryRow}>
                <Text style={styles.summaryLabel}>Delivery Charge</Text>
                <Text style={styles.summaryValue}>
                  ₹{checkoutData.totals?.deliveryCharge?.toFixed(2) || '0.00'}
                </Text>
              </View>

              <View style={styles.orderSummaryRow}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryValue}>
                  + ₹{checkoutData.totals?.tax?.toFixed(2) || '0.00'}
                </Text>
              </View>

              <View style={styles.orderSummaryRow}>
                <Text style={styles.summaryLabel}>Total</Text>
                <Text style={styles.summaryValue}>
                  ₹{checkoutData.totals?.total?.toFixed(2) || '0.00'}
                </Text>
              </View>

              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Grand Total :</Text>
                <Text style={styles.grandTotalValue}>
                  ₹{checkoutData.totals?.total?.toFixed(2) || '0.00'}
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
  summaryLabel: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Montserrat',
  },
  summaryValue: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Montserrat',
    textAlign: 'right',
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
