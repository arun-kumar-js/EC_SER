import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const PaymentFailure = ({ navigation, route }) => {
  const { errorMessage, orderId, amount } = route.params || {};

  const handleRetryPayment = () => {
    // Navigate back to payment screen
    navigation.goBack();
  };

  const handleGoHome = () => {
    // Navigate to home screen
    navigation.navigate('MainApp');
  };

  const handleContactSupport = () => {
    // Navigate to support screen or show contact options
    navigation.navigate('Support');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#F70D24" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={wp('6%')} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Failed</Text>
        <View style={{ width: wp('9%') }} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {/* Failure Icon */}
        <View style={styles.iconContainer}>
          <Icon name="error-outline" size={wp('20%')} color="#F70D24" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Payment Failed</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          We're sorry, but your payment could not be processed at this time.
        </Text>

        {/* Error Details */}
        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Error Details:</Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          </View>
        )}

        {/* Order Information */}
        {(orderId || amount) && (
          <View style={styles.orderInfoContainer}>
            <Text style={styles.orderInfoTitle}>Order Information:</Text>
            {orderId && (
              <Text style={styles.orderInfoText}>Order ID: {orderId}</Text>
            )}
            {amount && (
              <Text style={styles.orderInfoText}>Amount: ₹{amount}</Text>
            )}
          </View>
        )}

        {/* Possible Reasons */}
        <View style={styles.reasonsContainer}>
          <Text style={styles.reasonsTitle}>Possible reasons:</Text>
          <View style={styles.reasonsList}>
            <View style={styles.reasonItem}>
              <Icon name="check" size={wp('4%')} color="#F70D24" />
              <Text style={styles.reasonText}>Insufficient funds in your account</Text>
            </View>
            <View style={styles.reasonItem}>
              <Icon name="check" size={wp('4%')} color="#F70D24" />
              <Text style={styles.reasonText}>Network connectivity issues</Text>
            </View>
            <View style={styles.reasonItem}>
              <Icon name="check" size={wp('4%')} color="#F70D24" />
              <Text style={styles.reasonText}>Payment gateway temporarily unavailable</Text>
            </View>
            <View style={styles.reasonItem}>
              <Icon name="check" size={wp('4%')} color="#F70D24" />
              <Text style={styles.reasonText}>Invalid payment details</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetryPayment}
            activeOpacity={0.8}
          >
            <Icon name="refresh" size={wp('5%')} color="white" />
            <Text style={styles.retryButtonText}>Retry Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={handleGoHome}
            activeOpacity={0.8}
          >
            <Icon name="home" size={wp('5%')} color="#F70D24" />
            <Text style={styles.homeButtonText}>Go to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleContactSupport}
            activeOpacity={0.8}
          >
            <Icon name="support-agent" size={wp('5%')} color="#F70D24" />
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#F70D24',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
  },
  backButton: {
    width: wp('9%'),
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('3%'),
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: hp('5%'),
    marginBottom: hp('3%'),
    alignItems: 'center',
  },
  title: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: '#F70D24',
    textAlign: 'center',
    marginBottom: hp('2%'),
    fontFamily: 'Montserrat-Bold',
  },
  subtitle: {
    fontSize: wp('4%'),
    color: '#666',
    textAlign: 'center',
    lineHeight: wp('5.5%'),
    marginBottom: hp('4%'),
    fontFamily: 'Montserrat-Regular',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: wp('4%'),
    borderRadius: wp('2%'),
    marginBottom: hp('3%'),
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#F70D24',
  },
  errorTitle: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#F70D24',
    marginBottom: hp('1%'),
    fontFamily: 'Montserrat-Bold',
  },
  errorMessage: {
    fontSize: wp('3.5%'),
    color: '#666',
    lineHeight: wp('5%'),
    fontFamily: 'Montserrat-Regular',
  },
  orderInfoContainer: {
    backgroundColor: '#fff',
    padding: wp('4%'),
    borderRadius: wp('2%'),
    marginBottom: hp('3%'),
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  orderInfoTitle: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: hp('1%'),
    fontFamily: 'Montserrat-Bold',
  },
  orderInfoText: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginBottom: hp('0.5%'),
    fontFamily: 'Montserrat-Regular',
  },
  reasonsContainer: {
    backgroundColor: '#fff',
    padding: wp('4%'),
    borderRadius: wp('2%'),
    marginBottom: hp('4%'),
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  reasonsTitle: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: hp('2%'),
    fontFamily: 'Montserrat-Bold',
  },
  reasonsList: {
    gap: hp('1.5%'),
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('3%'),
  },
  reasonText: {
    fontSize: wp('3.5%'),
    color: '#666',
    flex: 1,
    fontFamily: 'Montserrat-Regular',
  },
  buttonContainer: {
    width: '100%',
    gap: hp('2%'),
  },
  retryButton: {
    backgroundColor: '#F70D24',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('2%'),
    gap: wp('3%'),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  retryButtonText: {
    color: 'white',
    fontSize: wp('4%'),
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  homeButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('2%'),
    borderWidth: 2,
    borderColor: '#F70D24',
    gap: wp('3%'),
  },
  homeButtonText: {
    color: '#F70D24',
    fontSize: wp('4%'),
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  supportButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('2%'),
    borderWidth: 2,
    borderColor: '#F70D24',
    gap: wp('3%'),
  },
  supportButtonText: {
    color: '#F70D24',
    fontSize: wp('4%'),
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
});

export default PaymentFailure;
