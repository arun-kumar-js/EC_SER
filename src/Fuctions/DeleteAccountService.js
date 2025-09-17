import { API_BASE_URL } from '../config/config';

export const deleteAccount = async (userId) => {
  try {
    console.log('=== DELETE ACCOUNT API CALL ===');
    console.log('User ID:', userId);
    
    const formData = new FormData();
    formData.append('accesskey', '90336');
    formData.append('type', 'delete_user');
    formData.append('user_id', userId.toString());

    console.log('Form Data:', {
      accesskey: '90336',
      type: 'delete_user',
      user_id: userId.toString()
    });

    const response = await fetch(`${API_BASE_URL}/delete_account.php`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);

    const responseText = await response.text();
    console.log('Raw Response:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.log('Response was not valid JSON:', responseText);
      return {
        success: false,
        message: 'Invalid response from server',
        error: parseError.message,
        rawResponse: responseText
      };
    }

    console.log('Parsed Response:', result);

    if (response.ok) {
      return {
        success: true,
        data: result,
        message: result.message || 'Account deleted successfully'
      };
    } else {
      return {
        success: false,
        message: result.message || 'Failed to delete account',
        error: result.error || 'Unknown error',
        status: response.status
      };
    }
  } catch (error) {
    console.error('Delete Account API Error:', error);
    return {
      success: false,
      message: 'Network error occurred',
      error: error.message
    };
  }
};

