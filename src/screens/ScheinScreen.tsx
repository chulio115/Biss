/**
 * BISS ScheinScreen - Angelschein Wallet
 * Upload, Anzeige & Verwaltung des Fischereischeins
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  FileText,
  Camera,
  ImageIcon,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2,
  Edit3,
  ChevronRight,
  X,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/colors';
import { useFishingLicense, StoredLicense } from '../hooks/useFishingLicense';

interface ScheinScreenProps {
  onClose?: () => void;
}

export const ScheinScreen: React.FC<ScheinScreenProps> = ({ onClose }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { license, loading, saveLicense, updateLicense, removeLicense, isValid, hasLicense } = useFishingLicense();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', licenseNumber: '', issuingAuthority: '', validUntil: '' });
  const [uploading, setUploading] = useState(false);

  const pickImage = async (source: 'camera' | 'gallery') => {
    try {
      let result: ImagePicker.ImagePickerResult;

      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Kamera-Berechtigung', 'Bitte erlaube den Kamerazugriff in den Einstellungen.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          quality: 0.8,
          allowsEditing: true,
          aspect: [3, 2],
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Galerie-Berechtigung', 'Bitte erlaube den Zugriff auf deine Fotos.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          quality: 0.8,
          allowsEditing: true,
          aspect: [3, 2],
        });
      }

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await saveLicense({
          imageUri: result.assets[0].uri,
          addedAt: new Date().toISOString(),
        });
        setUploading(false);
      }
    } catch (e) {
      setUploading(false);
      Alert.alert('Fehler', 'Bild konnte nicht geladen werden.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Schein entfernen',
      'Möchtest du deinen Fischereischein wirklich entfernen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Entfernen',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            removeLicense();
          },
        },
      ]
    );
  };

  const startEditing = () => {
    setEditData({
      name: license?.name ?? '',
      licenseNumber: license?.licenseNumber ?? '',
      issuingAuthority: license?.issuingAuthority ?? '',
      validUntil: license?.validUntil ?? '',
    });
    setIsEditing(true);
  };

  const saveEdits = async () => {
    await updateLicense({
      name: editData.name || undefined,
      licenseNumber: editData.licenseNumber || undefined,
      issuingAuthority: editData.issuingAuthority || undefined,
      validUntil: editData.validUntil || undefined,
    });
    setIsEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const validity = isValid();
  const validityColor = validity === true ? COLORS.green : validity === false ? COLORS.red : COLORS.gray400;
  const validityLabel = validity === true ? 'Gültig' : validity === false ? 'Abgelaufen' : 'Gültigkeit unbekannt';
  const ValidityIcon = validity === true ? CheckCircle : validity === false ? AlertCircle : Clock;

  if (loading) {
    return (
      <View style={[styles.container, isDark && styles.containerDark, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={[styles.header, isDark && styles.headerDark, { paddingTop: insets.top + 16 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[styles.title, isDark && styles.textLight]}>Mein Schein</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <X size={24} color={isDark ? COLORS.white : COLORS.gray600} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          {hasLicense ? 'Dein digitaler Angelschein' : 'Schein jetzt hinterlegen'}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {hasLicense && license ? (
          <>
            {/* ─── Wallet Card ─── */}
            <View style={[styles.walletCard, isDark && styles.walletCardDark]}>
              {/* License Image */}
              <View style={styles.imageContainer}>
                <Image source={{ uri: license.imageUri }} style={styles.licenseImage} resizeMode="cover" />
                <View style={[styles.validityBadge, { backgroundColor: validityColor + '20' }]}>
                  <ValidityIcon size={14} color={validityColor} />
                  <Text style={[styles.validityText, { color: validityColor }]}>{validityLabel}</Text>
                </View>
              </View>

              {/* Metadata */}
              <View style={styles.metaSection}>
                {license.name && (
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, isDark && styles.metaLabelDark]}>Inhaber</Text>
                    <Text style={[styles.metaValue, isDark && styles.textLight]}>{license.name}</Text>
                  </View>
                )}
                {license.licenseNumber && (
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, isDark && styles.metaLabelDark]}>Scheinnummer</Text>
                    <Text style={[styles.metaValue, isDark && styles.textLight]}>{license.licenseNumber}</Text>
                  </View>
                )}
                {license.issuingAuthority && (
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, isDark && styles.metaLabelDark]}>Ausgestellt von</Text>
                    <Text style={[styles.metaValue, isDark && styles.textLight]}>{license.issuingAuthority}</Text>
                  </View>
                )}
                {license.validUntil && (
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, isDark && styles.metaLabelDark]}>Gültig bis</Text>
                    <Text style={[styles.metaValue, isDark && styles.textLight]}>{license.validUntil}</Text>
                  </View>
                )}
                {!license.name && !license.licenseNumber && (
                  <TouchableOpacity style={styles.addMetaCta} onPress={startEditing}>
                    <Edit3 size={16} color={COLORS.primary} />
                    <Text style={styles.addMetaText}>Details hinzufügen (Name, Nummer, ...)</Text>
                    <ChevronRight size={16} color={COLORS.gray400} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, isDark && styles.actionBtnDark]}
                onPress={startEditing}
              >
                <Edit3 size={18} color={COLORS.primary} />
                <Text style={styles.actionBtnText}>Details bearbeiten</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, isDark && styles.actionBtnDark]}
                onPress={() => pickImage('camera')}
              >
                <Camera size={18} color={COLORS.primary} />
                <Text style={styles.actionBtnText}>Neues Foto</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnDanger]}
                onPress={handleDelete}
              >
                <Trash2 size={18} color={COLORS.red} />
                <Text style={[styles.actionBtnText, { color: COLORS.red }]}>Entfernen</Text>
              </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={[styles.infoCard, isDark && styles.infoCardDark]}>
              <Shield size={20} color={COLORS.primary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.infoTitle, isDark && styles.textLight]}>Sicher gespeichert</Text>
                <Text style={[styles.infoDesc, isDark && styles.subtitleDark]}>
                  Dein Schein wird nur lokal auf deinem Gerät gespeichert und nie an Dritte weitergegeben.
                </Text>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* ─── Empty State ─── */}
            <View style={[styles.emptyCard, isDark && styles.emptyCardDark]}>
              <View style={styles.emptyIconWrap}>
                <FileText size={48} color={COLORS.primary} strokeWidth={1.2} />
              </View>
              <Text style={[styles.emptyTitle, isDark && styles.textLight]}>
                Fischereischein hinterlegen
              </Text>
              <Text style={[styles.emptyDesc, isDark && styles.subtitleDark]}>
                Fotografiere deinen Fischereischein oder wähle ein bestehendes Foto, um ihn digital bei Kontrollen vorzeigen zu können.
              </Text>

              {uploading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 24 }} />
              ) : (
                <View style={styles.uploadActions}>
                  <TouchableOpacity
                    style={styles.uploadBtn}
                    onPress={() => pickImage('camera')}
                    activeOpacity={0.8}
                  >
                    <Camera size={22} color={COLORS.white} />
                    <Text style={styles.uploadBtnText}>Kamera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.uploadBtn, styles.uploadBtnSecondary]}
                    onPress={() => pickImage('gallery')}
                    activeOpacity={0.8}
                  >
                    <ImageIcon size={22} color={COLORS.primary} />
                    <Text style={[styles.uploadBtnText, styles.uploadBtnTextSecondary]}>Galerie</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Feature Preview */}
            <Text style={[styles.sectionTitle, isDark && styles.textLight]}>So funktioniert's</Text>
            <View style={styles.stepsContainer}>
              {[
                { num: '1', title: 'Schein fotografieren', desc: 'Mit der Kamera oder aus der Galerie' },
                { num: '2', title: 'Details ergänzen', desc: 'Name, Nummer und Gültigkeit eintragen' },
                { num: '3', title: 'Bei Kontrollen vorzeigen', desc: 'Immer griffbereit auf dem Handy' },
              ].map((step, i) => (
                <View key={i} style={[styles.stepRow, isDark && styles.stepRowDark]}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{step.num}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stepTitle, isDark && styles.textLight]}>{step.title}</Text>
                    <Text style={[styles.stepDesc, isDark && styles.subtitleDark]}>{step.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* ─── Edit Modal (inline overlay) ─── */}
      {isEditing && (
        <View style={styles.editOverlay}>
          <View style={[styles.editSheet, isDark && styles.editSheetDark]}>
            <View style={styles.editHeader}>
              <Text style={[styles.editTitle, isDark && styles.textLight]}>Details bearbeiten</Text>
              <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.editCloseBtn}>
                <X size={20} color={isDark ? COLORS.gray300 : COLORS.gray500} />
              </TouchableOpacity>
            </View>

            {[
              { label: 'Name', key: 'name' as const, placeholder: 'Max Mustermann' },
              { label: 'Scheinnummer', key: 'licenseNumber' as const, placeholder: 'z.B. 12345678' },
              { label: 'Ausstellende Behörde', key: 'issuingAuthority' as const, placeholder: 'z.B. Stadt Köln' },
              { label: 'Gültig bis', key: 'validUntil' as const, placeholder: 'z.B. 2027-12-31' },
            ].map((field) => (
              <View key={field.key} style={styles.editField}>
                <Text style={[styles.editLabel, isDark && styles.subtitleDark]}>{field.label}</Text>
                <TextInput
                  style={[styles.editInput, isDark && styles.editInputDark]}
                  value={editData[field.key]}
                  onChangeText={(val) => setEditData((prev) => ({ ...prev, [field.key]: val }))}
                  placeholder={field.placeholder}
                  placeholderTextColor={COLORS.gray400}
                />
              </View>
            ))}

            <TouchableOpacity style={styles.editSaveBtn} onPress={saveEdits} activeOpacity={0.8}>
              <Text style={styles.editSaveBtnText}>Speichern</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray100 },
  containerDark: { backgroundColor: COLORS.dark.bg },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingBottom: 20, backgroundColor: COLORS.white },
  headerDark: { backgroundColor: COLORS.dark.surface },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.gray900, marginBottom: 4 },
  subtitle: { fontSize: 15, color: COLORS.gray400 },
  subtitleDark: { color: COLORS.gray400 },
  textLight: { color: COLORS.white },
  content: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 120 },

  // ─── Wallet Card ───
  walletCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
    marginBottom: 20,
  },
  walletCardDark: { backgroundColor: COLORS.dark.card },
  imageContainer: { position: 'relative' },
  licenseImage: { width: '100%', height: 220, backgroundColor: COLORS.gray200 },
  validityBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  validityText: { fontSize: 12, fontWeight: '700' },
  metaSection: { padding: 20 },
  metaRow: { marginBottom: 12 },
  metaLabel: { fontSize: 11, fontWeight: '600', color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  metaLabelDark: { color: COLORS.gray500 },
  metaValue: { fontSize: 16, fontWeight: '600', color: COLORS.gray900 },
  addMetaCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.primary + '08',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  addMetaText: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.primary },

  // ─── Actions ───
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  actionBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionBtnDark: { backgroundColor: COLORS.dark.card },
  actionBtnDanger: { backgroundColor: '#FEF2F2' },
  actionBtnText: { fontSize: 11, fontWeight: '600', color: COLORS.gray700 },

  // ─── Info Card ───
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoCardDark: { backgroundColor: COLORS.dark.card },
  infoTitle: { fontSize: 14, fontWeight: '700', color: COLORS.gray900, marginBottom: 4 },
  infoDesc: { fontSize: 12, color: COLORS.gray500, lineHeight: 18 },

  // ─── Empty State ───
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 32,
  },
  emptyCardDark: { backgroundColor: COLORS.dark.card },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: COLORS.gray900, marginBottom: 8, textAlign: 'center' },
  emptyDesc: { fontSize: 14, color: COLORS.gray500, lineHeight: 22, textAlign: 'center', marginBottom: 4 },
  uploadActions: { flexDirection: 'row', gap: 12, marginTop: 24, width: '100%' },
  uploadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadBtnSecondary: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowOpacity: 0,
  },
  uploadBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  uploadBtnTextSecondary: { color: COLORS.primary },

  // ─── Steps ───
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.gray900, marginBottom: 16 },
  stepsContainer: { gap: 12 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  stepRowDark: { backgroundColor: COLORS.dark.card },
  stepNum: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumText: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  stepTitle: { fontSize: 14, fontWeight: '700', color: COLORS.gray900, marginBottom: 2 },
  stepDesc: { fontSize: 12, color: COLORS.gray500 },

  // ─── Edit Overlay ───
  editOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  editSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  editSheetDark: { backgroundColor: COLORS.dark.bg },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.gray200,
    marginBottom: 16,
  },
  editTitle: { fontSize: 18, fontWeight: '700', color: COLORS.gray900 },
  editCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.gray100, justifyContent: 'center', alignItems: 'center' },
  editField: { marginBottom: 16 },
  editLabel: { fontSize: 12, fontWeight: '600', color: COLORS.gray500, marginBottom: 6 },
  editInput: {
    backgroundColor: COLORS.gray50,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.gray900,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  editInputDark: {
    backgroundColor: COLORS.dark.surface,
    borderColor: COLORS.dark.border,
    color: COLORS.white,
  },
  editSaveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  editSaveBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
});

export default ScheinScreen;
