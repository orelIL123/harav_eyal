import { setDocument } from './firestore'
import { validateName, validatePhone, validateMessage, sanitizeText } from '../utils/validation'

/**
 * Leads Service - שמירת לידים ופניות
 */

/**
 * Create a new lead
 * @param {Object} leadData - { name, phone, message?, source? }
 */
export async function createLead(leadData) {
  try {
    const { name, phone, message = '', source = 'app' } = leadData
    
    // Validate name
    const nameValidation = validateName(name, { minLength: 2, maxLength: 100, required: true })
    if (!nameValidation.valid) {
      return { error: nameValidation.error }
    }

    // Validate phone
    const phoneValidation = validatePhone(phone)
    if (!phoneValidation.valid) {
      return { error: phoneValidation.error }
    }

    // Validate message (optional)
    const messageValidation = validateMessage(message, { maxLength: 2000, required: false })
    if (!messageValidation.valid) {
      return { error: messageValidation.error }
    }

    // Sanitize all inputs
    const lead = {
      name: nameValidation.sanitized,
      phone: phone.trim(),
      message: messageValidation.sanitized,
      source: sanitizeText(source) || 'app', // 'app', 'website', etc.
      status: 'new', // 'new', 'contacted', 'converted', 'archived'
      // createdAt and updatedAt will be added by setDocument
    }

    // Generate unique ID
    const leadId = `lead_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    await setDocument('leads', leadId, lead, false)
    
    return { leadId, error: null }
  } catch (error) {
    console.error('Error creating lead:', error)
    return { error: 'שגיאה בשמירת הפנייה. נסה שוב מאוחר יותר.' }
  }
}

/**
 * Get all leads (admin only - will be used in admin panel)
 */
export async function getAllLeads() {
  try {
    const { getDocs, collection } = await import('firebase/firestore')
    const { db } = await import('../config/firebase')
    
    const leadsRef = collection(db, 'leads')
    const snapshot = await getDocs(leadsRef)
    
    const leads = []
    snapshot.forEach((doc) => {
      leads.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    // Sort by createdAt descending
    leads.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt)
      const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt)
      return bTime - aTime
    })
    
    return { leads, error: null }
  } catch (error) {
    console.error('Error getting leads:', error)
    return { leads: [], error: error.message }
  }
}

