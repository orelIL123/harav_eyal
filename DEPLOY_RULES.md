# 🚀 Deploy Firebase Rules - הרץ את זה!

## שלב 1: התקן Firebase CLI (אם עדיין לא)

```bash
npm install -g firebase-tools
```

## שלב 2: Login ל-Firebase

```bash
firebase login
```

זה יפתח דפדפן - התחבר עם Google Account שלך

## שלב 3: Init הפרויקט (פעם אחת בלבד)

```bash
cd "/Users/x/Documents/naor baruch"
firebase init
```

בחר:
- ✓ Firestore
- ✓ Storage

כאשר שואל:
- "What file should be used for Firestore Rules?" → `firestore.rules` (ברירת מחדל)
- "What file should be used for Storage Rules?" → `storage.rules` (ברירת מחדל)
- "File firestore.rules already exists. Do you want to overwrite?" → **N** (No!)
- "Select a default Firebase project" → **naorbaruch-a6cc5**

## שלב 4: Deploy הכללים!

```bash
firebase deploy --only firestore:rules,storage:rules
```

## שלב 5: אחרי ה-Deploy, הרץ את הסקריפט

```bash
node scripts/initFirestore.js
```

## שלב 6: אחרי שהכל עובד - החזר את הכללים המאובטחים

```bash
# החזר את הקובץ המקורי
cp firestore.rules.backup firestore.rules

# Deploy שוב
firebase deploy --only firestore:rules
```

זהו! 🎉

---

## אלטרנטיבה: דרך ה-Console (אם אין לך Firebase CLI)

1. פתח Firebase Console
2. לך ל-Firestore Database → Rules
3. העתק את התוכן מ-`firestore.rules`
4. לחץ Publish
5. עשה אותו דבר ל-Storage → Rules עם `storage.rules`
6. הרץ: `node scripts/initFirestore.js`
7. אחרי שעובד, החזר את הכללים מ-`firestore.rules.backup`

**זה הכי מהיר!** ⚡
