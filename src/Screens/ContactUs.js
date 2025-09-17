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
      console.log('Fetching about information...');
      
    const formData = new FormData();
    formData.append('settings', '1');
    formData.append('accesskey', '90336');
    formData.append('get_contact', '1');

    const response = await axios.post(
      'https://spiderekart.in/ec_service/api-firebase/settings.php',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

      console.log('Contact API Response:', response.data);

       if (response.data && response.data.contact) {
         setContactData(response.data);
         console.log('Contact data set:', response.data);
       } else {
         console.log('No contact data received from API');
         setContactData(null);
       }
    } catch (error) {
      console.error('Error fetching contact info:', error);
      setContactData(null);
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
          {contactData && contactData.contact ? (
            <View>
              <Text style={styles.aboutText}>
                {contactData.contact.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim()}
              </Text>
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No contact information available</Text>
            </View>
          )}
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
    margin: wp('4%'),
    padding: wp('5%'),
    backgroundColor: '#fff',
    borderRadius: wp('2%'),
    borderTopWidth: 3,
    borderTopColor: '#E53935',
    borderLeftWidth: 2,
    borderLeftColor: '#2196F3',
    borderRightWidth: 2,
    borderRightColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  companyName: {
    fontSize: wp('7%'),
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp('2%'),
    textAlign: 'left',
  },
  feedbackText: {
    fontSize: wp('4%'),
    color: '#000',
    fontFamily: 'Montserrat-Regular',
    marginBottom: hp('1%'),
    textAlign: 'left',
  },
  emailText: {
    fontSize: wp('4%'),
    color: '#000',
    fontFamily: 'Montserrat-Regular',
    marginBottom: hp('2%'),
    textAlign: 'left',
  },
  contactText: {
    fontSize: wp('4%'),
    color: '#000',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'left',
  },
  aboutText: {
    fontSize: wp('4%'),
    color: '#333',
    fontFamily: 'Montserrat-Regular',
    marginBottom: hp('2%'),
    textAlign: 'left',
    lineHeight: wp('5%'),
  },
  contactSection: {
    marginBottom: hp('2%'),
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    color: '#E53935',
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    marginBottom: hp('1%'),
    textAlign: 'left',
  },
  phoneText: {
    fontSize: wp('4%'),
    color: '#333',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'left',
    textDecorationLine: 'underline',
  },
  noDataContainer: {
    padding: wp('4%'),
    alignItems: 'center',
  },
  noDataText: {
    fontSize: wp('4%'),
    color: '#666',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
  },
  poweredByContainer: {
    marginTop: hp('3%'),
    marginBottom: hp('2%'),
  },
});

export default ContactUsScreen;