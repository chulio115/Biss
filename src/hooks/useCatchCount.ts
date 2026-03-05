/**
 * useCatchCount Hook
 * Returns the number of catches for the current user.
 * Lightweight hook for use in ProfileScreen/Leaderboard without loading full catch data.
 */
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './useAuth';

export const useCatchCount = () => {
  const { user } = useAuth();
  const [catchesCount, setCatchesCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchCount = async () => {
      try {
        const { count, error } = await supabase
          .from('catches')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (!error && count !== null) {
          setCatchesCount(count);
        }
      } catch (e) {
        console.error('Failed to fetch catch count:', e);
      }
    };

    fetchCount();
  }, [user]);

  return catchesCount;
};
