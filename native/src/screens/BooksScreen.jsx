import React, { useState, useEffect } from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Image, Linking, Alert, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { getBooks } from '../services/booksService'
import { STATIC_BOOKS } from '../data/staticBooks'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

export default function BooksScreen({ navigation }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    try {
      setLoading(true)
      const firebaseBooks = await getBooks()
      
      // Combine static and firebase books
      // Firebase books take precedence if they have the same ID (unlikely for static)
      const allBooks = [...STATIC_BOOKS, ...(firebaseBooks || [])]
      
      // Filter only active books and ensure they have required fields
      const activeBooks = allBooks.filter(book => 
        book.isActive !== false && book.title && book.imageUrl
      )
      setBooks(activeBooks)
    } catch (error) {
      console.error('Error loading books:', error)
      Alert.alert('שגיאה', 'לא ניתן לטעון את הספרים')
      // Fallback to static books on error
      setBooks(STATIC_BOOKS)
    } finally {
      setLoading(false)
    }
  }
  const handlePurchase = React.useCallback((book) => {
    Linking.openURL(book.purchaseLink).catch(() => {
      Alert.alert('שגיאה', 'לא ניתן לפתוח את קישור הרכישה')
    })
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[BG, '#f4f6f9']} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="חזרה"
        >
          <Ionicons name="arrow-back" size={24} color={PRIMARY_RED} />
        </Pressable>
        <Text style={styles.headerTitle}>ספרים</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>ספרי תורה וחידושים מאת הרב אייל עמרמי שליט"א</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_RED} />
            <Text style={styles.loadingText}>טוען ספרים...</Text>
          </View>
        ) : books.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>אין ספרים זמינים כרגע</Text>
          </View>
        ) : (
          books.map((book, idx) => (
          <Pressable
            key={book.id}
            style={[styles.bookCard, idx === 0 && styles.bookCardFirst]}
            onPress={() => handlePurchase(book)}
            accessibilityRole="button"
            accessibilityLabel={`ספר ${book.title}`}
          >
            <View style={styles.bookImageContainer}>
              <Image
                source={{ uri: book.imageUrl }}
                style={styles.bookImage}
                resizeMode="cover"
                onError={(error) => {
                  console.log('Image load error:', error)
                }}
              />
            </View>
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle}>{book.title}</Text>
              <View style={styles.purchaseButton}>
                <Text style={styles.purchaseButtonText}>רכישה</Text>
                <Ionicons name="chevron-forward" size={18} color={PRIMARY_RED} />
              </View>
            </View>
          </Pressable>
          ))
        )}

        <View style={styles.footerCard}>
          <Ionicons name="book-outline" size={28} color={PRIMARY_RED} />
          <View style={styles.footerTextBlock}>
            <Text style={styles.footerTitle}>ספרים נוספים</Text>
            <Text style={styles.footerDesc}>
              ספרים נוספים יופיעו כאן בקרוב.
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
    paddingBottom: 36,
    gap: 18,
  },
  subtitle: {
    alignSelf: 'flex-end',
    color: DEEP_BLUE,
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    marginBottom: 8,
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
    padding: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#9ca3af',
  },
  bookCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.08)',
  },
  bookCardFirst: {
    marginTop: 6,
  },
  bookImageContainer: {
    width: 120,
    height: 180,
    backgroundColor: '#f3f4f6',
  },
  bookImage: {
    width: '100%',
    height: '100%',
  },
  bookInfo: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  bookTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: DEEP_BLUE,
    textAlign: 'right',
    marginBottom: 12,
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(220,38,38,0.1)',
  },
  purchaseButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
  },
  footerCard: {
    marginTop: 12,
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
    color: '#475569',
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'right',
    lineHeight: 18,
  },
})

