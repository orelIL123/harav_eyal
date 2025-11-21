# 🔐 איך להיכנס למסך האדמין?

## 📍 המיקום

### מסך הפרופיל (ProfileScreen)

הכפתור למסך האדמין נמצא **במסך הפרופיל**, אבל רק אם אתה מחובר כאדמין.

---

## 🚀 שלבים להיכנס:

### שלב 1: היכנס לחשבון
1. פתח את האפליקציה
2. אם אתה לא מחובר, התחבר עם חשבון האדמין שלך

### שלב 2: לך לפרופיל
1. לחץ על טאב **"פרופיל"** בתפריט התחתון (הכי ימין)
2. תראה את פרטי המשתמש שלך

### שלב 3: בדוק אם יש לך הרשאות
אם אתה אדמין, תראה:
- ✅ **תג "אדמין"** ליד השם שלך (סגול עם אייקון מגן)
- ✅ **כרטיס "🔐 לוח בקרה"** בחלק העליון של המסך

### שלב 4: היכנס לאדמין
1. לחץ על הכרטיס **"🔐 לוח בקרה"**
2. תיכנס למסך האדמין עם כל הטאבים:
   - 📚 Lessons (שיעורים)
   - 🔔 Alerts (התראות)
   - 🎴 Cards (כרטיסים)
   - 📰 News (חדשות)
   - 🎙️ Podcasts (פודקאסטים)
   - 🎬 Daily Videos (סרטונים יומיים)
   - 📚 Books (ספרים)
   - 📄 Flyers (עלונים)
   - 👥 Community Posts (פוסטים קהילתיים)
   - 🏛️ Institutions (מוסדות)
   - 🐛 Debug (דיבאג)

---

## ⚠️ אם אין לך הרשאות אדמין

אם אתה **לא רואה** את התג "אדמין" או את כרטיס "לוח בקרה", זה אומר שהמשתמש שלך לא מוגדר כאדמין.

### איך להפוך לאדמין?

#### אפשרות 1: דרך Firebase Console (מומלץ)

1. **היכנס ל-Firebase Console:**
   - לך ל-https://console.firebase.google.com
   - היכנס עם החשבון: `orel895@gmail.com`

2. **בחר את הפרויקט:**
   - בחר את הפרויקט `eyalamrami-1d69e`

3. **פתח Firestore Database:**
   - בתפריט צד, לחץ על **"Firestore Database"**
   - לחץ על **"Data"**

4. **מצא את המשתמש שלך:**
   - פתח את הקולקציה `users`
   - חפש את המסמך של המשתמש שלך (לפי UID או Email)

5. **ערוך את הרשאות המשתמש:**
   - לחץ על המסמך
   - מצא את השדה `role`
   - שנה/הוסף את הערך ל-`"admin"`
   - שמור

6. **התנתק והתחבר מחדש באפליקציה:**
   - התנתק מהאפליקציה
   - התחבר מחדש
   - עכשיו אמור להיות לך הרשאות אדמין!

#### אפשרות 2: דרך Firestore Rules (זמני)

אם אתה רוצה לבדוק מהר, אפשר לשנות זמנית את ה-Firestore Rules כדי לאפשר למשתמש לעדכן את עצמו:

```javascript
// ⚠️ זמני בלבד! אל תשאיר ככה!
match /users/{uid} {
  allow read: if request.auth != null && request.auth.uid == uid;
  allow write: if request.auth != null && request.auth.uid == uid;

  // זמני - לאפשר עדכון role
  allow update: if request.auth != null && request.auth.uid == uid;
}
```

אחרי זה תוכל לרוץ קוד כזה באפליקציה (זמני):
```javascript
import { setDocument } from './src/services/firestore'

await setDocument('users', 'YOUR_USER_ID', { role: 'admin' }, true)
```

**⚠️ חשוב:** אחרי זה תחזיר את ה-Rules למצב המקורי!

#### אפשרות 3: צור משתמש אדמין חדש

אם אין לך גישה ל-Firebase Console:

1. צור חשבון חדש באפליקציה
2. ב-Firebase Console, שנה את ה-`role` שלו ל-`admin`
3. התחבר עם החשבון החדש

---

## 🔍 בדיקה מהירה

### בדוק את הסטטוס שלך:

אם אתה כבר מחובר, תוכל לבדוק את ה-role שלך:

1. פתח את **React Native Debugger** או **Console**
2. הקש:
```javascript
import { auth } from './src/config/firebase'
import { getDocument } from './src/services/firestore'

const checkMyRole = async () => {
  const uid = auth.currentUser?.uid
  if (!uid) {
    console.log('❌ Not logged in')
    return
  }

  const userData = await getDocument('users', uid)
  console.log('✅ User role:', userData?.role)
  console.log('✅ Full user data:', userData)
}

checkMyRole()
```

---

## ✅ Checklist מהיר

- [ ] אני מחובר לחשבון
- [ ] החשבון שלי מוגדר כ-`role: 'admin'` ב-Firestore
- [ ] התנתקתי והתחברתי מחדש (cache refresh)
- [ ] אני רואה תג "אדמין" בפרופיל
- [ ] אני רואה כרטיס "🔐 לוח בקרה"
- [ ] לחצתי על הכרטיס ונכנסתי לאדמין!

---

## 🎯 מה עושים אם זה לא עובד?

1. **נקה cache:**
   - התנתק מהאפליקציה
   - סגור את האפליקציה לגמרי
   - פתח מחדש והתחבר

2. **בדוק ב-Firestore:**
   - וודא שה-`role` מוגדר בדיוק כ-`"admin"` (עם מרכאות, אותיות קטנות)

3. **בדוק Firestore Rules:**
   - וודא שהכללים מאפשרים קריאה של `users/{uid}`

4. **רענן את האפליקציה:**
   ```bash
   cd native
   npm start -- --clear
   ```

---

## 📞 צריך עזרה?

אם משהו לא עובד:
1. בדוק את הקונסול לשגיאות
2. וודא שהחיבור ל-Firebase תקין
3. בדוק שה-Firestore Rules מאפשרים גישה למשתמש

---

**בהצלחה! 🚀**
