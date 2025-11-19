import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, Pressable, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { FAITH_TOPICS } from '../data/faithTopics'

const PRIMARY_RED = '#DC2626'
const BG = '#FFFFFF'
const CHIP_BG = 'rgba(220,38,38,0.08)'

export default function FaithLearningScreen({ navigation, route }) {
  const initialCategory = route?.params?.category || FAITH_TOPICS[0].key
  const [activeCategory, setActiveCategory] = React.useState(initialCategory)

  const activeTopic = React.useMemo(() => {
    return FAITH_TOPICS.find(topic => topic.key === activeCategory) || FAITH_TOPICS[0]
  }, [activeCategory])

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[BG, '#f8f8f8']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Pressable accessibilityRole="button" style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={PRIMARY_RED} />
        </Pressable>
        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle}>לימוד אמונה</Text>
          <Text style={styles.headerSubtitle}>בחרו נושא לחיזוק ממוקד</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topicRow}>
          {FAITH_TOPICS.map(topic => (
            <Pressable
              key={topic.key}
              accessibilityRole="button"
              style={[styles.topicChip, activeCategory === topic.key && styles.topicChipActive]}
              onPress={() => setActiveCategory(topic.key)}
            >
              <Text style={[styles.topicChipText, activeCategory === topic.key && styles.topicChipTextActive]}>
                {topic.title}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.mainCard}>
          <Text style={styles.topicLabel}>מיקוד יומי</Text>
          <Text style={styles.topicTitle}>{activeTopic.title}</Text>
          <Text style={styles.topicVerse}>{activeTopic.verse}</Text>
          <Text style={styles.topicSummary}>{activeTopic.summary}</Text>

          <View style={styles.spotlightBox}>
            <Ionicons name="bulb-outline" size={20} color={PRIMARY_RED} />
            <Text style={styles.spotlightText}>{activeTopic.spotlight}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>תובנות מרכזיות</Text>
            <Ionicons name="book-outline" size={20} color={PRIMARY_RED} />
          </View>
          {activeTopic.focusPoints.map((point, idx) => (
            <View key={idx} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>{point}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>עבודת היום</Text>
            <Ionicons name="calendar-outline" size={20} color={PRIMARY_RED} />
          </View>
          {activeTopic.practices.map((practice, idx) => (
            <View key={idx} style={styles.practiceRow}>
              <Text style={styles.practiceIndex}>{idx + 1}</Text>
              <Text style={styles.practiceText}>{practice}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>מקורות מומלצים</Text>
            <Ionicons name="bookmark-outline" size={20} color={PRIMARY_RED} />
          </View>
          {activeTopic.sources.map((source, idx) => (
            <Text key={idx} style={styles.sourceText}>• {source}</Text>
          ))}
        </View>

        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>בקרוב: שיעורי וידאו לכל קטגוריה</Text>
          <Text style={styles.ctaSubtitle}>האדמין יוכל להעלות שיעורים, קבצי PDF והקלטות ייעודיות</Text>
          <View style={styles.ctaActions}>
            <Pressable accessibilityRole="button" style={styles.ctaBtnPrimary} onPress={() => navigation.navigate('DailyInsight')}>
              <Ionicons name="flame-outline" size={18} color="#fff" />
              <Text style={styles.ctaBtnPrimaryText}>זריקת אמונה</Text>
            </Pressable>
            <Pressable accessibilityRole="button" style={styles.ctaBtnSecondary} onPress={() => navigation.navigate('Admin')}>
              <Ionicons name="construct-outline" size={18} color={PRIMARY_RED} />
              <Text style={styles.ctaBtnSecondaryText}>מסך אדמין</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 2,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(12,118,111,0.12)',
  },
  headerTextBlock: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    color: PRIMARY_RED,
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
  },
  headerSubtitle: {
    color: '#6b7280',
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 48,
    gap: 18,
  },
  topicRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 10,
  },
  topicChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.2)',
    backgroundColor: CHIP_BG,
  },
  topicChipActive: {
    backgroundColor: PRIMARY_RED,
    borderColor: PRIMARY_RED,
  },
  topicChipText: {
    fontSize: 13,
    color: PRIMARY_RED,
    fontFamily: 'Poppins_600SemiBold',
  },
  topicChipTextActive: {
    color: '#fff',
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15,91,142,0.15)',
  },
  topicLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontFamily: 'Poppins_500Medium',
    textAlign: 'right',
  },
  topicTitle: {
    fontSize: 24,
    color: '#0b1b3a',
    fontFamily: 'Poppins_700Bold',
    textAlign: 'right',
    marginTop: 4,
  },
  topicVerse: {
    marginTop: 8,
    color: PRIMARY_RED,
    fontSize: 15,
    fontFamily: 'Heebo_700Bold',
    textAlign: 'right',
  },
  topicSummary: {
    marginTop: 12,
    color: '#1f2937',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'right',
    fontFamily: 'Heebo_500Medium',
  },
  spotlightBox: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(12,118,111,0.08)',
    padding: 12,
    borderRadius: 12,
  },
  spotlightText: {
    flex: 1,
    color: '#0c766f',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right',
    fontFamily: 'Heebo_500Medium',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.08)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#0b1b3a',
    fontSize: 17,
    fontFamily: 'Poppins_600SemiBold',
  },
  listItem: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PRIMARY_RED,
    marginTop: 8,
  },
  listText: {
    flex: 1,
    color: '#1f2937',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right',
    fontFamily: 'Heebo_500Medium',
  },
  practiceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  practiceIndex: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: CHIP_BG,
    color: PRIMARY_RED,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 26,
  },
  practiceText: {
    flex: 1,
    color: '#1f2937',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'right',
    fontFamily: 'Heebo_500Medium',
  },
  sourceText: {
    color: '#111827',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right',
    fontFamily: 'Heebo_500Medium',
    marginBottom: 6,
  },
  ctaCard: {
    backgroundColor: '#0b1b3a',
    borderRadius: 20,
    padding: 20,
    gap: 8,
  },
  ctaTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'right',
  },
  ctaSubtitle: {
    color: '#cbd5f5',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right',
    fontFamily: 'Heebo_400Regular',
  },
  ctaActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  ctaBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: PRIMARY_RED,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  ctaBtnPrimaryText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  ctaBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  ctaBtnSecondaryText: {
    color: PRIMARY_RED,
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
})



