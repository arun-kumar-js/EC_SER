import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import PoweredBy from '../Components/PoweredBy';

const AboutScreen = () => {
  const navigation = useNavigation();
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log('AboutScreen loaded');

  useEffect(() => {
    fetchAboutInfo();
  }, []);

  const fetchAboutInfo = async () => {
    try {
      setLoading(true);
      console.log('Fetching about information...');
      
      const response = await axios.post('https://ecservices.com.my/api/settings.php', {
        settings: '1',
        accesskey: '90336',
        get_about_us: '1'
      });

      console.log('About API Response:', response.data);

      if (response.data && response.data.data) {
        setAboutData(response.data.data);
        console.log('About data set:', response.data.data);
      } else {
        console.log('No about data received from API');
      }
    } catch (error) {
      console.error('Error fetching about info:', error);
      Alert.alert('Error', 'Failed to load about information');
    } finally {
      setLoading(false);
    }
  };

  const parseAboutHTML = (html) => {
    if (!html) return '';
    
    // Remove HTML tags and decode entities
    let text = html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .trim();
    
    return text;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E53935" />
          <Text style={styles.loadingText}>Loading about information...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>About Us</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.companyName}>Spider Ekart</Text>
          <Text style={styles.welcomeText}>Welcome to Spider Ekart!</Text>
          
          <Text style={styles.aboutText}>
            {aboutData?.about ? parseAboutHTML(aboutData.about) : 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.'}
          </Text>
          
          <Text style={styles.downloadTitle}>Download our Mobile App</Text>
          
          <Text style={styles.aboutText}>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
          </Text>
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
    marginBottom: hp('1%'),
    textAlign: 'left',
  },
  welcomeText: {
    fontSize: wp('4%'),
    color: '#666',
    fontFamily: 'Montserrat-Regular',
    marginBottom: hp('3%'),
    textAlign: 'left',
  },
  aboutText: {
    fontSize: wp('3.8%'),
    color: '#666',
    fontFamily: 'Montserrat-Regular',
    lineHeight: wp('5%'),
    marginBottom: hp('2%'),
    textAlign: 'left',
  },
  downloadTitle: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat-Bold',
    marginBottom: hp('2%'),
    marginTop: hp('2%'),
    textAlign: 'left',
  },
  poweredByContainer: {
    marginTop: hp('3%'),
    marginBottom: hp('2%'),
  },
});

export default AboutScreen;