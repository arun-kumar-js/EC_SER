# Pusher Beams Setup Guide for EC Services

## Overview
This guide will help you complete the setup of Pusher Beams push notifications for your React Native app.

## ✅ What's Already Done

1. **Pusher Beams SDK Installed** - `react-native-pusher-push-notifications` package
2. **Service Created** - `PusherBeamsService.js` with full functionality
3. **Configuration** - `PusherBeamsConfig.js` with your Instance ID
4. **iOS Setup** - AppDelegate updated for push notifications
5. **Android Setup** - Gradle files updated for FCM
6. **App Integration** - Main App.tsx updated
7. **Helper Functions** - `PusherBeamsHelper.js` for easy usage

## 🔧 Required Setup Steps

### 1. Get Your Pusher Beams Secret Key

You already have your Instance ID: `45642a5a-5177-4a5e-aeaa-024d4f7bcf84`

Now you need to get your Secret Key:

1. Go to [Pusher Dashboard](https://dashboard.pusher.com)
2. Navigate to **Beams** → Your Instance
3. Go to **Settings** or **Keys** section
4. Copy the **Secret Key** (starts with `sk_test_` or `sk_live_`)

### 2. Update Configuration

Update `/src/config/PusherBeamsConfig.js`:

```javascript
export const PUSHER_BEAMS_CONFIG = {
  INSTANCE_ID: '45642a5a-5177-4a5e-aeaa-024d4f7bcf84', // ✅ Already set
  SECRET_KEY: 'YOUR_SECRET_KEY_HERE', // ⚠️ Replace this
  // ... rest of config
};
```

### 3. iOS Setup (Required for iOS)

#### 3.1 Configure APNs in Pusher Dashboard
1. Go to your Pusher Beams instance
2. Navigate to **iOS** section
3. Upload your iOS certificate or key:
   - **Development**: Upload your development certificate
   - **Production**: Upload your production certificate

#### 3.2 Enable Push Notifications in Xcode
1. Open your project in Xcode
2. Select your target
3. Go to **Signing & Capabilities**
4. Add **Push Notifications** capability
5. Add **Background Modes** capability
6. Enable **Remote notifications**

### 4. Android Setup (Required for Android)

#### 4.1 Set up Firebase
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use existing
3. Add Android app with package name: `com.ec_services`
4. Download `google-services.json`
5. Place it in `android/app/google-services.json`

#### 4.2 Get FCM Server Key
1. In Firebase Console → Project Settings
2. Go to **Cloud Messaging** tab
3. Copy the **Server Key**

#### 4.3 Configure FCM in Pusher Dashboard
1. Go to your Pusher Beams instance
2. Navigate to **Android** section
3. Add your FCM Server Key

### 5. Backend Integration (Optional but Recommended)

Add these endpoints to your backend API:

#### 5.1 Get Pusher Auth Token
```php
// In your user-registration.php or create new endpoint
if (isset($_POST['get-pusher-token'])) {
    $userId = $_POST['member_id'];
    
    // Generate JWT token for Pusher Beams
    $token = generatePusherToken($userId);
    
    echo json_encode([
        'status' => true,
        'token' => $token,
        'message' => 'Token generated successfully'
    ]);
}
```

#### 5.2 Send Notification to User
```php
// Create new endpoint: send-notification.php
if (isset($_POST['send-notification'])) {
    $userId = $_POST['user_id'];
    $title = $_POST['title'];
    $body = $_POST['body'];
    $data = json_decode($_POST['data'], true);
    
    // Send notification via Pusher Beams API
    $result = sendPusherNotification($userId, $title, $body, $data);
    
    echo json_encode($result);
}
```

## 🚀 How to Use

### 1. Basic Usage (Already Integrated)

The app will automatically:
- Initialize Pusher Beams on startup
- Subscribe to default interests
- Set up user notifications if logged in
- Handle incoming notifications

### 2. Manual Usage

```javascript
import { setupUserNotifications, sendTestNotification } from './src/Fuctions/PusherBeamsHelper';

// Set up notifications when user logs in
const result = await setupUserNotifications();

// Send test notification
await sendTestNotification();
```

### 3. User-Specific Notifications

When a user logs in, they will be subscribed to:
- `user-{userId}-orders` - Order notifications
- `user-{userId}-profile` - Profile updates
- `user-{userId}-preferences` - Preference changes

Plus default interests:
- `general` - General app notifications
- `orders` - Order-related notifications
- `promotions` - Promotional notifications
- `updates` - App updates

## 🧪 Testing

### 1. Test from Pusher Dashboard
1. Go to your Pusher Beams instance
2. Navigate to **Debug Console**
3. Send a test notification to `general` interest

### 2. Test from Your App
```javascript
import { sendTestNotification } from './src/Fuctions/PusherBeamsHelper';

// Send test notification
await sendTestNotification();
```

### 3. Test User-Specific Notifications
Send notification to user-specific interest:
- `user-5-orders` (for user ID 5)
- `user-5-profile` (for user ID 5)

## 📱 Notification Handling

### Foreground Notifications
- Will be logged to console
- Can be customized in `PusherBeamsService.js`

### Background Notifications
- Will show as system notifications
- Tapping will trigger navigation (if configured)

### Deep Linking
Configure deep links in notification data:
```javascript
{
  "title": "New Order",
  "body": "Your order #12345 is confirmed",
  "data": {
    "screen": "OrderDetails",
    "orderId": "12345"
  }
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Notifications not received**
   - Check if Secret Key is correct
   - Verify APNs/FCM configuration
   - Check device permissions

2. **iOS build errors**
   - Make sure Push Notifications capability is enabled
   - Check if certificate is valid
   - Clean and rebuild project

3. **Android build errors**
   - Verify `google-services.json` is in correct location
   - Check if FCM Server Key is correct
   - Clean and rebuild project

### Debug Logs

Check console logs for:
- `=== INITIALIZING PUSHER BEAMS ===`
- `=== SETTING UP USER NOTIFICATIONS ===`
- `Notification received in App:`

## 📋 Next Steps

1. **Get Secret Key** from Pusher Dashboard
2. **Update configuration** with Secret Key
3. **Set up APNs** for iOS (if needed)
4. **Set up FCM** for Android (if needed)
5. **Test notifications** from dashboard
6. **Integrate with login flow** (optional)

## 📞 Support

If you need help:
1. Check Pusher Beams documentation
2. Check console logs for errors
3. Verify all configuration steps
4. Test with simple notifications first

---

**Note**: The app is already configured to work with your existing user data system. It will automatically use the `fcm_id` from your stored user data for notifications.
