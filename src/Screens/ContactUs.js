import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import PoweredBy from '../Components/PoweredBy';

const ContactUsScreen = () => {
  const navigation = useNavigation();
  const [contactData, setContactData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      console.log('Fetching contact information...');
      
      const response = await axios.post('https://ecservices.com.my/api/settings.php', {
        settings: '1',
        accesskey: '90336',
        get_contact_us: '1'
      });

      console.log('Contact API Response:', response.data);

      if (response.data && response.data.data) {
        setContactData(response.data.data);
        console.log('Contact data set:', response.data.data);
      } else {
        console.log('No contact data received from API');
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
      Alert.alert('Error', 'Failed to load contact information');
    } finally {
      setLoading(false);
    }
  };

  const parseContactHTML = (html) => {
    if (!html) return '';
    
    // Extract email and phone numbers from HTML
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const phoneRegex = /(\+?[0-9\s-()]{10,})/g;
    
    const emails = html.match(emailRegex) || [];
    const phones = html.match(phoneRegex) || [];
    
    return {
      emails: [...new Set(emails)], // Remove duplicates
      phones: [...new Set(phones)], // Remove duplicates
      text: html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim()
    };
  };

  const handlePhoneCall = (phoneNumber) => {
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    const phoneUrl = `tel:${cleanNumber}`;
    
    Linking.canOpenURL(phoneUrl)
      .then(supported => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Error', 'Phone calls are not supported on this device');
        }
      })
      .catch(err => {
        console.error('Error opening phone:', err);
        Alert.alert('Error', 'Failed to open phone app');
      });
  };

  const handleEmail = (email) => {
    const emailUrl = `mailto:${email}`;
    
    Linking.canOpenURL(emailUrl)
      .then(supported => {
        if (supported) {
          Linking.openURL(emailUrl);
        } else {
          Alert.alert('Error', 'Email is not supported on this device');
        }
      })
      .catch(err => {
        console.error('Error opening email:', err);
        Alert.alert('Error', 'Failed to open email app');
      });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E53935" />
          <Text style={styles.loadingText}>Loading contact information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const contactInfo = contactData ? parseContactHTML(contactData.contact) : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Image 
              source={require('../Assets/Images/Arrow.png')} 
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact Us</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.companyName}>Spider India</Text>
          
          <Text style={styles.feedbackText}>Please send all your feedback to</Text>
          
          <TouchableOpacity onPress={() => handleEmail('spiderindia@gmail.com')}>
            <Text style={styles.emailText}>spiderindia@gmail.com</Text>
          </TouchableOpacity>
          
          <Text style={styles.contactText}>Contact number : 9150489997</Text>
        </View>
        
        {/* Powered By Section */}
        <PoweredBy style={styles.poweredByContainer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: wp('4%'),
    color: '#666',
    fontFamily: 'Montserrat-Regular',
    marginTop: hp('2%'),
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#E53935',
    paddingVertical: hp('3%'),
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
    fontSize: wp('5%'),
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: wp('10%'),
  },
  contentContainer: {
    padding: wp('4%'),
    backgroundColor: '#fff',
  },
  companyName: {
    fontSize: wp('6%'),
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: hp('3%'),
    textAlign: 'left',
  },
  feedbackText: {
    fontSize: wp('4%'),
    color: '#333',
    fontFamily: 'Montserrat-Regular',
    marginBottom: hp('1%'),
    textAlign: 'left',
  },
  emailText: {
    fontSize: wp('4%'),
    color: '#333',
    fontFamily: 'Montserrat-Regular',
    marginBottom: hp('3%'),
    textAlign: 'left',
  },
  contactText: {
    fontSize: wp('4%'),
    color: '#333',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'left',
  },
  poweredByContainer: {
    marginTop: hp('3%'),
    marginBottom: hp('2%'),
  },
});

export default ContactUsScreen;