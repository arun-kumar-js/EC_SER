import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_KEY = 'CART_ITEMS';

export const getCartItems = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(CART_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error reading cart items:', e);
    return [];
  }
};

export const saveOrUpdateCartItem = async (product, quantity) => {
  try {
    // Ensure quantity is never below 1
    const validatedQuantity = Math.max(1, quantity);

    const items = await getCartItems();
    const productId = product.id ?? product.product_id;

    if (!productId) {
      console.error('Product ID is required');
      return;
    }

    const index = items.findIndex(
      i => i.id === productId || i.product_id === productId,
    );

    if (index >= 0) {
      // Update existing item
      items[index] = {
        ...items[index],
        ...product,
        id: productId,
        product_id: productId,
        quantity: validatedQuantity,
      };
    } else {
      // Add new item
      items.push({
        ...product,
        id: productId,
        product_id: productId,
        quantity: validatedQuantity,
      });
    }

    await AsyncStorage.setItem(CART_KEY, JSON.stringify(items));
    return validatedQuantity;
  } catch (e) {
    console.error('Error saving cart item:', e);
    throw e;
  }
};

export const removeCartItem = async productId => {
  try {
    const items = await getCartItems();
    const filtered = items.filter(
      i => i.id !== productId && i.product_id !== productId,
    );
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Error removing cart item:', e);
    throw e;
  }
};

export const clearCart = async () => {
  try {
    await AsyncStorage.removeItem(CART_KEY);
  } catch (e) {
    console.error('Error clearing cart:', e);
    throw e;
  }
};
