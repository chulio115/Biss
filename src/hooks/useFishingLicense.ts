/**
 * useFishingLicense Hook
 * Manages fishing license data using AsyncStorage (offline-first).
 * Stores license image URI + extracted metadata.
 */
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@biss_fishing_license';

export interface StoredLicense {
  imageUri: string;
  name?: string;
  licenseNumber?: string;
  issuingAuthority?: string;
  validUntil?: string;
  addedAt: string;
}

export const useFishingLicense = () => {
  const [license, setLicense] = useState<StoredLicense | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setLicense(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load license:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveLicense = useCallback(async (data: StoredLicense) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setLicense(data);
    } catch (e) {
      console.error('Failed to save license:', e);
    }
  }, []);

  const updateLicense = useCallback(async (updates: Partial<StoredLicense>) => {
    if (!license) return;
    const updated = { ...license, ...updates };
    await saveLicense(updated);
  }, [license, saveLicense]);

  const removeLicense = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setLicense(null);
    } catch (e) {
      console.error('Failed to remove license:', e);
    }
  }, []);

  const isValid = useCallback(() => {
    if (!license?.validUntil) return null; // unknown
    return new Date(license.validUntil) >= new Date();
  }, [license]);

  return {
    license,
    loading,
    saveLicense,
    updateLicense,
    removeLicense,
    isValid,
    hasLicense: !!license,
  };
};
