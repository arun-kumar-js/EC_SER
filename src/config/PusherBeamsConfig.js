// Pusher Beams Configuration
// Replace these with your actual Pusher Beams credentials

export const PUSHER_BEAMS_CONFIG = {
  // Your Pusher Beams Instance ID
  // Get this from your Pusher Beams dashboard
  INSTANCE_ID: '45642a5a-5177-4a5e-aeaa-024d4f7bcf84',
  
  // Your Pusher Beams Secret Key
  // Get this from your Pusher Beams dashboard
  SECRET_KEY: 'YOUR_PUSHER_BEAMS_SECRET_KEY',
  
  // Default interests to subscribe to
  DEFAULT_INTERESTS: [
    'general',           // General notifications
    'orders',            // Order-related notifications
    'promotions',        // Promotional notifications
    'updates'            // App updates and maintenance
  ],
  
  // User-specific interests (will be prefixed with user ID)
  USER_INTERESTS: [
    'user-orders',       // User's order notifications
    'user-profile',      // User profile updates
    'user-preferences'   // User preference notifications
  ],
  
  // Notification categories
  NOTIFICATION_CATEGORIES: {
    ORDER: 'order',
    PROMOTION: 'promotion',
    UPDATE: 'update',
    GENERAL: 'general',
    SYSTEM: 'system'
  },
  
  // Deep link patterns for different notification types
  DEEP_LINKS: {
    ORDER: 'ecservices://order/',
    PRODUCT: 'ecservices://product/',
    PROFILE: 'ecservices://profile/',
    CART: 'ecservices://cart/',
    NOTIFICATIONS: 'ecservices://notifications/'
  }
};

// Helper function to get user-specific interest name
export const getUserInterest = (userId, interest) => {
  return `user-${userId}-${interest}`;
};

// Helper function to get all user interests
export const getUserInterests = (userId) => {
  return PUSHER_BEAMS_CONFIG.USER_INTERESTS.map(interest => 
    getUserInterest(userId, interest)
  );
};

// Helper function to get all interests for a user
export const getAllUserInterests = (userId) => {
  return [
    ...PUSHER_BEAMS_CONFIG.DEFAULT_INTERESTS,
    ...getUserInterests(userId)
  ];
};

export default PUSHER_BEAMS_CONFIG;
