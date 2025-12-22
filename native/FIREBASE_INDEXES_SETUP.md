# 📋 הוראות הגדרת Firestore Indexes

## ⚠️ חשוב: Indexes חובה!

Firestore דורש indexes לכל queries מורכבים (עם where + orderBy).
ללא indexes, ה-queries יכשלו!

---

## 🚀 איך ליצור Indexes

### שיטה 1: אוטומטי (מומלץ)

1. הרץ את האפליקציה
2. כאשר query נכשל, Firebase Console יציג הודעת שגיאה
3. לחץ על הקישור ב-console
4. Firebase יצור את ה-index אוטומטית

### שיטה 2: ידני

1. לך ל-[Firebase Console](https://console.firebase.google.com)
2. בחר את הפרויקט שלך
3. לך ל-**Firestore Database** → **Indexes**
4. לחץ על **Create Index**
5. העתק את ההגדרות מהקובץ `firestore.indexes.json`

---

## 📝 Indexes נדרשים

### 1. Alerts Collection
```
Collection: alerts
Fields:
  - isActive (Ascending)
  - createdAt (Descending)
```

### 2. Lessons Collection
```
Collection: lessons
Fields:
  - category (Ascending)
  - order (Descending)
```

### 3. News Collection
```
Collection: news
Fields:
  - isPublished (Ascending)
  - publishedAt (Descending)
```

### 4. Podcasts Collection
```
Collection: podcasts
Fields:
  - isActive (Ascending)
  - createdAt (Descending)
```

### 5. Daily Videos Collection
```
Collection: dailyVideos
Fields:
  - isActive (Ascending)
  - createdAt (Descending)
```

### 6. Home Cards Collection
```
Collection: homeCards
Fields:
  - isActive (Ascending)
  - order (Ascending)
```

---

## ⏱️ זמן יצירה

Indexes לוקחים **2-5 דקות** ליצירה.
אחרי יצירה, הם פעילים מיידית.

---

## ✅ בדיקה

לאחר יצירת ה-indexes, בדוק שהאפליקציה עובדת ללא שגיאות.

---

## 📄 קובץ Indexes

הקובץ `firestore.indexes.json` מכיל את כל ההגדרות.
ניתן לייבא אותו ישירות ל-Firebase Console.


