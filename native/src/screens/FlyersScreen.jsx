import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { getFlyers } from '../services/flyersService'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

export default function FlyersScreen({ navigation }) {
  const [flyers, setFlyers] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    loadFlyers()
  }, [])

  const loadFlyers = async () => {
    try {
      setLoading(true)
      const allFlyers = await getFlyers()
      // Filter only active flyers
      const activeFlyers = allFlyers.filter(flyer => flyer.isActive !== false)
      setFlyers(activeFlyers)
    } catch (error) {
      console.error('Error loading flyers:', error)
      Alert.alert('שגיאה', 'לא ניתן לטעון את העלונים')
    } finally {
      setLoading(false)
    }
  }

  const handleFlyerPress = (flyer) => {
    if (flyer.pdfUrl) {
      navigation.navigate('PdfViewer', { pdfUrl: flyer.pdfUrl, title: flyer.title })
    } else {
      Alert.alert('בקרוב', `עלון ${flyer.title} יופיע כאן בקרוב`)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[BG, '#f5f5f5']} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={PRIMARY_RED} />
        </Pressable>
        <Text style={styles.headerTitle}>עלונים להדפסה</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>עלונים שבועיים של המוסדות</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_RED} />
            <Text style={styles.loadingText}>טוען עלונים...</Text>
          </View>
        ) : flyers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>אין עלונים זמינים כרגע</Text>
          </View>
        ) : (
          flyers.map((flyer, idx) => {
            const flyerDate = flyer.date ? 
              (flyer.date.toDate ? flyer.date.toDate().toLocaleDateString('he-IL') : new Date(flyer.date).toLocaleDateString('he-IL')) : 
              ''
            return (
              <Pressable
                key={flyer.id}
                style={[styles.flyerCard, idx === 0 && styles.flyerCardFirst]}
                onPress={() => handleFlyerPress(flyer)}
                accessibilityRole="button"
              >
                <View style={styles.flyerContent}>
                  <View style={styles.flyerIcon}>
                    <Ionicons name="document-text-outline" size={32} color={PRIMARY_RED} />
                  </View>
                  <View style={styles.flyerTextBlock}>
                    <Text style={styles.flyerTitle}>{flyer.title}</Text>
                    {flyerDate && <Text style={styles.flyerDate}>{flyerDate}</Text>}
                  </View>
                  <Ionicons name="chevron-forward" size={24} color={PRIMARY_RED} />
                </View>
              </Pressable>
            )
          })
        )}

        <View style={styles.footerCard}>
          <Ionicons name="document-outline" size={32} color={PRIMARY_RED} />
          <View style={styles.footerTextBlock}>
            <Text style={styles.footerTitle}>עלונים נוספים</Text>
            <Text style={styles.footerDesc}>
              עלונים נוספים יופיעו כאן מדי שבוע. ניתן לקרוא ולהדפיס.
            </Text>
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
    paddingBottom: 6,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(220,38,38,0.12)',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 18,
  },
  subtitle: {
    alignSelf: 'flex-end',
    color: DEEP_BLUE,
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
  },
  flyerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.08)',
  },
  flyerCardFirst: {
    marginTop: 6,
  },
  flyerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  flyerIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(220,38,38,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flyerTextBlock: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 4,
  },
  flyerTitle: {
    color: DEEP_BLUE,
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'right',
  },
  flyerDate: {
    color: '#6b7280',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'right',
  },
  footerCard: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 18,
    backgroundColor: 'rgba(220,38,38,0.1)',
  },
  footerTextBlock: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 4,
  },
  footerTitle: {
    color: DEEP_BLUE,
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  footerDesc: {
    color: '#4b5563',
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'right',
    lineHeight: 18,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#6b7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#9ca3af',
  },
})

