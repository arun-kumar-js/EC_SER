import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const ShareApp = ({ navigation }) => {
  const handleShareApp = async () => {
    try {
      const shareOptions = {
        message: 'Check out this amazing app! Download it from the App Store.',
        url: 'https://apps.apple.com/app/your-app-name', // Replace with your actual app store URL
        title: 'Share App',
      };

      const result = await Share.share(shareOptions);
      
      if (result.action === Share.sharedAction) {
        // Content was shared
        console.log('App shared successfully');
      } else if (result.action === Share.dismissedAction) {
        // Share dialog was dismissed
        console.log('Share dialog dismissed');
      }
    } catch (error) {
      console.error('Error sharing app:', error);
      Alert.alert('Error', 'Failed to share the app. Please try again.');
    }
  };

  const handleShareViaWhatsApp = async () => {
    try {
      const shareOptions = {
        message: 'Check out this amazing app! Download it from the App Store.',
        url: 'https://apps.apple.com/app/your-app-name', // Replace with your actual app store URL
        social: Share.Social.WHATSAPP,
      };

      await Share.share(shareOptions);
    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
      Alert.alert('Error', 'WhatsApp is not installed or failed to share.');
    }
  };

  const handleShareViaEmail = async () => {
    try {
      const shareOptions = {
        message: 'Check out this amazing app! Download it from the App Store.',
        url: 'https://apps.apple.com/app/your-app-name', // Replace with your actual app store URL
        subject: 'Amazing App Recommendation',
      };

      await Share.share(shareOptions);
    } catch (error) {
      console.error('Error sharing via email:', error);
      Alert.alert('Error', 'Failed to share via email. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image 
            source={require('../Assets/Images/Arrow.png')} 
            style={styles.backArrow} 
            resizeMode="contain" 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share App</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <View style={styles.appInfo}>
          <View style={styles.appIconContainer}>
            <Icon name="phone-portrait" size={80} color="#EE2737" />
          </View>
          <Text style={styles.appName}>EC Services</Text>
          <Text style={styles.appDescription}>
            Share this amazing app with your friends and family
          </Text>
        </View>

        <View style={styles.shareOptions}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShareApp}>
            <Icon name="share-outline" size={24} color="#fff" />
            <Text style={styles.shareButtonText}>Share App</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} onPress={handleShareViaWhatsApp}>
            <Icon name="logo-whatsapp" size={24} color="#25D366" />
            <Text style={styles.socialButtonText}>Share via WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} onPress={handleShareViaEmail}>
            <Icon name="mail-outline" size={24} color="#007AFF" />
            <Text style={styles.socialButtonText}>Share via Email</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.appDetails}>
          <Text style={styles.detailsTitle}>App Details</Text>
          <Text style={styles.detailsText}>
            • Easy to use interface{'\n'}
            • Fast and reliable service{'\n'}
            • Secure payment options{'\n'}
            • 24/7 customer support
          </Text>
        </View>
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
    backgroundColor: '#EE2737',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  backArrow: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // Compensate for back button width
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  appInfo: {
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  appIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 25,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat-Bold',
    marginBottom: 10,
  },
  appDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Montserrat-Regular',
    lineHeight: 22,
  },
  shareOptions: {
    marginBottom: 30,
  },
  shareButton: {
    backgroundColor: '#EE2737',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
    marginLeft: 10,
  },
  socialButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  socialButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
    marginLeft: 10,
  },
  appDetails: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat-Bold',
    marginBottom: 15,
  },
  detailsText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
    lineHeight: 20,
  },
});

export default ShareApp;
