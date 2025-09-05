import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import {
  createBillPlzBill,
  checkBillPlzStatus,
} from '../Fuctions/BillPlzService';

const BillPlzWebView = ({ route, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const webViewRef = useRef(null);

  const { orderData, paymentUrl: passedPaymentUrl, billId, returnToPayment } = route.params || {};

  useEffect(() => {
    if (passedPaymentUrl) {
      // Payment URL was passed from Payment screen
      console.log('✅ Using passed payment URL:', passedPaymentUrl);
      setPaymentUrl(passedPaymentUrl);
      setLoading(false);
    } else {
      // Create bill if no URL was passed
      createBill();
    }
  }, []);

  const createBill = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('=== CREATING BILLPLZ BILL ===');
      console.log('Order Data:', orderData);

      const result = await createBillPlzBill(orderData);

      if (result.success && result.paymentUrl) {
        console.log('✅ BillPlz bill created successfully');
        console.log('Payment URL:', result.paymentUrl);
        setPaymentUrl(result.paymentUrl);
      } else {
        console.error('❌ Failed to create BillPlz bill:', result.message);
        setError(result.message || 'Failed to create payment bill');

        if (retryCount < 2) {
          Toast.show({
            type: 'error',
            text1: 'Payment Error',
            text2: 'Failed to create payment bill. Retrying...',
            visibilityTime: 2000,
          });
          setRetryCount(prev => prev + 1);
          setTimeout(createBill, 1000);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Payment Error',
            text2: 'Unable to create payment bill. Please try again later.',
            visibilityTime: 3000,
          });
          setTimeout(() => navigation.goBack(), 2000);
        }
      }
    } catch (error) {
      console.error('❌ Error creating BillPlz bill:', error);
      setError('Network error. Please check your connection.');

      if (retryCount < 2) {
        Toast.show({
          type: 'error',
          text1: 'Network Error',
          text2: 'Connection failed. Retrying...',
          visibilityTime: 2000,
        });
        setRetryCount(prev => prev + 1);
        setTimeout(createBill, 1000);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Network Error',
          text2: 'Unable to connect. Please try again later.',
          visibilityTime: 3000,
        });
        setTimeout(() => navigation.goBack(), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewNavigationStateChange = navState => {
    console.log('=== WEBVIEW NAVIGATION ===');
    console.log('URL:', navState.url);
    console.log('Loading:', navState.loading);
    console.log('Title:', navState.title);

    // Check if payment was successful
    if (navState.url.includes('success') || navState.url.includes('paid')) {
      console.log('✅ Payment appears to be successful');
      handlePaymentSuccess();
    }

    // Check if payment failed
    if (navState.url.includes('failed') || navState.url.includes('error')) {
      console.log('❌ Payment appears to have failed');
      handlePaymentFailure('Payment was cancelled or failed');
    }
  };

  const handleWebViewError = syntheticEvent => {
    const { nativeEvent } = syntheticEvent;
    console.error('❌ WebView Error:', nativeEvent);
    setError('Failed to load payment page');
  };

  const handlePaymentSuccess = () => {
    console.log('✅ BillPlz payment successful');
    
    // Show success toast
    Toast.show({
      type: 'success',
      text1: 'Payment Successful!',
      text2: 'Processing your order...',
      visibilityTime: 1000,
    });

    // If we have a returnToPayment flag, go back to Payment screen to handle success
    if (returnToPayment) {
      setTimeout(() => {
        navigation.goBack();
        // Trigger the payment success handler in Payment screen
        if (navigation.getParent) {
          navigation.getParent().setParams({ 
            billPlzPaymentSuccess: true,
            orderData: orderData,
            billId: billId
          });
        }
      }, 1000);
    } else {
      // Direct navigation to OrderConfirmed
      setTimeout(() => {
        navigation.replace('OrderConfirmed', {
          orderId: `BILLPLZ_${Date.now()}`,
          orderData: orderData,
          orderResult: {
            error: false,
            message: 'Payment successful via BillPlz',
            order_id: `BILLPLZ_${Date.now()}`,
          },
          paymentMethod: 'BillPlz',
          paymentSuccess: true,
        });
      }, 1000);
    }
  };

  const handlePaymentFailure = (message = 'Payment was cancelled') => {
    console.log('❌ BillPlz payment failed:', message);
    
    // Navigate to PaymentFailure screen with error details
    navigation.replace('PaymentFailure', {
      errorMessage: message,
      orderId: orderData?.order_id,
      amount: orderData?.amount,
    });
  };

  const handleClose = () => {
    // Navigate to PaymentFailure screen when user closes payment
    navigation.replace('PaymentFailure', {
      errorMessage: 'Payment was cancelled by user.',
      orderId: orderData?.order_id,
      amount: orderData?.amount,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#EF3340" barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} activeOpacity={1}>
            <Icon name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Processing Payment</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EF3340" />
          <Text style={styles.loadingText}>Setting up payment...</Text>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </SafeAreaView>
    );
  }

  if (error && !paymentUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#EF3340" barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={1}
          >
            <Icon name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Error</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color="#EF3340" />
          <Text style={styles.errorTitle}>Payment Setup Failed</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={createBill}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#EF3340" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} activeOpacity={1}>
          <Icon name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BillPlz Payment</Text>
        <View style={{ width: 24 }} />
      </View>
      <WebView
        ref={webViewRef}
        source={{ uri: paymentUrl }}
        style={styles.webview}
        onNavigationStateChange={handleWebViewNavigationStateChange}
        onError={handleWebViewError}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.webviewLoading}>
            <ActivityIndicator size="large" color="#EF3340" />
            <Text style={styles.webviewLoadingText}>
              Loading payment page...
            </Text>
          </View>
        )}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsBackForwardNavigationGestures={false}
        onShouldStartLoadWithRequest={request => {
          console.log('WebView loading:', request.url);
          return true;
        }}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#EF3340',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    fontFamily: 'Montserrat',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    fontFamily: 'Montserrat',
  },
  retryButton: {
    backgroundColor: '#EF3340',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
  },
  webview: {
    flex: 1,
  },
  webviewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  webviewLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
});

export default BillPlzWebView;
