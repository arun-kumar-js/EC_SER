# Synchronized Cart System

This document explains how the synchronized cart system works across the e-commerce app.

## Overview

The cart system ensures that product quantities are synchronized across three main locations:

1. **Category/SubCategory pages** - Product listing with add/remove buttons
2. **Product Details page** - Individual product view with CartButton component
3. **Cart page** - Shopping cart with quantity controls

## Key Features

### ✅ Quantity Synchronization

- All three locations show the same product count
- Updates in any location reflect everywhere immediately
- Uses event-driven architecture for real-time updates

### ✅ Minimum Quantity Protection

- Product count never goes below 1
- If user tries to set quantity to 0, it automatically goes back to 1
- Prevents accidental removal of products

### ✅ Consistent Product IDs

- Handles both `product.id` and `product.product_id` formats
- Ensures proper matching across different data structures

## Architecture

### Core Components

1. **CartService.js** - Main service layer for all cart operations
2. **CartDB.js** - Database layer using AsyncStorage
3. **cartEvents.js** - Event system for real-time updates
4. **CartButton.js** - Reusable component for quantity controls

### Data Flow

```
User Action → CartService → CartDB → AsyncStorage
                ↓
            emitCartUpdated → All Listeners → UI Updates
```

## Usage Examples

### Adding Products

```javascript
import { increaseProductQuantity } from '../Fuctions/CartService';

// Increase quantity by 1
const newQuantity = await increaseProductQuantity(product);
```

### Removing Products

```javascript
import { decreaseProductQuantity } from '../Fuctions/CartService';

// Decrease quantity (never goes below 1)
const newQuantity = await decreaseProductQuantity(product);
```

### Getting Current Quantity

```javascript
import { getProductQuantity } from '../Fuctions/CartService';

// Get current quantity for a product
const quantity = await getProductQuantity(productId);
```

## Event System

The cart uses a custom event system to notify all components of changes:

```javascript
import { onCartUpdated, offCartUpdated } from '../Fuctions/cartEvents';

// Listen for cart updates
const listener = () => updateUI();
onCartUpdated(listener);

// Clean up when component unmounts
return () => offCartUpdated(listener);
```

## Error Handling

- All cart operations include try-catch blocks
- Invalid product IDs are validated before processing
- Database errors are logged and handled gracefully
- UI remains responsive even if cart operations fail

## Testing

To test the synchronization:

1. Add a product from Category page
2. Navigate to Product Details - quantity should match
3. Go to Cart page - quantity should match
4. Change quantity in Cart - should update everywhere
5. Try to decrease to 0 - should stay at 1

## Troubleshooting

### Common Issues

1. **Quantity not syncing**: Check if cartEvents are properly imported
2. **Product not found**: Verify product ID format in data
3. **Memory leaks**: Ensure listeners are properly cleaned up

### Debug Mode

Enable console logs to see cart operations:

```javascript
// CartService.js has detailed logging
console.log('Cart operation:', operation, data);
```

## Future Enhancements

- Add cart persistence across app restarts
- Implement cart backup/restore
- Add offline support with sync when online
- Cart analytics and user behavior tracking

