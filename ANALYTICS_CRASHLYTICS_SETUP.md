# 📊 Firebase Analytics & Crashlytics - מדריך התקנה

## ✅ מה הושלם

### 1. שירות Analytics (`native/src/services/analyticsService.js`)
- ✅ אתחול Analytics עם Firebase JS SDK
- ✅ מעקב אחר צפיות במסכים
- ✅ מעקב אחר אירועי משתמשים
- ✅ הגדרת מאפייני משתמש
- ✅ רישום שגיאות (Crashlytics fallback)
- ✅ אירועים מותאמים אישית לאפליקציה

### 2. אתחול ב-App.js
- ✅ אתחול Analytics בעת פתיחת האפליקציה
- ✅ מעקב אוטומטי אחר ניווט בין מסכים
- ✅ רישום אירוע "app_opened"

### 3. ErrorBoundary
- ✅ רישום שגיאות ל-Crashlytics/Analytics
- ✅ הקשר מלא לשגיאות

### 4. מעקב Analytics ב:
- ✅ `authService.js` - התחברות, הרשמה, התנתקות
- ✅ `NewsDetailScreen.jsx` - צפייה בחדשות ושיתוף
- ✅ `DonationScreen.jsx` - לחיצה על כפתור תרומה

---

## 📋 אירועי Analytics שמוגדרים

### אירועי משתמש:
- `login` - התחברות משתמש
- `sign_up` - הרשמה חדשה
- `logout` - התנתקות

### אירועי תוכן:
- `view_lesson` - צפייה בשיעור
- `view_news` - צפייה בחדשות
- `view_podcast` - צפייה בפודקאסט
- `share` - שיתוף תוכן

### אירועי אינטראקציה:
- `donate` - תרומה
- `contact_rabbi` - יצירת קשר עם הרב

### אירועי Admin:
- `admin_create` - יצירת תוכן
- `admin_update` - עדכון תוכן
- `admin_delete` - מחיקת תוכן

### אירועי מערכת:
- `app_opened` - פתיחת אפליקציה
- `screen_view` - מעבר בין מסכים
- `error_occurred` - שגיאות

---

## ⚠️ הערות חשובות

### Analytics על Web vs Native

**המימוש הנוכחי:**
- ✅ עובד מיד על **Web** (Firebase JS SDK)
- ⚠️ על **Native** (iOS/Android) - Analytics יעבוד רק אם:
  1. אתה משתמש ב-**Expo Web** או
  2. אתה משתמש ב-**Custom Dev Client** עם תמיכה ב-Firebase Analytics

### Crashlytics

**המימוש הנוכחי:**
- ✅ רישום שגיאות ל-Analytics (אירוע `error_occurred`)
- ⚠️ **Crashlytics מלא** דורש:
  - `@react-native-firebase/crashlytics` (דורש Custom Dev Client)
  - או שירות חיצוני כמו Sentry

### המלצות לעתיד:

1. **לאפליקציות Native:**
   ```bash
   # התקן React Native Firebase (דורש Custom Dev Client)
   npx expo install @react-native-firebase/app
   npx expo install @react-native-firebase/analytics
   npx expo install @react-native-firebase/crashlytics
   ```

2. **או השתמש ב-Sentry:**
   ```bash
   npx expo install sentry-expo
   ```

---

## 🔧 הגדרת Firebase Console

### שלב 1: הפעל Analytics
1. לך ל: https://console.firebase.google.com
2. בחר את הפרויקט: `eyalamrami-1d69e`
3. לך ל: **Analytics** → **Dashboard**
4. ודא ש-Analytics מופעל

### שלב 2: הפעל Crashlytics (אופציונלי)
1. לך ל: **Crashlytics** → **Get Started**
2. פעל לפי ההוראות (דורש Custom Dev Client)

### שלב 3: הגדר User Properties
1. לך ל: **Analytics** → **User Properties**
2. הוסף properties מותאמים אישית לפי הצורך

---

## 🧪 בדיקות

### בדיקת Analytics (Web):
1. פתח את האפליקציה ב-Web
2. פתח את ה-Console בדפדפן
3. חפש הודעות `📊` - אלה מציינות אירועי Analytics
4. לך ל-Firebase Console → Analytics → Events
5. חכה כמה דקות עד שהאירועים יופיעו

### בדיקת Error Logging:
1. גרום לשגיאה באפליקציה
2. בדוק את ה-Console - צריך לראות `🐛 Error logged`
3. בדוק ב-Firebase Console → Analytics → Events → `error_occurred`

---

## 📊 איך לראות את הנתונים

### Firebase Console:
1. **Analytics Dashboard**: סקירה כללית
2. **Events**: כל האירועים
3. **User Properties**: מאפייני משתמשים
4. **Audiences**: קהלי יעד

### זמן עדכון:
- **Real-time**: אירועים מופיעים תוך דקות
- **Reports**: דוחות מלאים מופיעים תוך 24-48 שעות

---

## 🔒 פרטיות ו-GDPR

### מה נאסף:
- ✅ אירועי שימוש (ללא מידע אישי)
- ✅ User ID (אם משתמש מחובר)
- ✅ Email (אם משתמש מחובר)
- ✅ Platform (iOS/Android/Web)

### מה לא נאסף:
- ❌ מיקום מדויק
- ❌ מידע רגיש אחר

### התאמה ל-GDPR:
- האפליקציה כבר כוללת מסך הסכמה (`TermsAndConsentScreen`)
- ודא שהמשתמש מסכים לפני איסוף נתונים

---

## 🚀 שלבים הבאים

1. **פרסם את האפליקציה** ובדוק שהנתונים מתעדכנים
2. **הגדר Dashboards** ב-Firebase Console
3. **צור Audiences** לפי התנהגות משתמשים
4. **הגדר Alerts** לאירועים חשובים
5. **שקול להוסיף Crashlytics מלא** לאפליקציות Native

---

## 📚 משאבים נוספים

- [Firebase Analytics Documentation](https://firebase.google.com/docs/analytics)
- [Firebase Crashlytics Documentation](https://firebase.google.com/docs/crashlytics)
- [React Native Firebase](https://rnfirebase.io/)
- [Expo Firebase Setup](https://docs.expo.dev/guides/using-firebase/)

---

## ✅ סיכום

**מה עובד עכשיו:**
- ✅ Analytics על Web
- ✅ מעקב אחר מסכים ואירועים
- ✅ רישום שגיאות בסיסי

**מה דורש עבודה נוספת:**
- ⚠️ Analytics מלא על Native (דורש Custom Dev Client)
- ⚠️ Crashlytics מלא (דורש Custom Dev Client או Sentry)

**האפליקציה מוכנה לפרודקשן עם Analytics בסיסי!** 🎉
