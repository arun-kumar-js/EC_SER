import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { clearCart } from '../Fuctions/CartService';
import { placeOrder } from '../Fuctions/OrderService';

const OrderConfirmed = ({ route, navigation }) => {
  const { orderId, orderData, orderResult, paymentMethod, paymentSuccess } =
    route.params || {};

  // Handle BillPlz payment success
  useEffect(() => {
    const handleBillPlzPaymentSuccess = async () => {
      if (paymentSuccess && paymentMethod === 'BillPlz' && orderData) {
        try {
          console.log('=== PROCESSING BILLPLZ PAYMENT SUCCESS ===');

          // Show loading indicator
          Alert.alert(
            'Processing Order',
            'Please wait while we process your order...',
            [],
            { cancelable: false },
          );

          // Create the actual order in your system
          const finalOrderData = {
            selectedAddress: orderData.selectedAddress,
            deliveryMethod: orderData.deliveryMethod,
            selectedDate: orderData.selectedDate,
            selectedDeliveryTime: orderData.selectedDeliveryTime,
            selectedPaymentMethod: 'billplz',
            useWalletBalance: orderData.useWalletBalance || false,
            walletBalance: orderData.walletBalance || 0,
            totals: orderData.totals,
            storeSettings: orderData.storeSettings,
            deliveryNotes: orderData.deliveryNotes,
            user: orderData.user,
            paymentStatus: 'paid',
          };

          // Call order placement API
          const result = await placeOrder(finalOrderData);
          console.log('=== ORDER PLACEMENT RESULT ===');
          console.log('Result:', result);

          if (
            result.data &&
            (result.data.error === false || result.data.error === 'false')
          ) {
            // Clear cart data from SQLite storage
            try {
              await clearCart();
              console.log('✅ Cart cleared successfully');
            } catch (error) {
              console.error('❌ Error clearing cart:', error);
            }

            // Update the route params with the actual order result
            route.params.orderId = result.data?.order_id || 'N/A';
            route.params.orderResult = result.data;
          } else {
            Alert.alert(
              'Order Failed',
              result.data?.message ||
                result.message ||
                'Failed to place order. Please try again.',
              [{ text: 'OK' }],
            );
          }
        } catch (error) {
          console.error('Error processing BillPlz payment success:', error);
          Alert.alert(
            'Error',
            'An error occurred while processing your payment. Please contact support.',
            [{ text: 'OK' }],
          );
        }
      }
    };

    handleBillPlzPaymentSuccess();
  }, [paymentSuccess, paymentMethod, orderData]);

  const handleContinueShopping = () => {
    navigation.navigate('MainDrawer');
  };

  const handleViewOrderDetails = () => {
    // Navigate to my orders screen
    navigation.navigate('MyOrders');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          
        >
          
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order placed</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Content */}
        <View style={styles.mainContent}>
          <Text style={styles.title}>Order Placed!</Text>
          <Text style={styles.subtitle}>
            Your order has been successfully placed
          </Text>

          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <Image
              source={require('../Assets/Images/order.png')}
              style={styles.orderImage}
              resizeMode="contain"
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinueShopping}
            >
              <Text style={styles.continueButtonText}>Continue Shopping</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={handleViewOrderDetails}
            >
              <Text style={styles.viewDetailsText}>View Order Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.poweredByText}>Powered by</Text>
          <View style={styles.logoContainer}>
            <View style={styles.cartIcon}>
              <Text style={styles.cartIconText}>S</Text>
            </View>
            <View style={styles.brandText}>
             <Image source={require('../Assets/Images/spider.png')} style={styles.logo} />
            </View>
            <View style={styles.confettiContainer}>
              <View style={styles.confetti1} />
              <View style={styles.confetti2} />
              <View style={styles.confetti3} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#EF3340',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: 'Montserrat-Regular',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  orderImage: {
    width: 200,
    height: 150,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  continueButton: {
    backgroundColor: '#EF3340',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 40,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
  },
  viewDetailsButton: {
    paddingVertical: 10,
  },
  viewDetailsText: {
    color: '#EF3340',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  poweredByText: {
    fontSize: 14,
    color: '#000',
    marginBottom: 10,
    fontFamily: 'Montserrat',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  cartIcon: {
    width: 30,
    height: 30,
    backgroundColor: '#EF3340',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cartIconText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
  },
  brandText: {
    alignItems: 'flex-start',
  },
  logo: {
    width: 80,
    height: 30,
    resizeMode: 'contain',
  },
  spiderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Montserrat',
  },
  ekartText: {
    fontSize: 12,
    color: '#000',
    fontFamily: 'Montserrat',
  },
  confettiContainer: {
    position: 'absolute',
    right: -20,
    top: 0,
  },
  confetti1: {
    width: 4,
    height: 4,
    backgroundColor: '#fff',
    borderRadius: 2,
    position: 'absolute',
    top: 5,
    right: 10,
  },
  confetti2: {
    width: 3,
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 1.5,
    position: 'absolute',
    top: 15,
    right: 5,
  },
  confetti3: {
    width: 2,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
    position: 'absolute',
    top: 25,
    right: 15,
  },
});

export default OrderConfirmed;
