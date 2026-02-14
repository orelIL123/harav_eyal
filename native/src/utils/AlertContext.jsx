import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import CustomAlert from '../components/CustomAlert'
import { setAlertContext } from './customAlert'

const AlertContext = createContext()

export const useAlert = () => {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider')
  }
  return context
}

export const AlertProvider = ({ children }) => {
  const [alertState, setAlertState] = useState({
    visible: false,
    title: null,
    message: null,
    buttons: null,
  })

  const showAlert = useCallback((title, message, buttons) => {
    setAlertState({
      visible: true,
      title,
      message,
      buttons,
    })
  }, [])

  const hideAlert = useCallback(() => {
    setAlertState({
      visible: false,
      title: null,
      message: null,
      buttons: null,
    })
  }, [])

  // Expose the context to the customAlert utility
  useEffect(() => {
    setAlertContext({ showAlert, hideAlert })
  }, [showAlert, hideAlert])

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onClose={hideAlert}
      />
    </AlertContext.Provider>
  )
}

