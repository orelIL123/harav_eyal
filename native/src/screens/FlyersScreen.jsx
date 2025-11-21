import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator, Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { getFlyers } from '../services/flyersService'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

export default function FlyersScreen({ navigation }) {
  const { t } = useTranslation()
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
      Alert.alert(t('error'), t('flyers.loadError'))
    } finally {
      setLoading(false)
    }
  }

  const handleFlyerPress = async (flyer) => {
    // Navigate to FlyerDetailScreen with all flyers for navigation
    navigation.navigate('FlyerDetail', { 
      flyerId: flyer.id,
      flyers: flyers 
    })
  }

  const handlePrintImage = async (imageUrl, title) => {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                margin: 0;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
              }
              img {
                max-width: 100%;
                height: auto;
              }
            </style>
          </head>
          <body>
            <img src="${imageUrl}" alt="${title}" />
          </body>
        </html>
      `
      await Print.printAsync({ html })
    } catch (error) {
      console.error('Error printing:', error)
      Alert.alert(t('error'), t('flyers.printError'))
    }
  }

  const handleShareImage = async (imageUrl) => {
    try {
      if (await Sharing.isAvailableAsync()) {
        // For remote images, share the URL directly
        await Sharing.shareAsync(imageUrl)
      } else {
        Alert.alert(t('flyers.shareNotAvailable'), t('flyers.shareNotAvailableDesc'))
      }
    } catch (error) {
      console.error('Error sharing:', error)
      Alert.alert(t('error'), t('flyers.shareError'))
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
        <Text style={styles.headerTitle}>{t('flyers.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>{t('flyers.subtitle')}</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_RED} />
            <Text style={styles.loadingText}>{t('flyers.loading')}</Text>
          </View>
        ) : flyers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>{t('flyers.noFlyers')}</Text>
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
                  {flyer.imageUrl ? (
                    <Image source={{ uri: flyer.imageUrl }} style={styles.flyerThumbnail} resizeMode="cover" />
                  ) : flyer.pdfUrl ? (
                    <View style={styles.flyerIcon}>
                      <Ionicons name="document-text-outline" size={32} color={PRIMARY_RED} />
                      <Text style={styles.flyerIconText}>PDF</Text>
                    </View>
                  ) : (
                    <View style={styles.flyerIcon}>
                      <Ionicons name="document-outline" size={32} color={PRIMARY_RED} />
                    </View>
                  )}
                  <View style={styles.flyerTextBlock}>
                    <Text style={styles.flyerTitle}>{flyer.title}</Text>
                    {flyerDate && <Text style={styles.flyerDate}>{flyerDate}</Text>}
                    {flyer.fileType && (
                      <Text style={styles.flyerType}>
                        {flyer.fileType === 'pdf' ? 'PDF' : t('flyers.image')}
                      </Text>
                    )}
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
            <Text style={styles.footerTitle}>{t('flyers.moreFlyers')}</Text>
            <Text style={styles.footerDesc}>
              {t('flyers.moreFlyersDesc')}
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
    gap: 4,
  },
  flyerIconText: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
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
  flyerThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  flyerType: {
    color: '#9ca3af',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'right',
    marginTop: 2,
  },
})

