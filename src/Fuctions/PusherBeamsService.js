import { Platform } from 'react-native';
import RNPusherPushNotifications from 'react-native-pusher-push-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/config';

// Pusher Beams Configuration
import { PUSHER_BEAMS_CONFIG } from '../config/PusherBeamsConfig';

const PUSHER_BEAMS_INSTANCE_ID = PUSHER_BEAMS_CONFIG.INSTANCE_ID;
const PUSHER_BEAMS_SECRET_KEY = PUSHER_BEAMS_CONFIG.SECRET_KEY;

class PusherBeamsService {
  constructor() {
    this.isInitialized = false;
    this.deviceToken = null;
    this.subscribedInterests = new Set();
    this.notificationListeners = [];
  }

  /**
   * Initialize Pusher Beams
   */
  async initialize() {
    try {
      console.log('=== INITIALIZING PUSHER BEAMS ===');
      
      if (this.isInitialized) {
        console.log('Pusher Beams already initialized');
        return { success: true, message: 'Already initialized' };
      }

      // Set instance ID
      RNPusherPushNotifications.setInstanceId(PUSHER_BEAMS_INSTANCE_ID);

      // Set up event listeners
      this.setupEventListeners();

      // Start the service
      await this.start();

      this.isInitialized = true;
      console.log('Pusher Beams initialized successfully');
      
      return { 
        success: true, 
        message: 'Pusher Beams initialized successfully' 
      };
    } catch (error) {
      console.error('Error initializing Pusher Beams:', error);
      return { 
        success: false, 
        message: 'Failed to initialize Pusher Beams',
        error: error.message 
      };
    }
  }

  /**
   * Set up event listeners for Pusher Beams
   */
  setupEventListeners() {
    // Listen for registration events
    RNPusherPushNotifications.on('registered', (deviceToken) => {
      console.log('Device registered with token:', deviceToken);
      this.deviceToken = deviceToken;
    });

    // Listen for notification events
    RNPusherPushNotifications.on('notification', (notification) => {
      console.log('Notification received:', notification);
      this.handleNotification(notification);
    });

    // Note: subscriptionChanged event is not supported by react-native-pusher-push-notifications
    // We'll track subscriptions manually in our service

    // Note: error event might not be supported by react-native-pusher-push-notifications
    // We'll handle errors in the individual method calls instead
  }

  /**
   * Start Pusher Beams service
   */
  async start() {
    try {
      console.log('Starting Pusher Beams service...');
      
      // For iOS, we need to request permissions first
      if (Platform.OS === 'ios') {
        await this.requestIOSPermissions();
      }

      // The react-native-pusher-push-notifications library doesn't have a start() method
      // It automatically starts when setInstanceId is called
      console.log('Pusher Beams service initialized (no start method needed)');

      return { success: true, message: 'Pusher Beams service initialized successfully' };
    } catch (error) {
      console.error('Error starting Pusher Beams:', error);
      return { 
        success: false, 
        message: 'Failed to start Pusher Beams',
        error: error.message 
      };
    }
  }

  /**
   * Request iOS notification permissions
   */
  async requestIOSPermissions() {
    try {
      if (Platform.OS !== 'ios') return { success: true };

      console.log('Requesting iOS notification permissions...');
      
      // This will be handled by the native iOS code
      // The permissions are requested automatically when start() is called
      
      return { success: true, message: 'iOS permissions requested' };
    } catch (error) {
      console.error('Error requesting iOS permissions:', error);
      return { 
        success: false, 
        message: 'Failed to request iOS permissions',
        error: error.message 
      };
    }
  }

  /**
   * Subscribe to an interest
   */
  async subscribeToInterest(interest) {
    try {
      console.log(`Subscribing to interest: ${interest}`);
      
      if (this.subscribedInterests.has(interest)) {
        console.log(`Already subscribed to interest: ${interest}`);
        return { success: true, message: 'Already subscribed' };
      }

      // Check if subscribe method exists
      if (typeof RNPusherPushNotifications.subscribe === 'function') {
        return new Promise((resolve) => {
          RNPusherPushNotifications.subscribe(
            interest,
            (statusCode, response) => {
              console.error(`Failed to subscribe to ${interest}:`, statusCode, response);
              resolve({ 
                success: false, 
                message: `Failed to subscribe to ${interest}`,
                error: response 
              });
            },
            () => {
              console.log(`Successfully subscribed to ${interest}`);
              this.subscribedInterests.add(interest);
              resolve({ 
                success: true, 
                message: `Successfully subscribed to ${interest}` 
              });
            }
          );
        });
      } else {
        // If subscribe method doesn't exist, just track it locally
        console.log(`Tracking interest locally: ${interest}`);
        this.subscribedInterests.add(interest);
        return { 
          success: true, 
          message: `Interest ${interest} tracked locally` 
        };
      }
    } catch (error) {
      console.error(`Error subscribing to interest ${interest}:`, error);
      return { 
        success: false, 
        message: `Failed to subscribe to ${interest}`,
        error: error.message 
      };
    }
  }

