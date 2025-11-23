# 🤖 פרומפטים מקצועיים לתיקון האפליקציה - Gemini 3.0 / Claude

**תאריך:** נובמבר 2025  
**פרויקט:** אפליקציית הרב אייל עמרמי  
**מטרה:** תיקון בעיות קריטיות והכנה למכירה ב-₪18,000+

---

## 📋 סקירה כללית

הפרומפטים מחולקים ל-**5 משימות עצמאיות** שניתן להריץ בנפרד:

| משימה | תיאור | זמן | קושי | עדיפות |
|-------|-------|-----|------|---------|
| **1️⃣** | תיקוני אבטחה קריטיים | 1-2 שעות | בינוני | 🔴 דחוף! |
| **2️⃣** | Firestore Indexes | 30 דקות | קל | 🔴 דחוף! |
| **3️⃣** | Firebase Analytics + Crashlytics | 2-3 שעות | בינוני | 🟡 חשוב |
| **4️⃣** | Cloud Functions לתחזוקה | 3-4 שעות | מתקדם | 🟡 חשוב |
| **5️⃣** | Error Boundaries + Rate Limiting | 2-3 שעות | בינוני | 🟡 חשוב |

**סה"כ זמן:** 8-12 שעות  
**סה"כ עלות (אם מזמין):** ₪6,000-9,000

---

## 1️⃣ משימה 1: תיקוני אבטחה קריטיים

### 🎯 מטרה
תיקון 3 בעיות אבטחה קריטיות:
1. API Keys חשופים
2. פגיעויות בחבילות (npm audit)
3. Input Validation חסר

### ⏱️ זמן משוער: 1-2 שעות
### 💰 עלות (אם מזמין): ₪800-1,200
### 🎯 חשיבות: 🔴🔴🔴 דחוף מאוד!

---

### 📝 פרומפט מקצועי ל-Gemini 3.0 / Claude

```
# Security Fixes for React Native Firebase App

## Context
I have a React Native (Expo) app with Firebase backend that has 3 critical security issues that need to be fixed before production launch.

## Project Structure
- React Native app with Expo (SDK 54)
- Firebase (Auth, Firestore, Storage)
- Location: `/home/runner/work/harav_eyal/harav_eyal/native/`
- 38 screens, 12 services, ~21K lines of code

## Issues to Fix

### Issue 1: Exposed Firebase API Keys (CRITICAL)
**File:** `native/src/config/firebase.js`

**Current code (lines 7-14):**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDpXIaHTcvamaoKXrl657nU3zFm9Nh389A",
  authDomain: "eyalamrami-1d69e.firebaseapp.com",
  projectId: "eyalamrami-1d69e",
  storageBucket: "eyalamrami-1d69e.firebasestorage.app",
  messagingSenderId: "990847614280",
  appId: "1:990847614280:web:431b7f340e07bd7f3b477d",
  measurementId: "G-P7YM9RTHK6"
}
```

**Required fix:**
1. Create `.env` file in `native/` directory with all Firebase config
2. Update `.gitignore` to exclude `.env` files
3. Use `expo-constants` to read from environment variables
4. Update `app.json` to include `extra` section with `process.env` variables
5. Update `firebase.js` to use `Constants.expoConfig.extra`

**Important:** 
- Use `expo-constants` (already installed)
- Keep backward compatibility
- Add fallback values for development
- Test that app still works after changes

---

### Issue 2: Security Vulnerabilities in Dependencies (HIGH)
**Current vulnerabilities:**
- `glob`: Command Injection (CVE-2024-XXXX) - High Severity
- `js-yaml`: Prototype Pollution - Moderate Severity

**Required fix:**
1. Run `npm audit` in `native/` directory
2. Run `npm audit fix --force` to auto-fix
3. If auto-fix fails, manually update vulnerable packages:
   - `npm update glob@latest`
   - `npm update js-yaml@latest`
4. Run `npm audit` again to verify all fixed
5. Test that app still builds and runs

---

### Issue 3: Missing Input Validation (MEDIUM-HIGH)
**Files to update:**
- `native/src/screens/AdminScreen.jsx` (main admin panel)
- `native/src/services/authService.js` (authentication)
- `native/src/screens/ContactRabbiScreen.jsx` (contact form)
- `native/src/screens/RegisterScreen.jsx` (registration)

**Required fix:**
1. Create `native/src/utils/validation.js` with these functions:
   - `validateEmail(email)` - email format validation
   - `validateUrl(url)` - URL format validation
   - `validateYoutubeUrl(url)` - YouTube URL specific validation
   - `sanitizeInput(input, maxLength)` - XSS prevention
   - `validatePhoneNumber(phone)` - Israeli phone format
   - `validateLength(text, min, max)` - length validation

2. Add validation to AdminScreen forms:
   - LessonsForm: validate title, url, videoId
   - NewsForm: validate title, content, imageUrl
   - PodcastsForm: validate title, audioUrl, thumbnailUrl
   - AlertsForm: validate title, message

3. Add validation to user inputs:
   - authService: validateEmail before register/login
   - ContactRabbiScreen: validate message, phone
   - RegisterScreen: validate email, password strength

