// SpotCard Component - Individual fishing spot card for carousel
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NearbySpot } from '../hooks/useNearbySpots';

interface SpotCardProps {
  spot: NearbySpot;
  onPress: () => void;
}

const getScoreColor = (score: number): string => {
  if (score >= 70) return '#4ade80'; // Green
  if (score >= 40) return '#fbbf24'; // Yellow
  return '#ef4444'; // Red
};

const getScoreGradient = (score: number): string => {
  if (score >= 70) return '#065f46'; // Dark green bg
  if (score >= 40) return '#78350f'; // Dark yellow bg
  return '#7f1d1d'; // Dark red bg
};

const getTypeEmoji = (type: string): string => {
  const t = type?.toLowerCase() || '';
  if (t.includes('forelle')) return '🐟';
  if (t.includes('teich')) return '🎣';
  if (t.includes('see')) return '🏞️';
  if (t.includes('fluss')) return '🌊';
  if (t.includes('kanal')) return '⛵';
  return '🐟';
};

const getTypeBadge = (type: string): string => {
  const t = type?.toLowerCase() || '';
  if (t.includes('forelle')) return 'Forellenteich';
  if (t.includes('teich')) return 'Angelteich';
  if (t === 'see') return 'See';
  if (t === 'fluss') return 'Fluss';
  if (t === 'kanal') return 'Kanal';
  return type || 'Gewässer';
};

export const SpotCard: React.FC<SpotCardProps> = ({ spot, onPress }) => {
  const scoreColor = getScoreColor(spot.fangIndex);
  const scoreBg = getScoreGradient(spot.fangIndex);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Top section with score highlight */}
      <View style={[styles.scoreHeader, { backgroundColor: scoreBg }]}>
        <View style={styles.scoreRow}>
          <Text style={[styles.scoreNumber, { color: scoreColor }]}>
            {spot.fangIndex}
          </Text>
          <View style={styles.scoreInfo}>
            <Text style={styles.scoreLabelTop}>Fangindex</Text>
            <View style={styles.distanceInline}>
              <Text style={styles.distanceText}>📍 {spot.distance} km</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Type badge row */}
        <View style={styles.badgeRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeEmoji}>{getTypeEmoji(spot.type)}</Text>
            <Text style={styles.typeBadgeText}>{getTypeBadge(spot.type)}</Text>
          </View>
          {spot.isAssumed && (
            <View style={styles.assumedBadge}>
              <Text style={styles.assumedText}>💡 Tipp</Text>
            </View>
          )}
        </View>

        {/* Name */}
        <Text style={styles.name} numberOfLines={2}>{spot.name}</Text>

        {/* Fish species */}
        {spot.fishSpecies.length > 0 && (
          <View style={styles.fishRow}>
            {spot.fishSpecies.slice(0, 2).map((fish, i) => (
              <View key={i} style={styles.fishChip}>
                <Text style={styles.fishChipText}>{fish}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Price */}
        {spot.permitPrice && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tageskarte</Text>
            <Text style={styles.priceValue}>€{spot.permitPrice}</Text>
          </View>
        )}
      </View>

      {/* Action hint */}
      <View style={styles.actionHint}>
        <Text style={styles.actionText}>Auf Karte ansehen →</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    marginRight: 12,
    width: 170,
    overflow: 'hidden',
  },
  scoreHeader: {
    padding: 12,
    paddingBottom: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    marginRight: 10,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreLabelTop: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '500',
  },
  distanceInline: {
    marginTop: 2,
  },
  distanceText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  content: {
    padding: 12,
    paddingTop: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  typeEmoji: {
    fontSize: 12,
  },
  typeBadgeText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '500',
  },
  assumedBadge: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  assumedText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600',
  },
  name: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 18,
  },
  fishRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  fishChip: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fishChipText: {
    color: '#64748b',
    fontSize: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    color: '#64748b',
    fontSize: 11,
  },
  priceValue: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: '600',
  },
  actionHint: {
    backgroundColor: '#334155',
    paddingVertical: 8,
    alignItems: 'center',
  },
  actionText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '500',
  },
});
