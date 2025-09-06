import { addToWishlist, removeFromWishlist, isInWishlist, getWishlistItems } from '../DataBase/db';

export const toggleWishlistItem = async (product) => {
  try {
    const inWishlist = await isInWishlist(product.id);
    
    if (inWishlist) {
      await removeFromWishlist(product.id);
      console.log('✅ Product removed from wishlist:', product.name);
      return { success: true, action: 'removed', message: 'Removed from wishlist' };
    } else {
      await addToWishlist(product);
      console.log('✅ Product added to wishlist:', product.name);
      return { success: true, action: 'added', message: 'Added to wishlist' };
    }
  } catch (error) {
    console.error('❌ Error toggling wishlist item:', error);
    return { success: false, action: 'error', message: 'Failed to update wishlist' };
  }
};

export const checkWishlistStatus = async (productId) => {
  try {
    const inWishlist = await isInWishlist(productId);
    return inWishlist;
  } catch (error) {
    console.error('❌ Error checking wishlist status:', error);
    return false;
  }
};

export const fetchWishlistItems = async () => {
  try {
    const items = await getWishlistItems();
    return items;
  } catch (error) {
    console.error('❌ Error fetching wishlist items:', error);
    return [];
  }
};

export const addToWishlistItem = async (product) => {
  try {
    await addToWishlist(product);
    console.log('✅ Product added to wishlist:', product.name);
    return { success: true, message: 'Added to wishlist' };
  } catch (error) {
    console.error('❌ Error adding to wishlist:', error);
    return { success: false, message: 'Failed to add to wishlist' };
  }
};

export const removeFromWishlistItem = async (productId) => {
  try {
    await removeFromWishlist(productId);
    console.log('✅ Product removed from wishlist:', productId);
    return { success: true, message: 'Removed from wishlist' };
  } catch (error) {
    console.error('❌ Error removing from wishlist:', error);
    return { success: false, message: 'Failed to remove from wishlist' };
  }
};
