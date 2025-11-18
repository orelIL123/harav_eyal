# 🔥 תכנית Firebase Backend - Naor Baruch App

## 📋 סטטוס: פרויקט חדש ב-Firebase Console
- ✅ Authentication (Email/Password + Phone)
- ✅ Firestore Database
- ✅ Storage
- ✅ Web + iOS + Android apps

---

## 1️⃣ הגדרת Authentication

### שלבים:
```
1. Firebase Console → Authentication → Get Started
2. Sign-in method → Enable:
   ✓ Email/Password
   ✓ Phone (יצריך הגדרת SHA-256 ל-Android)
3. Settings → Authorized domains → הוסף דומיין production
```

### Firestore Rules לאימות:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function
    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isSignedIn() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    function isVIP() {
      return isSignedIn() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.tier == 'vip';
    }

    function isPremium() {
      return isSignedIn() &&
             (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.tier == 'premium' ||
              get(/databases/$(database)/documents/users/$(request.auth.uid)).data.tier == 'vip');
    }
  }
}
```

---

## 2️⃣ מבנה Firestore Collections

### 📁 Collection: `users`
**Document ID:** `{userId}` (Firebase Auth UID)
```json
{
  "uid": "string",
  "email": "string",
  "phone": "string?",
  "displayName": "string",
  "photoURL": "string?",
  "tier": "free | premium | vip",
  "role": "user | admin",
  "createdAt": "timestamp",
  "lastLoginAt": "timestamp",
  "notificationsEnabled": "boolean",
  "fcmTokens": ["string"],
  "streakDays": "number",
  "completedCourses": ["courseId"],
  "metadata": {
    "onboardingCompleted": "boolean",
    "preferredLanguage": "he | en"
  }
}
```

**Firestore Rules:**
```javascript
match /users/{userId} {
  allow read: if isSignedIn() && request.auth.uid == userId;
  allow write: if isSignedIn() && request.auth.uid == userId;
  allow read: if isAdmin(); // Admin can read all users
}
```

**Indexes נדרשים:**
```
Collection: users
Fields: tier (Ascending) + createdAt (Descending)
```

---

### 📁 Collection: `alerts`
**Document ID:** auto-generated
```json
{
  "id": "string",
  "symbol": "string",
  "title": "string",
  "type": "buy | sell | watch",
  "price": "string",
  "change": "string",
  "message": "string (80-120 chars)",
  "priority": "high | medium | low",
  "targetAudience": ["free", "premium", "vip"],
  "createdAt": "timestamp",
  "createdBy": "userId (admin)",
  "expiresAt": "timestamp?",
  "isActive": "boolean",
  "viewCount": "number",
  "clickCount": "number"
}
```

**Firestore Rules:**
```javascript
match /alerts/{alertId} {
  allow read: if isSignedIn();
  allow create, update, delete: if isAdmin();
}
```

**Indexes:**
```
Collection: alerts
Fields: isActive (Ascending) + createdAt (Descending)
Fields: targetAudience (Array) + createdAt (Descending)
```

---

### 📁 Collection: `courses`
**Document ID:** auto-generated
```json
{
  "id": "string",
  "title": "string",
  "level": "Beginner | Intermediate | Advanced | Mindset",
  "duration": "string",
  "description": "string",
  "isPremium": "boolean",
  "coverImageUrl": "string (Firebase Storage URL)",
  "videoUrl": "string (Firebase Storage URL)?",
  "order": "number",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "chapters": [
    {
      "id": "string",
      "title": "string",
      "duration": "string",
      "videoUrl": "string",
      "order": "number"
    }
  ],
  "metadata": {
    "viewCount": "number",
    "completionRate": "number"
  }
}
```

**Firestore Rules:**
```javascript
match /courses/{courseId} {
  allow read: if isSignedIn() &&
    (!resource.data.isPremium || isPremium());
  allow create, update, delete: if isAdmin();
}
```

**Indexes:**
```
Collection: courses
Fields: isPremium (Ascending) + order (Ascending)
Fields: level (Ascending) + order (Ascending)
```

---

### 📁 Collection: `homeCards`
**Document ID:** card key (e.g., 'daily-insight')
```json
{
  "key": "string (unique)",
  "title": "string",
  "desc": "string",
  "icon": "string (Ionicon name)",
  "imageUrl": "string (Firebase Storage URL)",
  "locked": "boolean",
  "order": "number",
  "isActive": "boolean",
  "route": "string (navigation route)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Firestore Rules:**
```javascript
match /homeCards/{cardId} {
  allow read: if true; // Public read
  allow create, update, delete: if isAdmin();
}
```

**Indexes:**
```
Collection: homeCards
Fields: isActive (Ascending) + order (Ascending)
```

---

### 📁 Collection: `appConfig` (Singleton)
**Document ID:** `config`
```json
{
  "headerTitle": "NAOR BARUCH",
  "headerSubtitle": "Trading • Mindset • Faith",
  "marketSnapshot": {
    "enabled": "boolean",
    "sources": ["TA35", "NASDAQ", "BTC"]
  },
  "quoteOfTheWeek": {
    "text": "string",
    "author": "string",
    "updatedAt": "timestamp"
  },
  "maintenanceMode": {
    "enabled": "boolean",
    "message": "string"
  },
  "version": {
    "ios": "string",
    "android": "string",
    "web": "string",
    "forceUpdate": "boolean"
  }
}
```

**Firestore Rules:**
```javascript
match /appConfig/config {
  allow read: if true; // Public read
  allow write: if isAdmin();
}
```

---

### 📁 Collection: `recommendations`
**Document ID:** auto-generated
```json
{
  "id": "string",
  "title": "string",
  "type": "video | article | podcast",
  "description": "string",
  "url": "string",
  "thumbnailUrl": "string?",
  "order": "number",
  "isActive": "boolean",
  "createdAt": "timestamp",
  "expiresAt": "timestamp?"
}
```

**Firestore Rules:**
```javascript
match /recommendations/{recoId} {
  allow read: if isSignedIn();
  allow create, update, delete: if isAdmin();
}
```

---

### 📁 Collection: `news`
**Document ID:** auto-generated
```json
{
  "id": "string",
  "title": "string",
  "category": "market | crypto | education",
  "content": "string",
  "imageUrl": "string?",
  "author": "string (admin name)",
  "createdAt": "timestamp",
  "publishedAt": "timestamp",
  "isPublished": "boolean",
  "viewCount": "number"
}
```

**Firestore Rules:**
```javascript
match /news/{newsId} {
  allow read: if isSignedIn() && resource.data.isPublished == true;
  allow create, update, delete: if isAdmin();
}
```

**Indexes:**
```
Collection: news
Fields: isPublished (Ascending) + publishedAt (Descending)
Fields: category (Ascending) + publishedAt (Descending)
```

---

## 3️⃣ Firebase Storage Structure

```
storage/
├── users/
│   └── {userId}/
│       ├── avatar.jpg
│       └── documents/
├── courses/
│   └── {courseId}/
│       ├── cover.jpg
│       ├── videos/
│       │   └── chapter-{n}.mp4
│       └── thumbnails/
├── cards/
│   └── {cardKey}/
│       └── background.jpg
├── news/
│   └── {newsId}/
│       └── image.jpg
└── recommendations/
    └── {recoId}/
        ��── thumbnail.jpg
```

### Storage Rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User uploads
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Admin uploads (courses, cards, news, recommendations)
    match /{adminPath}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                   get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## 4️⃣ Cloud Functions (Functions v2)

### פונקציות נדרשות:

#### 1. `onUserCreate` - Trigger when user signs up
```typescript
import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  await admin.firestore().collection('users').doc(user.uid).set({
    uid: user.uid,
    email: user.email,
    phone: user.phoneNumber,
    displayName: user.displayName || '',
    photoURL: user.photoURL || null,
    tier: 'free',
    role: 'user',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
    notificationsEnabled: true,
    fcmTokens: [],
    streakDays: 0,
    completedCourses: [],
    metadata: {
      onboardingCompleted: false,
      preferredLanguage: 'he'
    }
  });
});
```

#### 2. `sendPushNotification` - Callable function
```typescript
export const sendPushNotification = functions.https.onCall(async (data, context) => {
  // Verify admin
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');

  const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  if (userDoc.data()?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Must be admin');
  }

  const { alertId, targetAudience } = data;

  // Get alert data
  const alertDoc = await admin.firestore().collection('alerts').doc(alertId).get();
  if (!alertDoc.exists) throw new functions.https.HttpsError('not-found', 'Alert not found');

  const alert = alertDoc.data();

  // Query users based on targetAudience
  let usersQuery = admin.firestore().collection('users')
    .where('notificationsEnabled', '==', true);

  if (!targetAudience.includes('free')) {
    usersQuery = usersQuery.where('tier', 'in', targetAudience);
  }

  const usersSnapshot = await usersQuery.get();
  const tokens: string[] = [];

  usersSnapshot.forEach(doc => {
    const userData = doc.data();
    if (userData.fcmTokens && userData.fcmTokens.length > 0) {
      tokens.push(...userData.fcmTokens);
    }
  });

  if (tokens.length === 0) return { success: true, sent: 0 };

  // Send notification
  const message = {
    notification: {
      title: `${alert.symbol} - ${alert.type.toUpperCase()}`,
      body: alert.message,
    },
    data: {
      alertId: alertId,
      type: alert.type,
      symbol: alert.symbol,
    },
    tokens: tokens,
  };

  const response = await admin.messaging().sendMulticast(message);

  return {
    success: true,
    sent: response.successCount,
    failed: response.failureCount
  };
});
```

#### 3. `updateMarketSnapshot` - Scheduled function
```typescript
export const updateMarketSnapshot = functions.scheduler.onSchedule('every 5 minutes', async () => {
  // Call external APIs for market data (Alpha Vantage, CoinGecko, etc.)
  // Update Firestore with latest prices

  // Example structure:
  await admin.firestore().collection('marketData').doc('snapshot').set({
    TA35: { value: 1890.25, change: 0.45 },
    NASDAQ: { value: 14780.12, change: -0.32 },
    BTC: { value: 68250, change: 1.25 },
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
});
```

---

## 5️⃣ Indexes נדרשים (סיכום)

צור ב-Firebase Console → Firestore → Indexes:

```
1. users: tier (ASC) + createdAt (DESC)
2. alerts: isActive (ASC) + createdAt (DESC)
3. alerts: targetAudience (ARRAY) + createdAt (DESC)
4. courses: isPremium (ASC) + order (ASC)
5. courses: level (ASC) + order (ASC)
6. homeCards: isActive (ASC) + order (ASC)
7. news: isPublished (ASC) + publishedAt (DESC)
8. news: category (ASC) + publishedAt (DESC)
```

---

## 6️⃣ סדר ביצוע (Step by Step)

### שלב 1: הגדרות בסיסיות
```bash
# 1. Initialize Firebase in your project
npm install firebase firebase-admin

# 2. Get your config from Firebase Console
# Project Settings → General → Your apps → Web app
```

### שלב 2: Client Setup (React Native)
```typescript
// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging'; // Web only

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### שלב 3: יצירת Admin User
```typescript
// Script to run once
import { auth, db } from './config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

async function createAdmin() {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    'admin@naorbaruch.com',
    'STRONG_PASSWORD_HERE'
  );

  await setDoc(doc(db, 'users', userCredential.user.uid), {
    uid: userCredential.user.uid,
    email: 'admin@naorbaruch.com',
    tier: 'vip',
    role: 'admin', // ← Important!
    createdAt: new Date(),
    notificationsEnabled: true
  });

  console.log('✅ Admin user created');
}

