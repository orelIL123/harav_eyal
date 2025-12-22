# ✅ Push Notifications הופעל!

## מה הופעל:

### 1. ✅ רישום אוטומטי ל-Push Notifications
- כשהאפליקציה נפתחת, היא מבקשת הרשאה להתראות
- ה-Push Token נשמר אוטומטית ב-Firestore כשמשתמש מתחבר

### 2. ✅ טיפול בהתראות
- התראות שנכנסות בזמן שהאפליקציה פתוחה (foreground)
- טיפול בלחיצה על התראות (navigation למסך רלוונטי)

### 3. ✅ שמירת Token ב-Firestore
- ה-token נשמר ב-`users/{userId}/expoPushTokens`
- תמיכה במספר tokens למשתמש (למקרה של מספר מכשירים)

## מה השתנה בקוד:

### 1. `native/App.js`
- ✅ הוסר ה-comment מה-import של `registerForPushNotificationsAsync`
- ✅ הופעל רישום אוטומטי ל-Push Notifications
- ✅ הוספו listeners להתראות:
  - `addNotificationReceivedListener` - התראות בזמן שהאפליקציה פתוחה
  - `addNotificationResponseReceivedListener` - לחיצה על התראות

### 2. `native/src/utils/AuthContext.jsx`
- ✅ הוספה שמירת Push Token ב-Firestore כשמשתמש מתחבר
- ✅ ה-token נשמר ב-`expoPushTokens` array

## איך זה עובד:

### שליחת התראות:

1. **דרך Expo Push API** (מומלץ):
   ```javascript
   // בשרת או Cloud Function
   const response = await fetch('https://exp.host/--/api/v2/push/send', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Accept': 'application/json',
       'Accept-Encoding': 'gzip, deflate'
     },
     body: JSON.stringify([{
       to: 'ExponentPushToken[xxxxx]',
       sound: 'default',
       title: 'כותרת',
       body: 'תוכן ההתראה',
       data: { screen: 'LiveAlerts', alertId: '123' }
     }])
   })
   ```

2. **דרך Firebase Cloud Functions** (אם יש):
   - צריך להשתמש ב-Expo Push API
   - לא FCM ישירות (כי זה Expo app)

### קבלת התראות:

- **Foreground**: התראות מוצגות אוטומטית
- **Background**: התראות מוצגות על ידי המערכת
- **Tapped**: האפליקציה נפתחת למסך הרלוונטי לפי `data.screen`

## בדיקות:

### בדיקה 1: רישום Token
1. פתח את האפליקציה
2. התחבר (או הירשם)
3. בדוק בקונסול: `📱 Push notification token received: ExponentPushToken[...]`
4. בדוק ב-Firestore: `users/{userId}/expoPushTokens` צריך להכיל את ה-token

### בדיקה 2: שליחת התראה
1. שלח התראה דרך Expo Push API עם ה-token
2. בדוק שההתראה מגיעה

### בדיקה 3: לחיצה על התראה
1. שלח התראה עם `data: { screen: 'LiveAlerts' }`
2. לחץ על ההתראה
3. בדוק שהאפליקציה נפתחת למסך LiveAlerts

## הערות חשובות:

1. **לא דורש build חדש!** ✅
   - זה רק שינוי בקוד JavaScript
   - אפשר לשלוח כ-update

2. **Expo Push Tokens**:
   - הפורמט: `ExponentPushToken[xxxxx]`
   - לא FCM tokens
   - צריך להשתמש ב-Expo Push API

3. **Permissions**:
   - iOS: צריך לבקש הרשאה (קורה אוטומטית)
   - Android: צריך לבקש הרשאה (קורה אוטומטית)

4. **Production**:
   - ב-production, צריך להשתמש ב-Expo Push API
   - לא עובד ב-Expo Go (רק ב-development builds)

## שליחת Update:

```bash
cd native
eas update --branch production --message "הפעלת Push Notifications"
```

## מה הלאה:

1. **שליחת התראות מהאדמין**:
   - להוסיף פיצ'ר בפאנל האדמין לשליחת התראות
   - להשתמש ב-Expo Push API

2. **Cloud Functions** (אופציונלי):
   - ליצור Cloud Function לשליחת התראות
   - להשתמש ב-Expo Push API

3. **התראות אוטומטיות**:
   - התראות על התראות חדשות
   - התראות על חדשות חדשות
   - וכו'

---

**תאריך הפעלה**: 2024
**סטטוס**: ✅ פעיל - מוכן לשימוש!

