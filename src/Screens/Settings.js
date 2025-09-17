import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppTrackingTransparencyService from '../Fuctions/AppTrackingTransparencyService';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const SettingsScreen = () => {
  const [trackingStatus, setTrackingStatus] = useState('Unknown');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTrackingStatus();
  }, []);

  const loadTrackingStatus = async () => {
    try {
      const result = await AppTrackingTransparencyService.getCurrentStatus();
      setTrackingStatus(result.message);
    } catch (error) {
      console.error('Error loading tracking status:', error);
      setTrackingStatus('Error loading status');
    }
  };

  const handleRequestTrackingPermission = async () => {
    setIsLoading(true);
    try {
      const result = await AppTrackingTransparencyService.requestTrackingPermission();
      setTrackingStatus(result.message);
      
      Alert.alert(
        'Tracking Permission',
        result.message,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error requesting tracking permission:', error);
      Alert.alert(
        'Error',
        'Failed to request tracking permission',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowExplanation = () => {
    AppTrackingTransparencyService.showTrackingExplanation();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      
      <View style={styles.content}>
        {/* App Tracking Transparency Section */}
        {Platform.OS === 'ios' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy & Tracking</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>App Tracking</Text>
                <Text style={styles.settingDescription}>
                  Allow tracking across apps and websites for personalized ads
                </Text>
                <Text style={styles.statusText}>Status: {trackingStatus}</Text>
              </View>
              
              <View style={styles.settingActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleShowExplanation}
                >
                  <Text style={styles.actionButtonText}>Learn More</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.primaryButton]}
                  onPress={handleRequestTrackingPermission}
                  disabled={isLoading}
                >
                  <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                    {isLoading ? 'Requesting...' : 'Request Permission'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Other Settings Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <Text style={styles.placeholderText}>More settings coming soon...</Text>
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
    backgroundColor: '#F40612',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
    alignItems: 'center',
  },
  title: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
  },
  content: {
    flex: 1,
    padding: wp('4%'),
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: wp('2%'),
    marginBottom: hp('2%'),
    padding: wp('4%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: hp('2%'),
    fontFamily: 'Montserrat-Bold',
  },
  settingItem: {
    marginBottom: hp('1%'),
  },
  settingInfo: {
    marginBottom: hp('2%'),
  },
  settingLabel: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#333',
    marginBottom: hp('0.5%'),
    fontFamily: 'Montserrat-SemiBold',
  },
  settingDescription: {
    fontSize: wp('3.5%'),
    color: '#666',
    lineHeight: wp('4.5%'),
    marginBottom: hp('1%'),
    fontFamily: 'Montserrat-Regular',
  },
  statusText: {
    fontSize: wp('3.5%'),
    color: '#F40612',
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
  settingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp('2%'),
  },
  actionButton: {
    flex: 1,
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('2%'),
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  primaryButton: {
    backgroundColor: '#F40612',
    borderColor: '#F40612',
  },
  actionButtonText: {
    fontSize: wp('3.5%'),
    color: '#333',
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
  primaryButtonText: {
    color: '#fff',
  },
  placeholderText: {
    fontSize: wp('3.5%'),
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'Montserrat-Regular',
  },
});

export default SettingsScreen;
