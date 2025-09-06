import axios from 'axios';
import { API_BASE_URL, API_ACCESS_KEY } from '../config/config';
import {
  BILLPLZ_CONFIG,
  formatAmountForBillPlz,
  formatMobileForBillPlz,
} from '../config/billplz';

const BILLPLZ_API_KEY = 'd43afc10-6e24-41c7-84be-61a9a89c0ba9';
const BILLPLZ_BASE_URL = 'https://www.billplz.com/api/';

// Direct BillPlz API integration (fallback when PHP backend is not working)
export const createBillPlzBillDirect = async orderData => {
  try {
    console.log('=== BILLPLZ DIRECT API CREATE BILL ===');
    console.log('Order Data:', orderData);

    const { orderId, user, selectedAddress, totals } = orderData;

    // Validate required data
    if (!user) {
      return {
        success: false,
        message: 'User data is required',
      };
    }

    if (!totals || !totals.total) {
      return {
        success: false,
        message: 'Order total is required',
      };
    }

    // Convert total to cents (BillPlz expects amount in cents)
    const amountInCents = formatAmountForBillPlz(totals.total || 0);

    // Extract user data with fallbacks
    const userMobile = user.mobile || user.phone || user.mobile_number || '';
    const userEmail = user.email || user.email_address || 'test@example.com';
    const userName = user.name || user.full_name || user.username || 'Customer';

    // Format mobile number for BillPlz
    const formattedMobile = formatMobileForBillPlz(userMobile);

    // Prepare URL parameters (matching Android implementation)
    const params = new URLSearchParams({
      accesskey: API_ACCESS_KEY,
      type: 'create-bill',
      order_id: orderId || `ORDER_${Date.now()}`,
      mobile: formattedMobile,
      customer_email: userEmail,
      customer_name: userName,
      amount: amountInCents.toString()
    });

    const paymentUrl = `${API_BASE_URL}billplz-payment-gateway.php?${params.toString()}`;

    console.log('=== BILLPLZ DIRECT API REQUEST ===');
    console.log('Payment URL:', paymentUrl);

    // Make direct API call using GET request (matching Android)
    const response = await fetch(paymentUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (compatible; ReactNative/1.0)',
      },
    });

    console.log('=== BILLPLZ DIRECT API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);

    // Check if it's a redirect response (302) - matching Android behavior
    if (response.status === 302 || response.status === 301) {
      const redirectUrl = response.headers.get('location');
      console.log('=== BILLPLZ REDIRECT DETECTED (DIRECT) ===');
      console.log('Redirect URL:', redirectUrl);

      if (redirectUrl && redirectUrl.includes('billplz.com')) {
        console.log('✅ Direct API redirect URL is valid BillPlz URL');
        return {
          success: true,
          data: { redirect: true },
          paymentUrl: redirectUrl,
          billId: redirectUrl.split('/').pop(),
        };
      } else {
        console.log('❌ Direct API redirect URL is not valid BillPlz URL:', redirectUrl);
        return {
          success: true,
          data: { redirect: false },
          paymentUrl: paymentUrl,
          billId: null,
        };
      }
    }

    // If not a redirect, try to parse as JSON
    try {
      const responseData = await response.json();
      console.log('Response Data:', responseData);

      if (response.ok && responseData.url) {
        return {
          success: true,
          data: responseData,
          paymentUrl: responseData.url,
          billId: responseData.id,
        };
      } else {
        return {
          success: false,
          message: responseData.message || 'Failed to create BillPlz bill',
          data: responseData,
        };
      }
    } catch (parseError) {
      console.log('Failed to parse JSON, using payment URL directly');
      return {
        success: true,
        data: { directUrl: true },
        paymentUrl: paymentUrl,
        billId: null,
      };
    }
  } catch (error) {
    console.error('=== BILLPLZ DIRECT API ERROR ===');
    console.error('Error:', error);
    return {
      success: false,
      message: error.message || 'Network error',
      error: error,
    };
  }
};

