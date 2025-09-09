import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import axios from 'axios';
import { API_BASE_URL } from '../config/config';

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      console.log('=== LOADING NOTIFICATIONS ===');
      
      const formdata = new FormData();
      formdata.append('get-notifications', '1');
      formdata.append('accesskey', '90336');

      console.log('Request URL:', `${API_BASE_URL}sections.php`);
      console.log('Form Data:', formdata);

      const response = await axios.post(`${API_BASE_URL}sections.php`, formdata, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000, // 10 second timeout
      });

      console.log('=== NOTIFICATION API RESPONSE ===');
      console.log('Response Status:', response.status);
      console.log('Response Data:', response.data);

      if (response.data && response.data.data) {
        setNotifications(response.data.data);
        console.log('Notifications loaded:', response.data.data.length);
      } else {
        console.log('No notifications data found');
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      console.error('Error details:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to load notifications. Please check your internet connection.');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification) => {
    try {
      console.log('Notification pressed:', notification);
      
      // You can add navigation logic here based on notification type
      if (notification.type === 'promotion') {
        // Navigate to promotions or specific screen
        console.log('Promotion notification pressed');
      } else if (notification.type === '') {
        // Handle default notification
        console.log('Default notification pressed');
      }
    } catch (error) {
      console.error('Error handling notification press:', error);
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Recently';
      
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 1) {
        return 'Just now';
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} hours ago`;
      } else if (diffInHours < 48) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      return 'Recently';
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={styles.notificationItem}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{item.name}</Text>
          <Text style={styles.notificationTime}>
            {formatDate(item.created_at)}
          </Text>
        </View>
        
        {item.subtitle && (
          <Text style={styles.notificationMessage}>{item.subtitle}</Text>
        )}
        
        {item.image && (
          <Image
            source={{ uri: item.image }}
            style={styles.notificationImage}
            resizeMode="cover"
          />
        )}
        
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptyMessage}>
        You don't have any notifications yet.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Image
              source={require('../Assets/Images/Arrow.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e60023" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require('../Assets/Images/Arrow.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#e60023']}
            tintColor="#e60023"
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#e60023',
    paddingVertical: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: wp('5%'),
    height: hp('2.5%'),
    tintColor: '#fff',
  },
  headerTitle: {
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    flex: 1,
  },
  headerRight: {
    width: wp('5%'),
  },
  listContainer: {
    flexGrow: 1,
  },
  notificationItem: {
    backgroundColor: '#fff',
    marginHorizontal: wp('4%'),
    marginVertical: hp('0.5%'),
    borderRadius: wp('2%'),
    padding: wp('4%'),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp('1%'),
  },
  notificationTitle: {
    fontSize: wp('4%'),
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: wp('2%'),
  },
  notificationTime: {
    fontSize: wp('3%'),
    fontFamily: 'Montserrat-Regular',
    color: '#666',
  },
  notificationMessage: {
    fontSize: wp('3.5%'),
    fontFamily: 'Montserrat-Regular',
    color: '#666',
    lineHeight: wp('4.5%'),
    marginBottom: hp('1%'),
  },
  notificationImage: {
    width: '100%',
    height: hp('15%'),
    borderRadius: wp('1%'),
    marginTop: hp('1%'),
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: hp('1%'),
  },
  typeBadge: {
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('2%'),
  },
  typeText: {
    color: '#fff',
    fontSize: wp('2.5%'),
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('8%'),
  },
  emptyTitle: {
    fontSize: wp('5%'),
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: hp('1%'),
  },
  emptyMessage: {
    fontSize: wp('4%'),
    fontFamily: 'Montserrat-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: wp('5%'),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: wp('4%'),
    fontFamily: 'Montserrat-Regular',
    color: '#666',
    marginTop: hp('2%'),
  },
});

export default NotificationScreen;
