const listeners = new Set();

// Helper functions to emit events
export const emitCartUpdated = data => {
  listeners.forEach(listener => {
    try {
      listener(data);
    } catch (error) {
      console.error('Error in cart update listener:', error);
    }
  });
};

export const onCartUpdated = listener => {
  if (typeof listener === 'function') {
    listeners.add(listener);
  }
  return listener;
};

export const offCartUpdated = listener => {
  if (listener) {
    listeners.delete(listener);
  }
};

// Clear all listeners (useful for cleanup)
export const clearAllListeners = () => {
  listeners.clear();
};
