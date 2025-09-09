import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Linking, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const SupportScreen = () => {
  const [contactData, setContactData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.post('https://ecservices.com.my/api/settings.php', {
        settings: '1',
        accesskey: '90336',
        get_contact_us: '1'
      });

      if (response.data && !response.data.error) {
        setContactData(response.data);
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
      Alert.alert('Error', 'Failed to load contact information');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneCall = (phoneNumber) => {
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${cleanNumber}`);
  };

  const handleEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const parseContactHTML = (htmlString) => {
    if (!htmlString) return null;
    
    // Extract email and phone numbers from HTML
    const emailMatch = htmlString.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    const phoneMatches = htmlString.match(/\+?[\d\s-]+/g);
    
    return {
      email: emailMatch ? emailMatch[0] : null,
      phones: phoneMatches ? phoneMatches.filter(phone => phone.length > 5) : []
    };
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Contact Us</Text>
          <Text style={styles.subtitle}>Get in touch with EC Services</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.infoCard}>
            <Icon name="business-outline" size={wp('8%')} color="#E53935" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>EC Services</Text>
            <Text style={styles.cardSubtitle}>DOORSTEP DELIVERY COMPANY FOR FLOWER AND GARLAND</Text>
          </View>

          {contactInfo && (
            <>
              {contactInfo.email && (
                <TouchableOpacity 
                  style={styles.contactItem}
                  onPress={() => handleEmail(contactInfo.email)}
                  activeOpacity={0.7}
                >
                  <Icon name="mail-outline" size={wp('6%')} color="#E53935" />
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactLabel}>Email</Text>
                    <Text style={styles.contactValue}>{contactInfo.email}</Text>
                  </View>
                  <Icon name="chevron-forward-outline" size={wp('5%')} color="#999" />
                </TouchableOpacity>
              )}

              {contactInfo.phones.map((phone, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.contactItem}
                  onPress={() => handlePhoneCall(phone)}
                  activeOpacity={0.7}
                >
                  <Icon name="call-outline" size={wp('6%')} color="#E53935" />
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactLabel}>Phone {index + 1}</Text>
                    <Text style={styles.contactValue}>{phone}</Text>
                  </View>
                  <Icon name="chevron-forward-outline" size={wp('5%')} color="#999" />
                </TouchableOpacity>
              ))}
            </>
          )}

          <View style={styles.infoCard}>
            <Icon name="information-circle-outline" size={wp('8%')} color="#E53935" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>About EC Services</Text>
            <Text style={styles.cardSubtitle}>
              Welcome to EC Services! Download EC Services now and experience shopping made easy!
            </Text>
            <Text style={styles.cardSubtitle}>
              SAVE TIME & MONEY with our doorstep delivery service.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp('2%'),
    fontSize: wp('4%'),
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  header: {
    backgroundColor: '#E53935',
    paddingVertical: hp('3%'),
    paddingHorizontal: wp('5%'),
    alignItems: 'center',
  },
  title: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
    marginBottom: hp('0.5%'),
  },
  subtitle: {
    fontSize: wp('4%'),
    color: '#fff',
    opacity: 0.9,
    fontFamily: 'Montserrat-Regular',
  },
  content: {
    padding: wp('5%'),
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    padding: wp('5%'),
    marginBottom: hp('2%'),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardIcon: {
    marginBottom: hp('1.5%'),
  },
  cardTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat-Bold',
    marginBottom: hp('1%'),
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: wp('3.5%'),
    color: '#666',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: wp('5%'),
  },
  contactItem: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginBottom: hp('1.5%'),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  contactTextContainer: {
    flex: 1,
    marginLeft: wp('4%'),
  },
  contactLabel: {
    fontSize: wp('3.5%'),
    color: '#666',
    fontFamily: 'Montserrat-Regular',
    marginBottom: hp('0.5%'),
  },
  contactValue: {
    fontSize: wp('4%'),
    color: '#333',
    fontFamily: 'Montserrat-Medium',
  },
});

export default SupportScreen;