createAdmin();
```

### שלב 4: Deploy Rules & Indexes
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Init project
firebase init firestore
firebase init storage
firebase init functions

# Deploy
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
firebase deploy --only firestore:indexes
firebase deploy --only functions
```

---

## 7️⃣ דוגמאות שימוש (Client Side)

### קריאת כרטיסיות מ-Firestore:
```typescript
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './config/firebase';

// Real-time listener
const cardsRef = collection(db, 'homeCards');
const q = query(
  cardsRef,
  where('isActive', '==', true),
  orderBy('order', 'asc')
);

const unsubscribe = onSnapshot(q, (snapshot) => {
  const cards = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  setCards(cards); // Update state
});

// Cleanup
return () => unsubscribe();
```

### העלאת תמונה ל-Storage:
```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config/firebase';

async function uploadCardImage(cardKey: string, imageFile: File) {
  const storageRef = ref(storage, `cards/${cardKey}/background.jpg`);
  await uploadBytes(storageRef, imageFile);
  const downloadURL = await getDownloadURL(storageRef);

  // Update Firestore
  await updateDoc(doc(db, 'homeCards', cardKey), {
    imageUrl: downloadURL,
    updatedAt: serverTimestamp()
  });

  return downloadURL;
}
```

### שליחת התראה:
```typescript
import { httpsCallable } from 'firebase/functions';
import { functions } from './config/firebase';

const sendNotification = httpsCallable(functions, 'sendPushNotification');

async function sendAlert(alertId: string, targetAudience: string[]) {
  const result = await sendNotification({ alertId, targetAudience });
  console.log('✅ Notification sent:', result.data);
}
```

