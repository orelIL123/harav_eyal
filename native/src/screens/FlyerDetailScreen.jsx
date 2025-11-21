import React, { useState, useEffect } from 'react'
import { SafeAreaView, View, Text, StyleSheet, Pressable, Image, ScrollView, Alert, ActivityIndicator, Platform, Linking } from 'react-native'
import { WebView } from 'react-native-webview'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import { getFlyers } from '../services/flyersService'

const PRIMARY_RED = '#DC2626'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

export default function FlyerDetailScreen({ route, navigation }) {
  const { t } = useTranslation()
  const { flyerId, flyers: initialFlyers } = route.params || {}
  const [flyer, setFlyer] = useState(null)
  const [allFlyers, setAllFlyers] = useState(initialFlyers || [])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFlyers()
  }, [])

  useEffect(() => {
    if (allFlyers.length > 0 && flyerId) {
      const index = allFlyers.findIndex(f => f.id === flyerId)
      if (index !== -1) {
        setCurrentIndex(index)
        setFlyer(allFlyers[index])
      } else {
        setFlyer(allFlyers[0])
      }
    } else if (allFlyers.length > 0) {
      setFlyer(allFlyers[0])
    }
    setLoading(false)
  }, [allFlyers, flyerId])

  const loadFlyers = async () => {
    try {
      if (!initialFlyers || initialFlyers.length === 0) {
        const flyers = await getFlyers()
        const activeFlyers = flyers.filter(f => f.isActive !== false)
        setAllFlyers(activeFlyers)
      }
    } catch (error) {
      console.error('Error loading flyers:', error)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      setFlyer(allFlyers[newIndex])
    }
  }

  const handleNext = () => {
    if (currentIndex < allFlyers.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      setFlyer(allFlyers[newIndex])
    }
  }

  const handlePrint = async () => {
    try {
      if (flyer.pdfUrl) {
        // For PDFs, open in browser for printing
        await Linking.openURL(flyer.pdfUrl)
      } else if (flyer.imageUrl) {
        // For images, use expo-print
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
              <img src="${flyer.imageUrl}" alt="${flyer.title || 'עלון'}" />
            </body>
          </html>
        `
        await Print.printAsync({ html })
      }
    } catch (error) {
      console.error('Error printing:', error)
      Alert.alert(t('error'), t('flyers.printFlyerError'))
    }
  }

  const handleShare = async () => {
    try {
      const url = flyer.pdfUrl || flyer.imageUrl
      if (!url) return

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(url)
      } else {
        await Linking.openURL(url)
      }
    } catch (error) {
      console.error('Error sharing:', error)
      Alert.alert(t('error'), t('flyers.shareFlyerError'))
    }
  }

  if (loading || !flyer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color={PRIMARY_RED} />
          </Pressable>
          <Text style={styles.headerTitle}>{t('flyers.detailTitle')}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_RED} />
        </View>
      </SafeAreaView>
    )
  }

  const flyerDate = flyer.date ? 
    (flyer.date.toDate ? flyer.date.toDate().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date(flyer.date).toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })) : 
    ''

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={PRIMARY_RED} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{flyer.title}</Text>
          {flyerDate && (
            <Text style={styles.headerDate}>{flyerDate}</Text>
          )}
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.actionButton} onPress={handlePrint}>
            <Ionicons name="print-outline" size={20} color={PRIMARY_RED} />
          </Pressable>
          <Pressable style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color={PRIMARY_RED} />
          </Pressable>
        </View>
      </View>

      {flyer.pdfUrl ? (
        <View style={styles.webviewContainer}>
          <WebView
            source={{ 
              uri: `https://docs.google.com/viewer?url=${encodeURIComponent(flyer.pdfUrl)}&embedded=true`
            }}
            style={styles.webview}
            startInLoadingState={true}
            scalesPageToFit={true}
            showsVerticalScrollIndicator={true}
            showsHorizontalScrollIndicator={false}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={PRIMARY_RED} />
              </View>
            )}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent
              console.error('WebView error: ', nativeEvent)
            }}
          />
        </View>
      ) : flyer.imageUrl ? (
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          maximumZoomScale={3}
          minimumZoomScale={1}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <Image 
            source={{ uri: flyer.imageUrl }} 
            style={styles.image}
            resizeMode="contain"
          />
        </ScrollView>
      ) : (
        <View style={styles.errorContainer}>
          <Ionicons name="document-outline" size={64} color={PRIMARY_RED} />
          <Text style={styles.errorText}>{t('flyers.loadFlyerError')}</Text>
        </View>
      )}

      {/* Navigation Controls */}
      {allFlyers.length > 1 && (
        <View style={styles.navigationControls}>
          <Pressable
            style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
            onPress={handlePrevious}
            disabled={currentIndex === 0}
          >
            <Ionicons name="chevron-forward" size={24} color={currentIndex === 0 ? '#d1d5db' : PRIMARY_RED} />
            <Text style={[styles.navButtonText, currentIndex === 0 && styles.navButtonTextDisabled]}>
              {t('flyers.previous')}
            </Text>
          </Pressable>
          <Text style={styles.navCounter}>
            {currentIndex + 1} / {allFlyers.length}
          </Text>
          <Pressable
            style={[styles.navButton, currentIndex === allFlyers.length - 1 && styles.navButtonDisabled]}
            onPress={handleNext}
            disabled={currentIndex === allFlyers.length - 1}
          >
            <Text style={[styles.navButtonText, currentIndex === allFlyers.length - 1 && styles.navButtonTextDisabled]}>
              {t('flyers.next')}
            </Text>
            <Ionicons name="chevron-back" size={24} color={currentIndex === allFlyers.length - 1 ? '#d1d5db' : PRIMARY_RED} />
          </Pressable>
        </View>
      )}
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
    backgroundColor: BG,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(11,27,58,0.1)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(220,38,38,0.12)',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    textAlign: 'center',
  },
  headerDate: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(220,38,38,0.12)',
  },
  webviewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
    minHeight: 400,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#6b7280',
  },
  navigationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: BG,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(11,27,58,0.1)',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(220,38,38,0.1)',
  },
  navButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
  navButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
  },
  navButtonTextDisabled: {
    color: '#d1d5db',
  },
  navCounter: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: DEEP_BLUE,
  },
})

