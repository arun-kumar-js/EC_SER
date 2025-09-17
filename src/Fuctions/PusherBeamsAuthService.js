import axios from 'axios';
import { API_BASE_URL, API_ACCESS_KEY } from '../config/config';
import { PUSHER_BEAMS_CONFIG } from '../config/PusherBeamsConfig';

/**
 * Pusher Beams Authentication Service
 * Handles authentication for Pusher Beams user-specific notifications
 */
class PusherBeamsAuthService {
  /**
   * Generate authentication token for Pusher Beams
   * This should be called from your backend server
   */
  async generateAuthToken(userId) {
    try {
      console.log('=== GENERATING PUSHER BEAMS AUTH TOKEN ===');
      console.log('User ID:', userId);

      const formdata = new FormData();
      formdata.append('generate-pusher-beams-token', '1');
      formdata.append('accesskey', API_ACCESS_KEY);
      formdata.append('member_id', userId.toString());

      const response = await axios.post(`${API_BASE_URL}sections.php`, formdata, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000,
      });

      console.log('=== PUSHER BEAMS AUTH TOKEN RESPONSE ===');
      console.log('Response Status:', response.status);
      console.log('Response Data:', response.data);

      if (response.data && response.data.status === true) {
        return {
          success: true,
          token: response.data.token,
          message: response.data.message || 'Auth token generated successfully'
        };
      } else {
        return {
          success: false,
          token: null,
          message: response.data.message || 'Failed to generate auth token'
        };
      }
    } catch (error) {
      console.error('Error generating Pusher Beams auth token:', error);
      return {
        success: false,
        token: null,
        message: 'Network error occurred while generating auth token'
      };
    }
  }

  /**
   * Send notification to specific user
   * This should be called from your backend server
   */
  async sendNotificationToUser(userId, notification) {
    try {
      console.log('=== SENDING NOTIFICATION TO USER ===');
      console.log('User ID:', userId);
      console.log('Notification:', notification);

      const formdata = new FormData();
      formdata.append('send-pusher-notification', '1');
      formdata.append('accesskey', API_ACCESS_KEY);
      formdata.append('member_id', userId.toString());
      formdata.append('title', notification.title || '');
      formdata.append('body', notification.body || '');
      formdata.append('data', JSON.stringify(notification.data || {}));
      formdata.append('category', notification.category || 'general');

      const response = await axios.post(`${API_BASE_URL}sections.php`, formdata, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000,
      });

      console.log('=== SEND NOTIFICATION RESPONSE ===');
      console.log('Response Status:', response.status);
      console.log('Response Data:', response.data);

      if (response.data && response.data.status === true) {
        return {
          success: true,
          message: response.data.message || 'Notification sent successfully'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to send notification'
        };
      }
    } catch (error) {
      console.error('Error sending notification to user:', error);
      return {
        success: false,
        message: 'Network error occurred while sending notification'
      };
    }
  }

  /**
   * Send notification to interest group
   * This should be called from your backend server
   */
  async sendNotificationToInterest(interest, notification) {
    try {
      console.log('=== SENDING NOTIFICATION TO INTEREST ===');
      console.log('Interest:', interest);
      console.log('Notification:', notification);

      const formdata = new FormData();
      formdata.append('send-pusher-interest-notification', '1');
      formdata.append('accesskey', API_ACCESS_KEY);
      formdata.append('interest', interest);
      formdata.append('title', notification.title || '');
      formdata.append('body', notification.body || '');
      formdata.append('data', JSON.stringify(notification.data || {}));
      formdata.append('category', notification.category || 'general');

      const response = await axios.post(`${API_BASE_URL}sections.php`, formdata, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000,
      });

      console.log('=== SEND INTEREST NOTIFICATION RESPONSE ===');
      console.log('Response Status:', response.status);
      console.log('Response Data:', response.data);

      if (response.data && response.data.status === true) {
        return {
          success: true,
          message: response.data.message || 'Interest notification sent successfully'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to send interest notification'
        };
      }
    } catch (error) {
      console.error('Error sending notification to interest:', error);
      return {
        success: false,
        message: 'Network error occurred while sending interest notification'
      };
    }
  }

  /**
   * Get user's notification preferences
   */
  async getUserNotificationPreferences(userId) {
    try {
      console.log('=== GETTING USER NOTIFICATION PREFERENCES ===');
      console.log('User ID:', userId);

      const formdata = new FormData();
      formdata.append('get-notification-preferences', '1');
      formdata.append('accesskey', API_ACCESS_KEY);
      formdata.append('member_id', userId.toString());

      const response = await axios.post(`${API_BASE_URL}sections.php`, formdata, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000,
      });

      console.log('=== NOTIFICATION PREFERENCES RESPONSE ===');
      console.log('Response Status:', response.status);
      console.log('Response Data:', response.data);

      if (response.data && response.data.status === true) {
        return {
          success: true,
          preferences: response.data.preferences || {},
          message: response.data.message || 'Preferences fetched successfully'
        };
      } else {
        return {
          success: false,
          preferences: {},
          message: response.data.message || 'Failed to fetch preferences'
        };
      }
    } catch (error) {
      console.error('Error getting user notification preferences:', error);
      return {
        success: false,
        preferences: {},
        message: 'Network error occurred while fetching preferences'
      };
    }
  }

  /**
   * Update user's notification preferences
   */
  async updateUserNotificationPreferences(userId, preferences) {
    try {
      console.log('=== UPDATING USER NOTIFICATION PREFERENCES ===');
      console.log('User ID:', userId);
      console.log('Preferences:', preferences);

      const formdata = new FormData();
      formdata.append('update-notification-preferences', '1');
      formdata.append('accesskey', API_ACCESS_KEY);
      formdata.append('member_id', userId.toString());
      formdata.append('preferences', JSON.stringify(preferences));

      const response = await axios.post(`${API_BASE_URL}sections.php`, formdata, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000,
      });

      console.log('=== UPDATE PREFERENCES RESPONSE ===');
      console.log('Response Status:', response.status);
      console.log('Response Data:', response.data);

      if (response.data && response.data.status === true) {
        return {
          success: true,
          message: response.data.message || 'Preferences updated successfully'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to update preferences'
        };
      }
    } catch (error) {
      console.error('Error updating user notification preferences:', error);
      return {
        success: false,
        message: 'Network error occurred while updating preferences'
      };
    }
  }

  /**
   * Subscribe user to default interests
   */
  async subscribeUserToDefaultInterests(userId) {
    try {
      console.log('=== SUBSCRIBING USER TO DEFAULT INTERESTS ===');
      console.log('User ID:', userId);

      const formdata = new FormData();
      formdata.append('subscribe-default-interests', '1');
      formdata.append('accesskey', API_ACCESS_KEY);
      formdata.append('member_id', userId.toString());
      formdata.append('interests', JSON.stringify(PUSHER_BEAMS_CONFIG.DEFAULT_INTERESTS));

      const response = await axios.post(`${API_BASE_URL}sections.php`, formdata, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000,
      });

      console.log('=== SUBSCRIBE DEFAULT INTERESTS RESPONSE ===');
      console.log('Response Status:', response.status);
      console.log('Response Data:', response.data);

      if (response.data && response.data.status === true) {
        return {
          success: true,
          message: response.data.message || 'Subscribed to default interests successfully'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to subscribe to default interests'
        };
      }
    } catch (error) {
      console.error('Error subscribing user to default interests:', error);
      return {
        success: false,
        message: 'Network error occurred while subscribing to default interests'
      };
    }
  }

  /**
   * Unsubscribe user from all interests
   */
  async unsubscribeUserFromAllInterests(userId) {
    try {
      console.log('=== UNSUBSCRIBING USER FROM ALL INTERESTS ===');
      console.log('User ID:', userId);

      const formdata = new FormData();
      formdata.append('unsubscribe-all-interests', '1');
      formdata.append('accesskey', API_ACCESS_KEY);
      formdata.append('member_id', userId.toString());

      const response = await axios.post(`${API_BASE_URL}sections.php`, formdata, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000,
      });

      console.log('=== UNSUBSCRIBE ALL INTERESTS RESPONSE ===');
      console.log('Response Status:', response.status);
      console.log('Response Data:', response.data);

      if (response.data && response.data.status === true) {
        return {
          success: true,
          message: response.data.message || 'Unsubscribed from all interests successfully'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to unsubscribe from all interests'
        };
      }
    } catch (error) {
      console.error('Error unsubscribing user from all interests:', error);
      return {
        success: false,
        message: 'Network error occurred while unsubscribing from all interests'
      };
    }
  }
}

// Create singleton instance
const pusherBeamsAuthService = new PusherBeamsAuthService();

export default pusherBeamsAuthService;