4. Show user-friendly error messages in Hebrew

**Example validation.js structure:**
```javascript
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const sanitizeInput = (input, maxLength = 500) => {
  if (!input) return ''
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Basic XSS prevention
}
```

---

## Requirements
1. **DO NOT** break existing functionality
2. **TEST** each change before moving to next
3. **USE** existing code style and conventions
4. **ADD** comments in Hebrew for important changes
5. **PRESERVE** all existing imports and dependencies
6. **ENSURE** app builds successfully after changes

## Validation Steps
After completing fixes:
1. Run `cd native && npm install` to update dependencies
2. Run `npx expo start` to verify app starts
3. Test Firebase connection works
4. Test admin panel forms work
5. Test user registration/login works
6. Run `npm audit` - should show 0 vulnerabilities

## Success Criteria
- ✅ No Firebase credentials in git
- ✅ Zero high/critical npm vulnerabilities
- ✅ All forms have input validation
- ✅ App builds and runs without errors
- ✅ All existing features still work

## Output Format
Please provide:
1. List of files changed
2. Summary of changes made
3. Any warnings or issues encountered
4. Testing results
5. Next steps if any
```

---

## 2️⃣ משימה 2: Firestore Indexes

### 🎯 מטרה
הוספת indexes חסרים ל-Firestore למניעת כשלים בשאילתות

### ⏱️ זמן משוער: 30 דקות
### 💰 עלות (אם מזמין): ₪400-600
### 🎯 חשיבות: 🔴🔴🔴 קריטי!

---

### 📝 פרומפט מקצועי ל-Gemini 3.0 / Claude

```
# Add Missing Firestore Indexes

## Context
I have a Firebase Firestore database that's missing critical composite indexes. Without these indexes, queries will fail when collections have more than 1,000 documents.

## Project Structure
- React Native app with Firebase Firestore
- Location: `/home/runner/work/harav_eyal/harav_eyal/`
- Firestore indexes file: `firestore.indexes.json`
- Services using queries: `native/src/services/`

## Current Indexes File
File: `firestore.indexes.json` (lines 1-187)

**Existing indexes:** dailyInsights, notifications, faithLessons, feeds, alerts, homeCards (some)

**Missing critical indexes:**
1. lessons: category + order (DESC)
2. lessons: category + createdAt (DESC) 
3. alerts: isActive + createdAt (DESC)
4. news: isPublished + publishedAt (DESC)
5. news: category + publishedAt (DESC)
6. podcasts: isActive + order (DESC)
7. dailyVideos: isActive + createdAt (DESC)

## Task Requirements

### 1. Update firestore.indexes.json
Add the missing indexes while preserving existing ones:

```json
{
  "indexes": [
    // ... keep existing indexes ...
    {
      "collectionGroup": "lessons",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "order", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "lessons",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "alerts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "news",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isPublished", "order": "ASCENDING" },
        { "fieldPath": "publishedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "news",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "publishedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "podcasts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "order", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "dailyVideos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

### 2. Verify Queries Match Indexes
Check these service files use the correct field names:
- `native/src/services/lessonsService.js`
- `native/src/services/alertsService.js`
- `native/src/services/newsService.js`
- `native/src/services/podcastsService.js`
- `native/src/services/dailyVideosService.js`

### 3. Create Deployment Guide
Create a new file: `DEPLOY_FIRESTORE_INDEXES.md` with:
- Step-by-step deployment instructions
- Firebase CLI commands
- Expected deployment time
- How to verify indexes are active

## Requirements
1. **PRESERVE** all existing indexes
2. **VALIDATE** JSON syntax is correct
3. **MATCH** field names exactly as used in queries
4. **TEST** that file is valid JSON

## Deployment Instructions to Include
```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy indexes
cd /home/runner/work/harav_eyal/harav_eyal
firebase deploy --only firestore:indexes

# Wait for deployment (can take 5-30 minutes)
# Check Firebase Console → Firestore → Indexes to verify
```

## Success Criteria
- ✅ Valid JSON file
- ✅ All 7 new indexes added
- ✅ Existing indexes preserved
- ✅ Matches query patterns in services
- ✅ Deployment guide created

## Output Format
Please provide:
1. Updated firestore.indexes.json content
2. List of indexes added
3. Verification that queries match indexes
4. Deployment guide content
5. Any warnings or considerations
```

---

## 3️⃣ משימה 3: Firebase Analytics + Crashlytics

### 🎯 מטרה
הוספת monitoring מקיף לפרודקשן

### ⏱️ זמן משוער: 2-3 שעות
### 💰 עלות (אם מזמין): ₪1,200-1,800
### 🎯 חשיבות: 🟡🟡 חשוב מאוד!

---

### 📝 פרומפט מקצועי ל-Gemini 3.0 / Claude

