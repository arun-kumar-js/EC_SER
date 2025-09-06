import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNotificationCount } from '../Fuctions/NotificationService';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const NotificationIcon = ({ style }) => {
  const navigation = useNavigation();
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotificationCount();
  }, []);

  const loadNotificationCount = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        const userId = user.id || user.user_id;
        
        if (userId) {
          const result = await getNotificationCount(userId);
          if (result.success) {
            setNotificationCount(result.count);
          }
        }
      }
    } catch (error) {
      console.error('Error loading notification count:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = () => {
    navigation.navigate('Notification');
  };

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={handlePress}>
      <View style={styles.iconContainer}>
        <Text style={styles.bellIcon}>🔔</Text>
        {notificationCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {notificationCount > 99 ? '99+' : notificationCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: wp('2%'),
  },
  iconContainer: {
    position: 'relative',
  },
  bellIcon: {
    fontSize: wp('5%'),
    color: '#fff',
  },
  badge: {
    position: 'absolute',
    top: -wp('1%'),
    right: -wp('1%'),
    backgroundColor: '#ff4444',
    borderRadius: wp('3%'),
    minWidth: wp('4%'),
    height: wp('4%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: wp('2.5%'),
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default NotificationIcon;
