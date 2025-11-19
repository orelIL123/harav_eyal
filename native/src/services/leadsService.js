import { setDocument } from './firestore'

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
    
    if (!name || !phone) {
      return { error: 'שם וטלפון הם שדות חובה' }
    }

    // Validate phone (basic validation)
    const phoneRegex = /^[0-9\-\+\(\)\s]+$/
    if (!phoneRegex.test(phone)) {
      return { error: 'מספר טלפון לא תקין' }
    }

    const lead = {
      name: name.trim(),
      phone: phone.trim(),
      message: message.trim(),
      source, // 'app', 'website', etc.
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

