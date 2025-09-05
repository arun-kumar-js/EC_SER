export const BILLPLZ_CONFIG = {
  API_KEY: 'd43afc10-6e24-41c7-84be-61a9a89c0ba9',
  COLLECTION_ID: 'YOUR_ACTUAL_COLLECTION_ID_HERE', // ← Update this
  X_SIGNATURE: 'YOUR_X_SIGNATURE_KEY_HERE', // ← Update this
  ENVIRONMENT: 'sandbox', // Change to "production" when ready
  BASE_URL: 'https://www.billplz-sandbox.com/api/v3', // Sandbox URL
  // BASE_URL: "https://www.billplz.com/api/v3", // Production URL
  CALLBACK_URL:
    'https://spiderekart.in/ec_service/api-firebase/billplz-callback',
  REDIRECT_URL:
    'https://spiderekart.in/ec_service/api-firebase/billplz-redirect',
};

// Helper function to get the correct base URL based on environment
export const getBillPlzBaseUrl = () => {
  return BILLPLZ_CONFIG.ENVIRONMENT === 'production'
    ? 'https://www.billplz.com/api/v3'
    : 'https://www.billplz-sandbox.com/api/v3';
};

// Helper function to format amount for BillPlz (convert to cents)
export const formatAmountForBillPlz = amount => {
  return Math.round(amount * 100); // Convert to cents
};

// Helper function to format mobile number for BillPlz
export const formatMobileForBillPlz = mobile => {
  // Remove any non-digit characters
  const cleanMobile = mobile.replace(/\D/g, '');

  // If it doesn't start with 60, add it
  if (!cleanMobile.startsWith('60')) {
    return `60${cleanMobile}`;
  }

  return cleanMobile;
};
