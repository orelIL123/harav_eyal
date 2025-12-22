# מדריך נגישות - סיכום מהיר

## 📋 סטטוס נוכחי

### ✅ מה כבר קיים
- `accessibilityRole="button"` ב-137 מקומות
- `accessibilityLabel` בחלק מהכפתורים
- תמיכה ב-i18n (עברית/אנגלית)
- תמיכה ב-RTL

### ❌ מה חסר
- תיאורי תמונות (Alt Text)
- `accessibilityHint` לכפתורים
- `accessibilityState` למצבים
- `accessibilityValue` לסליידרים
- בדיקת קורא מסך (AccessibilityInfo)
- הצהרת נגישות
- שיפור טפסים
- כותרות היררכיות
- כיבוד הפחתת תנועה

---

## ⚖️ דרישות חוקיות

### תקן ישראלי 5568 (WCAG 2.0 AA)

**חובה:**
- ניגודיות צבעים: 4.5:1 לטקסט רגיל, 3:1 לטקסט גדול
- תיאורי תמונות לכל תמונה עם תוכן
- ניווט במקלדת - כל הפונקציות נגישות
- תוויות שדות בטפסים
- הודעות שגיאה ברורות
- הצהרת נגישות באפליקציה

---

## 🛠️ React Native - Props עיקריים

### Props בסיסיים

```jsx
// תווית נגישות (חובה)
accessibilityLabel="חזרה למסך הקודם"

// תפקיד האלמנט
accessibilityRole="button" // button, text, image, header, link, etc.

// רמז נוסף
accessibilityHint="לחץ כדי לחזור"

// מצב האלמנט
accessibilityState={{ disabled: true, selected: false }}

// ערך (לסליידרים)
accessibilityValue={{ text: "50%" }}
```

### Props מתקדמים

```jsx
// עדכונים דינמיים
accessibilityLiveRegion="polite" // או "assertive"

// הסתרת אלמנטים דקורטיביים
accessibilityElementsHidden={true}
importantForAccessibility="no"

// מודאליות
accessibilityViewIsModal={true}
```

---

## 📝 דוגמאות קוד מהירות

### כפתור נגיש

```jsx
<Pressable
  onPress={handlePress}
  accessibilityRole="button"
  accessibilityLabel="שלח טופס"
  accessibilityHint="לחץ כדי לשלוח את הטופס"
  accessibilityState={{ disabled: isLoading }}
>
  <Text>שלח</Text>
</Pressable>
```

### תמונה נגישה

```jsx
// תמונה עם תוכן
<Image
  source={require('./image.jpg')}
  accessibilityLabel="כריכת הספר 'זריקת אמונה'"
  accessibilityRole="image"
/>

// תמונה דקורטיבית
<Image
  source={require('./decoration.png')}
  accessibilityElementsHidden={true}
  importantForAccessibility="no"
/>
```

### שדה קלט נגיש

```jsx
<View>
  <Text accessibilityRole="text">אימייל</Text>
  <TextInput
    value={email}
    onChangeText={setEmail}
    accessibilityLabel="שדה אימייל"
    accessibilityHint="הכנס את כתובת האימייל שלך"
  />
  {error && (
    <Text
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      {error}
    </Text>
  )}
</View>
```

### רשימה נגישה

```jsx
<FlatList
  data={items}
  renderItem={({ item, index }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, פריט ${index + 1} מתוך ${items.length}`}
    >
      <Text>{item.title}</Text>
    </Pressable>
  )}
  accessibilityLabel="רשימת שיעורים"
  accessibilityRole="list"
/>
```

---

## ✅ רשימת בדיקה מהירה

### כפתורים
- [ ] `accessibilityRole="button"`
- [ ] `accessibilityLabel` ברור
- [ ] `accessibilityHint` (אם נדרש)
- [ ] `accessibilityState` למצבים

### תמונות
- [ ] `accessibilityLabel` לתמונות עם תוכן
- [ ] `accessibilityElementsHidden={true}` לתמונות דקורטיביות

### טפסים
- [ ] `accessibilityLabel` לכל שדה
- [ ] `accessibilityRole="alert"` לשגיאות
- [ ] `accessibilityLiveRegion` לעדכונים

### ניווט
- [ ] כפתורי חזרה עם `accessibilityLabel`
- [ ] כותרות עם `accessibilityRole="header"`
- [ ] סדר טאבים הגיוני

---

## 🔍 כלי בדיקה

### Android
- **TalkBack**: Settings > Accessibility > TalkBack
- **Accessibility Scanner**: אפליקציה לבדיקת נגישות

### iOS
- **VoiceOver**: Settings > Accessibility > VoiceOver
- **Accessibility Inspector**: כלי פיתוח

### כלים נוספים
- **WebAIM Contrast Checker**: בדיקת ניגודיות
- **axe DevTools**: בדיקת נגישות בקוד

---

## 📚 מסמכים נוספים

1. **ACCESSIBILITY_REPORT.md** - דוח מפורט מלא
   - דרישות חוקיות
   - WCAG 2.0 AA
   - ניתוח מצב נוכחי
   - מדריך יישום מפורט
   - תוכנית עבודה

2. **native/ACCESSIBILITY_IMPLEMENTATION_GUIDE.md** - דוגמאות קוד
   - קומפוננטות נגישות מותאמות
   - דוגמאות למסכים קיימים
   - הוקים מותאמים
   - עזרי נגישות

---

## 🚀 תוכנית עבודה מהירה

### שבוע 1: בסיס
- התקנת כלים
- בדיקת מצב נוכחי
- יצירת קומפוננטות בסיסיות

### שבוע 2-3: יישום
- כפתורים ותמונות
- טפסים
- רשימות

### שבוע 4: שיפורים
- מבנה וניווט
- מדיה
- אנימציות

### שבוע 5: בדיקות
- בדיקות מקיפות
- תיקון בעיות
- הצהרת נגישות

### שבוע 6: משתמשים
- בדיקות עם משתמשים
- שיפורים סופיים

---

## 💡 טיפים חשובים

1. **תמיד בדקו עם קורא מסך** - כל שינוי צריך להיבדק
2. **תוויות ברורות** - תוויות עצמאיות מהקשר
3. **גובה מינימלי** - 44x44 פיקסלים לכפתורים
4. **ניגודיות** - 4.5:1 לטקסט רגיל
5. **רמזים מועילים** - רק כשצריך, לא לכל כפתור

---

## 📞 משאבים

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [Israeli Standard 5568](https://www.sii.org.il/)
- [WebAIM](https://webaim.org/)

---

**עדכון אחרון**: 2024
**גרסה**: 1.0


