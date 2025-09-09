import axios from 'axios';
import { API_BASE_URL, API_ACCESS_KEY } from '../config/config';

// Get notification list API
export const getNotificationList = async (userId) => {
  try {
    console.log('=== FETCHING NOTIFICATION LIST ===');
    console.log('User ID:', userId);
    
    const formdata = new FormData();
    formdata.append('get-notifications', '1');
    formdata.append('accesskey', '90336');
    formdata.append('member_id', userId.toString());

    console.log('Request URL:', `${API_BASE_URL}sections.php`);
    console.log('Request Data:', formdata);

    const response = await axios.post(`${API_BASE_URL}sections.php`, formdata, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 10000, // 10 second timeout
    });

    console.log('=== NOTIFICATION API RESPONSE ===');
    console.log('Response Status:', response.status);
    console.log('Response Data:', response.data);

    if (response.data && response.data.status === true) {
      return {
        success: true,
        data: response.data.data || [],
        imageUrl: response.data.image_url || '',
        message: response.data.message || 'Notifications fetched successfully'
      };
    } else {
      return {
        success: false,
        data: [],
        message: response.data.message || 'Failed to fetch notifications'
      };
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return {
      success: false,
      data: [],
      message: 'Network error occurred while fetching notifications'
    };
  }
};

// Mark notification as read (if API supports it)
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    console.log('=== MARKING NOTIFICATION AS READ ===');
    console.log('Notification ID:', notificationId);
    console.log('User ID:', userId);

    const formdata = new FormData();
    formdata.append('mark-notification-read', '1');
    formdata.append('accesskey', '90336');
    formdata.append('notification_id', notificationId.toString());
    formdata.append('member_id', userId.toString());

    const response = await axios.post(`${API_BASE_URL}sections.php`, formdata, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 10000, // 10 second timeout
    });

    console.log('=== MARK NOTIFICATION READ RESPONSE ===');
    console.log('Response Status:', response.status);
    console.log('Response Data:', response.data);

    if (response.data && response.data.status === true) {
      return {
        success: true,
        message: response.data.message || 'Notification marked as read'
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Failed to mark notification as read'
      };
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return {
      success: false,
      message: 'Network error occurred while marking notification as read'
    };
  }
};

// Get notification count (if API supports it)
export const getNotificationCount = async (userId) => {
  try {
    console.log('=== FETCHING NOTIFICATION COUNT ===');
    console.log('User ID:', userId);

    const formdata = new FormData();
    formdata.append('get-notification-count', '1');
    formdata.append('accesskey', '90336');
    formdata.append('member_id', userId.toString());

    const response = await axios.post(`${API_BASE_URL}sections.php`, formdata, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 10000, // 10 second timeout
    });

    console.log('=== NOTIFICATION COUNT RESPONSE ===');
    console.log('Response Status:', response.status);
    console.log('Response Data:', response.data);

    if (response.data && response.data.status === true) {
      return {
        success: true,
        count: response.data.count || 0,
        message: response.data.message || 'Notification count fetched successfully'
      };
    } else {
      return {
        success: false,
        count: 0,
        message: response.data.message || 'Failed to fetch notification count'
      };
    }
  } catch (error) {
    console.error('Error fetching notification count:', error);
    return {
      success: false,
      count: 0,
      message: 'Network error occurred while fetching notification count'
    };
  }
};