```
# Implement Firebase Analytics and Crashlytics

## Context
I need to add comprehensive monitoring to my React Native (Expo) production app to track usage, errors, and crashes.

## Project Structure
- React Native with Expo SDK 54
- Firebase backend already configured
- Main app file: `native/App.js`
- Services directory: `native/src/services/`
- Location: `/home/runner/work/harav_eyal/harav_eyal/native/`

## Requirements

### 1. Install Required Packages
Add these packages to `native/package.json`:
```bash
npx expo install @react-native-firebase/app
npx expo install @react-native-firebase/analytics
npx expo install @react-native-firebase/crashlytics
```

### 2. Update App.js (Main Application File)
File: `native/App.js` (224 lines)

**Changes needed:**
1. Import Analytics and Crashlytics at the top:
```javascript
import analytics from '@react-native-firebase/analytics'
import crashlytics from '@react-native-firebase/crashlytics'
```

2. Add initialization in the main App component:
```javascript
export default function App() {
  // ... existing state ...

  useEffect(() => {
    // Initialize Analytics
    const initAnalytics = async () => {
      await analytics().setAnalyticsCollectionEnabled(true)
      console.log('📊 Analytics initialized')
    }

    // Initialize Crashlytics
    const initCrashlytics = async () => {
      await crashlytics().setCrashlyticsCollectionEnabled(true)
      console.log('🐛 Crashlytics initialized')
    }

    initAnalytics()
    initCrashlytics()
  }, [])

  // ... rest of component
}
```

### 3. Create Analytics Service
Create new file: `native/src/services/analyticsService.js`

**Content:**
```javascript
import analytics from '@react-native-firebase/analytics'
import crashlytics from '@react-native-firebase/crashlytics'

/**
 * Analytics Service - מעקב אחר שימוש באפליקציה
 */

// Track screen views
export async function logScreenView(screenName, screenClass = null) {
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass || screenName,
    })
    console.log(`📊 Screen view: ${screenName}`)
  } catch (error) {
    console.error('Analytics error:', error)
  }
}

// Track user events
export async function logEvent(eventName, params = {}) {
  try {
    await analytics().logEvent(eventName, params)
    console.log(`📊 Event: ${eventName}`, params)
  } catch (error) {
    console.error('Analytics error:', error)
  }
}

// Set user properties
export async function setUserProperties(userId, properties = {}) {
  try {
    await analytics().setUserId(userId)
    await analytics().setUserProperties(properties)
    console.log('📊 User properties set')
  } catch (error) {
    console.error('Analytics error:', error)
  }
}

// Log errors to Crashlytics
export function logError(error, context = '') {
  try {
    if (context) {
      crashlytics().log(context)
    }
    crashlytics().recordError(error)
    console.error('🐛 Error logged to Crashlytics:', error)
  } catch (err) {
    console.error('Crashlytics error:', err)
  }
}

// Set Crashlytics user
export function setCrashlyticsUser(userId, email = '') {
  try {
    crashlytics().setUserId(userId)
    if (email) {
      crashlytics().setAttribute('email', email)
    }
    console.log('🐛 Crashlytics user set')
  } catch (error) {
    console.error('Crashlytics error:', error)
  }
}

// Custom analytics events for the app
export const Analytics = {
  // User actions
  userLogin: (method) => logEvent('login', { method }),
  userRegister: () => logEvent('sign_up'),
  userLogout: () => logEvent('logout'),
  
  // Content viewing
  viewLesson: (lessonId, category) => logEvent('view_lesson', { lesson_id: lessonId, category }),
  viewNews: (newsId) => logEvent('view_news', { news_id: newsId }),
  viewPodcast: (podcastId) => logEvent('view_podcast', { podcast_id: podcastId }),
  
  // User interactions
  shareContent: (contentType, contentId) => logEvent('share', { content_type: contentType, item_id: contentId }),
  donate: (amount) => logEvent('donate', { value: amount, currency: 'ILS' }),
  contactRabbi: () => logEvent('contact_rabbi'),
  
  // Admin actions
  adminCreateContent: (contentType) => logEvent('admin_create', { content_type: contentType }),
  adminUpdateContent: (contentType) => logEvent('admin_update', { content_type: contentType }),
  adminDeleteContent: (contentType) => logEvent('admin_delete', { content_type: contentType }),
}
```

### 4. Add Screen Tracking to Navigation
Update `native/App.js` to track screen navigation:

```javascript
import { logScreenView } from './src/services/analyticsService'

// In NavigationContainer
<NavigationContainer 
  ref={navigationRef}
  onStateChange={async () => {
    const currentRouteName = navigationRef.current?.getCurrentRoute()?.name
    if (currentRouteName) {
      await logScreenView(currentRouteName)
    }
  }}
>
```

### 5. Add Error Tracking to ErrorBoundary
Update `native/src/components/ErrorBoundary.jsx`:

```javascript
import { logError } from '../services/analyticsService'

// In componentDidCatch
componentDidCatch(error, errorInfo) {
  console.error('ErrorBoundary caught:', error, errorInfo)
  logError(error, `ErrorBoundary: ${errorInfo.componentStack}`)
  this.setState({ hasError: true, error })
}
```

### 6. Add Analytics to Key User Actions

Update these files to track important events:

**`native/src/services/authService.js`:**
```javascript
import { Analytics, setCrashlyticsUser } from './analyticsService'