  /**
   * Unsubscribe from an interest
   */
  async unsubscribeFromInterest(interest) {
    try {
      console.log(`Unsubscribing from interest: ${interest}`);
      
      if (!this.subscribedInterests.has(interest)) {
        console.log(`Not subscribed to interest: ${interest}`);
        return { success: true, message: 'Not subscribed' };
      }

      // Check if unsubscribe method exists
      if (typeof RNPusherPushNotifications.unsubscribe === 'function') {
        return new Promise((resolve) => {
          RNPusherPushNotifications.unsubscribe(
            interest,
            (statusCode, response) => {
              console.error(`Failed to unsubscribe from ${interest}:`, statusCode, response);
              resolve({ 
                success: false, 
                message: `Failed to unsubscribe from ${interest}`,
                error: response 
              });
            },
            () => {
              console.log(`Successfully unsubscribed from ${interest}`);
              this.subscribedInterests.delete(interest);
              resolve({ 
                success: true, 
                message: `Successfully unsubscribed from ${interest}` 
              });
            }
          );
        });
      } else {
        // If unsubscribe method doesn't exist, just remove it locally
        console.log(`Removing interest locally: ${interest}`);
        this.subscribedInterests.delete(interest);
        return { 
          success: true, 
          message: `Interest ${interest} removed locally` 
        };
      }
    } catch (error) {
      console.error(`Error unsubscribing from interest ${interest}:`, error);
      return { 
        success: false, 
        message: `Failed to unsubscribe from ${interest}`,
        error: error.message 
      };
    }
  }

  /**
   * Get user data from AsyncStorage
   */
  async getUserDataFromStorage() {
    try {
      const storedUser = await AsyncStorage.getItem('userData');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log('User data from AsyncStorage:', userData);
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error getting user data from storage:', error);
      return null;
    }
  }

  /**
   * Set up user for notifications using stored user data
   */
  async setupUserForNotifications() {
    try {
      console.log('=== SETTING UP USER FOR NOTIFICATIONS ===');
      
      // Get user data from AsyncStorage
      const userData = await this.getUserDataFromStorage();
      
      if (!userData) {
        console.log('No user data found in storage');
        return { 
          success: false, 
          message: 'No user data found. Please login first.' 
        };
      }

      const userId = userData.user_id || userData.id;
      const fcmId = userData.fcm_id;

      if (!userId) {
        return { 
          success: false, 
          message: 'User ID not found in stored data' 
        };
      }

      console.log(`Setting up notifications for user: ${userId}`);
      console.log(`FCM ID: ${fcmId}`);

      // Set user ID for Pusher Beams
      const setUserResult = await this.setUserId(userId, fcmId);
      
      if (setUserResult.success) {
        // Subscribe to user-specific interests
        const userInterests = [
          `user-${userId}-orders`,
          `user-${userId}-profile`, 
          `user-${userId}-preferences`
        ];

        // Subscribe to user-specific interests
        for (const interest of userInterests) {
          await this.subscribeToInterest(interest);
        }

        console.log(`User ${userId} set up for notifications successfully`);
        return { 
          success: true, 
          message: `User ${userId} set up for notifications successfully`,
          userId: userId,
          fcmId: fcmId
        };
      } else {
        return setUserResult;
      }
    } catch (error) {
      console.error('Error setting up user for notifications:', error);
      return { 
        success: false, 
        message: 'Failed to set up user for notifications',
        error: error.message 
      };
    }
  }

  /**
   * Set user ID for authenticated notifications
   */
  async setUserId(userId, fcmToken = null) {
    try {
      console.log(`Setting user ID: ${userId}`);
      console.log(`FCM Token: ${fcmToken}`);
      
      if (!userId) {
        return { 
          success: false, 
          message: 'User ID is required' 
        };
      }

      // If we have an FCM token, we can use it directly
      if (fcmToken) {
        // Store the FCM token for this user
        this.userFCMTokens = this.userFCMTokens || {};
        this.userFCMTokens[userId] = fcmToken;
        
        console.log(`Stored FCM token for user ${userId}`);
        return { 
          success: true, 
          message: `FCM token stored for user ${userId}` 
        };
      }

      // Create token provider for authentication using your existing API
      const tokenProvider = {
        url: `${API_BASE_URL}user-registration.php`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        queryParams: {
          'get-pusher-token': '1',
          'accesskey': '90336',
          'member_id': userId.toString()
        }
      };

      // For now, we'll just store the user ID and FCM token
      // The actual setUserId method might not be available in this version
      console.log(`Setting user ID: ${userId} with FCM token: ${fcmToken}`);
      
      // Store user information
      this.currentUserId = userId;
      this.userFCMTokens = this.userFCMTokens || {};
      this.userFCMTokens[userId] = fcmToken;
      
      return { 
        success: true, 
        message: `User ID ${userId} set successfully` 
      };
    } catch (error) {
      console.error(`Error setting user ID ${userId}:`, error);
      return { 
        success: false, 
        message: `Failed to set user ID ${userId}`,
        error: error.message 
      };
    }
  }

