# Billplz Payment Integration Setup Guide

## 🔑 API Configuration

Your Billplz API key has been configured: `d43afc10-6e24-41c7-84be-61a9a89c0ba9`

## 📋 Required Setup Steps

### 1. Create Collection in Billplz Dashboard

- Log into your [Billplz Dashboard](https://www.billplz.com/)
- Go to Collections → Create New Collection
- Set collection name (e.g., "Spider Ekart Orders")
- Copy the Collection ID and update `src/config/billplz.js`

### 2. Update Configuration

Edit `src/config/billplz.js`:

```javascript
export const BILLPLZ_CONFIG = {
  API_KEY: "d43afc10-6e24-41c7-84be-61a9a89c0ba9",
  COLLECTION_ID: "YOUR_ACTUAL_COLLECTION_ID_HERE", // ← Update this
  X_SIGNATURE: "YOUR_X_SIGNATURE_KEY_HERE", // ← Update this
  // ... rest of config
};
```

### 3. Set Up Webhook Endpoints

Update callback URLs in `src/config/billplz.js`:

```javascript
CALLBACK_URL: "https://your-actual-domain.com/billplz-callback",
REDIRECT_URL: "https://your-actual-domain.com/billplz-redirect",
```

### 4. Environment Configuration

- **Sandbox**: Use `https://www.billplz-sandbox.com/api/v3`
- **Production**: Use `https://www.billplz.com/api/v3`
- Change `ENVIRONMENT: "sandbox"` to `"production"` when ready

## 🚀 How It Works

### Payment Flow for Billplz:

1. ✅ Customer selects Billplz payment method
2. ✅ Order is created in your system
3. ✅ Billplz bill is created via API
4. ✅ Customer is redirected to Billplz payment page
5. ✅ Payment completion triggers webhook
6. ✅ Customer returns to your app

### Payment Flow for Other Methods (COD):

1. ✅ Order is created in your system
2. ✅ Direct navigation to order confirmation

## 🔧 API Endpoints Used

- **Create Bill**: `POST /bills`
- **Get Bill**: `GET /bills/{bill_id}`
- **Get Collection**: `GET /collections/{collection_id}`

## 📱 Mobile App Integration

The app automatically:

- Detects Billplz payment method
- Creates Billplz bill with order details
- Opens Billplz payment URL
- Handles payment success/failure
- Passes payment info to OrderConfirm screen

## 🚨 Important Notes

1. **Amount Format**: Billplz expects amount in cents (smallest currency unit)
2. **Currency**: Only supports Malaysian Ringgit (MYR)
3. **Webhooks**: Must implement callback URL for payment status updates
4. **Testing**: Use sandbox environment for development
5. **Collection ID**: Required for creating bills

## 🐛 Troubleshooting

### Common Issues:

- **"Collection not found"**: Check Collection ID in config
- **"Unauthorized"**: Verify API key is correct
- **"Invalid amount"**: Ensure amount is in cents (multiply by 100)
- **"Mobile required"**: Mobile number is mandatory for Billplz

### Debug Steps:

1. Check console logs for API responses
2. Verify API key and collection ID
3. Test with sandbox environment first
4. Check webhook endpoint accessibility

## 📞 Support

- **Billplz API Docs**: [https://www.billplz.com/api/](https://www.billplz.com/api/)
- **Billplz Support**: Contact Billplz support for API issues
- **App Support**: Check console logs for detailed error messages

## ✅ Next Steps

1. Create collection in Billplz dashboard
2. Update `COLLECTION_ID` in config
3. Set up webhook endpoints
4. Test with sandbox environment
5. Switch to production when ready

---

**Last Updated**: $(date)
**API Key**: d43afc10-6e24-41c7-84be-61a9a89c0ba9
**Environment**: Sandbox (Development)
