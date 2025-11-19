# 🎙️ תכנית פודקאסטים + Authentication מאובטח

## 📋 סטטוס
- ⏳ פודקאסטים - בתכנון
- ⏳ Authentication - צריך לבנות

---

## 1️⃣ פודקאסטים - איפה יעלו?

### ✅ **דרך Firebase Storage + Firestore** (מומלץ!)

**למה?**
- ✅ מאובטח - רק אדמין יכול להעלות
- ✅ נגיש מכל מקום
- ✅ CDN אוטומטי
- ✅ ניהול קל דרך מסך האדמין
- ✅ Analytics וסטטיסטיקות

### מבנה Firestore:
```
Collection: podcasts
Document ID: {podcastId} (auto-generated)
Fields:
{
  title: string,
  description: string,
  audioUrl: string (from Storage),
  duration: number (seconds),
  thumbnailUrl: string (optional, from Storage),
  category: string (optional),
  createdAt: timestamp,
  updatedAt: timestamp,
  order: number,
  isActive: boolean
}
```

### מבנה Storage:
```
/podcasts/{podcastId}/
  - audio.mp3 (or .m4a, .wav)
  - thumbnail.jpg (optional)
```

---

## 2️⃣ Authentication מאובטח

### מה צריך?

#### A. מסך התחברות/הרשמה
- [ ] מסך Login (Email/Password)
- [ ] מסך Register (Email/Password)
- [ ] שכחת סיסמה
- [ ] שמירת מצב התחברות (AsyncStorage)

#### B. Firebase Authentication
- [ ] Email/Password Authentication
- [ ] Phone Authentication (אופציונלי)
- [ ] Custom Claims (לאדמין)

#### C. Security Rules
- [ ] Firestore Rules מאובטחים
- [ ] Storage Rules מאובטחים
- [ ] בדיקת Admin Role

#### D. User Management
- [ ] יצירת User Document ב-Firestore
- [ ] עדכון Profile
- [ ] ניהול Roles (user/admin)

---

## 3️⃣ מבנה Authentication

### מסכים נדרשים:
1. **LoginScreen** - התחברות
2. **RegisterScreen** - הרשמה
3. **ForgotPasswordScreen** - שכחת סיסמה
4. **ProfileScreen** - עדכון (כבר קיים, צריך לשפר)

### שירותים נדרשים:
1. **authService.js** - כל פונקציות ה-Auth
2. **userService.js** - ניהול משתמשים

---

## 4️⃣ Security Rules - עדכון

### Firestore Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isSignedIn() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users
    match /users/{userId} {
      allow read: if isSignedIn() && request.auth.uid == userId;
      allow create: if isSignedIn() && request.auth.uid == userId;
      allow update: if isSignedIn() && request.auth.uid == userId;
      allow read: if isAdmin(); // Admins can read all
    }
    
    // Lessons - Public read, Admin write
    match /lessons/{lessonId} {
      allow read: if true; // Public
      allow write: if isAdmin();
    }
    
    // Alerts - Authenticated read, Admin write
    match /alerts/{alertId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
    
    // News - Public read, Admin write
    match /news/{newsId} {
      allow read: if true; // Public
      allow write: if isAdmin();
    }
    
    // Podcasts - Authenticated read, Admin write
    match /podcasts/{podcastId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
    
    // Home Cards - Public read, Admin write
    match /homeCards/{cardKey} {
      allow read: if true; // Public
      allow write: if isAdmin();
    }
    
    // App Config - Public read, Admin write
    match /appConfig/{docId} {
      allow read: if true; // Public
      allow write: if isAdmin();
    }
    
    // Institutions - Public read, Admin write
    match /institutionsContent/{activityId} {
      allow read: if true; // Public
      allow write: if isAdmin();
    }
  }
}
```

### Storage Rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isSignedIn() && 
             firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Podcasts - Authenticated read, Admin write
    match /podcasts/{podcastId}/{allPaths=**} {
      allow read: if isSignedIn();
      allow write: if isAdmin() &&
                   request.resource.size < 100 * 1024 * 1024 && // Max 100MB
                   request.resource.contentType.matches('audio/.*|image/.*');
    }
    
    // Cards Images - Public read, Admin write
    match /cards/{cardId}/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin() &&
                   request.resource.size < 10 * 1024 * 1024 && // Max 10MB
                   request.resource.contentType.matches('image/.*');
    }
    
    // News Images - Public read, Admin write
    match /news/{newsId}/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin() &&
                   request.resource.size < 10 * 1024 * 1024 && // Max 10MB
                   request.resource.contentType.matches('image/.*');
    }
    
    // User Uploads - Only own profile
    match /users/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if isSignedIn() && request.auth.uid == userId &&
                   request.resource.size < 5 * 1024 * 1024; // Max 5MB
    }
    
    // Default deny
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 5️⃣ מבנה קבצים

### קבצים חדשים:
```
native/src/screens/
  - LoginScreen.jsx
  - RegisterScreen.jsx
  - ForgotPasswordScreen.jsx