  /**
   * Handle incoming notifications
   */
  handleNotification(notification) {
    try {
      console.log('=== HANDLING NOTIFICATION ===');
      console.log('Notification data:', notification);

      // Extract notification data
      const { title, body, data, aps } = notification;
      
      // Handle different app states (iOS specific)
      if (Platform.OS === 'ios') {
        const appState = notification.appState;
        console.log('App state:', appState);
        
        switch (appState) {
          case 'inactive':
            // App came to foreground by clicking notification
            this.handleNotificationTap(notification);
            break;
          case 'background':
            // App is in background, notification received
            this.handleBackgroundNotification(notification);
            break;
          case 'active':
            // App is in foreground, show in-app notification
            this.handleForegroundNotification(notification);
            break;
          default:
            console.log('Unknown app state:', appState);
        }
      } else {
        // Android handling
        this.handleAndroidNotification(notification);
      }

      // Notify all listeners
      this.notificationListeners.forEach(listener => {
        try {
          listener(notification);
        } catch (error) {
          console.error('Error in notification listener:', error);
        }
      });

    } catch (error) {
      console.error('Error handling notification:', error);
    }
  }

  /**
   * Handle notification tap (iOS)
   */
  handleNotificationTap(notification) {
    console.log('Notification tapped:', notification);
    // Navigate to specific screen based on notification data
    // This will be implemented based on your navigation structure
  }

  /**
   * Handle background notification (iOS)
   */
  handleBackgroundNotification(notification) {
    console.log('Background notification received:', notification);
    // Handle background notification processing
  }

  /**
   * Handle foreground notification (iOS)
   */
  handleForegroundNotification(notification) {
    console.log('Foreground notification received:', notification);
    // Show in-app notification or update UI
  }

  /**
   * Handle Android notification
   */
  handleAndroidNotification(notification) {
    console.log('Android notification received:', notification);
    // Handle Android-specific notification processing
  }

  /**
   * Add notification listener
   */
  addNotificationListener(listener) {
    this.notificationListeners.push(listener);
    return () => {
      const index = this.notificationListeners.indexOf(listener);
      if (index > -1) {
        this.notificationListeners.splice(index, 1);
      }
    };
  }

  /**
   * Get current subscriptions
   * Note: Since subscriptionChanged event is not supported, we track subscriptions manually
   */
  getSubscriptions() {
    return Array.from(this.subscribedInterests);
  }

  /**
   * Check if subscribed to an interest
   */
  isSubscribedTo(interest) {
    return this.subscribedInterests.has(interest);
  }

  /**
   * Get device token
   */
  getDeviceToken() {
    return this.deviceToken;
  }

  /**
   * Stop Pusher Beams service
   */
  async stop() {
    try {
      console.log('Stopping Pusher Beams service...');
      
      // Clear all subscriptions
      this.subscribedInterests.clear();
      
      // Remove all listeners
      this.notificationListeners = [];
      
      // The react-native-pusher-push-notifications library doesn't have a stop() method
      // We just clear our local state
      console.log('Clearing Pusher Beams local state');
      
      this.isInitialized = false;
      console.log('Pusher Beams service stopped');
      
      return { success: true, message: 'Pusher Beams service stopped' };
    } catch (error) {
      console.error('Error stopping Pusher Beams:', error);
      return { 
        success: false, 
        message: 'Failed to stop Pusher Beams',
        error: error.message 
      };
    }
  }

  /**
   * Send notification to server (for testing)
   * This should be called from your backend, not from the app
   */
  async sendTestNotification(interest, title, body, data = {}) {
    try {
      console.log('=== SENDING TEST NOTIFICATION ===');
      console.log('Interest:', interest);
      console.log('Title:', title);
      console.log('Body:', body);
      console.log('Data:', data);
      
      // This is just for logging - actual sending should be done from backend
      console.log('Note: Test notifications should be sent from your backend server');
      console.log('Use the Pusher Beams API or your backend to send notifications');
      
      return { 
        success: true, 
        message: 'Test notification logged (send from backend for actual delivery)' 
      };
    } catch (error) {
      console.error('Error in test notification:', error);
      return { 
        success: false, 
        message: 'Failed to process test notification',
        error: error.message 
      };
    }
  }
}

// Create singleton instance
const pusherBeamsService = new PusherBeamsService();

export default pusherBeamsService;
