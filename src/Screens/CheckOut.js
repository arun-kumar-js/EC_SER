import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validatePromoCode } from '../Fuctions/PromoCodeService';
import { getDeliveryMethods } from '../Fuctions/DeliveryMethodService';
import { fetchCartItems } from '../Fuctions/CartService';
import { getStoreSettings } from '../Fuctions/StoreSettingsService';

const CheckOutScreen = ({ route }) => {
  const navigation = useNavigation();
  const [promoCode, setPromoCode] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('IN PERSON DELIVERY');
  const [showDeliveryOptions, setShowDeliveryOptions] = useState(false);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [user, setUser] = useState(null);
  const [deliveryMethods, setDeliveryMethods] = useState({});
  const [availableDeliveryOptions, setAvailableDeliveryOptions] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [storeSettings, setStoreSettings] = useState({
    tax: 0,
    delivery_charge: 0,
    currency: '₹',
    currency_symbol: '₹',
    min_order_amount: 0,
    free_delivery_amount: 0,
    app_name: 'EC Services',
    support_number: '',
    support_email: '',
    whatsapp_number: '',
    gst_no: '',
    address: '',
    system_timezone: 'Asia/Kuala_Lumpur',
    is_refer_earn_on: false,
    refer_earn_bonus: 0,
    refer_earn_method: 'percentage',
    max_refer_earn_amount: 0,
    min_refer_earn_order_amount: 0
  });

  // Get selected address from route params
  const selectedAddress = route.params?.selectedAddress 

  const getItemPrice = item => {
    // Try different possible price fields
    let priceStr = item.price || 
      item.product_price ||
      (item.product_variants && item.product_variants[0]?.product_price) ||
      (item.variants && item.variants[0]?.product_price) ||
      '0';
    
    // Remove common currency symbols
    priceStr = priceStr.toString().replace(/[₹$€£¥RM]/g, '').trim();
    
    return parseFloat(priceStr) || 0;
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = getItemPrice(item);
      return sum + price * (item.quantity || 1);
    }, 0);
    
    console.log('=== CALCULATE TOTALS DEBUG ===');
    console.log('Current storeSettings:', storeSettings);
    console.log('Subtotal:', subtotal);
    
    // Use dynamic store settings for calculations
    const baseDeliveryCharge = storeSettings.delivery_charge || 0;
    const freeDeliveryThreshold = storeSettings.free_delivery_amount || 0;
    
    console.log('Base delivery charge:', baseDeliveryCharge);
    console.log('Free delivery threshold:', freeDeliveryThreshold);
    
    // Check if order qualifies for free delivery
    const deliveryCharge = (subtotal >= freeDeliveryThreshold && freeDeliveryThreshold > 0) 
      ? 0 
      : baseDeliveryCharge;
    
    const taxPercentage = parseFloat(storeSettings.tax) / 100; // Convert percentage to decimal
    const tax = subtotal * taxPercentage;
    const taxableAmount = subtotal + tax;
    const total = taxableAmount + deliveryCharge - promoDiscount;

    console.log('Tax percentage:', taxPercentage);
    console.log('Tax amount:', tax);
    console.log('Delivery charge:', deliveryCharge);
    console.log('Total:', total);

    return {
      taxableAmount,
      tax,
      subtotal,
      deliveryCharge,
      total,
      promoDiscount,
    };
  };

  const totals = calculateTotals();

  // Force re-render when store settings change
  const [forceUpdate, setForceUpdate] = useState(0);
  
  useEffect(() => {
    console.log('Store settings changed, forcing update');
    setForceUpdate(prev => prev + 1);
  }, [storeSettings]);

  

  // Load user data and delivery methods on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load user data
        const storedUser = await AsyncStorage.getItem('userData');
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          setUser(userObj);
        }

        // Load cart items
        const cartData = await fetchCartItems();
        console.log('=== CART DATA DEBUG ===');
        console.log('Cart Items:', cartData);
        if (cartData && cartData.length > 0) {
          console.log('First item structure:', cartData[0]);
          console.log('First item keys:', Object.keys(cartData[0]));
        }
        setCartItems(cartData);

        // Load store settings
        const settingsResult = await getStoreSettings();
        console.log('=== STORE SETTINGS DEBUG ===');
        console.log('Settings Result:', settingsResult);
        if (settingsResult.success && settingsResult.data) {
          const settings = settingsResult.data;
          console.log('Raw Settings:', settings);
          const newSettings = {
            tax: parseFloat(settings.tax) || 0,
            delivery_charge: parseFloat(settings.delivery_charge) || 0,
            currency: settings.currency || '₹',
            currency_symbol: settings.currency || '₹',
            min_order_amount: parseFloat(settings.min_amount) || 0,
            free_delivery_amount: parseFloat(settings.free_delivery_amount) || 0,
            app_name: settings.app_name || 'EC Services',
            support_number: settings.support_number || '',
            support_email: settings.support_email || '',
            whatsapp_number: settings.whatsapp_number || '',
            gst_no: settings.gst_no || '',
            address: settings.address || '',
            system_timezone: settings.system_timezone || 'Asia/Kuala_Lumpur',
            is_refer_earn_on: settings['is-refer-earn-on'] === '1',
            refer_earn_bonus: parseFloat(settings['refer-earn-bonus']) || 0,
            refer_earn_method: settings['refer-earn-method'] || 'percentage',
            max_refer_earn_amount: parseFloat(settings['max-refer-earn-amount']) || 0,
            min_refer_earn_order_amount: parseFloat(settings['min-refer-earn-order-amount']) || 0
          };
          console.log('✅ Processed Store Settings:', newSettings);
          setStoreSettings(newSettings);
        } else {
          console.log('❌ Failed to load store settings, using fallback values');
          // Use fallback values when API fails
          setStoreSettings({
            tax: 8, // 8% tax as per your API response
            delivery_charge: 5, // 5 delivery charge as per your API response
            currency: '₹',
            currency_symbol: '₹',
            min_order_amount: 100,
            free_delivery_amount: 0,
            app_name: 'EC Services',
            support_number: '+6013-2439343',
            support_email: 'rrk@ecservices.com.my',
            whatsapp_number: '+60 13-2439343',
            gst_no: 'IG27061622050',
            address: 'NO.3,JALAN INAI 5,SEK BB3,BANDAR BUKIT BERUTUNG ,48300 RAWANG,',
            system_timezone: 'Asia/Kuala_Lumpur',
            is_refer_earn_on: true,
            refer_earn_bonus: 5,
            refer_earn_method: 'percentage',
            max_refer_earn_amount: 110,
            min_refer_earn_order_amount: 100
          });
        }

        // Load delivery methods
        const deliveryResult = await getDeliveryMethods();
        if (deliveryResult.success && deliveryResult.data) {
          setDeliveryMethods(deliveryResult.data);

          // Create available delivery options based on API response
          const availableOptions = [];

          if (deliveryResult.data.in_persion_delivery === '1') {
            availableOptions.push({
              id: 'in_person',
              name: 'IN PERSON DELIVERY',
              price: 0,
            });
          }

          if (deliveryResult.data.Delivery_by_courier === '1') {
            availableOptions.push({
              id: 'courier',
              name: 'DELIVERY BY COURIER',
              price: 0,
            });
          }

          if (deliveryResult.data.storepickup === '1') {
            availableOptions.push({
              id: 'store_pickup',
              name: 'STORE PICKUP',
              price: 0,
            });
          }

          if (deliveryResult.data.dunzo === '1') {
            availableOptions.push({
              id: 'dunzo',
              name: 'DUNZO DELIVERY',
              price: 0,
            });
          }

          setAvailableDeliveryOptions(availableOptions);

          // Set default delivery method if in_persion_delivery is available
          if (deliveryResult.data.in_persion_delivery === '1') {
            setDeliveryMethod('IN PERSON DELIVERY');
          } else if (availableOptions.length > 0) {
            // If in_persion_delivery is not available, set the first available option
            setDeliveryMethod(availableOptions[0].name);
          }
        } else {
          console.log('❌ Failed to load delivery methods, using fallback');
          // Use fallback delivery methods
          const fallbackMethods = {
            in_persion_delivery: '1',
            Delivery_by_courier: '0',
            storepickup: '0',
            dunzo: '0'
          };
          setDeliveryMethods(fallbackMethods);
          setAvailableDeliveryOptions([{
            id: 'in_person',
            name: 'IN PERSON DELIVERY',
            price: 0,
          }]);
          setDeliveryMethod('IN PERSON DELIVERY');
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Error', 'Please enter a promo code');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    const currentTotal = calculateTotals().subtotal;
    const userId = user.user_id || user.id;

    try {
      const result = await validatePromoCode(
        promoCode.trim(),
        currentTotal,
        userId,
      );

      if (result.success) {
        setPromoApplied(true);
        setPromoDiscount(result.discount);
        setPromoMessage(result.message);
        Alert.alert('Success', result.message);
      } else {
        setPromoApplied(false);
        setPromoDiscount(0);
        setPromoMessage(result.message);
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
      Alert.alert('Error', 'Failed to apply promo code');
    }
  };

  const handleConfirm = () => {
    // Validate required fields
    if (!deliveryMethod) {
      Alert.alert('Error', 'Please select a delivery method');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    // Prepare checkout data to pass to next page
    const checkoutData = {
      selectedAddress,
      cartItems,
      totals: calculateTotals(),
      deliveryMethod,
      promoCode,
      promoApplied,
      promoDiscount,
      storeSettings,
      user,
    };

    console.log('=== CHECKOUT DATA ===');
    console.log('Selected Address:', selectedAddress);
    console.log('Cart Items:', cartItems);
    console.log('Totals:', checkoutData.totals);
    console.log('Delivery Method:', deliveryMethod);
    console.log('Promo Code:', promoCode);
    console.log('Store Settings:', storeSettings);

    // Navigate to payment page with all checkout data
    navigation.navigate('Payment', checkoutData);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#EF3340" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={1}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
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
            <Text style={[styles.progressText, styles.activeProgressText]}>
              Delivery
            </Text>
          </View>
        </View>
        <View style={styles.progressArrow}></View>
        <View style={styles.progressStep}>
          <View style={styles.progressContent}>
            <Image
              source={require('../Assets/Images/ash.png')}
              style={styles.progressIcon}
            />
            <Text style={styles.progressText}>Payment</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
      >
        {/* Delivery Address Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Delivery Address</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AddressPage')}
              activeOpacity={1}
            >
              <Icon name="create-outline" size={20} color="#EF3340" />
            </TouchableOpacity>
          </View>
          <View style={styles.addressContent}>
            <Text style={styles.addressName}>{selectedAddress.name}</Text>
            <Text style={styles.addressText}>{selectedAddress.address}</Text>
            <Text style={styles.addressText}>
              Mobile: {selectedAddress.mobile}
            </Text>
            <Text style={styles.addressText}>
              Email: {selectedAddress.email}
            </Text>
          </View>
        </View>

        {/* Promo Code Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Have a Promo Code?</Text>
            <TouchableOpacity activeOpacity={1}>
              <Icon name="refresh-outline" size={20} color="#EF3340" />
            </TouchableOpacity>
          </View>
          <View style={styles.promoContainer}>
            <TextInput
              style={styles.promoInput}
              placeholder="Promo Code"
              placeholderTextColor="#999"
              value={promoCode}
              onChangeText={setPromoCode}
            />
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApplyPromoCode}
              activeOpacity={1}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
          {promoApplied && promoMessage && (
            <Text style={styles.promoMessage}>{promoMessage}</Text>
          )}
        </View>

        {/* Delivery Method Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Method</Text>
          <TouchableOpacity
            style={styles.deliverySelector}
            onPress={() => setShowDeliveryOptions(!showDeliveryOptions)}
            activeOpacity={1}
          >
            <Text
              style={
                deliveryMethod ? styles.deliveryText : styles.placeholderText
              }
            >
              {deliveryMethod || 'Select Delivery Method'}
            </Text>
            <Icon name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          {showDeliveryOptions && (
            <View style={styles.deliveryOptions}>
              {availableDeliveryOptions.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.deliveryOption}
                  onPress={() => {
                    setDeliveryMethod(option.name);
                    setShowDeliveryOptions(false);
                  }}
                  activeOpacity={1}
                >
                  <Text style={styles.deliveryOptionText}>{option.name}</Text>
                  <Text style={styles.deliveryOptionPrice}>
                    {option.price > 0 ? `${storeSettings.currency_symbol} ${option.price}` : 'FREE'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Order Summary Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Product Name</Text>
            <Text style={styles.tableHeaderText}>Qty</Text>
            <Text style={styles.tableHeaderText}>Price</Text>
            <Text style={styles.tableHeaderText}>Subtotal</Text>
          </View>

          {/* Table Rows */}
          {cartItems.map(item => (
            <View key={item.id || item.product_id} style={styles.tableRow}>
              <Text style={styles.tableCell}>
                {item.name || item.product_name}
              </Text>
              <Text style={styles.tableCell}>{item.quantity || 1}</Text>
              <Text style={styles.tableCell}>
                {storeSettings.currency_symbol} {getItemPrice(item).toFixed(2)}
              </Text>
              <Text style={styles.tableCell}>
                {storeSettings.currency_symbol} {(getItemPrice(item) * (item.quantity || 1)).toFixed(2)}
              </Text>
            </View>
          ))}

          {/* Summary Breakdown */}
          <View style={styles.summaryBreakdown}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {storeSettings.currency_symbol} {totals.subtotal.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Tax ({storeSettings.tax}%)
              </Text>
              <Text style={styles.summaryValue}>
                + {storeSettings.currency_symbol} {totals.tax.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxable Amount</Text>
              <Text style={styles.summaryValue}>
                {storeSettings.currency_symbol} {totals.taxableAmount.toFixed(2)}
              </Text>
            </View>
            {promoApplied && promoDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Promo Discount</Text>
                <Text style={[styles.summaryValue, styles.discountValue]}>
                  - {storeSettings.currency_symbol} {promoDiscount.toFixed(2)}
                </Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Charge</Text>
              <Text style={styles.summaryValue}>
                {storeSettings.currency_symbol} {totals.deliveryCharge.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomBar}>
        <View style={styles.totalSection}>
          <Icon name="information-circle-outline" size={20} color="#666" />
          <Text style={styles.totalText}>
            Total : {storeSettings.currency_symbol} {totals.total.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
          activeOpacity={1}
        >
          <Text style={styles.confirmButtonText}>Confirm</Text>
          <Icon name="chevron-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
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
  progressIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  progressText: {
    fontSize: 18,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  activeProgressText: {
    color: '#EF3340',
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  progressArrow: {
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
    padding: 16,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF3340',
    fontFamily: 'Montserrat',
  },
  addressContent: {
    gap: 4,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontFamily: 'Montserrat',
  },
  promoContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Montserrat',
  },
  applyButton: {
    backgroundColor: '#EF3340',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
  },
  promoMessage: {
    fontSize: 12,
    color: '#28a745',
    marginTop: 8,
    fontStyle: 'italic',
    fontFamily: 'Montserrat',
  },
  deliverySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  deliveryText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Montserrat',
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Montserrat',
  },
  deliveryOptions: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
  },
  deliveryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  deliveryOptionText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Montserrat',
  },
  deliveryOptionPrice: {
    fontSize: 14,
    color: '#EF3340',
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    paddingVertical: 8,
    marginBottom: 8,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Montserrat',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Montserrat',
  },
  summaryBreakdown: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
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
  confirmButton: {
    backgroundColor: '#EF3340',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    gap: 8,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
  },
});

export default CheckOutScreen;