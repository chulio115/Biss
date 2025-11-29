// Home Screen - Main Dashboard with Fangindex
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { getWeather } from '../services/weather';
import { calculateFangIndex } from '../services/xai';
import { FangIndex, WeatherData } from '../types';
import { NearbySpots } from '../components/NearbySpots';

interface HomeScreenProps {
  onNavigateToMap?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToMap }) => {
  const { user, signOut } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [fangIndex, setFangIndex] = useState<FangIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Demo coordinates (Bendestorf, 21227)
  const DEMO_LAT = 53.3347;
  const DEMO_LON = 9.9717;

  const loadData = async () => {
    try {
      // Fetch weather
      const weatherData = await getWeather(DEMO_LAT, DEMO_LON);
      setWeather(weatherData);

      // Calculate local Fangindex (for current location, not specific water)
      const index = await calculateFangIndex('Dein Standort', weatherData, null);
      setFangIndex(index);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#4ade80';
    if (score >= 40) return '#fbbf24';
    return '#ef4444';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={styles.loadingText}>Lade Angelbedingungen...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4ade80" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hallo, {user?.user_metadata?.full_name || 'Angler'}!</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('de-DE', { 
            weekday: 'long', day: 'numeric', month: 'long' 
          })}</Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Compact Local Fangindex + Weather */}
      {fangIndex && weather && (
        <View style={styles.localIndexCard}>
          <View style={styles.localIndexHeader}>
            <Text style={styles.localIndexTitle}>🎣 Lokaler Fangindex</Text>
            <Text style={styles.locationText}>📍 Bendestorf</Text>
          </View>
          
          <View style={styles.localIndexContent}>
            {/* Score */}
            <View style={styles.localScoreSection}>
              <Text style={[styles.localScore, { color: getScoreColor(fangIndex.score) }]}>
                {fangIndex.score}
              </Text>
              <Text style={styles.localScoreLabel}>von 100</Text>
            </View>

            {/* Compact Weather */}
            <View style={styles.compactWeather}>
              <View style={styles.weatherRow}>
                <Text style={styles.weatherEmoji}>🌡️</Text>
                <Text style={styles.weatherText}>{weather.temp.toFixed(0)}°C</Text>
              </View>
              <View style={styles.weatherRow}>
                <Text style={styles.weatherEmoji}>💨</Text>
                <Text style={styles.weatherText}>{weather.wind_speed.toFixed(1)} m/s</Text>
              </View>
              <View style={styles.weatherRow}>
                <Text style={styles.weatherEmoji}>📊</Text>
                <Text style={styles.weatherText}>{weather.pressure} hPa</Text>
              </View>
            </View>
          </View>

          {/* Reasoning */}
          <Text style={styles.localReasoning}>{fangIndex.reasoning}</Text>

          {/* Best Fish Tags */}
          {fangIndex.best_fish.length > 0 && (
            <View style={styles.fishTags}>
              {fangIndex.best_fish.map((fish, i) => (
                <View key={i} style={styles.fishTag}>
                  <Text style={styles.fishTagText}>🐟 {fish}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Top 3 Nearby Spots */}
      <NearbySpots />

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>Schein</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onNavigateToMap}>
          <Text style={styles.actionIcon}>🗺️</Text>
          <Text style={styles.actionText}>Karte</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>🎫</Text>
          <Text style={styles.actionText}>Kaufen</Text>
        </TouchableOpacity>
      </View>

      {/* Spacer for bottom */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

// Helper Components
const FactorBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <View style={styles.factorRow}>
    <Text style={styles.factorLabel}>{label}</Text>
    <View style={styles.factorBarBg}>
      <View style={[styles.factorBarFill, { width: `${value}%` }]} />
    </View>
    <Text style={styles.factorValue}>{value}</Text>
  </View>
);

const WeatherItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.weatherItem}>
    <Text style={styles.weatherValue}>{value}</Text>
    <Text style={styles.weatherLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a1628',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  date: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  logoutBtn: {
    padding: 8,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 14,
  },
  indexCard: {
    backgroundColor: '#1e293b',
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  waterName: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 16,
  },
  score: {
    fontSize: 72,
    fontWeight: 'bold',
  },
  scoreMax: {
    fontSize: 24,
    color: '#64748b',
    marginLeft: 4,
  },
  reasoning: {
    color: '#cbd5e1',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  factors: {
    gap: 12,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  factorLabel: {
    color: '#94a3b8',
    fontSize: 12,
    width: 80,
  },
  factorBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
  },
  factorBarFill: {
    height: '100%',
    backgroundColor: '#4ade80',
    borderRadius: 4,
  },
  factorValue: {
    color: '#fff',
    fontSize: 12,
    width: 30,
    textAlign: 'right',
  },
  bestFish: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#334155',
    borderRadius: 8,
  },
  bestFishTitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 4,
  },
  bestFishList: {
    color: '#4ade80',
    fontSize: 16,
    fontWeight: '500',
  },
  recommendation: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#1e3a5f',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4ade80',
  },
  recommendationText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  weatherCard: {
    backgroundColor: '#1e293b',
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
  },
  weatherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  weatherItem: {
    width: '50%',
    paddingVertical: 8,
  },
  weatherValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  weatherLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  weatherDesc: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 12,
    textTransform: 'capitalize',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  // New compact local index styles
  localIndexCard: {
    backgroundColor: '#1e293b',
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },
  localIndexHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  localIndexTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  locationText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  localIndexContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  localScoreSection: {
    alignItems: 'center',
    marginRight: 24,
  },
  localScore: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  localScoreLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  compactWeather: {
    flex: 1,
    gap: 6,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weatherEmoji: {
    fontSize: 14,
  },
  weatherText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  localReasoning: {
    color: '#cbd5e1',
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  fishTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fishTag: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fishTagText: {
    color: '#4ade80',
    fontSize: 12,
  },
});
