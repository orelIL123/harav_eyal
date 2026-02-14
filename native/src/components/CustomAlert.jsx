import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Pressable, Modal, Animated, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const DEEP_BLUE = '#0b1b3a'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function CustomAlert({ visible, title, message, onClose, buttons }) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      fadeAnim.setValue(0)
      scaleAnim.setValue(0.9)
    }
  }, [visible])

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  // If buttons are provided, use them; otherwise show default close button
  const alertButtons = buttons && buttons.length > 0 ? buttons : [
    { text: 'סגור', onPress: handleClose, style: 'default' }
  ]

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <Animated.View
          style={[
            styles.alertContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.alertContent}>
            {title && (
              <>
                <View style={styles.titleAccent} />
                <Text style={styles.title}>{title}</Text>
              </>
            )}
            
            {message && (
              <Text style={styles.message}>{message}</Text>
            )}

            <View style={styles.buttonsContainer}>
              {alertButtons.map((button, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.button,
                    button.style === 'cancel' && styles.buttonCancel,
                    button.style === 'destructive' && styles.buttonDestructive,
                  ]}
                  onPress={() => {
                    if (button.onPress) {
                      button.onPress()
                    }
                    handleClose()
                  }}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      button.style === 'cancel' && styles.buttonTextCancel,
                      button.style === 'destructive' && styles.buttonTextDestructive,
                    ]}
                  >
                    {button.text}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  alertContainer: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: DEEP_BLUE,
    borderWidth: 2,
    borderColor: PRIMARY_RED,
    shadowColor: PRIMARY_RED,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  alertContent: {
    padding: 24,
    alignItems: 'center',
  },
  titleAccent: {
    width: 60,
    height: 4,
    backgroundColor: PRIMARY_RED,
    borderRadius: 2,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  message: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#E5E7EB',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    backgroundColor: PRIMARY_RED,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    shadowColor: PRIMARY_RED,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonCancel: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonDestructive: {
    backgroundColor: PRIMARY_RED,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
  },
  buttonTextCancel: {
    color: '#FFFFFF',
  },
  buttonTextDestructive: {
    color: '#FFFFFF',
  },
})

