import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, Pressable, Image, ScrollView, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'

const PRIMARY_RED = '#DC2626'
const BG = '#FFFFFF'

export default function ImageViewerScreen({ route, navigation }) {
  const { imageUrl, title } = route.params || {}

  const handlePrint = async () => {
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
            <img src="${imageUrl}" alt="${title || 'תמונה'}" />
          </body>
        </html>
      `
      await Print.printAsync({ html })
    } catch (error) {
      console.error('Error printing:', error)
      Alert.alert('שגיאה', 'לא ניתן להדפיס את התמונה')
    }
  }

  const handleShare = async () => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(imageUrl)
      } else {
        Alert.alert('לא זמין', 'שיתוף לא זמין במכשיר זה')
      }
    } catch (error) {
      console.error('Error sharing:', error)
      Alert.alert('שגיאה', 'לא ניתן לשתף את התמונה')
    }
  }

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
        <Text style={styles.headerTitle}>{title || 'תמונה'}</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.actionButton} onPress={handlePrint}>
            <Ionicons name="print-outline" size={20} color={PRIMARY_RED} />
          </Pressable>
          <Pressable style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color={PRIMARY_RED} />
          </Pressable>
        </View>
      </View>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        maximumZoomScale={3}
        minimumZoomScale={1}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.errorContainer}>
            <Ionicons name="image-outline" size={64} color={PRIMARY_RED} />
            <Text style={styles.errorText}>לא ניתן לטעון את התמונה</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
    textAlign: 'center',
    marginHorizontal: 16,
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    minHeight: 400,
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
    color: '#fff',
  },
})