// In login function (after successful login)
Analytics.userLogin('email')
setCrashlyticsUser(user.uid, user.email)

// In register function (after successful registration)
Analytics.userRegister()
setCrashlyticsUser(user.uid, user.email)

// In logout function
Analytics.userLogout()
```

**`native/src/screens/NewsDetailScreen.jsx`:**
```javascript
import { Analytics } from '../services/analyticsService'

// In useEffect when news loads
useEffect(() => {
  if (newsItem) {
    Analytics.viewNews(newsItem.id)
  }
}, [newsItem])
```

**`native/src/screens/DonationScreen.jsx`:**
```javascript
import { Analytics } from '../services/analyticsService'

// When donation button is pressed
const handleDonate = () => {
  Analytics.donate(100) // or actual amount
  // ... existing donation logic
}
```

### 7. Configure Firebase Console
**Manual steps (document these):**
1. Go to Firebase Console → Analytics → Enable
2. Go to Firebase Console → Crashlytics → Enable
3. Set up data retention (important for GDPR)
4. Configure user properties

### 8. Test Implementation
Add test logging to verify it works:
```javascript
// Add to App.js for testing
useEffect(() => {
  // Test analytics
  logEvent('app_opened', { platform: Platform.OS })
  
  // Test crashlytics (only in dev)
  if (__DEV__) {
    console.log('📊 Analytics and Crashlytics ready for testing')
  }
}, [])
```

## Requirements
1. **DO NOT** break existing functionality
2. **PRESERVE** all existing imports and code
3. **ADD** analytics gradually - don't track everything
4. **RESPECT** user privacy - only track necessary data
5. **TEST** in development first
6. **DOCUMENT** all tracked events

## Success Criteria
- ✅ Analytics initialized on app start
- ✅ Crashlytics captures errors
- ✅ Screen views tracked automatically
- ✅ Key user actions tracked (login, logout, content views)
- ✅ Admin actions tracked
- ✅ App builds and runs without errors

## Output Format
Please provide:
1. List of files created/modified
2. Summary of analytics events added
3. Testing instructions
4. Firebase Console configuration steps
5. Privacy considerations documented
```

---

## 4️⃣ משימה 4: Cloud Functions לתחזוקה

### 🎯 מטרה
יצירת Cloud Functions לניקוי אוטומטי ו-Custom Claims

### ⏱️ זמן משוער: 3-4 שעות
### 💰 עלות (אם מזמין): ₪1,800-2,400
### 🎯 חשיבות: 🟡🟡 חשוב!

---

### 📝 פרומפט מקצועי ל-Gemini 3.0 / Claude

```
# Create Firebase Cloud Functions for Maintenance

## Context
I need to create Cloud Functions for automated maintenance tasks and security features that can't run from the client app.

## Project Structure
- React Native app with Firebase
- Location: `/home/runner/work/harav_eyal/harav_eyal/`
- No functions directory exists yet - need to create from scratch

## Requirements

### 1. Initialize Firebase Functions
Create functions directory structure:
```
/home/runner/work/harav_eyal/harav_eyal/
├── functions/
│   ├── package.json
│   ├── index.js
│   └── .gitignore
```

**Initialize with:**
```bash
cd /home/runner/work/harav_eyal/harav_eyal
firebase init functions
# Select JavaScript (not TypeScript for simplicity)
# Install dependencies
```

### 2. Create functions/index.js

**Function 1: Daily Video Cleanup (Scheduled)**
Runs daily at 2 AM to delete old daily videos:

```javascript
const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()

/**
 * Scheduled function: Clean up expired daily videos
 * Runs daily at 2:00 AM Israel time
 */
exports.cleanupDailyVideos = functions.pubsub
  .schedule('0 2 * * *')
  .timeZone('Asia/Jerusalem')
  .onRun(async (context) => {
    console.log('🧹 Starting daily video cleanup...')
    
    const db = admin.firestore()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    try {
      // Get videos older than 24 hours
      const snapshot = await db.collection('dailyVideos')
        .where('createdAt', '<', yesterday)
        .get()
      
      if (snapshot.empty) {
        console.log('No old videos to delete')
        return null
      }
      
      // Delete in batch
      const batch = db.batch()
      snapshot.docs.forEach(doc => {
        console.log(`Deleting video: ${doc.id}`)
        batch.delete(doc.ref)
      })
      
      await batch.commit()
      console.log(`✅ Cleaned up ${snapshot.size} old videos`)
      
      return { deleted: snapshot.size }
    } catch (error) {
      console.error('Error cleaning up videos:', error)
      throw error
    }
  })
```

**Function 2: Set Admin Custom Claims (Firestore Trigger)**
Automatically syncs admin role from Firestore to Auth Custom Claims:

```javascript
/**
 * Firestore trigger: Set custom claims when user role changes
 * Watches: users/{userId}
 */
