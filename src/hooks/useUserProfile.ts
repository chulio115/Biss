/**
 * useUserProfile Hook
 * AsyncStorage für Benutzerprofil-Daten
 */
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  name: string;
  bio: string;
  favoriteFish: string;
  experienceLevel: 'beginner' | 'intermediate' | 'pro';
  homeRegion: string;
  joinedAt: string;
}

const PROFILE_STORAGE_KEY = '@biss_user_profile';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Angler',
  bio: '',
  favoriteFish: '',
  experienceLevel: 'beginner',
  homeRegion: '',
  joinedAt: new Date().toISOString(),
};

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load profile from AsyncStorage
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const stored = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) {
        const parsedProfile = JSON.parse(stored);
        setProfile({ ...DEFAULT_PROFILE, ...parsedProfile });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (newProfile: Partial<UserProfile>) => {
    setSaving(true);
    try {
      const updatedProfile = { ...profile, ...newProfile };
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const resetProfile = async () => {
    try {
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
      setProfile(DEFAULT_PROFILE);
      return true;
    } catch (error) {
      console.error('Error resetting profile:', error);
      return false;
    }
  };

  return {
    profile,
    loading,
    saving,
    saveProfile,
    resetProfile,
    isDefault: profile.name === DEFAULT_PROFILE.name && !profile.bio,
  };
};
