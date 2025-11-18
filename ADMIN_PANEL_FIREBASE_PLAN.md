# 🔥 תכנית חיבור Firebase למסך האדמין

## 📋 סטטוס נוכחי
- ✅ הסרת טאב קורסים (לא נדרש)
- ✅ תיקון סרטונים לא תקינים בליקוטי מוהר"ן
- ⏳ חיבור Firebase - בתכנון

---

## 1️⃣ ניהול שיעורים (Lessons)

### מבנה Firestore:
```
Collection: lessons
Document ID: {lessonId} (auto-generated)
Fields:
{
  category: string (emuna | likutei | einYaakov | motseiShabbat | halachotShabbat | shortLessons | holidays),
  title: string,
  date: string (optional),
  videoId: string,
  url: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  order: number (for sorting)
}
```

### פונקציות נדרשות:
1. **הוספת שיעור חדש**
   - בדיקת תקינות URL YouTube
   - חילוץ videoId
   - שמירה ב-Firestore
   - עדכון רשימה מקומית

2. **עריכת שיעור קיים**
   - טעינת נתונים קיימים
   - עדכון שדות
   - שמירה ב-Firestore

3. **מחיקת שיעור**
   - אימות מחיקה
   - מחיקה מ-Firestore

4. **רשימת שיעורים קיימים**
   - טעינה מ-Firestore לפי קטגוריה
   - תצוגה ברשימה עם אפשרות עריכה/מחיקה
   - סינון וחיפוש

### שיפורים למסך:
- [ ] הוספת רשימת שיעורים קיימים
- [ ] אפשרות עריכה (לחיצה על שיעור)
- [ ] אפשרות מחיקה (swipe או כפתור)
- [ ] אינדיקטור טעינה
- [ ] הודעות שגיאה/הצלחה

---

## 2️⃣ ניהול התראות (Alerts)

### מבנה Firestore:
```
Collection: alerts
Document ID: {alertId} (auto-generated)
Fields:
{
  title: string,
  type: string (reminder | push | announcement),
  message: string,
  priority: string (high | medium | low),
  sendType: string (immediate | scheduled),
  scheduledTime: timestamp (optional),
  targetAudience: array (all | registered),
  isActive: boolean,
  createdAt: timestamp,
  sentAt: timestamp (optional)
}
```

### פונקציות נדרשות:
1. **יצירת התראה**
   - שמירה ב-Firestore
   - שליחת Push Notification (אם immediate)
   - תזמון (אם scheduled)

2. **רשימת התראות**
   - טעינה מ-Firestore
   - סינון לפי סטטוס (פעיל/לא פעיל)
   - אפשרות עריכה/מחיקה

### שיפורים למסך:
- [ ] רשימת התראות קיימות
- [ ] אפשרות עריכה/מחיקה
- [ ] אינדיקטור סטטוס (נשלח/מתוזמן)
- [ ] תאריך שליחה

---

## 3️⃣ ניהול כרטיסיות (Cards)

### מבנה Firestore:
```
Collection: homeCards
Document ID: {cardKey} (daily-insight | community | books | institutions | live-alerts)
Fields:
{
  key: string,
  title: string,
  desc: string,
  icon: string,
  locked: boolean,
  imageUrl: string (from Storage),
  order: number,
  isActive: boolean,
  updatedAt: timestamp
}

Collection: appConfig
Document ID: header
Fields:
{
  title: string,
  subtitle: string,
  updatedAt: timestamp
}
```

### פונקציות נדרשות:
1. **עריכת כרטיס**
   - עדכון שדות
   - העלאת תמונה ל-Storage
   - עדכון ב-Firestore

2. **עריכת כותרת ראשית**
   - עדכון appConfig/header

### שיפורים למסך:
- [ ] תצוגת תמונה מועלת
- [ ] אינדיקטור טעינה בעת העלאת תמונה
- [ ] הודעת הצלחה/שגיאה

---

## 4️⃣ ניהול חדשות (News)

### מבנה Firestore:
```
Collection: news
Document ID: {newsId} (auto-generated)
Fields:
{
  title: string,
  category: string (chidushim | crypto | education),
  content: string,
  imageUrl: string (from Storage, optional),
  isPublished: boolean,
  publishedAt: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### פונקציות נדרשות:
1. **פרסום חדשה**
   - העלאת תמונה (אם יש)
   - שמירה ב-Firestore
   - עדכון סטטוס פרסום

2. **רשימת חדשות**
   - טעינה מ-Firestore
   - סינון לפי קטגוריה
   - אפשרות עריכה/מחיקה

### שיפורים למסך:
- [ ] רשימת חדשות קיימות
- [ ] אפשרות עריכה/מחיקה
- [ ] אינדיקטור סטטוס (פורסם/טיוטה)

---

## 5️⃣ ניהול מוסדות (Institutions)

### מבנה Firestore:
```
Collection: institutionsContent
Document ID: {activityId} (kindergarten | talmud-torah | girls-school | small-yeshiva | large-yeshiva | kollel | women-lessons | community | youth-club)
Fields:
{
  activityId: string,
  title: string,
  content: string (HTML or plain text),
  updatedAt: timestamp,
  updatedBy: string (userId)
}
```

### פונקציות נדרשות:
1. **טעינת תוכן קיים**
   - קריאה מ-Firestore לפי activityId
   - הצגה בטופס

2. **שמירת תוכן**
   - עדכון/יצירה ב-Firestore
   - שמירת userId של העורך

### שיפורים למסך:
- [ ] טעינה אוטומטית של תוכן קיים
- [ ] אינדיקטור טעינה
- [ ] הודעת הצלחה/שגיאה

---

## 6️⃣ מבנה Firestore המלא

### Collections:
```
lessons/
  {lessonId}/
    category, title, date, videoId, url, createdAt, updatedAt, order

