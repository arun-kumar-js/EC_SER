import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserData } from '../Fuctions/UserDataService';

const UserProfileContext = createContext();

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

export const UserProfileProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Load user data from AsyncStorage and API
  const loadUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedUser = await AsyncStorage.getItem('userData');
      
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        setUserData(userObj);
        setIsLoggedIn(true);

        // Try to fetch latest profile from API
        const userId = userObj?.user_id || userObj?.id;
        if (userId) {
          const result = await getUserData(userId);
          
          if (result?.success && result?.data) {
            const merged = { ...userObj, ...(result.data || {}) };
            setUserData(merged);
            // Update AsyncStorage with latest data
            await AsyncStorage.setItem('userData', JSON.stringify(merged));
          }
        }
      } else {
        setUserData(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUserData(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update user data
  const updateUserData = useCallback(async (newUserData) => {
    try {
      setUserData(newUserData);
      setIsLoggedIn(!!newUserData);
      
      if (newUserData) {
        await AsyncStorage.setItem('userData', JSON.stringify(newUserData));
      } else {
        await AsyncStorage.removeItem('userData');
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  }, []);

  // Clear user data (logout)
  const clearUserData = useCallback(async () => {
    try {
      setUserData(null);
      setIsLoggedIn(false);
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }, []);

  // Refresh user data from API
  const refreshUserData = useCallback(async () => {
    if (userData) {
      const userId = userData?.user_id || userData?.id;
      if (userId) {
        try {
          const result = await getUserData(userId);
          if (result?.success && result?.data) {
            const merged = { ...userData, ...(result.data || {}) };
            await updateUserData(merged);
          }
        } catch (error) {
          console.error('Error refreshing user data:', error);
        }
      }
    }
  }, [userData, updateUserData]);

  useEffect(() => {
    // Load initial user data
    loadUserData();
  }, [loadUserData]);

  const value = {
    userData,
    isLoading,
    isLoggedIn,
    loadUserData,
    updateUserData,
    clearUserData,
    refreshUserData,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};
