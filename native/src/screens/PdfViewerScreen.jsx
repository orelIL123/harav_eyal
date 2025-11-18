import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, Pressable, ActivityIndicator, Image, Linking, Platform, Alert } from 'react-native'
import { WebView } from 'react-native-webview'
import { Ionicons } from '@expo/vector-icons'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'

export default function PdfViewerScreen({ route, navigation }) {
  const { pdf, title } = route.params || {}
  const [pdfUri, setPdfUri] = React.useState(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const loadPdf = async () => {
      try {
        if (pdf) {
          // Get the asset URI
          const asset = Image.resolveAssetSource(pdf)
          if (asset?.uri) {
            // For local assets, copy to cache directory
            const filename = asset.uri.split('/').pop()
            const cacheUri = `${FileSystem.cacheDirectory}${filename}`
            
            // Check if file exists in cache
            const fileInfo = await FileSystem.getInfoAsync(cacheUri)
            if (!fileInfo.exists) {
              // Copy from bundle to cache
              await FileSystem.copyAsync({
                from: asset.uri,
                to: cacheUri,
              })
            }
            setPdfUri(cacheUri)
          } else {
            setPdfUri(asset?.uri)
          }
        }
      } catch (error) {
        console.error('Error loading PDF:', error)
        // Fallback: try to use the asset URI directly
        if (pdf) {
          const asset = Image.resolveAssetSource(pdf)
          setPdfUri(asset?.uri)
        }
      } finally {
        setLoading(false)
      }
    }
    loadPdf()
  }, [pdf])

  if (loading) {
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
          <Text style={styles.headerTitle}>{title || 'תפילה'}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_RED} />
        </View>
      </SafeAreaView>
    )
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
        <Text style={styles.headerTitle}>{title || 'תפילה'}</Text>
        <View style={{ width: 24 }} />
      </View>
      {pdfUri ? (
        <View style={styles.webviewContainer}>
          <WebView
            source={{ 
              uri: Platform.OS === 'ios' 
                ? pdfUri 
                : `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUri)}&embedded=true`
            }}
            style={styles.webview}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={PRIMARY_RED} />
              </View>
            )}
          />
          <Pressable 
            style={styles.shareButton}
            onPress={async () => {
              try {
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(pdfUri)
                } else {
                  await Linking.openURL(pdfUri)
                }
              } catch (error) {
                Alert.alert('שגיאה', 'לא ניתן לפתוח את הקובץ')
              }
            }}
          >
            <Ionicons name="share-outline" size={20} color="#fff" />
            <Text style={styles.shareButtonText}>שתף</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.errorContainer}>
          <Ionicons name="document-outline" size={64} color={PRIMARY_RED} />
          <Text style={styles.errorText}>לא ניתן לטעון את הקובץ</Text>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(11,27,58,0.1)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30,58,138,0.12)',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
  },
  webviewContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  shareButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: PRIMARY_RED,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
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
})

