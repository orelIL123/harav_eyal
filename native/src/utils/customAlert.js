import { Alert } from 'react-native'

// This will be set by the AlertProvider
let alertContext = null

export const setAlertContext = (context) => {
  alertContext = context
}

/**
 * Custom alert function that matches the style from the image
 * Usage: customAlert('Title', 'Message') or customAlert('Title', 'Message', [{ text: 'OK', onPress: () => {} }])
 */
export const customAlert = (title, message, buttons) => {
  if (alertContext && alertContext.showAlert) {
    alertContext.showAlert(title, message, buttons)
  } else {
    // Fallback to native alert if context is not available
    if (buttons && buttons.length > 0) {
      Alert.alert(title, message, buttons)
    } else {
      Alert.alert(title, message)
    }
  }
}

/**
 * Helper function to replace Alert.alert calls
 * This maintains the same API as Alert.alert for easy migration
 */
export const showAlert = (title, message, buttons) => {
  customAlert(title, message, buttons)
}