native/src/services/
  - authService.js
  - userService.js
  - podcastsService.js

native/src/utils/
  - authContext.js (React Context)
```

---

## 6️⃣ סדר ביצוע

### שלב 1: Authentication (Priority 1)
1. יצירת `authService.js`
2. יצירת `LoginScreen.jsx`
3. יצירת `RegisterScreen.jsx`
4. יצירת `authContext.js` (Context API)
5. עדכון `App.js` - בדיקת Auth State
6. עדכון `ProfileScreen` - התחברות/התנתקות

### שלב 2: Security Rules (Priority 1)
1. עדכון `firestore.rules`
2. עדכון `storage.rules`
3. פרסום ב-Firebase Console

### שלב 3: פודקאסטים (Priority 2)
1. יצירת `podcastsService.js`
2. הוספת טאב פודקאסטים למסך האדמין
3. יצירת מסך פודקאסטים למשתמשים
4. העלאת קבצי אודיו דרך האדמין

---

## 7️⃣ פודקאסטים - פונקציות

### במסך האדמין:
- [ ] העלאת קובץ אודיו
- [ ] הוספת כותרת ותיאור
- [ ] העלאת תמונת כריכה (אופציונלי)
- [ ] רשימת פודקאסטים קיימים
- [ ] עריכה ומחיקה

### במסך המשתמש:
- [ ] רשימת פודקאסטים
- [ ] נגן אודיו מובנה
- [ ] הורדה לאופליין (אופציונלי)
- [ ] חיפוש וסינון

---

## 8️⃣ Authentication Flow

```
1. App Start
   ↓
2. Check Auth State (onAuthStateChanged)
   ↓
3. If not signed in → LoginScreen
   ↓
4. If signed in → Check User Document in Firestore
   ↓
5. If no document → Create User Document
   ↓
6. Load App with User Context
```

---

## 9️⃣ User Document Structure

```javascript
{
  uid: string, // Firebase Auth UID
  email: string,
  displayName: string,
  photoURL: string | null,
  role: 'user' | 'admin',
  tier: 'free' | 'premium' | 'vip',
  createdAt: timestamp,
  lastLoginAt: timestamp,
  notificationsEnabled: boolean,
  fcmTokens: array,
  metadata: {
    onboardingCompleted: boolean,
    preferredLanguage: 'he' | 'en'
  }
}
```

---

## 🔟 Security Best Practices

1. **Password Requirements**
   - מינימום 6 תווים (Firebase default)
   - מומלץ: 8+ תווים, אותיות ומספרים

2. **Email Verification**
   - אופציונלי - לא חובה בהתחלה
   - ניתן להוסיף בהמשך

3. **Session Management**
   - Firebase מנהל אוטומטית
   - Token refresh אוטומטי

4. **Admin Access**
   - רק דרך Firestore `users/{uid}.role == 'admin'`
   - לא דרך Custom Claims (מורכב יותר)

5. **Error Handling**
   - לא לחשוף שגיאות ספציפיות למשתמש
   - לוגים מפורטים ב-Console בלבד

---

## 📝 TODO List

### Authentication:
- [ ] יצירת authService.js
- [ ] יצירת LoginScreen
- [ ] יצירת RegisterScreen
- [ ] יצירת ForgotPasswordScreen
- [ ] יצירת authContext.js
- [ ] עדכון App.js עם Auth Guard
- [ ] עדכון ProfileScreen

### Security:
- [ ] עדכון Firestore Rules
- [ ] עדכון Storage Rules
- [ ] פרסום Rules ב-Firebase Console

### Podcasts:
- [ ] יצירת podcastsService.js
- [ ] הוספת טאב למסך האדמין
- [ ] יצירת מסך פודקאסטים
- [ ] נגן אודיו

---

**מוכן להתחיל! 🚀**


