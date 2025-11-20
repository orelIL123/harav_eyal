/**
 * Input validation and sanitization utilities
 * Provides validation functions for common input types and XSS prevention
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {Object} - { valid: boolean, error: string }
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'כתובת אימייל נדרשת' }
  }

  const trimmed = email.trim()
  if (trimmed.length === 0) {
    return { valid: false, error: 'כתובת אימייל נדרשת' }
  }

  // Email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'כתובת אימייל לא תקינה' }
  }

  // Length check
  if (trimmed.length > 254) {
    return { valid: false, error: 'כתובת אימייל ארוכה מדי (מקסימום 254 תווים)' }
  }

  return { valid: true, error: null }
}

/**
 * Validate phone number (Israeli format)
 * @param {string} phone - Phone number to validate
 * @returns {Object} - { valid: boolean, error: string }
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'מספר טלפון נדרש' }
  }

  const trimmed = phone.trim()
  if (trimmed.length === 0) {
    return { valid: false, error: 'מספר טלפון נדרש' }
  }

  // Remove common separators for validation
  const cleaned = trimmed.replace(/[\s\-\(\)\+]/g, '')
  
  // Israeli phone number patterns: 9-10 digits, may start with 0 or country code
  const phoneRegex = /^(0|972)?[1-9]\d{7,9}$/
  if (!phoneRegex.test(cleaned)) {
    return { valid: false, error: 'מספר טלפון לא תקין (יש להזין מספר ישראלי)' }
  }

  // Length check (with separators)
  if (trimmed.length > 20) {
    return { valid: false, error: 'מספר טלפון ארוך מדי' }
  }

  return { valid: true, error: null }
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {Object} options - { minLength: number, requireUppercase: boolean, requireLowercase: boolean, requireNumber: boolean, requireSpecial: boolean }
 * @returns {Object} - { valid: boolean, error: string }
 */
export function validatePassword(password, options = {}) {
  const {
    minLength = 6,
    requireUppercase = false,
    requireLowercase = false,
    requireNumber = false,
    requireSpecial = false
  } = options

  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'סיסמה נדרשת' }
  }

  if (password.length < minLength) {
    return { valid: false, error: `סיסמה חייבת להכיל לפחות ${minLength} תווים` }
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { valid: false, error: 'סיסמה חייבת להכיל אות גדולה' }
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return { valid: false, error: 'סיסמה חייבת להכיל אות קטנה' }
  }

  if (requireNumber && !/[0-9]/.test(password)) {
    return { valid: false, error: 'סיסמה חייבת להכיל מספר' }
  }

  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, error: 'סיסמה חייבת להכיל תו מיוחד' }
  }

  return { valid: true, error: null }
}

/**
 * Validate and sanitize text input
 * @param {string} text - Text to validate
 * @param {Object} options - { minLength: number, maxLength: number, required: boolean, allowNewlines: boolean }
 * @returns {Object} - { valid: boolean, error: string, sanitized: string }
 */
export function validateText(text, options = {}) {
  const {
    minLength = 0,
    maxLength = 1000,
    required = false,
    allowNewlines = true
  } = options

  if (required && (!text || typeof text !== 'string' || text.trim().length === 0)) {
    return { valid: false, error: 'שדה זה נדרש', sanitized: '' }
  }

  if (!text) {
    return { valid: true, error: null, sanitized: '' }
  }

  const trimmed = text.trim()
  
  if (required && trimmed.length < minLength) {
    return { valid: false, error: `שדה זה חייב להכיל לפחות ${minLength} תווים`, sanitized: trimmed }
  }

  if (trimmed.length > maxLength) {
    return { valid: false, error: `שדה זה ארוך מדי (מקסימום ${maxLength} תווים)`, sanitized: trimmed }
  }

  // Sanitize: remove potentially dangerous characters
  let sanitized = trimmed
  
  // Remove null bytes and control characters (except newlines if allowed)
  if (allowNewlines) {
    sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
  } else {
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '')
  }

  // Basic XSS prevention: remove script tags and event handlers
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/javascript:/gi, '')

  return { valid: true, error: null, sanitized }
}

/**
 * Validate name (person name)
 * @param {string} name - Name to validate
 * @param {Object} options - { minLength: number, maxLength: number, required: boolean }
 * @returns {Object} - { valid: boolean, error: string, sanitized: string }
 */
