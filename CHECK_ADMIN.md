# 🔍 מדריך בדיקת Admin - צעד אחר צעד

## ✅ מה שכבר בדקנו:
- ✅ המשתמש קיים ב-Auth
- ✅ המשתמש קיים ב-Firestore עם role: 'admin'
- ✅ UID: `2dEcFBvgiYQbbaHama53ZVs3lz02`

## 🔴 שלב 1: בדוק Firestore Rules

1. פתח Firebase Console: https://console.firebase.google.com
2. בחר בפרויקט: `eyalamrami-1d69e`
3. לך ל-Firestore Database → Rules
4. ודא שהכללים הבאים קיימים:

```javascript
match /users/{userId} {
  // Users can read and write their own data
  allow read: if isSignedIn() && request.auth.uid == userId;
  allow write: if isSignedIn() && request.auth.uid == userId;
  // Admins can read all users
  allow read: if isAdmin();
}
```

5. לחץ על "Publish" אם יש שינויים

## 🔴 שלב 2: בדוק את הלוגים באפליקציה

אחרי התחברות, בדוק את הלוגים בקונסול. אמור להופיע:

```
🔐 Login successful: { uid: '...', email: '...' }
🧹 All cache cleared for user
📋 User data refreshed: { role: 'admin', email: '...' }
🔄 Auth state changed - user logged in: ...
📖 Fetching document: users/...
✅ Document found: users/... { role: 'admin', ... }
🔍 Getting user data for: ...
✅ User data retrieved: { uid: '...', email: '...', role: 'admin', tier: 'vip' }
📋 User data loaded: { uid: '...', email: '...', role: 'admin', ... }
🔍 isUserAdmin check: { userId: '...', role: 'admin', ... }
✅ isUserAdmin result: true
✅ User is ADMIN - admin panel should be visible!
```

אם אתה רואה:
- `❌ Error getting document` - יש בעיה ב-Firestore Rules
- `⚠️ Document not found` - המשתמש לא קיים ב-Firestore
- `❌ Error code: permission-denied` - יש בעיה ב-Firestore Rules
- `role: undefined` או `role: null` - המשתמש לא נטען נכון

## 🔴 שלב 3: בדוק את ה-UID

אם אתה רואה UID שונה מ-`2dEcFBvgiYQbbaHama53ZVs3lz02`, זה אומר שאתה מתחבר עם משתמש אחר!

בדוק:
1. האם אתה מתחבר עם `orel895@gmail.com`?
2. האם הסיסמה היא `123456`?
3. מה ה-UID שמופיע בלוגים?

## 🔴 שלב 4: אם עדיין לא עובד

1. התנתק לגמרי מהאפליקציה
2. סגור את האפליקציה (kill app)
3. פתח מחדש
4. התחבר עם:
   - Email: `orel895@gmail.com`
   - Password: `123456`
5. שלח את כל הלוגים מהקונסול

## 📝 פרטי המשתמש:

- **Email:** `orel895@gmail.com`
- **Password:** `123456`
- **UID:** `2dEcFBvgiYQbbaHama53ZVs3lz02`
- **Role:** `admin`
- **Tier:** `vip`

