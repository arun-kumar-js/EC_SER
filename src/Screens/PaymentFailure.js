import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const PaymentFailure = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#EF3340" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image 
            source={require('../Assets/Images/Arrow.png')} 
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Failed</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name="close-circle" size={wp('20%')} color="#EF3340" />
        </View>
        
        <Text style={styles.title}>Payment Failed</Text>
        <Text style={styles.subtitle}>
          Your payment could not be processed successfully. Please check your payment details and try again.
        </Text>
        
        <View style={styles.reasonContainer}>
          <Text style={styles.reasonTitle}>Possible reasons:</Text>
          <View style={styles.reasonItem}>
            <Icon name="checkmark-circle-outline" size={wp('4%')} color="#666" />
            <Text style={styles.reasonText}>Insufficient funds in your account</Text>
          </View>
          <View style={styles.reasonItem}>
            <Icon name="checkmark-circle-outline" size={wp('4%')} color="#666" />
            <Text style={styles.reasonText}>Incorrect card details</Text>
          </View>
          <View style={styles.reasonItem}>
            <Icon name="checkmark-circle-outline" size={wp('4%')} color="#666" />
            <Text style={styles.reasonText}>Network connectivity issues</Text>
          </View>
          <View style={styles.reasonItem}>
            <Icon name="checkmark-circle-outline" size={wp('4%')} color="#666" />
            <Text style={styles.reasonText}>Card expired or blocked</Text>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="refresh" size={wp('4%')} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate('MainDrawer')}
          >
            <Icon name="home" size={wp('4%')} color="#EF3340" style={styles.buttonIcon} />
            <Text style={styles.homeButtonText}>Go to Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => navigation.navigate('ContactUs')}
          >
            <Icon name="call" size={wp('4%')} color="#666" style={styles.buttonIcon} />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#EF3340',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: wp('2%'),
  },
  backIcon: {
    width: wp('6%'),
    height: wp('6%'),
    tintColor: '#fff',
  },
  headerTitle: {
    color: '#fff',
    fontSize: wp('4.5%'),
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: wp('10%'),
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('8%'),
  },
  iconContainer: {
    marginBottom: hp('3%'),
  },
  title: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat-Bold',
    marginBottom: hp('2%'),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: wp('4%'),
    color: '#666',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: wp('5%'),
    marginBottom: hp('4%'),
  },
  reasonContainer: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginBottom: hp('4%'),
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reasonTitle: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat-Bold',
    marginBottom: hp('2%'),
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  reasonText: {
    fontSize: wp('3.5%'),
    color: '#666',
    fontFamily: 'Montserrat-Regular',
    marginLeft: wp('3%'),
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    gap: hp('2%'),
  },
  retryButton: {
    backgroundColor: '#EF3340',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('8%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
  },
  homeButton: {
    backgroundColor: 'transparent',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('8%'),
    borderRadius: wp('2%'),
    borderWidth: 1,
    borderColor: '#EF3340',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  homeButtonText: {
    color: '#EF3340',
    fontSize: wp('4%'),
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
  },
  contactButton: {
    backgroundColor: 'transparent',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('8%'),
    borderRadius: wp('2%'),
    borderWidth: 1,
    borderColor: '#666',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  contactButtonText: {
    color: '#666',
    fontSize: wp('4%'),
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
  },
  buttonIcon: {
    marginRight: wp('2%'),
  },
});

export default PaymentFailure;