alerts/
  {alertId}/
    title, type, message, priority, sendType, scheduledTime, targetAudience, isActive, createdAt, sentAt

homeCards/
  {cardKey}/
    key, title, desc, icon, locked, imageUrl, order, isActive, updatedAt

appConfig/
  header/
    title, subtitle, updatedAt

news/
  {newsId}/
    title, category, content, imageUrl, isPublished, publishedAt, createdAt, updatedAt

institutionsContent/
  {activityId}/
    activityId, title, content, updatedAt, updatedBy
```

### Indexes נדרשים:
```
1. lessons: category (ASC) + order (ASC)
2. lessons: category (ASC) + createdAt (DESC)
3. alerts: isActive (ASC) + createdAt (DESC)
4. alerts: sendType (ASC) + scheduledTime (ASC)
5. news: isPublished (ASC) + publishedAt (DESC)
6. news: category (ASC) + publishedAt (DESC)
7. homeCards: isActive (ASC) + order (ASC)
```

---

## 7️⃣ סדר ביצוע מומלץ

### שלב 1: הכנה
1. ✅ בדיקת קובץ Firebase config
2. ✅ בדיקת Authentication
3. ✅ בדיקת Firestore Rules

### שלב 2: שיעורים (Priority 1)
1. יצירת פונקציות עזר ל-Firestore
2. הוספת רשימת שיעורים קיימים
3. חיבור פונקציית הוספה
4. חיבור פונקציית עריכה
5. חיבור פונקציית מחיקה

### שלב 3: התראות (Priority 2)
1. חיבור פונקציית יצירה
2. הוספת רשימת התראות
3. חיבור Push Notifications

### שלב 4: כרטיסיות (Priority 3)
1. חיבור העלאת תמונות
2. חיבור עדכון כרטיסים
3. חיבור עדכון כותרת ראשית

### שלב 5: חדשות (Priority 4)
1. חיבור פרסום חדשה
2. הוספת רשימת חדשות
3. חיבור עריכה/מחיקה

### שלב 6: מוסדות (Priority 5)
1. חיבור טעינת תוכן
2. חיבור שמירת תוכן

---

## 8️⃣ קבצים ליצירה/עדכון

### קבצים חדשים:
```
native/src/services/firestore.js          - פונקציות עזר ל-Firestore
native/src/services/lessonsService.js     - שירות ניהול שיעורים
native/src/services/alertsService.js      - שירות ניהול התראות
native/src/services/cardsService.js       - שירות ניהול כרטיסיות
native/src/services/newsService.js        - שירות ניהול חדשות
native/src/services/institutionsService.js - שירות ניהול מוסדות
```

### קבצים לעדכון:
```
native/src/screens/AdminScreen.jsx        - חיבור כל הפונקציות
native/src/config/firebase.js             - בדיקת הגדרות
```

---

## 9️⃣ Security Rules

### Firestore Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Lessons
    match /lessons/{lessonId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    // Alerts
    match /alerts/{alertId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    // Home Cards
    match /homeCards/{cardKey} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    // App Config
    match /appConfig/{docId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    // News
    match /news/{newsId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    // Institutions Content
    match /institutionsContent/{activityId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
  }
}
```

---

## 🔟 הערות חשובות

1. **Authentication**: כל הפונקציות דורשות משתמש מחובר עם role='admin'
2. **Error Handling**: יש לטפל בשגיאות בצורה נכונה
3. **Loading States**: יש להציג אינדיקטורי טעינה
4. **Validation**: יש לאמת נתונים לפני שמירה
5. **Offline Support**: לשקול תמיכה במצב offline

---

## 📝 TODO List

- [ ] יצירת קובץ firestore.js עם פונקציות עזר
- [ ] יצירת lessonsService.js
- [ ] עדכון LessonsForm - הוספת רשימה
- [ ] עדכון LessonsForm - חיבור Firebase
- [ ] יצירת alertsService.js
- [ ] עדכון AlertsForm - חיבור Firebase
- [ ] עדכון CardsForm - חיבור Firebase
- [ ] עדכון NewsForm - חיבור Firebase
- [ ] עדכון InstitutionsForm - חיבור Firebase
- [ ] עדכון Firestore Rules
- [ ] יצירת Indexes
- [ ] בדיקות ותיקונים

