// NearbySpots Component - Top 3 Carousel for Dashboard
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNearbySpots, NearbySpot } from '../hooks/useNearbySpots';
import { SpotCard } from './SpotCard';

interface NearbySpotsSectionProps {
  onSpotPress?: (spot: NearbySpot) => void;
}

export const NearbySpots: React.FC<NearbySpotsSectionProps> = ({ onSpotPress }) => {
  // 50km radius to find more spots, prioritize Teiche
  const { spots, loading, error, refresh, locationGranted } = useNearbySpots(50, 3);

  const handleSpotPress = (spot: NearbySpot) => {
    if (onSpotPress) {
      onSpotPress(spot);
    } else {
      // Default: Show alert with details
      Alert.alert(
        spot.name,
        `🎣 Fangindex: ${spot.fangIndex}/100\n` +
        `📍 Entfernung: ${spot.distance} km\n` +
        `🐟 Fische: ${spot.fishSpecies.join(', ') || 'Keine Angabe'}\n` +
        (spot.permitPrice ? `💰 Tageskarte: €${spot.permitPrice}` : '') +
        (spot.isAssumed ? '\n\n⚠️ Dieser Spot ist ein Vorschlag und noch nicht verifiziert.' : ''),
        [
          { text: 'Schließen', style: 'cancel' },
          { text: 'Route planen', onPress: () => console.log('TODO: Open maps') },
        ]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🎯 Top Spots in der Nähe</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4ade80" />
          <Text style={styles.loadingText}>Suche Gewässer...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🎯 Top Spots in der Nähe</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryText}>Erneut versuchen</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (spots.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🎯 Top Spots in der Nähe</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Keine Gewässer in der Nähe gefunden</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎯 Top Spots in der Nähe</Text>
        {!locationGranted && (
          <View style={styles.locationHint}>
            <Text style={styles.locationHintText}>📍 Standort aktivieren für bessere Ergebnisse</Text>
          </View>
        )}
      </View>

      {/* Carousel */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carousel}
      >
        {spots.map((spot, index) => (
          <View key={spot.id} style={styles.cardWrapper}>
            {/* Ranking badge */}
            <View style={[styles.rankBadge, index === 0 && styles.rankBadgeGold]}>
              <Text style={styles.rankText}>#{index + 1}</Text>
            </View>
            <SpotCard spot={spot} onPress={() => handleSpotPress(spot)} />
          </View>
        ))}
        
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  locationHint: {
    marginTop: 6,
    backgroundColor: '#1e3a5f',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  locationHintText: {
    color: '#94a3b8',
    fontSize: 11,
  },
  carousel: {
    paddingLeft: 16,
    paddingRight: 4,
  },
  cardWrapper: {
    position: 'relative',
  },
  rankBadge: {
    position: 'absolute',
    top: -8,
    left: -8,
    backgroundColor: '#334155',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#0a1628',
  },
  rankBadgeGold: {
    backgroundColor: '#fbbf24',
  },
  rankText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 10,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
});
