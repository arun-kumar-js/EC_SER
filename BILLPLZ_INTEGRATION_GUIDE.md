# 🚀 Billplz Integration Fix Guide

## ❌ **Current Problem**
Your WebView is showing the PHP API endpoint URL instead of the actual Billplz payment page:
- **Wrong**: `https://spiderekart.in/ec_service/api-firebase/billplz-payment-gateway.php?accesskey=...`
- **Should show**: `https://billplz.com/...` (actual Billplz payment page)

## ✅ **Solution Implemented**

### 1. **Frontend Fixed** (`BillplzWebView.js`)
- ✅ Updated to call PHP backend first
- ✅ Parse response to get Billplz payment URL
- ✅ Redirect WebView to actual Billplz page
- ✅ Better error handling and retry functionality

### 2. **Backend Required** (`billplz-payment-gateway.php`)
You need to update your PHP backend to:
1. **Receive** the request parameters
2. **Call** Billplz API to create a bill
3. **Return** the Billplz payment URL
4. **Handle** errors properly

## 🔧 **What You Need to Do**

### **Step 1: Update Your PHP Backend**
Replace your current `billplz-payment-gateway.php` with the example provided in `BILLPLZ_PHP_BACKEND_EXAMPLE.php`

**Key Changes Required:**
```php
// 1. Add Billplz API configuration
$BILLPLZ_CONFIG = [
    'API_KEY' => 'd43afc10-6e24-41c7-84be-61a9a89c0ba9',
    'COLLECTION_ID' => 'YOUR_ACTUAL_COLLECTION_ID_HERE', // ← UPDATE THIS
    'X_SIGNATURE' => 'YOUR_X_SIGNATURE_KEY_HERE', // ← UPDATE THIS
    'ENVIRONMENT' => 'sandbox', // Change to 'production' when ready
    'CALLBACK_URL' => 'https://your-domain.com/billplz-callback',
    'REDIRECT_URL' => 'https://your-domain.com/billplz-redirect'
];

// 2. Call Billplz API to create bill
$billData = [
    'collection_id' => $BILLPLZ_CONFIG['COLLECTION_ID'],
    'description' => "Order #{$orderId} - Spider Ekart",
    'email' => $customerEmail,
    'name' => $customerName,
    'amount' => intval($amount), // Amount in cents
    'callback_url' => $BILLPLZ_CONFIG['CALLBACK_URL'],
    'redirect_url' => $BILLPLZ_CONFIG['REDIRECT_URL']
];

// 3. Return Billplz payment URL
echo json_encode([
    'success' => true,
    'billplz_url' => $billplzResponse['url'], // ← This is what the WebView needs
    'bill_id' => $billplzResponse['id'],
    'message' => 'Bill created successfully'
]);
```

### **Step 2: Get Your Billplz Collection ID**
1. Log into [Billplz Dashboard](https://www.billplz.com/)
2. Go to **Collections** → **Create New Collection**
3. Set collection name (e.g., "Spider Ekart Orders")
4. Copy the **Collection ID**
5. Update `COLLECTION_ID` in your PHP file

### **Step 3: Set Up Webhook URLs**
Update these URLs in your PHP config:
- `CALLBACK_URL`: Where Billplz sends payment status updates
- `REDIRECT_URL`: Where customers return after payment

## 🔄 **How It Works Now**

### **Before (Broken):**
```
App → WebView → PHP API URL (shows PHP script)
```

### **After (Fixed):**
```
App → PHP Backend → Billplz API → Get Payment URL → WebView → Billplz Payment Page
```

### **Flow:**
1. ✅ User selects Billplz payment
2. ✅ App calls your PHP backend
3. ✅ PHP creates Billplz bill via API
4. ✅ PHP returns Billplz payment URL
5. ✅ WebView redirects to actual Billplz page
6. ✅ User completes payment on Billplz
7. ✅ Billplz redirects back to your app

## 🧪 **Testing**

### **1. Test PHP Backend First**
```bash
# Test with curl
curl "https://spiderekart.in/ec_service/api-firebase/billplz-payment-gateway.php?accesskey=90336&type=create-bill&order_id=TEST123&amount=1000&customer_name=Test&customer_email=test@example.com"
```

**Expected Response:**
```json
{
  "success": true,
  "billplz_url": "https://billplz-sandbox.com/bills/...",
  "bill_id": "bill_123",
  "message": "Bill created successfully"
}
```

### **2. Test in App**
- Create a test order
- Select Billplz payment
- Should see Billplz payment page (not PHP script)

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Collection not found"**
- **Solution**: Check Collection ID in PHP config
- **Verify**: Log into Billplz dashboard

### **Issue 2: "Unauthorized"**
- **Solution**: Verify API key is correct
- **Check**: `d43afc10-6e24-41c7-84be-61a9a89c0ba9`

### **Issue 3: "Invalid amount"**
- **Solution**: Ensure amount is in cents
- **Example**: RM 10.00 = 1000 cents

### **Issue 4: Still showing PHP script**
- **Solution**: Check PHP backend is returning JSON
- **Debug**: Use browser dev tools to see response

## 📱 **App Status**

### **✅ Fixed:**
- WebView module linking (`RNCWebViewModule`)
- Frontend logic for API calls
- Error handling and retry functionality
- Payment completion detection

### **🔄 Pending:**
- PHP backend update
- Billplz Collection ID setup
- Webhook URL configuration

## 🎯 **Next Steps**

1. **Update** your `billplz-payment-gateway.php` with the example code
2. **Get** your Billplz Collection ID
3. **Configure** webhook URLs
4. **Test** the integration
5. **Switch** to production when ready

## 📞 **Support**

- **Billplz API Docs**: [https://www.billplz.com/api/](https://www.billplz.com/api/)
- **Your API Key**: `d43afc10-6e24-41c7-84be-61a9a89c0ba9`
- **Environment**: Sandbox (Development)

---

**Status**: Frontend Fixed ✅ | Backend Update Required 🔄
**Priority**: High - Payment flow broken without this fix
