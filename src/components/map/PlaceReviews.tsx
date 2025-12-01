/**
 * 🆕 PlaceReviews Component
 * Zeigt Google Reviews in schönem Card-Design
 * 
 * Features:
 * - Autor-Avatar mit Fallback
 * - Star-Rating visuell
 * - Relative Zeit (vor 2 Wochen)
 * - Expandable Text für lange Reviews
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Star, ChevronDown, ChevronUp, User } from 'lucide-react-native';
import { PlaceReview } from '../../services/googlePlaces';

interface PlaceReviewsProps {
  reviews: PlaceReview[];
  maxVisible?: number;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={12}
          color="#FBBF24"
          fill={star <= rating ? '#FBBF24' : 'transparent'}
        />
      ))}
    </View>
  );
};

const ReviewCard: React.FC<{ review: PlaceReview }> = ({ review }) => {
  const [expanded, setExpanded] = useState(false);
  const isLongText = review.text.length > 150;
  const displayText = expanded || !isLongText 
    ? review.text 
    : review.text.slice(0, 150) + '...';

  return (
    <View style={styles.reviewCard}>
      {/* Header: Avatar + Name + Rating */}
      <View style={styles.reviewHeader}>
        {review.authorPhoto ? (
          <Image 
            source={{ uri: review.authorPhoto }} 
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <User size={16} color="#9CA3AF" />
          </View>
        )}
        <View style={styles.reviewMeta}>
          <Text style={styles.authorName}>{review.authorName}</Text>
          <View style={styles.ratingRow}>
            <StarRating rating={review.rating} />
            <Text style={styles.relativeTime}>{review.relativeTime}</Text>
          </View>
        </View>
      </View>

      {/* Review Text */}
      {review.text && (
        <View style={styles.reviewTextContainer}>
          <Text style={styles.reviewText}>{displayText}</Text>
          {isLongText && (
            <TouchableOpacity 
              onPress={() => setExpanded(!expanded)}
              style={styles.expandBtn}
            >
              <Text style={styles.expandBtnText}>
                {expanded ? 'Weniger' : 'Mehr lesen'}
              </Text>
              {expanded ? (
                <ChevronUp size={14} color="#0066FF" />
              ) : (
                <ChevronDown size={14} color="#0066FF" />
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export const PlaceReviews: React.FC<PlaceReviewsProps> = ({ 
  reviews, 
  maxVisible = 3 
}) => {
  const [showAll, setShowAll] = useState(false);
  const visibleReviews = showAll ? reviews : reviews.slice(0, maxVisible);
  const hasMore = reviews.length > maxVisible;

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bewertungen</Text>
        <Text style={styles.count}>{reviews.length} Rezensionen</Text>
      </View>

      {visibleReviews.map((review, index) => (
        <ReviewCard key={`${review.authorName}-${index}`} review={review} />
      ))}

      {hasMore && !showAll && (
        <TouchableOpacity 
          style={styles.showMoreBtn}
          onPress={() => setShowAll(true)}
        >
          <Text style={styles.showMoreText}>
            Alle {reviews.length} Bewertungen anzeigen
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  count: {
    fontSize: 13,
    color: '#6B7280',
  },
  reviewCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  avatarPlaceholder: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewMeta: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
  },
  relativeTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  reviewTextContainer: {
    marginTop: 4,
  },
  reviewText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  expandBtnText: {
    fontSize: 13,
    color: '#0066FF',
    fontWeight: '500',
  },
  showMoreBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    marginTop: 4,
  },
  showMoreText: {
    fontSize: 14,
    color: '#0066FF',
    fontWeight: '600',
  },
});

export default PlaceReviews;