exports.setAdminClaim = functions.firestore
  .document('users/{userId}')
  .onWrite(async (change, context) => {
    const userId = context.params.userId
    
    // If document was deleted, remove claims
    if (!change.after.exists) {
      console.log(`User ${userId} deleted, removing claims`)
      await admin.auth().setCustomUserClaims(userId, { admin: false })
      return null
    }
    
    const userData = change.after.data()
    const isAdmin = userData.role === 'admin'
    
    try {
      // Set custom claims
      await admin.auth().setCustomUserClaims(userId, { 
        admin: isAdmin,
        role: userData.role || 'user'
      })
      
      console.log(`✅ Set claims for user ${userId}: admin=${isAdmin}`)
      
      // Update user document to trigger client refresh
      await change.after.ref.update({
        customClaimsSet: true,
        customClaimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
      })
      
      return { userId, isAdmin }
    } catch (error) {
      console.error(`Error setting claims for ${userId}:`, error)
      throw error
    }
  })
```

**Function 3: Cleanup Expired Alerts (Scheduled)**
Runs every hour to deactivate expired alerts:

```javascript
/**
 * Scheduled function: Deactivate expired alerts
 * Runs every hour
 */
exports.cleanupExpiredAlerts = functions.pubsub
  .schedule('0 * * * *')
  .timeZone('Asia/Jerusalem')
  .onRun(async (context) => {
    console.log('🧹 Checking for expired alerts...')
    
    const db = admin.firestore()
    const now = new Date()
    
    try {
      // Get active alerts with past expiryDate
      const snapshot = await db.collection('alerts')
        .where('isActive', '==', true)
        .where('expiryDate', '<', now)
        .get()
      
      if (snapshot.empty) {
        console.log('No expired alerts found')
        return null
      }
      
      // Deactivate in batch
      const batch = db.batch()
      snapshot.docs.forEach(doc => {
        console.log(`Deactivating alert: ${doc.id}`)
        batch.update(doc.ref, { 
          isActive: false,
          deactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
          deactivatedBy: 'system'
        })
      })
      
      await batch.commit()
      console.log(`✅ Deactivated ${snapshot.size} expired alerts`)
      
      return { deactivated: snapshot.size }
    } catch (error) {
      console.error('Error deactivating alerts:', error)
      throw error
    }
  })
```

**Function 4: Clean Old Cache Entries (Scheduled)**
Runs weekly to clean up old cache data:

```javascript
/**
 * Scheduled function: Clean old cache entries
 * Runs weekly on Sunday at 3 AM
 */
exports.cleanupOldCache = functions.pubsub
  .schedule('0 3 * * 0')
  .timeZone('Asia/Jerusalem')
  .onRun(async (context) => {
    console.log('🧹 Cleaning up old cache entries...')
    
    const db = admin.firestore()
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    try {
      // This is a placeholder - adjust based on actual cache structure
      // If you're using Firestore for cache (not recommended for large scale)
      const snapshot = await db.collection('cache')
        .where('createdAt', '<', weekAgo)
        .get()
      
      if (snapshot.empty) {
        console.log('No old cache entries found')
        return null
      }
      
      const batch = db.batch()
      snapshot.docs.forEach(doc => batch.delete(doc.ref))
      
      await batch.commit()
      console.log(`✅ Cleaned up ${snapshot.size} old cache entries`)
      
      return { deleted: snapshot.size }
    } catch (error) {
      console.error('Error cleaning cache:', error)
      throw error
    }
  })
```

### 3. Update Storage Rules to Check Custom Claims
File: `storage.rules` (currently uses custom claims but they're not set)

**Current code uses:**
```javascript
function isAdminClaim() {
  return request.auth != null && request.auth.token.admin == true;
}
```

This is already correct! The Cloud Function will now set these claims.

### 4. Update Client Code to Refresh Token
File: `native/src/services/authService.js`

Add function to refresh token after role change:

```javascript
/**
 * Force refresh user token to get updated custom claims
 */
export async function refreshUserToken() {
  try {
    const user = auth.currentUser
    if (!user) return
    
    // Force token refresh
    await user.getIdToken(true)
    console.log('🔄 Token refreshed with updated claims')
    
    return { error: null }
  } catch (error) {
    console.error('Error refreshing token:', error)
    return { error: error.message }
  }
}
```

### 5. Create Deployment Guide
Create file: `CLOUD_FUNCTIONS_DEPLOYMENT.md`

**Content:**
```markdown
# Cloud Functions Deployment Guide

## Prerequisites
1. Firebase CLI installed: `npm install -g firebase-tools`
2. Logged in: `firebase login`
3. Project selected: `firebase use eyalamrami-1d69e`

## Deploy Functions
```bash
cd /home/runner/work/harav_eyal/harav_eyal
firebase deploy --only functions
```

## Deploy Specific Function
```bash
firebase deploy --only functions:cleanupDailyVideos
firebase deploy --only functions:setAdminClaim
```

## View Logs
```bash
firebase functions:log
firebase functions:log --only cleanupDailyVideos
```

## Test Functions Locally
```bash
cd functions
npm run serve
```

## Cost Estimation
- Scheduled functions: ~100-200 invocations/day = Free tier
- Firestore triggers: Depends on user activity = Usually free
- Total: $0-5/month for <10K users

