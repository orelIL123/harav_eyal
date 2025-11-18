# 🔐 Firestore Rules - הוראות התקנה

## 📝 איך להחליף את הכללים ב-Firebase Console:

1. **פתח את Firebase Console:**
   - לך ל: https://console.firebase.google.com/project/naorbaruch-a6cc5/firestore/rules

2. **החלף את הכללים:**
   - בחר הכל (Ctrl+A / Cmd+A)
   - מחק את התוכן הקיים
   - העתק את התוכן מקובץ `firestore.rules`
   - הדבק ב-Firebase Console

3. **פרסם:**
   - לחץ על **Publish** ✅

## ✅ מה הכללים האלה עושים:

- **Users** - כל משתמש יכול לקרוא/לכתוב רק את המידע שלו
- **Admin** - רק Admin יכול לערוך alerts, courses, news, recommendations
- **Premium/VIP** - רק משתמשים משלמים רואים קורסים פרימיום
- **Public** - כרטיסיות ו-appConfig זמינים לכולם (קריאה בלבד)
- **Security** - כל מה שלא מוגדר מפורשות = אסור!

## 🔒 Collections המוגדרות:

- `users` - נתוני משתמשים
- `alerts` - התראות מסחר
- `courses` - קורסים (חינמיים ופרימיום)
- `homeCards` - כרטיסיות בית
- `appConfig` - הגדרות אפליקציה
- `recommendations` - המלצות
- `news` - חדשות
- `marketData` - נתוני שוק

פרסם את זה עכשיו והכל מאובטח! 🔒


