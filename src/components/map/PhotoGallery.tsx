/**
 * 🆕 PhotoGallery Component
 * Horizontale Foto-Galerie mit Vollbild-Ansicht
 * 
 * Features:
 * - Horizontal scrollable thumbnails
 * - Tap für Vollbild-Ansicht
 * - Swipe durch alle Fotos
 * - Foto-Counter
 */
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { X, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PhotoGalleryProps {
  photos: string[];
  spotName?: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ 
  photos, 
  spotName 
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  if (!photos || photos.length === 0) {
    return (
      <View style={styles.placeholder}>
        <ImageIcon size={32} color="#9CA3AF" />
        <Text style={styles.placeholderText}>Keine Fotos verfügbar</Text>
      </View>
    );
  }

  const openFullscreen = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentIndex(index);
    setModalVisible(true);
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    Haptics.selectionAsync();
    const newIndex = direction === 'next' 
      ? Math.min(currentIndex + 1, photos.length - 1)
      : Math.max(currentIndex - 1, 0);
    setCurrentIndex(newIndex);
  };

  return (
    <View style={styles.container}>
      {/* Thumbnail Strip */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {photos.map((photo, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => openFullscreen(index)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: photo }}
              style={[
                styles.thumbnail,
                index === 0 && styles.thumbnailFirst,
                photos.length === 1 && styles.thumbnailSingle,
              ]}
              resizeMode="cover"
            />
            {index === 0 && photos.length > 1 && (
              <View style={styles.photoCountBadge}>
                <Text style={styles.photoCountText}>
                  1/{photos.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Fullscreen Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        statusBarTranslucent
        onRequestClose={() => setModalVisible(false)}
      >
        <StatusBar hidden />
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setModalVisible(false)}
          >
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Photo Counter */}
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>
              {currentIndex + 1} / {photos.length}
            </Text>
            {spotName && (
              <Text style={styles.spotNameText}>{spotName}</Text>
            )}
          </View>

          {/* Main Image */}
          <Image
            source={{ uri: photos[currentIndex] }}
            style={styles.fullImage}
            resizeMode="contain"
          />

          {/* Navigation Arrows */}
          {currentIndex > 0 && (
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnLeft]}
              onPress={() => navigatePhoto('prev')}
            >
              <ChevronLeft size={32} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          {currentIndex < photos.length - 1 && (
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnRight]}
              onPress={() => navigatePhoto('next')}
            >
              <ChevronRight size={32} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          {/* Dot Indicators */}
          <View style={styles.dotsContainer}>
            {photos.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingRight: 20,
  },
  thumbnail: {
    width: 140,
    height: 100,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: '#E5E7EB',
  },
  thumbnailFirst: {
    width: 200,
    height: 140,
  },
  thumbnailSingle: {
    width: '100%',
    height: 180,
    marginRight: 0,
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 8,
    right: 18,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  photoCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  placeholder: {
    height: 120,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderText: {
    marginTop: 8,
    color: '#9CA3AF',
    fontSize: 13,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  counterContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  spotNameText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 4,
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  navBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnLeft: {
    left: 16,
  },
  navBtnRight: {
    right: 16,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
});

export default PhotoGallery;
