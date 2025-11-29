// MapFilters - Collapsible fish filter bar
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';

interface MapFiltersProps {
  selectedFish: string | null;
  onSelectFish: (fish: string | null) => void;
  availableFish: string[];
}

const fishEmojis: Record<string, string> = {
  'Forelle': '🐟',
  'Karpfen': '🐟',
  'Hecht': '🐊',
  'Zander': '🐟',
  'Barsch': '🐟',
  'Aal': '🐍',
  'Wels': '🐋',
  'Schleie': '🐟',
  'Brassen': '🐟',
  'Saibling': '🐟',
};

export const MapFilters: React.FC<MapFiltersProps> = ({
  selectedFish,
  onSelectFish,
  availableFish,
}) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => setExpanded(!expanded);

  const handleSelect = (fish: string) => {
    if (selectedFish === fish) {
      onSelectFish(null);
    } else {
      onSelectFish(fish);
    }
  };

  return (
    <View style={styles.container}>
      {/* Collapsed state - just show toggle */}
      <TouchableOpacity style={styles.toggleBar} onPress={toggleExpand}>
        <View style={styles.toggleLeft}>
          <Text style={styles.filterIcon}>🐟</Text>
          <Text style={styles.toggleText}>
            {selectedFish ? `Filter: ${selectedFish}` : 'Alle Fischarten'}
          </Text>
        </View>
        <Text style={styles.toggleArrow}>{expanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {/* Expanded state - show fish chips */}
      {expanded && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {/* All / Reset */}
          <TouchableOpacity
            style={[styles.filterChip, !selectedFish && styles.filterChipActive]}
            onPress={() => onSelectFish(null)}
          >
            <Text style={[styles.filterChipText, !selectedFish && styles.filterChipTextActive]}>
              Alle
            </Text>
          </TouchableOpacity>

          {/* Fish options */}
          {availableFish.map((fish) => (
            <TouchableOpacity
              key={fish}
              style={[styles.filterChip, selectedFish === fish && styles.filterChipActive]}
              onPress={() => handleSelect(fish)}
            >
              <Text style={styles.filterEmoji}>{fishEmojis[fish] || '🐟'}</Text>
              <Text
                style={[
                  styles.filterChipText,
                  selectedFish === fish && styles.filterChipTextActive,
                ]}
              >
                {fish}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 120,
    left: 16,
    right: 16,
  },
  toggleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(10, 22, 40, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterIcon: {
    fontSize: 16,
  },
  toggleText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  toggleArrow: {
    color: '#64748b',
    fontSize: 10,
  },
  filterScroll: {
    marginTop: 8,
  },
  filterContent: {
    gap: 8,
    paddingVertical: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: '#4ade8020',
    borderColor: '#4ade80',
  },
  filterEmoji: {
    fontSize: 14,
  },
  filterChipText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#4ade80',
  },
});
