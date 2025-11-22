import React, { Component } from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { logError } from '../services/analyticsService'

const PRIMARY_RED = '#DC2626'
const BG = '#FFFFFF'

/**
 * Error Boundary Component
 * 
 * תופס שגיאות React ומציג מסך שגיאה ידידותי במקום קריסה מלאה
 * 
 * שימוש:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // עדכן state כך שהרינדור הבא יציג את מסך השגיאה
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // לוג את השגיאה (בפרודקשן, שלח ל-Crashlytics)
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // שמור את השגיאה ב-state להצגה
    this.setState({
      error,
      errorInfo
    })

    // שלח ל-Crashlytics/Analytics
    logError(error, `ErrorBoundary: ${errorInfo.componentStack || 'Unknown component'}`)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // מציג מסך שגיאה ידידותי
      return (
        <View style={styles.container}>
          <LinearGradient colors={[BG, '#f7f7f7']} style={StyleSheet.absoluteFill} />
          
          <ScrollView 
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="alert-circle-outline" size={64} color={PRIMARY_RED} />
            </View>
            
            <Text style={styles.title}>אופס, משהו השתבש</Text>
            <Text style={styles.message}>
              אירעה שגיאה באפליקציה. אנא נסה שוב או צא וחזור לאפליקציה.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>פרטי השגיאה (פיתוח בלבד):</Text>
                <Text style={styles.errorText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={styles.errorStack}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}

            <Pressable
              style={styles.button}
              onPress={this.handleReset}
              accessibilityRole="button"
              accessibilityLabel="נסה שוב"
            >
              <Ionicons name="refresh-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>נסה שוב</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => {
                // אפשר להוסיף שליחה לדף הבית
                if (this.props.onGoHome) {
                  this.props.onGoHome()
                }
              }}
              accessibilityRole="button"
              accessibilityLabel="חזור לדף הבית"
            >
              <Ionicons name="home-outline" size={20} color={PRIMARY_RED} />
              <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                חזור לדף הבית
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      )
    }

    // אם אין שגיאה, הצג את הילדים כרגיל
    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  errorDetails: {
    width: '100%',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY_RED,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#991b1b',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 10,
    color: '#7f1d1d',
    fontFamily: 'monospace',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_RED,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    minWidth: 200,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: PRIMARY_RED,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonTextSecondary: {
    color: PRIMARY_RED,
  },
})

export default ErrorBoundary