---

## 8️⃣ Security Checklist

- [ ] Rules מוגדרים לכל Collection
- [ ] Storage Rules מוגדרים
- [ ] Admin role מוגדר ב-Firestore
- [ ] FCM Tokens מאובטחים
- [ ] API Keys מוגבלים (Restrict API key ב-Google Cloud Console)
- [ ] Authorized domains מוגדרים
- [ ] Budget alerts מופעלים ב-Google Cloud
- [ ] Backup policy מוגדר

---

## 9️⃣ עלויות משוערות (חינם עד):

| שירות | חינם עד | מחיר אחרי |
|-------|---------|----------|
| Firestore | 50K reads/day | $0.06 per 100K |
| Authentication | Unlimited | Free |
| Storage | 5GB | $0.026/GB |
| Functions | 2M invocations/month | $0.40 per 1M |
| Hosting | 10GB/month | $0.15/GB |

---

## 🎯 סיכום מהיר

**מה עשית עד כה:**
1. ✅ יצרת פרויקט ב-Firebase Console
2. ✅ הוספת Authentication (Email + Phone)
3. ✅ הוספת Firestore
4. ✅ הוספת Storage
5. ✅ הוספת Web + iOS + Android apps

**מה צריך לעשות עכשיו:**
1. קופי את ה-firebaseConfig מ-Console
2. התקן `firebase` ב-React Native
3. הגדר את ה-Collections לפי המבנה למעלה
4. העתק את ה-Rules ל-Firebase Console
5. צור Indexes
6. צור Admin user
7. בדוק שהכל עובד!

---

**נוצר ע"י Claude Code** 🤖