/**
 * OfflineMapsScreen
 * Mapbox Offline-Karten Downloads verwalten
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Download,
  Wifi,
  WifiOff,
  Trash2,
  Check,
  X,
  RefreshCw,
  MapPin,
  HardDrive,
  Clock,
  AlertCircle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useOfflineMaps } from '../hooks/useOfflineMaps';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { COLORS } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

interface OfflineRegion {
  name: string;
  bounds: [[number, number], [number, number]];
  minZoom: number;
  maxZoom: number;
  styleURL: string;
  size?: number;
  progress?: number;
  state: 'available' | 'downloading' | 'downloaded' | 'error';
  downloadedAt?: string;
}

const OFFLINE_REGIONS: OfflineRegion[] = [
  {
    name: 'Niedersachsen',
    bounds: [
      [7.2, 51.3], // Southwest corner
      [11.5, 54.1], // Northeast corner
    ],
    minZoom: 7,
    maxZoom: 14,
    styleURL: 'mapbox://styles/chulio115/cmmkducr7000301r0aigcgiyj',
    state: 'available',
  },
  {
    name: 'Hamburg & Schleswig-Holstein',
    bounds: [
      [8.5, 53.3], // Southwest corner
      [11.5, 55.0], // Northeast corner
    ],
    minZoom: 7,
    maxZoom: 14,
    styleURL: 'mapbox://styles/chulio115/cmmkducr7000301r0aigcgiyj',
    state: 'available',
  },
  {
    name: 'Norddeutschland (Komplett)',
    bounds: [
      [7.2, 51.3], // Southwest corner
      [14.5, 55.5], // Northeast corner
    ],
    minZoom: 7,
    maxZoom: 14,
    styleURL: 'mapbox://styles/chulio115/cmmkducr7000301r0aigcgiyj',
    state: 'available',
  },
];

export const OfflineMapsScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { isConnected } = useNetworkStatus();
  const { isDark } = useTheme();
  const { 
    packs, 
    downloadPack, 
    deletePack, 
    checkExistingPacks,
    isDownloading 
  } = useOfflineMaps();
  const [regions, setRegions] = useState<OfflineRegion[]>(OFFLINE_REGIONS);
  const [downloading, setDownloading] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    checkExistingPacks();
    updateRegionStates();
  }, [packs]);

  const updateRegionStates = () => {
    const updatedRegions = OFFLINE_REGIONS.map(region => {
      const existingPack = packs.find(pack => pack.name === region.name);
      if (existingPack) {
        return {
          ...region,
          state: 'downloaded' as const,
          downloadedAt: existingPack.downloadedAt ? new Date(existingPack.downloadedAt).toLocaleDateString('de-DE') : undefined,
          size: existingPack.completedSize || 0,
        };
      }
      return region;
    });
    setRegions(updatedRegions);
  };

  const handleDownload = async (region: OfflineRegion) => {
    if (!isConnected) {
      Alert.alert('Keine Verbindung', 'Du bist offline. Bitte stelle eine Internetverbindung her.');
      return;
    }

    Alert.alert(
      'Offline-Karte herunterladen',
      `Möchtest du "${region.name}" herunterladen? Das kann einige Minuten dauern und ca. ${region.size || '50-100'}MB Speicherplatz benötigen.`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        { 
          text: 'Herunterladen', 
          onPress: () => startDownload(region),
          style: 'default'
        }
      ]
    );
  };

  const startDownload = async (region: OfflineRegion) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDownloading(region.name);

    try {
      // Update region state to downloading
      setRegions(prev => prev.map(r => 
        r.name === region.name ? { ...r, state: 'downloading', progress: 0 } : r
      ));

      // Start download
      await downloadPack();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      updateRegionStates();
      
      Alert.alert(
        'Erfolg',
        `"${region.name}" wurde erfolgreich heruntergeladen.`
      );
    } catch (error) {
      console.error('Download error:', error);
      setRegions(prev => prev.map(r => 
        r.name === region.name ? { ...r, state: 'error' } : r
      ));
      
      Alert.alert(
        'Fehler',
        'Download fehlgeschlagen. Bitte versuche es erneut.'
      );
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = (region: OfflineRegion) => {
    Alert.alert(
      'Offline-Karte löschen',
      `Möchtest du "${region.name}" wirklich löschen? Die Karte wird dann nicht mehr offline verfügbar sein.`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        { 
          text: 'Löschen', 
          style: 'destructive',
          onPress: () => deleteOfflinePack(region)
        }
      ]
    );
  };

  const deleteOfflinePack = async (region: OfflineRegion) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    try {
      await deletePack();
      updateRegionStates();
      
      Alert.alert(
        'Gelöscht',
        `"${region.name}" wurde entfernt.`
      );
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Fehler', 'Löschen fehlgeschlagen.');
    }
  };

  const refreshPacks = () => {
    checkExistingPacks();
    updateRegionStates();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return 'Unbekannt';
    const mb = bytes / (1024 * 1024);
    return `${Math.round(mb)}MB`;
  };

  const getRegionIcon = (region: OfflineRegion) => {
    switch (region.state) {
      case 'downloaded':
        return <Check size={20} color={COLORS.green} strokeWidth={2} />;
      case 'downloading':
        return <RefreshCw size={20} color={COLORS.primary} strokeWidth={2} />;
      case 'error':
        return <X size={20} color={COLORS.red} strokeWidth={2} />;
      default:
        return <Download size={20} color={COLORS.gray500} strokeWidth={2} />;
    }
  };

  const getRegionStatus = (region: OfflineRegion) => {
    switch (region.state) {
      case 'downloaded':
        return 'Verfügbar offline';
      case 'downloading':
        return 'Wird heruntergeladen...';
      case 'error':
        return 'Download fehlgeschlagen';
      default:
        return 'Nicht heruntergeladen';
    }
  };

  const getRegionStatusColor = (region: OfflineRegion) => {
    switch (region.state) {
      case 'downloaded':
        return COLORS.green;
      case 'downloading':
        return COLORS.primary;
      case 'error':
        return COLORS.red;
      default:
        return COLORS.gray500;
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={[styles.backBtn, isDark && styles.backBtnDark]}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={isDark ? COLORS.white : COLORS.gray600} />
        </TouchableOpacity>
        <Text style={[styles.title, isDark && styles.textLight]}>Offline-Karten</Text>
        <TouchableOpacity
          style={[styles.refreshBtn, isDark && styles.refreshBtnDark]}
          onPress={refreshPacks}
          activeOpacity={0.7}
        >
          <RefreshCw size={20} color={COLORS.gray500} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Connection Status */}
        <View style={[styles.connectionCard, isDark && styles.connectionCardDark]}>
          <View style={styles.connectionHeader}>
            {isConnected ? (
              <Wifi size={20} color={COLORS.green} strokeWidth={2} />
            ) : (
              <WifiOff size={20} color={COLORS.red} strokeWidth={2} />
            )}
            <Text style={[styles.connectionTitle, isDark && styles.textLight]}>
              {isConnected ? 'Online' : 'Offline'}
            </Text>
          </View>
          <Text style={[styles.connectionDesc, isDark && styles.subtitleDark]}>
            {isConnected 
              ? 'Du kannst neue Offline-Karten herunterladen'
              : 'Du bist offline. Heruntergeladene Karten funktionieren weiterhin.'
            }
          </Text>
        </View>

        {/* Storage Info */}
        <View style={[styles.storageCard, isDark && styles.storageCardDark]}>
          <View style={styles.storageHeader}>
            <HardDrive size={20} color={COLORS.primary} strokeWidth={2} />
            <Text style={[styles.storageTitle, isDark && styles.textLight]}>
              Speicherplatz
            </Text>
          </View>
          <View style={styles.storageInfo}>
            <Text style={[styles.storageUsed, isDark && styles.textLight]}>
              {formatSize(packs.reduce((total, pack) => total + (pack.completedSize || 0), 0))}
            </Text>
            <Text style={[styles.storageTotal, isDark && styles.subtitleDark]}>
              von allen Offline-Karten
            </Text>
          </View>
        </View>

        {/* Available Regions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
            Verfügbare Regionen
          </Text>
          <Text style={[styles.sectionDesc, isDark && styles.subtitleDark]}>
            Lade Karten herunter, um sie auch offline zu nutzen
          </Text>

          {regions.map((region) => (
            <View key={region.name} style={[styles.regionCard, isDark && styles.regionCardDark]}>
              <View style={styles.regionHeader}>
                <View style={styles.regionInfo}>
                  <View style={styles.regionTitleRow}>
                    <Text style={[styles.regionName, isDark && styles.textLight]}>
                      {region.name}
                    </Text>
                    <View style={styles.regionIcon}>
                      {getRegionIcon(region)}
                    </View>
                  </View>
                  <Text style={[styles.regionStatus, { color: getRegionStatusColor(region) }]}>
                    {getRegionStatus(region)}
                  </Text>
                  {region.downloadedAt && (
                    <Text style={[styles.regionDate, isDark && styles.subtitleDark]}>
                      Heruntergeladen am {region.downloadedAt}
                    </Text>
                  )}
                </View>
              </View>

              {region.state === 'downloading' && (
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, isDark && styles.progressBarDark]}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${region.progress || 0}%` }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.progressText, isDark && styles.progressTextDark]}>
                    {region.progress || 0}%
                  </Text>
                </View>
              )}

              <View style={styles.regionDetails}>
                <View style={styles.detailItem}>
                  <MapPin size={16} color={COLORS.gray500} strokeWidth={1.5} />
                  <Text style={[styles.detailText, isDark && styles.subtitleDark]}>
                    Zoom {region.minZoom}-{region.maxZoom}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <HardDrive size={16} color={COLORS.gray500} strokeWidth={1.5} />
                  <Text style={[styles.detailText, isDark && styles.subtitleDark]}>
                    {formatSize(region.size || 0)}
                  </Text>
                </View>
              </View>

              <View style={styles.regionActions}>
                {region.state === 'downloaded' ? (
                  <TouchableOpacity
                    style={[styles.deleteBtn, isDark && styles.deleteBtnDark]}
                    onPress={() => handleDelete(region)}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={16} color={COLORS.red} strokeWidth={2} />
                    <Text style={[styles.title, isDark && styles.titleDark]}>Löschen</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.downloadBtn,
                      (region.state === 'downloading' || !isConnected) && styles.downloadBtnDisabled,
                      isDark && styles.downloadBtnDark,
                    ]}
                    onPress={() => handleDownload(region)}
                    disabled={region.state === 'downloading' || !isConnected}
                    activeOpacity={0.7}
                  >
                    <Download size={16} color={COLORS.white} strokeWidth={2} />
                    <Text style={styles.downloadBtnText}>
                      {region.state === 'downloading' ? 'Download...' : 'Herunterladen'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Tips */}
        <View style={[styles.tipsCard, isDark && styles.tipsCardDark]}>
          <View style={styles.tipsHeader}>
            <AlertCircle size={20} color={COLORS.primary} strokeWidth={2} />
            <Text style={[styles.tipsTitle, isDark && styles.textLight]}>
              Tipps
            </Text>
          </View>
          <View style={styles.tipsList}>
            <Text style={[styles.tipItem, isDark && styles.subtitleDark]}>
              • Offline-Karten funktionieren auch ohne Internetverbindung
            </Text>
            <Text style={[styles.tipItem, isDark && styles.subtitleDark]}>
              • Große Regionen benötigen mehr Speicherplatz und Ladezeit
            </Text>
            <Text style={[styles.tipItem, isDark && styles.subtitleDark]}>
              • Du kannst mehrere Regionen gleichzeitig herunterladen
            </Text>
            <Text style={[styles.tipItem, isDark && styles.subtitleDark]}>
              • Karten werden automatisch aktualisiert, wenn du online bist
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray100,
  },
  containerDark: {
    backgroundColor: COLORS.dark.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerDark: {
    backgroundColor: COLORS.dark.surface,
    borderBottomColor: COLORS.dark.card,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnDark: {
    backgroundColor: COLORS.dark.bg,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshBtnDark: {
    backgroundColor: COLORS.dark.bg,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  titleDark: {
    color: COLORS.white,
  },
  textLight: {
    color: COLORS.white,
  },
  subtitleDark: {
    color: COLORS.gray400,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  connectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  connectionCardDark: {
    backgroundColor: COLORS.dark.card,
  },
  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  connectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
    marginLeft: 8,
  },
  connectionDesc: {
    fontSize: 14,
    color: COLORS.gray600,
    lineHeight: 20,
  },
  storageCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  storageCardDark: {
    backgroundColor: COLORS.dark.card,
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
    marginLeft: 8,
  },
  storageInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  storageUsed: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray900,
    marginRight: 4,
  },
  storageTotal: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 14,
    color: COLORS.gray600,
    marginBottom: 16,
  },
  regionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  regionCardDark: {
    backgroundColor: COLORS.dark.card,
  },
  regionHeader: {
    marginBottom: 12,
  },
  regionInfo: {
    flex: 1,
  },
  regionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  regionName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
    flex: 1,
  },
  regionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  regionStatus: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  regionDate: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.gray200,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarDark: {
    backgroundColor: COLORS.dark.bg,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.gray600,
    textAlign: 'right',
  },
  progressTextDark: {
    color: COLORS.gray400,
  },
  regionDetails: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.gray600,
    marginLeft: 4,
  },
  regionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  downloadBtnDark: {
    backgroundColor: COLORS.primary,
  },
  downloadBtnDisabled: {
    backgroundColor: COLORS.gray300,
  },
  downloadBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.white,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.red + '10',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  deleteBtnDark: {
    backgroundColor: COLORS.red + '20',
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.red,
  },
  tipsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipsCardDark: {
    backgroundColor: COLORS.dark.card,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
    marginLeft: 8,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 13,
    color: COLORS.gray600,
    lineHeight: 18,
  },
});
