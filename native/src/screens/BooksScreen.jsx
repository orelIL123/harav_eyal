import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Image, Linking, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

const BOOKS = [
  {
    id: 'book-1',
    title: 'אמונה וביטחון',
    imageUrl: 'https://ayal-taarog.org.il/wp-content/uploads/elementor/thumbs/%D7%97%D7%95%D7%91%D7%AA-%D7%94%D7%9C%D7%91%D7%91%D7%95%D7%AA-r7o6xhx6eujg4qy4dw6jvwnuttfo2qyqmoq37e3cs0.jpg',
    purchaseLink: 'https://ayal-taarog.org.il/product/%d7%90%d7%9e%d7%95%d7%a0%d7%94-%d7%95%d7%91%d7%99%d7%98%d7%97%d7%95%d7%9f/',
  },
  {
    id: 'book-2',
    title: 'חובת הלבבות',
    imageUrl: 'https://ayal-taarog.org.il/wp-content/uploads/elementor/thumbs/%D7%97%D7%95%D7%91%D7%AA-%D7%94%D7%9C%D7%91%D7%91%D7%95%D7%AA-%D7%A2%D7%9D-%D7%A4%D7%99%D7%A8%D7%95%D7%A9-%D7%9B%D7%90%D7%99%D7%9C-%D7%AA%D7%A2%D7%A8%D7%95%D7%92-r7o70e99hgi9xgqkgna52oc0rl5et5gy114zh3snlc.jpg',
    purchaseLink: 'https://ayal-taarog.org.il/product/%d7%97%d7%95%d7%91%d7%aa-%d7%94%d7%9c%d7%91%d7%91%d7%95%d7%aa/',
  },
  {
    id: 'book-3',
    title: 'כאיל תערוג',
    imageUrl: 'https://ayal-taarog.org.il/wp-content/uploads/elementor/thumbs/%D7%9B%D7%90%D7%99%D7%9C-%D7%AA%D7%A2%D7%A8%D7%95%D7%92-r7o6z0ftf8m2u4qxjjqwwiwla5yyh6z666k91fuir4.jpg',
    purchaseLink: 'https://ayal-taarog.org.il/product/%d7%9b%d7%90%d7%99%d7%9c-%d7%aa%d7%a2%d7%a8%d7%95%d7%92/',
  },
  {
    id: 'book-4',
    title: 'ליקוטי אמונה',
    imageUrl: 'https://ayal-taarog.org.il/wp-content/uploads/elementor/thumbs/IMG-20251113-WA0014-renor9ks0cru1e5jqscj55a99tnureb7wuuei0wy9c.jpg',
    purchaseLink: 'https://ayal-taarog.org.il/product/%d7%9c%d7%99%d7%a7%d7%95%d7%98%d7%99-%d7%90%d7%9e%d7%95%d7%a0%d7%94/',
  },
]

export default function BooksScreen({ navigation }) {
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

        {BOOKS.map((book, idx) => (
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
        ))}

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

