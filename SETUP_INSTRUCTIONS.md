# 🚀 מדריך הקמה והפעלה - אפליקציית הרב אייל עמרמי

## 📋 דרישות מקדימות

### תוכנות נדרשות:
- **Node.js** v18+ ([הורדה](https://nodejs.org/))
- **npm** או **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **Firebase CLI** (אופציונלי): `npm install -g firebase-tools`
- **Git**

### חשבונות נדרשים:
- חשבון Expo ([הרשמה](https://expo.dev/))
- גישה ל-Firebase Console
- גישה לפרויקט: `eyalamrami-1d69e`

---

## 🔧 התקנה ראשונית

### 1. שכפול הפרויקט

```bash
git clone https://github.com/orelIL123/harav_eyal.git
cd harav_eyal
```

### 2. התקנת תלויות ברמת השורש

```bash
npm install
```

### 3. התקנת תלויות של Native App

```bash
cd native
npm install
```

---

## 🔑 הגדרת Environment Variables

### צור קובץ `.env` בתיקייה `native/`

**⚠️ חשוב:** קובץ זה **לא** צריך להיות ב-Git! הוא כבר ב-.gitignore.

```bash
cd native
cp .env.example .env
```

### ערוך את `.env` עם ה-credentials האמיתיים:

```env
FIREBASE_API_KEY=AIzaSyDpXIaHTcvamaoKXrl657nU3zFm9Nh389A
FIREBASE_AUTH_DOMAIN=eyalamrami-1d69e.firebaseapp.com
FIREBASE_PROJECT_ID=eyalamrami-1d69e
FIREBASE_STORAGE_BUCKET=eyalamrami-1d69e.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=990847614280
FIREBASE_APP_ID=1:990847614280:web:431b7f340e07bd7f3b477d
FIREBASE_MEASUREMENT_ID=G-P7YM9RTHK6
```

**🔒 אבטחה:**
- **לעולם אל תשתף את קובץ `.env` בציבור**
- אל תעלה אותו ל-Git
- אל תשלח אותו באימייל לא מוצפן
- השתמש בכלים מאובטחים להעברה (1Password, LastPass וכו')

---

## 🚀 הפעלת האפליקציה

### במצב פיתוח (Development)

```bash
cd native
npm start
# או
expo start
```

זה יפתח את Expo DevTools בדפדפן:

1. **לאנדרואיד:** לחץ על "Run on Android device/emulator"
2. **ל-iOS:** לחץ על "Run on iOS simulator" (רק במק)
3. **לדפדפן:** לחץ על "w" להפעלה בדפדפן

### סריקת QR Code

**באנדרואיד:**
- התקן את אפליקציית **Expo Go** מ-Play Store
- סרוק את ה-QR code מהטרמינל

**ב-iOS:**
- התקן את אפליקציית **Expo Go** מ-App Store
- סרוק את ה-QR code עם מצלמת האייפון

---

## 🔥 הגדרות Firebase

### 1. אימות Firebase (אם עדיין לא מוגדר)

```bash
firebase login
```

### 2. בחירת הפרויקט

```bash
firebase use eyalamrami-1d69e
```

### 3. פרסום Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 4. פרסום Firestore Indexes (**קריטי!**)

```bash
firebase deploy --only firestore:indexes
```

**⚠️ חשוב מאוד:** בלי indexes, האפליקציה תכשל עם יותר מ-1000 מסמכים!

### 5. פרסום Storage Rules

```bash
firebase deploy --only storage
```

---

## 🛠️ סקריפטים זמינים

### Root Level

```bash
# יצירת משתמש אדמין
node scripts/createAdmin.js

# בדיקת הרשאות אדמין
node scripts/testAdmin.js

# אתחול Firestore
node scripts/initFirestore.js
```

### Native App

```bash
cd native

# הפעלה רגילה
npm start

# הפעלת אנדרואיד
npm run android

# הפעלת iOS (רק במק)
npm run ios

# הפעלה בדפדפן
npm run web
```

---

## 📱 בניית גרסת פרודקשן

### עם Expo EAS Build

#### 1. התקנת EAS CLI

```bash
npm install -g eas-cli
```

#### 2. התחברות ל-EAS

```bash
eas login
```

#### 3. קישור הפרויקט

```bash
cd native
eas build:configure
```

#### 4. בנייה לאנדרואיד

```bash
eas build --platform android
```

#### 5. בנייה ל-iOS

```bash
eas build --platform ios
```

**הערה:** לבנייה של iOS צריכה חשבון Apple Developer ($99/שנה).

---

## 🧪 בדיקות

### הפעלת בדיקות (אם מוגדרות)

```bash
cd native
npm test
```

### בדיקת Linting

```bash
npm run lint
```

---

## 🔍 פתרון בעיות נפוצות

### בעיה: "Firebase not configured"

**פתרון:**
1. וודא שקובץ `.env` קיים ב-`native/`
2. וודא שכל המשתנים מוגדרים
3. הפעל מחדש את `expo start`

### בעיה: "Index not found"

**פתרון:**
```bash
firebase deploy --only firestore:indexes
```
וחכה 5-10 דקות עד שה-indexes נוצרים.

### בעיה: "Module not found"

**פתרון:**
```bash
cd native
rm -rf node_modules package-lock.json
npm install
```

### בעיה: "Expo Go won't connect"

**פתרון:**
1. וודא שהמחשב והטלפון באותה רשת Wi-Fi
2. נסה לפתוח דרך ה-URL הישיר (`exp://...`)
3. הפעל מחדש את `expo start`

### בעיה: Build כשל ב-EAS

**פתרון:**
1. וודא שה-`.env` מוגדר ב-EAS Secrets
2. בדוק את ה-logs ב-[expo.dev](https://expo.dev/)
3. וודא שכל התלויות תקינות

---

## 📋 Checklist לפני השקה

### אבטחה
- [ ] קובץ `.env` לא ב-Git
- [ ] כל ה-API keys מוגדרים נכון
- [ ] Firestore Rules פורסמו
- [ ] Storage Rules פורסמו

### Firebase
- [ ] Firestore Indexes פורסמו
- [ ] Authentication מופעל
- [ ] Storage מופעל
- [ ] הרשאות אדמין מוגדרות

### אפליקציה
- [ ] האפליקציה עולה ללא שגיאות
- [ ] כל המסכים נטענים נכון
- [ ] Login/Register עובדים
- [ ] התראות Push עובדות
- [ ] כל התמונות נטענות

### פרודקשן
- [ ] גרסה נבנתה ב-EAS
- [ ] האפליקציה הועלתה ל-Play Store / App Store
- [ ] Analytics מופעל (אופציונלי)
- [ ] Crashlytics מופעל (אופציונלי)

---

## 📊 ניטור ותחזוקה

### Firebase Console

**גישה:** [console.firebase.google.com](https://console.firebase.google.com/)

**דברים לבדוק:**
- **Authentication:** מספר משתמשים רשומים
- **Firestore:** מספר קריאות (reads/writes)
- **Storage:** שימוש באחסון
- **Analytics:** (אם מופעל) התנהגות משתמשים

### Expo Dashboard

**גישה:** [expo.dev](https://expo.dev/)

**דברים לבדוק:**
- **Builds:** סטטוס builds אחרונים
- **Updates:** OTA updates
- **Analytics:** שימוש באפליקציה

### עלויות Firebase

**טווח צפוי:**
- 100-500 משתמשים: ₪20-50/חודש
- 500-1,000 משתמשים: ₪50-100/חודש
- 1,000-5,000 משתמשים: ₪100-200/חודש

---

## 🆘 קבלת עזרה

### תיעוד רשמי
- **Expo:** [docs.expo.dev](https://docs.expo.dev/)
- **Firebase:** [firebase.google.com/docs](https://firebase.google.com/docs)
- **React Native:** [reactnative.dev](https://reactnative.dev/)

### קהילות
- **Expo Forums:** [forums.expo.dev](https://forums.expo.dev/)
- **Stack Overflow:** תג `expo`, `firebase`, `react-native`
- **Discord:** Expo Community Discord

### מסמכים נוספים בפרויקט
- `COMPREHENSIVE_APP_ANALYSIS_2025.md` - ניתוח מקיף
- `DEPLOY_INDEXES_GUIDE.md` - פרסום Indexes
- `FIREBASE_SETUP_GUIDE.md` - מדריך Firebase מפורט
- `SCALABILITY_FIXES_SUMMARY.md` - תיקוני סקיילינג

---

## ✅ סיכום

אחרי ביצוע כל השלבים הנ"ל, האפליקציה שלך צריכה להיות:

1. ✅ פועלת במקומי (Development)
2. ✅ מחוברת ל-Firebase
3. ✅ מאובטחת (API keys ב-.env)
4. ✅ מוכנה להשקה (עם Indexes)

**בהצלחה! 🚀**

---

*עדכון אחרון: 20 נובמבר 2025*