## Monitoring
View function execution in Firebase Console:
- Functions → Dashboard
- Logs → Cloud Functions
```

### 6. Update package.json in functions/
```json
{
  "name": "functions",
  "description": "Cloud Functions for Firebase",
  "scripts": {
    "serve": "firebase emulators:start --only functions",
    "shell": "firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "18"
  },
  "main": "index.js",
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^5.0.0"
  },
  "devDependencies": {
    "firebase-functions-test": "^3.1.0"
  },
  "private": true
}
```

## Requirements
1. **USE** Node.js 18 for functions
2. **TEST** locally before deploying
3. **HANDLE** errors gracefully
4. **LOG** all important operations
5. **USE** batch operations for efficiency
6. **SET** appropriate timeouts

## Success Criteria
- ✅ Functions directory created and initialized
- ✅ 4 Cloud Functions implemented
- ✅ Custom claims sync working
- ✅ Scheduled cleanup working
- ✅ Deployment guide created
- ✅ Local testing passes

## Output Format
Please provide:
1. Complete functions/index.js code
2. functions/package.json
3. Deployment guide content
4. Testing instructions
5. Cost estimation
6. Any warnings or considerations
```

---

## 5️⃣ משימה 5: Error Boundaries + Rate Limiting

### 🎯 מטרה
הוספת Error Boundaries בכל המסכים ו-Rate Limiting למניעת שימוש יתר

### ⏱️ זמן משוער: 2-3 שעות
### 💰 עלות (אם מזמין): ₪1,200-1,800
### 🎯 חשיבות: 🟡 חשוב!

---

### 📝 פרומפט מקצועי ל-Gemini 3.0 / Claude

```
# Add Error Boundaries and Rate Limiting

## Context
I need to add error handling and rate limiting to prevent app crashes and excessive Firebase costs.

## Project Structure
- React Native with Expo
- ErrorBoundary component already exists: `native/src/components/ErrorBoundary.jsx`
- Main app: `native/App.js`
- Services: `native/src/services/`

## Task 1: Implement Error Boundaries

### 1. Update App.js to Wrap Navigation
File: `native/App.js` (line 150)

**Current code:**
```javascript
<NavigationContainer ref={navigationRef}>
  <StatusBar style="dark" />
  <Stack.Navigator 
    initialRouteName={initialRoute}
    screenOptions={{ headerShown: false }}
  >
    {/* all screens */}
  </Stack.Navigator>
</NavigationContainer>
```

**Updated code:**
```javascript
<NavigationContainer ref={navigationRef}>
  <StatusBar style="dark" />
  <ErrorBoundary 
    onGoHome={() => navigationRef.current?.navigate('Home')}
  >
    <Stack.Navigator 
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      {/* all screens */}
    </Stack.Navigator>
  </ErrorBoundary>
</NavigationContainer>
```

### 2. Enhance ErrorBoundary Component
File: `native/src/components/ErrorBoundary.jsx`

**Add these improvements:**
```javascript
import { logError } from '../services/analyticsService' // if analytics is implemented

componentDidCatch(error, errorInfo) {
  console.error('ErrorBoundary caught:', error, errorInfo)
  
  // Log to Crashlytics (if implemented)
  if (logError) {
    logError(error, `ErrorBoundary: ${errorInfo.componentStack}`)
  }
  
  this.setState({ 
    hasError: true, 
    error,
    errorInfo: errorInfo.componentStack 
  })
}
```

### 3. Add Error Boundary to AdminScreen Forms
File: `native/src/screens/AdminScreen.jsx`

Wrap each form component with try-catch:

```javascript
{activeTab === 'lessons' && (
  <ErrorBoundary>
    <LessonsForm navigation={navigation} />
  </ErrorBoundary>
)}
{activeTab === 'alerts' && (
  <ErrorBoundary>
    <AlertsForm />
  </ErrorBoundary>
)}
// ... repeat for all tabs
```

## Task 2: Implement Rate Limiting

### 1. Create Rate Limiting Utility
Create file: `native/src/utils/rateLimiting.js`

```javascript
/**
 * Rate Limiting Utilities
 * מניעת קריאות מוגזמות לשרת
 */

/**
 * Throttle function - מגביל קריאות לפונקציה
 * @param {Function} func - הפונקציה לביצוע
 * @param {number} delay - זמן ההמתנה במילישניות
 * @returns {Function}
 */
export const throttle = (func, delay = 2000) => {
  let lastCall = 0
  let timeoutId = null
  
  return (...args) => {
    const now = Date.now()
    const timeSinceLastCall = now - lastCall
    
    if (timeSinceLastCall >= delay) {
      lastCall = now
      return func(...args)
    } else {
      // Clear existing timeout
      if (timeoutId) clearTimeout(timeoutId)
      
      // Set new timeout
      timeoutId = setTimeout(() => {
        lastCall = Date.now()
        func(...args)
      }, delay - timeSinceLastCall)
    }
  }
}