export function validateName(name, options = {}) {
  const {
    minLength = 2,
    maxLength = 100,
    required = true
  } = options

  const textValidation = validateText(name, { minLength, maxLength, required, allowNewlines: false })
  
  if (!textValidation.valid) {
    return textValidation
  }

  if (!name || name.trim().length === 0) {
    if (required) {
      return { valid: false, error: 'שם נדרש', sanitized: '' }
    }
    return { valid: true, error: null, sanitized: '' }
  }

  const sanitized = name.trim()
  
  // Name should contain only letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[\p{L}\s\-'']+$/u
  if (!nameRegex.test(sanitized)) {
    return { valid: false, error: 'שם יכול להכיל רק אותיות, רווחים, מקפים וגרשיים', sanitized }
  }

  if (sanitized.length < minLength) {
    return { valid: false, error: `שם חייב להכיל לפחות ${minLength} תווים`, sanitized }
  }

  if (sanitized.length > maxLength) {
    return { valid: false, error: `שם ארוך מדי (מקסימום ${maxLength} תווים)`, sanitized }
  }

  return { valid: true, error: null, sanitized }
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @param {Object} options - { required: boolean, allowedProtocols: string[] }
 * @returns {Object} - { valid: boolean, error: string }
 */
export function validateURL(url, options = {}) {
  const {
    required = false,
    allowedProtocols = ['http:', 'https:', 'youtube:', 'youtu.be:']
  } = options

  if (!url || typeof url !== 'string') {
    if (required) {
      return { valid: false, error: 'כתובת URL נדרשת' }
    }
    return { valid: true, error: null }
  }

  const trimmed = url.trim()
  
  if (required && trimmed.length === 0) {
    return { valid: false, error: 'כתובת URL נדרשת' }
  }

  if (trimmed.length === 0) {
    return { valid: true, error: null }
  }

  try {
    // Handle YouTube URLs specially
    if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/
      if (youtubeRegex.test(trimmed)) {
        return { valid: true, error: null }
      }
    }

    const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
    
    if (!allowedProtocols.some(proto => urlObj.protocol === proto || proto.endsWith(':'))) {
      // Check if protocol matches (handle youtube: and youtu.be: specially)
      const hasAllowedProtocol = allowedProtocols.some(proto => {
        if (proto === 'youtube:' || proto === 'youtu.be:') {
          return trimmed.includes('youtube.com') || trimmed.includes('youtu.be')
        }
        return urlObj.protocol === proto
      })
      
      if (!hasAllowedProtocol) {
        return { valid: false, error: 'פרוטוקול לא מורשה. יש להשתמש ב-http או https' }
      }
    }

    return { valid: true, error: null }
  } catch (error) {
    return { valid: false, error: 'כתובת URL לא תקינה' }
  }
}

/**
 * Sanitize text to prevent XSS attacks
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
export function sanitizeText(text) {
  if (!text || typeof text !== 'string') {
    return ''
  }

  let sanitized = text
  
  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '')
  
  // Remove data: URLs that could be used for XSS
  sanitized = sanitized.replace(/data:text\/html/gi, '')
  
  // Remove null bytes and control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '')
  
  return sanitized.trim()
}

/**
 * Validate message/comment text
 * @param {string} message - Message to validate
 * @param {Object} options - { maxLength: number, required: boolean }
 * @returns {Object} - { valid: boolean, error: string, sanitized: string }
 */
export function validateMessage(message, options = {}) {
  const {
    maxLength = 5000,
    required = false
  } = options

  return validateText(message, {
    minLength: 0,
    maxLength,
    required,
    allowNewlines: true
  })
}

/**
 * Validate YouTube URL specifically
 * @param {string} url - YouTube URL to validate
 * @param {Object} options - { required: boolean }
 * @returns {Object} - { valid: boolean, error: string }
 */
export function validateYoutubeUrl(url, options = {}) {
  const { required = false } = options

  if (!url || typeof url !== 'string') {
    if (required) {
      return { valid: false, error: 'כתובת YouTube נדרשת' }
    }
    return { valid: true, error: null }
  }

  const trimmed = url.trim()
  
  if (required && trimmed.length === 0) {
    return { valid: false, error: 'כתובת YouTube נדרשת' }
  }

  if (trimmed.length === 0) {
    return { valid: true, error: null }
  }

  // YouTube URL patterns
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[\w-]+/
  
  if (!youtubeRegex.test(trimmed)) {
    return { valid: false, error: 'כתובת YouTube לא תקינה. יש להשתמש בפורמט: youtube.com/watch?v=... או youtu.be/...' }
  }

  return { valid: true, error: null }
}

/**
 * Sanitize input to prevent XSS attacks (alias for sanitizeText for compatibility)
 * @param {string} input - Input to sanitize
 * @param {number} maxLength - Maximum length (default: 500)
 * @returns {string} - Sanitized input
 */
export function sanitizeInput(input, maxLength = 500) {
  if (!input || typeof input !== 'string') {
    return ''
  }

  let sanitized = input.trim()
  
  // Limit length
  if (maxLength > 0 && sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength)
  }
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>]/g, '') // Basic XSS prevention
  
  // Use sanitizeText for comprehensive sanitization
  return sanitizeText(sanitized)
}

/**
 * Validate text length
 * @param {string} text - Text to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {Object} - { valid: boolean, error: string }
 */
export function validateLength(text, min, max) {
  if (text === null || text === undefined) {
    return { valid: false, error: `טקסט נדרש (בין ${min} ל-${max} תווים)` }
  }

  const length = typeof text === 'string' ? text.trim().length : String(text).trim().length

  if (length < min) {
    return { valid: false, error: `טקסט קצר מדי (מינימום ${min} תווים)` }
  }

  if (length > max) {
    return { valid: false, error: `טקסט ארוך מדי (מקסימום ${max} תווים)` }
  }

  return { valid: true, error: null }
}