export const createBillPlzBill = async orderData => {
  try {
    console.log('=== BILLPLZ CREATE BILL ===');
    console.log('Order Data:', orderData);

    const { orderId, user, selectedAddress, totals } = orderData;

    // Validate required data
    if (!user) {
      return {
        success: false,
        message: 'User data is required',
      };
    }

    if (!totals || !totals.total) {
      return {
        success: false,
        message: 'Order total is required',
      };
    }

    // Convert total to cents (BillPlz expects amount in cents)
    const amountInCents = formatAmountForBillPlz(totals.total || 0);

    // Extract user data with fallbacks
    const userMobile = user.mobile || user.phone || user.mobile_number || '';
    const userEmail = user.email || user.email_address || 'test@example.com';
    const userName = user.name || user.full_name || user.username || 'Customer';

    // Format mobile number for BillPlz
    const formattedMobile = formatMobileForBillPlz(userMobile);

    // Prepare URL parameters (matching Android implementation)
    const params = new URLSearchParams({
      accesskey: API_ACCESS_KEY,
      type: 'create-bill',
      order_id: orderId || `ORDER_${Date.now()}`,
      mobile: formattedMobile,
      customer_email: userEmail,
      customer_name: userName,
      amount: amountInCents.toString()
    });

    const paymentUrl = `${API_BASE_URL}billplz-payment-gateway.php?${params.toString()}`;

    console.log('=== BILLPLZ URL PARAMETERS ===');
    console.log('Access Key:', API_ACCESS_KEY);
    console.log('Type: create-bill');
    console.log('Order ID:', orderId || `ORDER_${Date.now()}`);
    console.log('Mobile:', formattedMobile);
    console.log('Email:', userEmail);
    console.log('Name:', userName);
    console.log('Amount (cents):', amountInCents);
    console.log('Payment URL:', paymentUrl);

    // Make API call to BillPlz gateway using GET request (matching Android)
    console.log('=== MAKING API CALL ===');
    console.log('URL:', paymentUrl);

    try {
      // Use GET request with URL parameters (matching Android implementation)
      const fetchResponse = await fetch(paymentUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (compatible; ReactNative/1.0)',
        },
      });

      console.log('=== FETCH RESPONSE ===');
      console.log('Status:', fetchResponse.status);
      console.log('Status Text:', fetchResponse.statusText);
      console.log(
        'Headers:',
        Object.fromEntries(fetchResponse.headers.entries()),
      );
      console.log('OK:', fetchResponse.ok);
      console.log('Redirected:', fetchResponse.redirected);

      // Check if it's a redirect response (302) - matching Android behavior
      if (fetchResponse.status === 302 || fetchResponse.status === 301) {
        const redirectUrl = fetchResponse.headers.get('location');
        console.log('=== BILLPLZ REDIRECT DETECTED ===');
        console.log('Redirect URL:', redirectUrl);

        if (redirectUrl && redirectUrl.includes('billplz.com')) {
          console.log('✅ Redirect URL is valid BillPlz URL');
          return {
            success: true,
            data: { redirect: true },
            paymentUrl: redirectUrl,
            billId: redirectUrl.split('/').pop(), // Extract bill ID from URL
          };
        } else {
          console.log('❌ Redirect URL is not a valid BillPlz URL:', redirectUrl);
          // If redirect URL is not BillPlz, use the original payment URL
          return {
            success: true,
            data: { redirect: false },
            paymentUrl: paymentUrl,
            billId: null,
          };
        }
      }

      // If not a redirect, try to get the response text
      const responseText = await fetchResponse.text();
      console.log('=== RESPONSE TEXT ===');
      console.log('Response Text:', responseText);
      console.log('Response Text Length:', responseText.length);
      console.log('Response Text Preview:', responseText.substring(0, 200));

      // Check if response is HTML (error page)
      if (responseText.includes('<!DOCTYPE html>')) {
        console.log('=== BILLPLZ HTML RESPONSE DETECTED ===');
        console.log('PHP backend returned HTML instead of JSON');

        // Try to extract any useful information from the HTML
        if (responseText.includes('billplz.com')) {
          // Look for BillPlz payment URL in the HTML (not CSS or other assets)
          const urlMatch = responseText.match(
            /https:\/\/[^"'\s]*billplz\.com\/bills\/[^"'\s]*/,
          );
          if (urlMatch) {
            const billplzUrl = urlMatch[0];
            console.log('Found BillPlz payment URL in HTML:', billplzUrl);
            return {
              success: true,
              data: { htmlResponse: true },
              paymentUrl: billplzUrl,
              billId: billplzUrl.split('/').pop(),
            };
          }

          // If no payment URL found, try to find any billplz.com URL that's not a CSS/JS file
          const allUrlMatch = responseText.match(
            /https:\/\/[^"'\s]*billplz\.com[^"'\s]*/g,
          );
          if (allUrlMatch) {
            console.log('All BillPlz URLs found:', allUrlMatch);
            // Filter out CSS, JS, and other asset files
            const paymentUrls = allUrlMatch.filter(
              url =>
                !url.includes('.css') &&
                !url.includes('.js') &&
                !url.includes('.png') &&
                !url.includes('.jpg') &&
                !url.includes('.gif') &&
                !url.includes('cdn') &&
                url.includes('/bills/'),
            );

            if (paymentUrls.length > 0) {
              const billplzUrl = paymentUrls[0];
              console.log('Found BillPlz payment URL (filtered):', billplzUrl);
              return {
                success: true,
                data: { htmlResponse: true },
                paymentUrl: billplzUrl,
                billId: billplzUrl.split('/').pop(),
              };
            }
          }

          // If we found BillPlz URLs but no payment URL, it means the PHP backend
          // is returning the BillPlz payment page HTML instead of creating a bill
          // This indicates the PHP backend needs to be updated
          console.log('=== BILLPLZ BACKEND ISSUE DETECTED ===');
          console.log('PHP backend is returning BillPlz payment page HTML instead of creating a bill');
          console.log('This means the PHP backend needs to be updated with proper BillPlz API integration');
          
          return {
            success: false,
            message: 'PHP backend needs to be updated. It\'s returning BillPlz payment page HTML instead of creating a bill via API. Please update your PHP backend with the example code provided in BILLPLZ_PHP_BACKEND_EXAMPLE.php',
            data: { 
              htmlResponse: true,
              billplzUrlsFound: allUrlMatch?.length || 0,
              issue: 'backend_returns_html_instead_of_json'
            },
          };
        }

        return {
          success: false,
          message: 'PHP backend returned HTML error page',
          data: responseText,
        };
      }

      // Try to parse as JSON
      try {
        const jsonData = JSON.parse(responseText);
        console.log('=== PARSED JSON DATA ===');
        console.log('JSON Data:', jsonData);

        if (jsonData && jsonData.error === false) {
          return {
            success: true,
            data: jsonData,
            paymentUrl:
              jsonData.payment_url || jsonData.url || jsonData.billplz_url,
            billId: jsonData.bill_id,
          };
        } else if (jsonData && jsonData.success === true) {
          return {
            success: true,
            data: jsonData,
            paymentUrl:
              jsonData.payment_url || jsonData.url || jsonData.billplz_url,
            billId: jsonData.bill_id,
          };
        } else {
          return {
            success: false,
            message: jsonData?.message || 'Failed to create BillPlz bill',
            data: jsonData,
          };
        }
      } catch (parseError) {
        console.log('Failed to parse JSON:', parseError.message);
        return {
          success: false,
          message: 'Invalid response format from server',
          data: responseText,
        };
      }
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error('=== BILLPLZ ERROR ===');
    console.error('Error creating BillPlz bill:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.message);
    console.error('Full error object:', JSON.stringify(error, null, 2));

    // Check if it's a PHP error response
    if (error.response?.data && typeof error.response.data === 'string') {
      if (
        error.response.data.includes('Warning') ||
        error.response.data.includes('Error') ||
        error.response.data.includes('<!DOCTYPE html>')
      ) {
        console.log('=== PHP ERROR RESPONSE DETECTED ===');
        console.log('Response contains HTML or PHP error');

        // Try to extract BillPlz URL from error response
        if (error.response.data.includes('billplz.com')) {
          // Look for BillPlz payment URL (not CSS or other assets)
          const urlMatch = error.response.data.match(
            /https:\/\/[^"'\s]*billplz\.com\/bills\/[^"'\s]*/,
          );
          if (urlMatch) {
            const billplzUrl = urlMatch[0];
            console.log(
              'Found BillPlz payment URL in error response:',
              billplzUrl,
            );
            return {
              success: true,
              data: { errorResponse: true },
              paymentUrl: billplzUrl,
              billId: billplzUrl.split('/').pop(),
            };
          }

          // If no payment URL found, try to find any billplz.com URL that's not a CSS/JS file
          const allUrlMatch = error.response.data.match(
            /https:\/\/[^"'\s]*billplz\.com[^"'\s]*/g,
          );
          if (allUrlMatch) {
            console.log('All BillPlz URLs found in error:', allUrlMatch);
            // Filter out CSS, JS, and other asset files
            const paymentUrls = allUrlMatch.filter(
              url =>
                !url.includes('.css') &&
                !url.includes('.js') &&
                !url.includes('.png') &&
                !url.includes('.jpg') &&
                !url.includes('.gif') &&
                !url.includes('cdn') &&
                url.includes('/bills/'),
            );

            if (paymentUrls.length > 0) {
              const billplzUrl = paymentUrls[0];
              console.log(
                'Found BillPlz payment URL in error (filtered):',
                billplzUrl,
              );
              return {
                success: true,
                data: { errorResponse: true },
                paymentUrl: billplzUrl,
                billId: billplzUrl.split('/').pop(),
              };
            }
          }
        }

        return {
          success: false,
          message:
            'PHP backend error: ' +
            error.response.data.substring(0, 100) +
            '...',
          data: error.response.data,
        };
      }
    }

    return {
      success: false,
      message:
        error.response?.data?.message || error.message || 'Network error',
      error: error,
    };
  }
};

export const checkBillPlzStatus = async billId => {
  try {
    console.log('=== BILLPLZ STATUS CHECK ===');
    console.log('Bill ID:', billId);

    const formData = new FormData();
    formData.append('accesskey', API_ACCESS_KEY);
    formData.append('type', 'check-bill-status');
    formData.append('bill_id', billId);

    const response = await axios.post(
      `${API_BASE_URL}billplz-payment-gateway.php`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      },
    );

    console.log('=== BILLPLZ STATUS RESPONSE ===');
    console.log('Response Status:', response.status);
    console.log('Response Data:', response.data);

    if (response.data && response.data.error === false) {
      return {
        success: true,
        data: response.data,
        status: response.data.status,
        paid: response.data.paid === true || response.data.status === 'paid',
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to check bill status',
        data: response.data,
      };
    }
  } catch (error) {
    console.error('=== BILLPLZ STATUS ERROR ===');
    console.error('Error checking BillPlz status:', error);
    console.error('Error response:', error.response?.data);

    return {
      success: false,
      message:
        error.response?.data?.message || error.message || 'Network error',
      error: error,
    };
  }
};

// Test BillPlz API call
export const testBillPlzAPI = async () => {
  try {
    console.log('=== TESTING BILLPLZ API ===');
    console.log('API Base URL:', API_BASE_URL);
    console.log('Access Key:', API_ACCESS_KEY);

    // Test direct fetch call first
    console.log('=== TESTING DIRECT FETCH ===');
    const formData = new FormData();
    formData.append('accesskey', API_ACCESS_KEY);
    formData.append('type', 'create-bill');
    formData.append('order_id', 'TEST_ORDER_123');
    formData.append('mobile', '60123456789');
    formData.append('customer_email', 'test@example.com');
    formData.append('customer_name', 'Test Customer');
    formData.append('amount', '1000');

    try {
      const fetchResponse = await fetch(
        `${API_BASE_URL}billplz-payment-gateway.php`,
        {
          method: 'POST',
          body: formData,
        },
      );

      console.log('=== FETCH RESPONSE ===');
      console.log('Status:', fetchResponse.status);
      console.log('Status Text:', fetchResponse.statusText);
      console.log(
        'Headers:',
        Object.fromEntries(fetchResponse.headers.entries()),
      );
      console.log('OK:', fetchResponse.ok);
      console.log('Redirected:', fetchResponse.redirected);

      if (fetchResponse.status === 302) {
        const redirectUrl = fetchResponse.headers.get('location');
        console.log('✅ REDIRECT DETECTED:', redirectUrl);
        return {
          success: true,
          message: 'Redirect detected',
          redirectUrl: redirectUrl,
        };
      } else {
        const responseText = await fetchResponse.text();
        console.log('Response Text:', responseText);
        return {
          success: false,
          message: 'No redirect detected',
          status: fetchResponse.status,
          responseText: responseText,
        };
      }
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return {
        success: false,
        message: 'Fetch failed',
        error: fetchError.message,
      };
    }
  } catch (error) {
    console.error('Test failed:', error);
    return {
      success: false,
      message: error.message,
      error: error,
    };
  }
};
