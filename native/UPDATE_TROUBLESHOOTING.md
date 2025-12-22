# 🔍 פתרון בעיות עם EAS Updates

## בעיות אפשריות

### 1. ⚠️ Runtime Version לא תואם

**הבעיה**: ה-`runtimeVersion` ב-`app.json` חייב להתאים ל-`runtimeVersion` של ה-build בחנות.

**בדיקה**:
- ה-build בחנות נבנה עם `runtimeVersion: "1.0.0"`
- ה-`app.json` כרגע גם `runtimeVersion: "1.0.0"` ✅

**אם שינית את ה-runtimeVersion**, צריך build חדש!

### 2. ⚠️ Channel לא תואם

**הבעיה**: ה-update צריך להישלח לאותו channel שה-build נבנה איתו.

**בדיקה**:
- ה-build בחנות נבנה עם `channel: "production"` (מ-eas.json)
- הפקודה `eas update --branch production` שולחת ל-channel הנכון ✅

### 3. ⚠️ Updates לא מופעל

**הבעיה**: אם `Updates.isEnabled` הוא `false`, העדכונים לא יעבדו.

**בדיקה בקוד**:
```javascript
if (!Updates.isEnabled) {
  return // זה מונע טעינת עדכונים!
}
```

### 4. ⚠️ Build לא תומך ב-Updates

**הבעיה**: אם ה-build נבנה בלי תמיכה ב-Updates, זה לא יעבוד.

**פתרון**: צריך לוודא שה-build נבנה עם:
- `expo-updates` מותקן
- `runtimeVersion` מוגדר
- `updates.url` מוגדר

## בדיקות

### בדיקה 1: האם Updates מופעל?

```bash
cd native
npx expo install expo-updates
```

### בדיקה 2: בדוק את ה-runtimeVersion

```bash
cd native
cat app.json | grep runtimeVersion
```

צריך להיות: `"runtimeVersion": "1.0.0"`

### בדיקה 3: בדוק את ה-channel

```bash
cd native
cat eas.json | grep channel
```

צריך להיות: `"channel": "production"`

### בדיקה 4: בדוק אם יש update זמין

בקוד, הוסף לוגים:

```javascript
console.log('Updates.isEnabled:', Updates.isEnabled)
console.log('Updates.updateId:', Updates.updateId)
console.log('Updates.manifest:', Updates.manifest)
```

## פתרונות

### פתרון 1: שליחת Update מחדש

```bash
cd native
eas update --branch production --message "תיקון קריטי - תיקון קריסות"
```

### פתרון 2: בדיקה ידנית של Updates

הוסף ל-App.js:

```javascript
useEffect(() => {
  const checkUpdates = async () => {
    try {
      console.log('🔍 Checking for updates...')
      console.log('Updates.isEnabled:', Updates.isEnabled)
      
      if (!Updates.isEnabled) {
        console.warn('⚠️ Updates are not enabled')
        return
      }
      
      const update = await Updates.checkForUpdateAsync()
      console.log('Update available:', update.isAvailable)
      
      if (update.isAvailable) {
        console.log('📥 Fetching update...')
        await Updates.fetchUpdateAsync()
        console.log('✅ Update fetched, reloading...')
        await Updates.reloadAsync()
      } else {
        console.log('✅ App is up to date')
      }
    } catch (error) {
      console.error('❌ Error checking for updates:', error)
    }
  }
  
  checkUpdates()
}, [])
```

### פתרון 3: בדיקה ב-EAS Dashboard

1. לך ל: https://expo.dev/accounts/orel895/projects/harav-eyal
2. בדוק את ה-Updates section
3. ודא שיש update שנשלח
4. בדוק את ה-runtimeVersion וה-channel

### פתרון 4: אם עדיין לא עובד - Build חדש

אם העדכון לא עובד, אולי צריך build חדש:

```bash
cd native
eas build --platform ios --profile production
```

**אבל**: זה יגרור אישור מחדש של App Store!

## בדיקות נוספות

### בדיקה 5: האם ה-build תומך ב-Updates?

בדוק ב-App Store Connect:
- האם ה-build נבנה עם `expo-updates`?
- האם יש `runtimeVersion` ב-build?

### בדיקה 6: בדוק את ה-logs

בדוק את ה-logs ב-Expo Dashboard:
- האם יש שגיאות בטעינת העדכון?
- האם העדכון נשלח בהצלחה?

## אם עדיין לא עובד

1. **בדוק את ה-logs** ב-Expo Dashboard
2. **בדוק את ה-Updates section** ב-EAS Dashboard
3. **בדוק את ה-console logs** באפליקציה
4. **נסה build חדש** אם העדכון לא עובד

## קישורים שימושיים

- EAS Dashboard: https://expo.dev/accounts/orel895/projects/harav-eyal
- Expo Updates Docs: https://docs.expo.dev/versions/latest/sdk/updates/
- EAS Update Docs: https://docs.expo.dev/eas-updates/introduction/

