/**
 * BISS SearchScreen - Vollbild-Suche für Gewässer
 * 
 * Features:
 * - Autocomplete-Suche
 * - Letzte Suchen
 * - Beliebte Gewässer
 * - Filter nach Region/Fisch
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  TextInput,
  FlatList,
  Keyboard,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Search, 
  X, 
  Clock, 
  MapPin, 
  Fish,
  TrendingUp,
  ChevronRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

// Design Tokens
const COLORS = {
  primary: '#00A3FF',
  accent: '#0066FF',
  green: '#4ADE80',
  white: '#FFFFFF',
  gray100: '#F5F5F5',
  gray200: '#E0E0E0',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray900: '#111827',
  dark: {
    bg: '#0A1A2F',
    surface: '#132337',
    card: '#1A2D44',
  },
};

// Mock recent searches
const RECENT_SEARCHES = [
  'Elbe-Seitenkanal',
  'Ilmenau',
  'Schaalssee',
];

// Water body type from MapScreen
interface WaterBody {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  region: string;
  fish_species: string[];
  permit_price: number | null;
  fangIndex: number;
}

interface SearchScreenProps {
  onClose: () => void;
  onSelectSpot?: (spotId: string) => void;
  waterBodies?: WaterBody[];
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ onClose, onSelectSpot, waterBodies = [] }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  
  // Transform waterBodies to search format
  const searchableData = waterBodies.map(wb => ({
    id: wb.id,
    name: wb.name,
    region: wb.region,
    score: wb.fangIndex,
    type: wb.type,
    fish_species: wb.fish_species,
  }));
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(searchableData);
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Auto-focus input and animate in
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleClose = () => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleSearch = (text: string) => {
    setQuery(text);
    // Filter results from actual waterBodies
    if (text.length > 0) {
      const filtered = searchableData.filter(w => 
        w.name.toLowerCase().includes(text.toLowerCase()) ||
        w.region.toLowerCase().includes(text.toLowerCase()) ||
        (w.fish_species && w.fish_species.some(f => f.toLowerCase().includes(text.toLowerCase())))
      );
      setResults(filtered);
    } else {
      setResults(searchableData);
    }
  };
  
  // Update results when waterBodies change
  useEffect(() => {
    setResults(searchableData);
  }, [waterBodies]);

  const handleSelect = (spotId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectSpot?.(spotId);
    onClose();
  };

  const handleRecentSearch = (search: string) => {
    Haptics.selectionAsync();
    setQuery(search);
    handleSearch(search);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return COLORS.green;
    if (score >= 50) return '#FACC15';
    return '#EF4444';
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        isDark && styles.containerDark,
        { opacity: fadeAnim }
      ]}
    >
      {/* Search Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={[styles.searchBar, isDark && styles.searchBarDark]}>
          <Search size={22} color={COLORS.gray400} strokeWidth={1.8} />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, isDark && styles.textLight]}
            placeholder="Gewässer, Region oder Fisch..."
            placeholderTextColor={COLORS.gray400}
            value={query}
            onChangeText={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <X size={20} color={COLORS.gray400} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.cancelBtn} 
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelText}>Abbrechen</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Recent Searches (only show if no query) */}
        {query.length === 0 && RECENT_SEARCHES.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
              Zuletzt gesucht
            </Text>
            <View style={styles.recentList}>
              {RECENT_SEARCHES.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.recentItem, isDark && styles.recentItemDark]}
                  onPress={() => handleRecentSearch(search)}
                  activeOpacity={0.7}
                >
                  <Clock size={16} color={COLORS.gray400} strokeWidth={1.8} />
                  <Text style={[styles.recentText, isDark && styles.textLight]}>
                    {search}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Results / Trending */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={18} color={COLORS.primary} strokeWidth={1.8} />
            <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
              {query.length > 0 ? 'Ergebnisse' : 'Beliebt in deiner Nähe'}
            </Text>
          </View>

          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsList}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Fish size={48} color={COLORS.gray400} strokeWidth={1.2} />
                <Text style={[styles.emptyText, isDark && styles.subtitleDark]}>
                  Keine Gewässer gefunden
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.resultCard, isDark && styles.resultCardDark]}
                onPress={() => handleSelect(item.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.resultIcon, { backgroundColor: COLORS.primary + '15' }]}>
                  <MapPin size={20} color={COLORS.primary} strokeWidth={1.8} />
                </View>
                
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultName, isDark && styles.textLight]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.resultRegion, isDark && styles.subtitleDark]}>
                    {item.region}
                  </Text>
                </View>

                <View style={styles.resultScore}>
                  <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(item.score) }]}>
                    <Text style={styles.scoreText}>{item.score}</Text>
                  </View>
                  <ChevronRight size={18} color={COLORS.gray400} strokeWidth={1.8} />
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  containerDark: {
    backgroundColor: COLORS.dark.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchBarDark: {
    backgroundColor: COLORS.dark.surface,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.gray900,
    paddingVertical: 0,
  },
  textLight: {
    color: COLORS.white,
  },
  subtitleDark: {
    color: COLORS.gray400,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cancelText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  recentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  recentItemDark: {
    backgroundColor: COLORS.dark.surface,
  },
  recentText: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  resultsList: {
    paddingBottom: 100,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  resultCardDark: {
    backgroundColor: COLORS.dark.surface,
  },
  resultIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 2,
  },
  resultRegion: {
    fontSize: 13,
    color: COLORS.gray400,
  },
  resultScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray400,
  },
});

export default SearchScreen;
