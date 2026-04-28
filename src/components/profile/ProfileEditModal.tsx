/**
 * ProfileEditModal
 * Vollständiges Profil-Edit Modal für BISS
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  User,
  FileText,
  Fish,
  Award,
  MapPin,
  Calendar,
  Check,
  RotateCcw,
  ChevronRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useUserProfile, UserProfile } from '../../hooks/useUserProfile';
import { COLORS } from '../../constants/colors';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Anfänger', icon: '🎣' },
  { value: 'intermediate', label: 'Fortgeschritten', icon: '🎯' },
  { value: 'pro', label: 'Profi', icon: '🏆' },
] as const;

const FAVORITE_FISH_OPTIONS = [
  'Hecht', 'Zander', 'Barsch', 'Karpfen', 'Forelle', 'Aal', 'Wels', 
  'Schleie', 'Brasse', 'Rotauge', 'Dorsch', 'Lachs', 'Makrele', 'Forelle'
];

const GERMAN_REGIONS = [
  'Schleswig-Holstein', 'Hamburg', 'Niedersachsen', 'Bremen', 
  'Nordrhein-Westfalen', 'Hessen', 'Rheinland-Pfalz', 'Saarland',
  'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 
  'Mecklenburg-Vorpommern', 'Sachsen', 'Sachsen-Anhalt', 'Thüringen'
];

export const ProfileEditModal: React.FC<Props> = ({ visible, onClose }) => {
  const { profile, saveProfile, saving } = useUserProfile();
  const { isDark } = useTheme();
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  const [showFishOptions, setShowFishOptions] = useState(false);
  const [showRegionOptions, setShowRegionOptions] = useState(false);
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    if (visible) {
      setEditedProfile(profile);
    }
  }, [visible, profile]);

  const handleSave = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const success = await saveProfile(editedProfile);
    if (success) {
      onClose();
    } else {
      Alert.alert('Fehler', 'Profil konnte nicht gespeichert werden.');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Profil zurücksetzen',
      'Möchtest du dein Profil wirklich auf die Standardwerte zurücksetzen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { 
          text: 'Zurücksetzen', 
          style: 'destructive',
          onPress: () => {
            setEditedProfile(profile);
          }
        }
      ]
    );
  };

  const updateField = (field: keyof UserProfile, value: string) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.container, isDark && styles.containerDark]}>
        {/* Header */}
        <View style={[styles.header, isDark && styles.headerDark, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity
            style={[styles.closeBtn, isDark && styles.closeBtnDark]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <X size={24} color={isDark ? COLORS.white : COLORS.gray600} />
          </TouchableOpacity>
          
          <Text style={[styles.title, isDark && styles.textLight]}>Profil bearbeiten</Text>
          
          <TouchableOpacity
            style={[styles.resetBtn, isDark && styles.resetBtnDark]}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <RotateCcw size={20} color={COLORS.gray500} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Section */}
          <View style={[styles.avatarSection, isDark && styles.avatarSectionDark]}>
            <View style={[styles.avatar, { backgroundColor: COLORS.primary + '20' }]}>
              <User size={40} color={COLORS.primary} strokeWidth={2} />
            </View>
            <Text style={[styles.avatarText, isDark && styles.avatarTextDark]}>
              {editedProfile.name || 'Angler'}
            </Text>
            <Text style={[styles.avatarSubtext, isDark && styles.avatarSubtextDark]}>
              Mitglied seit {new Date(profile.joinedAt).toLocaleDateString('de-DE')}
            </Text>
          </View>

          {/* Name */}
          <View style={[styles.fieldGroup, isDark && styles.fieldGroupDark]}>
            <View style={styles.fieldHeader}>
              <User size={20} color={COLORS.primary} strokeWidth={2} />
              <Text style={[styles.fieldLabel, isDark && styles.fieldLabelDark]}>Name</Text>
            </View>
            <TextInput
              style={[styles.textInput, isDark && styles.textInputDark]}
              value={editedProfile.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="Dein Angler-Name"
              placeholderTextColor={COLORS.gray400}
              maxLength={30}
            />
          </View>

          {/* Bio */}
          <View style={[styles.fieldGroup, isDark && styles.fieldGroupDark]}>
            <View style={styles.fieldHeader}>
              <FileText size={20} color={COLORS.primary} strokeWidth={2} />
              <Text style={[styles.fieldLabel, isDark && styles.fieldLabelDark]}>Bio</Text>
            </View>
            <TextInput
              style={[styles.textInput, styles.textInputMultiline, isDark && styles.textInputDark]}
              value={editedProfile.bio}
              onChangeText={(value) => updateField('bio', value)}
              placeholder="Erzähl etwas über dich und deine Angel-Leidenschaft..."
              placeholderTextColor={COLORS.gray400}
              multiline
              numberOfLines={4}
              maxLength={200}
            />
            <Text style={[styles.charCount, isDark && styles.subtitleDark]}>
              {editedProfile.bio.length}/200
            </Text>
          </View>

          {/* Lieblingsfisch */}
          <View style={[styles.fieldGroup, isDark && styles.fieldGroupDark]}>
            <View style={styles.fieldHeader}>
              <Fish size={20} color={COLORS.primary} strokeWidth={2} />
              <Text style={[styles.fieldLabel, isDark && styles.fieldLabelDark]}>Lieblingsfisch</Text>
            </View>
            <TouchableOpacity
              style={[styles.selector, isDark && styles.selectorDark]}
              onPress={() => setShowFishOptions(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.selectorText, isDark && styles.selectorTextDark]}>
                {editedProfile.favoriteFish || 'Wähle deinen Lieblingsfisch'}
              </Text>
              <ChevronRight size={20} color={COLORS.gray400} />
            </TouchableOpacity>
          </View>

          {/* Erfahrung */}
          <View style={[styles.fieldGroup, isDark && styles.fieldGroupDark]}>
            <View style={styles.fieldHeader}>
              <Award size={20} color={COLORS.primary} strokeWidth={2} />
              <Text style={[styles.fieldLabel, isDark && styles.fieldLabelDark]}>Erfahrung</Text>
            </View>
            <View style={styles.experienceGrid}>
              {EXPERIENCE_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.experienceCard,
                    editedProfile.experienceLevel === level.value && styles.experienceCardActive,
                    isDark && styles.experienceCardDark,
                    editedProfile.experienceLevel === level.value && styles.experienceCardActiveDark,
                  ]}
                  onPress={() => updateField('experienceLevel', level.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.experienceIcon}>{level.icon}</Text>
                  <Text style={[
                    styles.experienceLabel,
                    editedProfile.experienceLevel === level.value && styles.experienceLabelActive,
                    isDark && styles.experienceLabelDark,
                  ]}>
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Heimatregion */}
          <View style={[styles.fieldGroup, isDark && styles.fieldGroupDark]}>
            <View style={styles.fieldHeader}>
              <MapPin size={20} color={COLORS.primary} strokeWidth={2} />
              <Text style={[styles.fieldLabel, isDark && styles.fieldLabelDark]}>Heimatregion</Text>
            </View>
            <TouchableOpacity
              style={[styles.selector, isDark && styles.selectorDark]}
              onPress={() => setShowRegionOptions(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.selectorText, isDark && styles.selectorTextDark]}>
                {editedProfile.homeRegion || 'Wähle deine Heimatregion'}
              </Text>
              <ChevronRight size={20} color={COLORS.gray400} />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={[styles.footer, isDark && styles.footerDark, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            style={[styles.saveBtn, isDark && styles.saveBtnDark]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <Text style={styles.saveBtnText}>Speichern...</Text>
            ) : (
              <>
                <Check size={20} color={COLORS.white} strokeWidth={2} />
                <Text style={[styles.title, isDark && styles.titleDark]}>Profil bearbeiten</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Fish Options Modal */}
        <Modal visible={showFishOptions} animationType="fade" transparent>
          <View style={styles.optionsOverlay}>
            <View style={[styles.optionsModal, isDark && styles.optionsModalDark]}>
              <View style={styles.optionsHeader}>
                <Text style={[styles.optionsTitle, isDark && styles.optionsTitleDark]}>Lieblingsfisch</Text>
                <TouchableOpacity onPress={() => setShowFishOptions(false)}>
                  <X size={24} color={isDark ? COLORS.white : COLORS.gray600} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {FAVORITE_FISH_OPTIONS.map((fish) => (
                  <TouchableOpacity
                    key={fish}
                    style={[
                      styles.optionItem,
                      editedProfile.favoriteFish === fish && styles.optionItemActive,
                      isDark && styles.optionItemDark,
                    ]}
                    onPress={() => {
                      updateField('favoriteFish', fish);
                      setShowFishOptions(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.optionText,
                      editedProfile.favoriteFish === fish && styles.optionTextActive,
                      isDark && styles.optionTextDark,
                    ]}>
                      {fish}
                    </Text>
                    {editedProfile.favoriteFish === fish && (
                      <Check size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Region Options Modal */}
        <Modal visible={showRegionOptions} animationType="fade" transparent>
          <View style={styles.optionsOverlay}>
            <View style={[styles.optionsModal, isDark && styles.optionsModalDark]}>
              <View style={styles.optionsHeader}>
                <Text style={[styles.optionsTitle, isDark && styles.optionsTitleDark]}>Heimatregion</Text>
                <TouchableOpacity onPress={() => setShowRegionOptions(false)}>
                  <X size={24} color={isDark ? COLORS.white : COLORS.gray600} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {GERMAN_REGIONS.map((region) => (
                  <TouchableOpacity
                    key={region}
                    style={[
                      styles.optionItem,
                      editedProfile.homeRegion === region && styles.optionItemActive,
                      isDark && styles.optionItemDark,
                    ]}
                    onPress={() => {
                      updateField('homeRegion', region);
                      setShowRegionOptions(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.optionText,
                      editedProfile.homeRegion === region && styles.optionTextActive,
                      isDark && styles.optionTextDark,
                    ]}>
                      {region}
                    </Text>
                    {editedProfile.homeRegion === region && (
                      <Check size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
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
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnDark: {
    backgroundColor: COLORS.dark.bg,
  },
  resetBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetBtnDark: {
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
  },
  avatarSection: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarSectionDark: {
    backgroundColor: COLORS.dark.card,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  avatarTextDark: {
    color: COLORS.white,
  },
  avatarSubtext: {
    fontSize: 14,
    color: COLORS.gray500,
  },
  avatarSubtextDark: {
    color: COLORS.gray400,
  },
  fieldGroup: {
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
  fieldGroupDark: {
    backgroundColor: COLORS.dark.card,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
    marginLeft: 8,
  },
  fieldLabelDark: {
    color: COLORS.white,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.gray900,
    backgroundColor: COLORS.white,
  },
  textInputDark: {
    borderColor: COLORS.dark.card,
    backgroundColor: COLORS.dark.bg,
    color: COLORS.white,
  },
  textInputMultiline: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: COLORS.gray500,
    textAlign: 'right',
    marginTop: 4,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  selectorDark: {
    borderColor: COLORS.dark.card,
    backgroundColor: COLORS.dark.bg,
  },
  selectorText: {
    fontSize: 16,
    color: COLORS.gray900,
  },
  selectorTextDark: {
    color: COLORS.white,
  },
  experienceGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  experienceCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
  experienceCardDark: {
    borderColor: COLORS.dark.card,
    backgroundColor: COLORS.dark.bg,
  },
  experienceCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  experienceCardActiveDark: {
    backgroundColor: COLORS.primary + '20',
  },
  experienceIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  experienceLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.gray600,
    textAlign: 'center',
  },
  experienceLabelDark: {
    color: COLORS.gray400,
  },
  experienceLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
  footerDark: {
    borderTopColor: COLORS.dark.card,
    backgroundColor: COLORS.dark.surface,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
  },
  saveBtnDark: {
    backgroundColor: COLORS.primary,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  optionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  optionsModal: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    maxHeight: '70%',
  },
  optionsModalDark: {
    backgroundColor: COLORS.dark.card,
  },
  optionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  optionsTitleDark: {
    color: COLORS.white,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  optionItemDark: {
    borderBottomColor: COLORS.dark.card,
  },
  optionItemActive: {
    backgroundColor: COLORS.primary + '5',
  },
  optionText: {
    fontSize: 16,
    color: COLORS.gray900,
  },
  optionTextDark: {
    color: COLORS.white,
  },
  optionTextActive: {
    color: COLORS.primary,
    fontWeight: '500',
  },
});
