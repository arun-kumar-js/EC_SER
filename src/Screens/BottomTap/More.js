import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
  Share,
  Linking,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getWalletBalance } from '../../Fuctions/UserDataService';
import { useUserProfile } from '../../Context/UserProfileContext';

const ListItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.listItem} onPress={onPress}>
    <Image source={icon} style={styles.listItemIcon} />
    <Text style={styles.listItemText}>{label}</Text>
  </TouchableOpacity>
);

const More = () => {
  const navigation = useNavigation();
  const { userData: user, isLoading: userLoading, clearUserData } = useUserProfile();
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const menuItems = [
    {
      icon: require('../../Assets/icon/track.png'),
      label: 'My Orders',
      onPress: () => navigation.navigate('MyOrders'),
    },
    {
      icon: require('../../Assets/icon/bell.png'),
      label: 'Notifications',
      onPress: () => navigation.navigate('Notification'),
    },
    {
      icon: require('../../Assets/icon/phone.png'),
      label: 'Contact Us',
      onPress: () => navigation.navigate('ContactUs'),
    },
    {
      icon: require('../../Assets/icon/about.png'),
      label: 'About Us',
      onPress: () => navigation.navigate('About'),
    },
    {
      icon: require('../../Assets/icon/star.png'),
      label: 'Rate Us',
      onPress: () => handleRateUs(),
    },
    {
      icon: require('../../Assets/icon/share.png'),
      label: 'Share App',
      onPress: () => handleShareApp(),
    },
    {
      icon: require('../../Assets/icon/refer.png'),
      label: 'Refer & Earn',
      onPress: () => navigation.navigate('ReferEarn'),
    },
    {
      icon: require('../../Assets/icon/FAQ.png'),
      label: 'FAQ',
      onPress: () => navigation.navigate('Faq'),
    },
    {
      icon: require('../../Assets/icon/terms.png'),
      label: 'Terms & Conditions',
      onPress: () => navigation.navigate('TermsAndCondition'),
    },
    {
      icon: require('../../Assets/icon/privacy.png'),
      label: 'Privacy Policy',
      onPress: () => navigation.navigate('PrivacyPolicy'),
    },
    {
      icon: require('../../Assets/icon/profile.png'),
      label: 'Log Out',
      onPress: () => handleLogout(),
    },
  ];

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // User data is now managed by UserProfileContext
      console.log('=== MORE PAGE: USER DATA FROM CONTEXT ===');
      console.log('User data from context:', user);

      if (user) {
        // Get wallet balance from API
        const userId = user.user_id || user.id;
        console.log('User ID for wallet balance:', userId);

        if (userId) {
          const balanceResult = await getWalletBalance(userId);
          console.log('Wallet balance result:', balanceResult);
          if (balanceResult.success) {
            setWalletBalance(balanceResult.balance);
            console.log('Set wallet balance to:', balanceResult.balance);
          }
        }
      } else {
        console.log('No user data found in context');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = name => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  const handleShareApp = async () => {
    try {
      const result = await Share.share({
        message:
          'Check out this amazing shopping app! Download now and get the best deals.',
        url: 'https://play.google.com/store', // Replace with your actual app store URL
        title: 'Share EC Services App',
      });

      if (result.action === Share.sharedAction) {
        console.log('App shared successfully');
      }
    } catch (error) {
      console.error('Error sharing app:', error);
      Alert.alert('Error', 'Unable to share app at the moment.');
    }
  };

  const handleRateUs = async () => {
    try {
      const appStoreUrl = 'https://apps.apple.com/in/app/ec-services/id6751712659';
      const supported = await Linking.canOpenURL(appStoreUrl);
      
      if (supported) {
        await Linking.openURL(appStoreUrl);
      } else {
        Alert.alert('Error', 'Unable to open App Store. Please rate us manually.');
      }
    } catch (error) {
      console.error('Error opening App Store:', error);
      Alert.alert('Error', 'Unable to open App Store at the moment.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            // Clear user data using context
            await clearUserData();
            console.log('User logged out successfully');

            // Navigate to login screen
            navigation.navigate('Login');
          } catch (error) {
            console.error('Error during logout:', error);
            Alert.alert('Error', 'Unable to logout at the moment.');
          }
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };


  useEffect(() => {
    fetchUserData();
  }, [user]);

  // Add focus listener to refresh data when returning from Profile screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('More screen focused - refreshing user data');
      fetchUserData();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#EE2737']}
                tintColor="#EE2737"
            />
          }
        >
          <View style={styles.header}>
            {user ? (
              <>
                <View style={styles.profileContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {getInitials(user?.name || 'User')}
                    </Text>
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>
                      {user?.name || 'User'}
                    </Text>
                    <Text style={styles.profilePhone}>
                      {user?.mobile || user?.phone || 'N/A'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.editProfileButton}
                  onPress={() => navigation.navigate('Profile')}
                >
                  <Text style={styles.editProfileButtonText}>Edit Profile</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.loginContainer}>
                <View style={styles.profileContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>L</Text>
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>Welcome Guest</Text>
                    <Text style={styles.profilePhone}>Please login to continue</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {user && (
            <View style={styles.walletBalanceContainer}>
              <Text style={styles.walletBalanceText}>Wallet Balance</Text>
              <Text style={styles.walletBalanceAmount}>
                {loading ? 'Loading...' : `RM ${walletBalance.toFixed(2)}`}
              </Text>
            </View>
          )}

          <View style={styles.listContainer}>
            {menuItems.map((item, index) => (
              <ListItem
                key={index}
                icon={item.icon}
                label={item.label}
                onPress={item.onPress}
              />
            ))}
          </View>
        </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EE2737',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingBottom: 80, // Space for the bottom nav
  },
  header: {
    backgroundColor: '#EE2737',
    paddingHorizontal: 20,
    paddingVertical: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#EE2737',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  profileInfo: {},
  profileName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  profilePhone: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 2,
    fontFamily: 'Montserrat-Regular',
  },
  editProfileButton: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  editProfileButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  loginButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  loginButtonText: {
    color: '#EE2737',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
  walletBalanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  walletBalanceText: {
    fontSize: 17,
    color: '#EE2737',
    fontFamily: 'Montserrat-Regular',
  },
  walletBalanceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EE2737',
    fontFamily: 'Montserrat-Bold',
  },
  listContainer: {
    backgroundColor: '#FFFFFF',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  listItemIcon: {
    width: 24,
    height: 24,
    tintColor: '#666',
  },
  listItemText: {
    fontSize: 17,
    color: '#333',
    marginLeft: 20,
    fontFamily: 'Montserrat-Regular',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 8,
    paddingBottom: 5,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    fontFamily: 'Montserrat-Regular',
  },
  activeTabLabel: {
    color: '#EE2737',
  },
});

export default More;
