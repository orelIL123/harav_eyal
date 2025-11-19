# 🔒 עדכון Firebase Rules - Authentication + Podcasts

## 📋 מה צריך לעדכן:

### 1. Firestore Rules
עדכן את `firestore.rules` עם הכללים הבאים:

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
    
    // ========== USERS COLLECTION ==========
    match /users/{userId} {
      allow read: if isSignedIn() && request.auth.uid == userId;
      allow create: if isSignedIn() && request.auth.uid == userId;
      allow update: if isSignedIn() && request.auth.uid == userId;
      allow read: if isAdmin(); // Admins can read all
    }
    
    // ========== LESSONS COLLECTION ==========
    match /lessons/{lessonId} {
      allow read: if true; // Public
      allow write: if isAdmin();
    }
    
    // ========== ALERTS COLLECTION ==========
    match /alerts/{alertId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
    
    // ========== NEWS COLLECTION ==========
    match /news/{newsId} {
      allow read: if true; // Public
      allow write: if isAdmin();
    }
    
    // ========== PODCASTS COLLECTION ==========
    match /podcasts/{podcastId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
    
    // ========== HOME CARDS COLLECTION ==========
    match /homeCards/{cardKey} {
      allow read: if true; // Public
      allow write: if isAdmin();
    }
    
    // ========== APP CONFIG COLLECTION ==========
    match /appConfig/{docId} {
      allow read: if true; // Public
      allow write: if isAdmin();
    }
    
    // ========== INSTITUTIONS CONTENT ==========
    match /institutionsContent/{activityId} {
      allow read: if true; // Public
      allow write: if isAdmin();
    }
    
    // ========== DEFAULT DENY ==========
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 2. Storage Rules
עדכן את `storage.rules` עם הכללים הבאים:

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
    
    // ========== PODCASTS ==========
    match /podcasts/{podcastId}/{allPaths=**} {
      allow read: if isSignedIn();
      allow write: if isAdmin() &&
                   request.resource.size < 100 * 1024 * 1024 && // Max 100MB
                   request.resource.contentType.matches('audio/.*|image/.*');
    }
    
    // ========== CARDS IMAGES ==========
    match /cards/{cardId}/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin() &&
                   request.resource.size < 10 * 1024 * 1024 && // Max 10MB
                   request.resource.contentType.matches('image/.*');
    }
    
    // ========== NEWS IMAGES ==========
    match /news/{newsId}/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin() &&
                   request.resource.size < 10 * 1024 * 1024 && // Max 10MB
                   request.resource.contentType.matches('image/.*');
    }
    
    // ========== USER UPLOADS ==========
    match /users/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if isSignedIn() && request.auth.uid == userId &&
                   request.resource.size < 5 * 1024 * 1024; // Max 5MB
    }
    
    // ========== DEFAULT DENY ==========
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 📝 הוראות:

1. **פתח Firebase Console**
2. **Firestore Database → Rules**
   - העתק את ה-Firestore Rules למעלה
   - לחץ "Publish"
3. **Storage → Rules**
   - העתק את ה-Storage Rules למעלה
   - לחץ "Publish"

---

## ⚠️ חשוב:

- ודא שיש משתמש עם `role: 'admin'` ב-Firestore
- בדוק שהמשתמש מחובר לפני גישה למסך האדמין
- Rules משתמשים ב-Firestore role, לא ב-Custom Claims

---

**מוכן! 🚀**


