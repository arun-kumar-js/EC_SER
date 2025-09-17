import pusherBeamsService from './PusherBeamsService';
import { PUSHER_BEAMS_CONFIG } from '../config/PusherBeamsConfig';

/**
 * Helper functions for Pusher Beams integration
 * Use these functions throughout your app to manage notifications
 */

/**
 * Set up notifications when user logs in
 * Call this function after successful login
 */
export const setupUserNotifications = async () => {
  try {
    console.log('=== SETTING UP USER NOTIFICATIONS ===');
    
    const result = await pusherBeamsService.setupUserForNotifications();
    
    if (result.success) {
      console.log('✅ User notifications set up successfully');
      console.log(`User ID: ${result.userId}`);
      console.log(`FCM ID: ${result.fcmId}`);
    } else {
      console.log('❌ Failed to set up user notifications:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('Error setting up user notifications:', error);
    return {
      success: false,
      message: 'Failed to set up user notifications',
      error: error.message
    };
  }
};

/**
 * Send notification to specific user
 * Call this from your backend or admin panel
 */
export const sendNotificationToUser = async (userId, notification) => {
  try {
    console.log(`=== SENDING NOTIFICATION TO USER ${userId} ===`);
    console.log('Notification:', notification);
    
    // This would typically be called from your backend
    // For now, we'll just log it
    console.log('Notification should be sent from backend to user:', userId);
    console.log('Notification data:', notification);
    
    return {
      success: true,
      message: 'Notification queued for sending'
    };
  } catch (error) {
    console.error('Error sending notification to user:', error);
    return {
      success: false,
      message: 'Failed to send notification',
      error: error.message
    };
  }
};

/**
 * Send notification to interest group
 * Call this from your backend or admin panel
 */
export const sendNotificationToInterest = async (interest, notification) => {
  try {
    console.log(`=== SENDING NOTIFICATION TO INTEREST ${interest} ===`);
    console.log('Notification:', notification);
    
    // This would typically be called from your backend
    // For now, we'll just log it
    console.log('Notification should be sent from backend to interest:', interest);
    console.log('Notification data:', notification);
    
    return {
      success: true,
      message: 'Notification queued for sending'
    };
  } catch (error) {
    console.error('Error sending notification to interest:', error);
    return {
      success: false,
      message: 'Failed to send notification',
      error: error.message
    };
  }
};

/**
 * Subscribe to additional interests
 * Call this when user wants to subscribe to specific topics
 */
export const subscribeToInterest = async (interest) => {
  try {
    console.log(`=== SUBSCRIBING TO INTEREST: ${interest} ===`);
    
    const result = await pusherBeamsService.subscribeToInterest(interest);
    
    if (result.success) {
      console.log(`✅ Successfully subscribed to ${interest}`);
    } else {
      console.log(`❌ Failed to subscribe to ${interest}:`, result.message);
    }
    
    return result;
  } catch (error) {
    console.error(`Error subscribing to interest ${interest}:`, error);
    return {
      success: false,
      message: `Failed to subscribe to ${interest}`,
      error: error.message
    };
  }
};

/**
 * Unsubscribe from interest
 * Call this when user wants to unsubscribe from specific topics
 */
export const unsubscribeFromInterest = async (interest) => {
  try {
    console.log(`=== UNSUBSCRIBING FROM INTEREST: ${interest} ===`);
    
    const result = await pusherBeamsService.unsubscribeFromInterest(interest);
    
    if (result.success) {
      console.log(`✅ Successfully unsubscribed from ${interest}`);
    } else {
      console.log(`❌ Failed to unsubscribe from ${interest}:`, result.message);
    }
    
    return result;
  } catch (error) {
    console.error(`Error unsubscribing from interest ${interest}:`, error);
    return {
      success: false,
      message: `Failed to unsubscribe from ${interest}`,
      error: error.message
    };
  }
};

/**
 * Get current subscriptions
 */
export const getCurrentSubscriptions = () => {
  try {
    const subscriptions = pusherBeamsService.getSubscriptions();
    console.log('Current subscriptions:', subscriptions);
    return {
      success: true,
      subscriptions: subscriptions
    };
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    return {
      success: false,
      subscriptions: [],
      error: error.message
    };
  }
};

/**
 * Test notification (for development)
 * This sends a test notification to the 'general' interest
 */
export const sendTestNotification = async () => {
  try {
    console.log('=== SENDING TEST NOTIFICATION ===');
    
    const testNotification = {
      title: 'Test Notification',
      body: 'This is a test notification from EC Services',
      data: {
        screen: 'Home',
        test: true
      }
    };
    
    const result = await pusherBeamsService.sendTestNotification('general', testNotification.title, testNotification.body, testNotification.data);
    
    if (result.success) {
      console.log('✅ Test notification sent successfully');
    } else {
      console.log('❌ Failed to send test notification:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return {
      success: false,
      message: 'Failed to send test notification',
      error: error.message
    };
  }
};

/**
 * Clear all notifications (logout)
 * Call this when user logs out
 */
export const clearUserNotifications = async () => {
  try {
    console.log('=== CLEARING USER NOTIFICATIONS ===');
    
    // Unsubscribe from all user-specific interests
    const subscriptions = pusherBeamsService.getSubscriptions();
    const userInterests = subscriptions.filter(interest => interest.startsWith('user-'));
    
    for (const interest of userInterests) {
      await pusherBeamsService.unsubscribeFromInterest(interest);
    }
    
    console.log('✅ User notifications cleared');
    
    return {
      success: true,
      message: 'User notifications cleared successfully'
    };
  } catch (error) {
    console.error('Error clearing user notifications:', error);
    return {
      success: false,
      message: 'Failed to clear user notifications',
      error: error.message
    };
  }
};

export default {
  setupUserNotifications,
  sendNotificationToUser,
  sendNotificationToInterest,
  subscribeToInterest,
  unsubscribeFromInterest,
  getCurrentSubscriptions,
  sendTestNotification,
  clearUserNotifications
};
