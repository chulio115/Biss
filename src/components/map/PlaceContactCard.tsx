/**
 * 🆕 PlaceContactCard Component
 * Zeigt Kontaktdaten: Telefon, Website, Adresse, Öffnungszeiten
 * 
 * Features:
 * - Tap-to-Call
 * - Tap-to-Open-Website
 * - Kopieren der Adresse
 * - Expandable Öffnungszeiten
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Clipboard } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Phone,
  Globe,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Navigation,
} from 'lucide-react-native';

interface PlaceContactCardProps {
  phone?: string;
  website?: string;
  address?: string;
  googleMapsUrl?: string;
  hours?: string[];
  openNow?: boolean;
}

export const PlaceContactCard: React.FC<PlaceContactCardProps> = ({
  phone,
  website,
  address,
  googleMapsUrl,
  hours,
  openNow,
}) => {
  const [hoursExpanded, setHoursExpanded] = useState(false);

  const handleCall = () => {
    if (!phone) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
  };

  const handleWebsite = () => {
    if (!website) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(website);
  };

  const handleCopyAddress = () => {
    if (!address) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Clipboard.setString(address);
    Alert.alert('Kopiert!', 'Adresse in Zwischenablage kopiert.');
  };

  const handleOpenMaps = () => {
    if (!googleMapsUrl) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(googleMapsUrl);
  };

  const getTodayHours = (): string | null => {
    if (!hours || hours.length === 0) return null;
    const today = new Date().getDay();
    // Google returns Mon-Sun, JS Date returns Sun=0
    const dayIndex = today === 0 ? 6 : today - 1;
    const todayHours = hours[dayIndex];
    // Extract just the hours part (after ": ")
    return todayHours?.split(': ')[1] || null;
  };

  const todayHours = getTodayHours();

  // Don't render if no data
  if (!phone && !website && !address && !hours?.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Kontakt & Info</Text>

      {/* Phone */}
      {phone && (
        <TouchableOpacity style={styles.row} onPress={handleCall}>
          <View style={[styles.iconBox, styles.iconPhone]}>
            <Phone size={16} color="#10B981" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Telefon</Text>
            <Text style={styles.rowValue}>{phone}</Text>
          </View>
          <Text style={styles.actionHint}>Anrufen</Text>
        </TouchableOpacity>
      )}

      {/* Website */}
      {website && (
        <TouchableOpacity style={styles.row} onPress={handleWebsite}>
          <View style={[styles.iconBox, styles.iconWeb]}>
            <Globe size={16} color="#0066FF" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Website</Text>
            <Text style={styles.rowValue} numberOfLines={1}>
              {website.replace(/^https?:\/\/(www\.)?/, '')}
            </Text>
          </View>
          <ExternalLink size={16} color="#9CA3AF" />
        </TouchableOpacity>
      )}

      {/* Address */}
      {address && (
        <View style={styles.row}>
          <View style={[styles.iconBox, styles.iconAddress]}>
            <MapPin size={16} color="#F59E0B" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Adresse</Text>
            <Text style={styles.rowValue}>{address}</Text>
          </View>
          <View style={styles.addressActions}>
            <TouchableOpacity 
              style={styles.miniBtn} 
              onPress={handleCopyAddress}
            >
              <Copy size={14} color="#6B7280" />
            </TouchableOpacity>
            {googleMapsUrl && (
              <TouchableOpacity 
                style={styles.miniBtn} 
                onPress={handleOpenMaps}
              >
                <Navigation size={14} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Opening Hours */}
      {hours && hours.length > 0 && (
        <View style={styles.hoursContainer}>
          <TouchableOpacity 
            style={styles.row}
            onPress={() => {
              Haptics.selectionAsync();
              setHoursExpanded(!hoursExpanded);
            }}
          >
            <View style={[styles.iconBox, styles.iconHours]}>
              <Clock size={16} color="#8B5CF6" />
            </View>
            <View style={styles.rowContent}>
              <View style={styles.hoursHeader}>
                <Text style={styles.rowLabel}>Öffnungszeiten</Text>
                {openNow !== undefined && (
                  <View style={[
                    styles.openBadge,
                    openNow ? styles.openBadgeOpen : styles.openBadgeClosed
                  ]}>
                    <Text style={[
                      styles.openBadgeText,
                      { color: openNow ? '#10B981' : '#EF4444' }
                    ]}>
                      {openNow ? 'Geöffnet' : 'Geschlossen'}
                    </Text>
                  </View>
                )}
              </View>
              {todayHours && !hoursExpanded && (
                <Text style={styles.rowValue}>Heute: {todayHours}</Text>
              )}
            </View>
            {hoursExpanded ? (
              <ChevronUp size={18} color="#9CA3AF" />
            ) : (
              <ChevronDown size={18} color="#9CA3AF" />
            )}
          </TouchableOpacity>

          {/* Expanded Hours List */}
          {hoursExpanded && (
            <View style={styles.hoursList}>
              {hours.map((dayHours, index) => {
                const today = new Date().getDay();
                const dayIndex = today === 0 ? 6 : today - 1;
                const isToday = index === dayIndex;
                
                return (
                  <View 
                    key={index} 
                    style={[
                      styles.hoursRow,
                      isToday && styles.hoursRowToday
                    ]}
                  >
                    <Text style={[
                      styles.hoursDay,
                      isToday && styles.hoursDayToday
                    ]}>
                      {dayHours.split(': ')[0]}
                    </Text>
                    <Text style={[
                      styles.hoursTime,
                      isToday && styles.hoursTimeToday
                    ]}>
                      {dayHours.split(': ')[1]}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconPhone: { backgroundColor: '#D1FAE5' },
  iconWeb: { backgroundColor: '#DBEAFE' },
  iconAddress: { backgroundColor: '#FEF3C7' },
  iconHours: { backgroundColor: '#EDE9FE' },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  actionHint: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  miniBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hoursContainer: {
    borderBottomWidth: 0,
  },
  hoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  openBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  openBadgeOpen: {
    backgroundColor: '#D1FAE5',
  },
  openBadgeClosed: {
    backgroundColor: '#FEE2E2',
  },
  openBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  hoursList: {
    marginLeft: 48,
    marginTop: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  hoursRowToday: {
    backgroundColor: '#EEF2FF',
    marginHorizontal: -8,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  hoursDay: {
    fontSize: 13,
    color: '#6B7280',
    width: 100,
  },
  hoursDayToday: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  hoursTime: {
    fontSize: 13,
    color: '#111827',
  },
  hoursTimeToday: {
    color: '#4F46E5',
    fontWeight: '600',
  },
});

export default PlaceContactCard;