/**
 * Debounce function - ממתין עד שהמשתמש מפסיק לקרוא
 * @param {Function} func - הפונקציה לביצוע
 * @param {number} delay - זמן ההמתנה במילישניות
 * @returns {Function}
 */
export const debounce = (func, delay = 1000) => {
  let timeoutId = null
  
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId)
    
    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

/**
 * Rate limit for specific user - מגביל לפי משתמש
 * @param {string} userId
 * @param {string} action
 * @param {number} maxCalls - מקסימום קריאות
 * @param {number} windowMs - חלון זמן במילישניות
 */
const rateLimitStore = new Map()

export const checkRateLimit = (userId, action, maxCalls = 10, windowMs = 60000) => {
  const key = `${userId}:${action}`
  const now = Date.now()
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxCalls - 1 }
  }
  
  const data = rateLimitStore.get(key)
  
  // Reset if window expired
  if (now > data.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxCalls - 1 }
  }
  
  // Check if limit exceeded
  if (data.count >= maxCalls) {
    return { 
      allowed: false, 
      remaining: 0,
      resetIn: data.resetTime - now 
    }
  }
  
  // Increment count
  data.count++
  rateLimitStore.set(key, data)
  
  return { allowed: true, remaining: maxCalls - data.count }
}

/**
 * Clear rate limit for user/action
 */
export const clearRateLimit = (userId, action) => {
  const key = `${userId}:${action}`
  rateLimitStore.delete(key)
}
```

### 2. Apply Throttling to Data Loading
File: `native/src/HomeScreen.jsx`

**Current code (line ~188):**
```javascript
const loadAlerts = async () => {
  // ... loading logic
}

const interval = setInterval(loadAlerts, 5 * 60 * 1000)
```

**Updated code:**
```javascript
import { throttle } from './utils/rateLimiting'

// Throttle the load function
const loadAlertsThrottled = throttle(async () => {
  try {
    const alerts = await getAlerts()
    // ... rest of logic
  } catch (error) {
    console.error('Error loading alerts:', error)
  }
}, 5000) // Max once per 5 seconds

useEffect(() => {
  loadAlertsThrottled()
  const interval = setInterval(loadAlertsThrottled, 5 * 60 * 1000)
  
  return () => clearInterval(interval)
}, [])
```

### 3. Apply Debouncing to Search/Input
File: `native/src/screens/NewsScreen.jsx` (if has search)

```javascript
import { debounce } from '../utils/rateLimiting'

// Debounce search
const handleSearchDebounced = debounce((searchText) => {
  loadNews({ search: searchText })
}, 500) // Wait 500ms after user stops typing

const handleSearch = (text) => {
  setSearchText(text)
  handleSearchDebounced(text)
}
```

### 4. Apply Rate Limiting to Admin Actions
File: `native/src/screens/AdminScreen.jsx`

Add rate limiting to create/update/delete actions:

```javascript
import { checkRateLimit } from '../utils/rateLimiting'
import { getCurrentUser } from '../services/authService'

// In LessonsForm handleSubmit
const handleSubmit = async () => {
  const user = getCurrentUser()
  if (!user) return
  
  // Check rate limit
  const rateLimit = checkRateLimit(user.uid, 'createLesson', 10, 60000)
  if (!rateLimit.allowed) {
    Alert.alert(
      t('admin.rateLimitTitle'),
      t('admin.rateLimitMessage', { seconds: Math.ceil(rateLimit.resetIn / 1000) })
    )
    return
  }
  
  // ... rest of submit logic
}
```

### 5. Add Rate Limit Messages to Translations
File: `native/src/locales/he.json`

Add these keys:
```json
{
  "admin": {
    "rateLimitTitle": "יותר מדי פעולות",
    "rateLimitMessage": "אנא המתן {{seconds}} שניות לפני הפעולה הבאה"
  }
}
```

### 6. Apply Throttling to Firebase Queries
File: `native/src/services/lessonsService.js`

```javascript
import { throttle } from '../utils/rateLimiting'

// Throttle the main query function
const getLessonsInternal = async (category = null) => {
  // ... existing logic
}

export const getLessons = throttle(getLessonsInternal, 2000)
```

### 7. Add Memory Leak Fixes
File: `native/src/HomeScreen.jsx`

Fix potential memory leaks in useEffect:

```javascript
useEffect(() => {
  let isMounted = true
  
  const loadData = async () => {
    if (!isMounted) return
    
    try {
      const alerts = await getAlerts()
      if (!isMounted) return
      
      setAlerts(alerts)
    } catch (error) {
      if (!isMounted) return
      console.error('Error loading alerts:', error)
    }
  }
  
  loadData()
  const interval = setInterval(loadData, 5 * 60 * 1000)
  
  return () => {
    isMounted = false
    clearInterval(interval)
  }
}, [])
```

## Requirements
1. **DO NOT** break existing functionality
2. **TEST** error boundaries catch errors properly
3. **VERIFY** rate limiting works without blocking legitimate use
4. **ADD** user-friendly error messages in Hebrew
5. **FIX** all memory leaks in useEffect hooks
6. **LOG** rate limit violations for monitoring

## Success Criteria
- ✅ ErrorBoundary wraps navigation
- ✅ Individual forms have error boundaries
- ✅ Rate limiting utility created
- ✅ Throttling applied to data loading
- ✅ Debouncing applied to search/input
- ✅ Admin actions rate limited
- ✅ Memory leaks fixed
- ✅ App builds and runs without errors

## Output Format
Please provide:
1. List of files modified
2. Summary of error boundaries added
3. Summary of rate limiting added
4. Memory leak fixes applied
5. Testing instructions
6. Any warnings or considerations
```

---

## 💰 הסבר מפורט על העלות ₪2,500-3,500

### מה כלול בשיפורים החשובים?

עלות זו מתייחסת ל**שיפורים חשובים** שמוזכרים בהערכה:

1. **Firebase Analytics + Crashlytics** (משימה 3)
   - זמן: 2-3 שעות
   - עלות: ₪1,200-1,800
   - מה זה כולל: מעקב אחר שימוש, שגיאות, קריסות

2. **Cloud Functions לתחזוקה** (משימה 4)
   - זמן: 3-4 שעות
   - עלות: ₪1,800-2,400
   - מה זה כולל: ניקוי אוטומטי, Custom Claims, תחזוקת מערכת

3. **Error Boundaries + Rate Limiting** (משימה 5)
   - זמן: 2-3 שעות
   - עלות: ₪1,200-1,800
   - מה זה כולל: טיפול בשגיאות, הגבלת קריאות

**אבל רגע!** הסכום ₪2,500-3,500 כולל רק את:
- ✅ Firestore Indexes (משימה 2) - ₪400-600
- ✅ Firebase Analytics + Crashlytics (משימה 3) - ₪1,200-1,800
- ✅ Cloud Functions (משימה 4) - ₪1,800-2,400

**בפועל, זה יוצא:**
- מינימום: ₪400 + ₪1,200 + ₪1,800 = ₪3,400
- מקסימום: ₪600 + ₪1,800 + ₪2,400 = ₪4,800

### למה ההערכה היא ₪2,500-3,500?

זו הערכה **שמרנית** שמניחה:
1. העבודה תהיה יעילה (לא הכל יקח את המקסימום)
2. חלק מהקוד כבר קיים (ErrorBoundary למשל)
3. אין צורך בכל הפיצ'רים (Rate Limiting פחות קריטי)

### פירוט מחיר לפי משימה:

| משימה | זמן | שעתי ₪600 | הערות |
|-------|-----|-----------|-------|
| 1. אבטחה | 1-2 שעות | ₪600-1,200 | קריטי! |
| 2. Indexes | 0.5 שעה | ₪300-400 | קריטי! |
| 3. Analytics | 2-3 שעות | ₪1,200-1,800 | חשוב מאוד |
| 4. Cloud Functions | 3-4 שעות | ₪1,800-2,400 | חשוב |
| 5. Error Boundaries | 2-3 שעות | ₪1,200-1,800 | חשוב |
| **סה"כ מלא** | **8-12 שעות** | **₪5,100-7,600** | |
| **מינימום (1+2+3)** | **3-5 שעות** | **₪2,100-3,400** | |

### המלצה שלי:

**אם התקציב מוגבל:**
עשה רק משימות 1+2 (אבטחה + indexes) = **₪900-1,600**
זה הכרחי לפני מכירה!

**אם רוצה לממש ₪18K:**
עשה משימות 1+2+3 (+ Analytics) = **₪2,100-3,400**
זה יראה מקצועי ברמה אחרת!

**אם רוצה פרימיום:**
עשה הכל (1+2+3+4+5) = **₪5,100-7,600**
זה מוצר production-ready מלא!

---

## 📋 סיכום ושימוש בפרומפטים

### איך להשתמש בפרומפטים:

1. **בחר משימה** (1-5 לפי העדיפות)
2. **העתק את הפרומפט** המלא לחצי משימה
3. **הדבק ב-Gemini 3.0** או **Claude Code**
4. **המתן לתוצאה** ובדוק את הקוד
5. **בדוק שהכל עובד** לפני עבור למשימה הבאה

### סדר ביצוע מומלץ:

1. ✅ **משימה 1** (אבטחה) - קריטי!
2. ✅ **משימה 2** (Indexes) - קריטי!
3. ✅ **משימה 3** (Analytics) - חשוב מאוד
4. ⚠️ **משימה 4** (Cloud Functions) - חשוב
5. ⚠️ **משימה 5** (Error Boundaries) - רצוי

### טיפים לעבודה עם AI:

1. **הרץ משימה אחת בכל פעם** - אל תנסה הכל ביחד
2. **בדוק את הקוד** לפני שממשיך למשימה הבאה
3. **שמור גיבוי** לפני כל שינוי משמעותי
4. **בדוק שהאפליקציה עובדת** אחרי כל משימה
5. **אם משהו לא עובד** - שאל את ה-AI לתקן

---

**בהצלחה! 🚀**

אם יש שאלות או צריך הבהרות נוספות, אני כאן לעזור!
