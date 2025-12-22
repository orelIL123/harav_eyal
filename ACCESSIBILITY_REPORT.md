# דוח נגישות לאפליקציה - עמידה בחוק הישראלי

## תוכן עניינים
1. [מבוא והקשר חוקי](#מבוא-והקשר-חוקי)
2. [דרישות חוקיות ישראליות](#דרישות-חוקיות-ישראליות)
3. [תקן WCAG 2.0 AA - דרישות עיקריות](#תקן-wcag-20-aa---דרישות-עיקריות)
4. [נגישות ב-React Native - כלים ותכונות](#נגישות-ב-react-native---כלים-ותכונות)
5. [ניתוח מצב נוכחי](#ניתוח-מצב-נוכחי)
6. [מדריך יישום מפורט](#מדריך-יישום-מפורט)
7. [רשימת בדיקה (Checklist)](#רשימת-בדיקה-checklist)
8. [כלים וספריות מומלצים](#כלים-וספריות-מומלצים)
9. [תוכנית עבודה מומלצת](#תוכנית-עבודה-מומלצת)

---

## מבוא והקשר חוקי

### חוק שוויון זכויות לאנשים עם מוגבלות (תיקון 40), התשע"ח-2018

החוק הישראלי מחייב כי שירותים דיגיטליים, כולל אפליקציות מובייל, יהיו נגישים לאנשים עם מוגבלויות. האפליקציה חייבת לעמוד בתקן הישראלי 5568, המבוסס על הנחיות WCAG 2.0 ברמה AA.

### מי חייב בהנגשה?
- כל ארגון המספק שירותים לציבור
- אפליקציות חדשות או מעודכנות
- אפליקציות עם מעל 50,000 משתמשים (חיוב מלא)
- אפליקציות קטנות יותר (חיוב חלקי)

### עונשים על אי-עמידה
- קנסות כספיים
- תביעות נזיקין
- פגיעה במוניטין

---

## דרישות חוקיות ישראליות

### תקן ישראלי 5568 - נגישות שירותי אינטרנט

התקן מחייב עמידה ב-**WCAG 2.0 ברמה AA** לפחות, עם התאמות ספציפיות לישראל:

#### 1. נגישות טקסט ותוכן
- **ניגודיות צבעים**: יחס ניגודיות מינימלי של 4.5:1 לטקסט רגיל, 3:1 לטקסט גדול
- **גודל טקסט**: אפשרות להגדיל טקסט עד 200% ללא אובדן פונקציונליות
- **שפה**: הכרזה על שפת התוכן (עברית/אנגלית)

#### 2. נגישות תמונות ומדיה
- **תיאורי תמונות (Alt Text)**: כל תמונה חייבת בתיאור אלטרנטיבי
- **תמונות דקורטיביות**: סימון כ-decorative
- **וידאו**: כתוביות (subtitles) ותיאורים (captions)

#### 3. נגישות ניווט
- **ניווט במקלדת**: כל הפונקציות חייבות להיות נגישות באמצעות מקלדת בלבד
- **מיקוד (Focus)**: אינדיקטור מיקוד ברור ונראה
- **סדר לוגי**: סדר טאבים הגיוני

#### 4. נגישות טפסים
- **תוויות שדות**: כל שדה חייב בתווית ברורה
- **הודעות שגיאה**: הודעות שגיאה ברורות ומסייעות
- **אימות בזמן אמת**: משוב מיידי על שגיאות

#### 5. נגישות קורא מסך
- **תיאורים נגישים**: תיאורים ברורים לכל אלמנט אינטראקטיבי
- **מבנה היררכי**: כותרות ומבנה לוגי
- **Landmarks**: אזורים סמנטיים (header, nav, main, footer)

#### 6. הצהרת נגישות
- **פרסום הצהרה**: הצהרת נגישות באפליקציה
- **פרטי קשר**: פרטי קשר לבעיות נגישות
- **תאריך עדכון**: תאריך עדכון אחרון

---

## תקן WCAG 2.0 AA - דרישות עיקריות

### עקרונות WCAG (4 עקרונות)

#### 1. ניתן לתפיסה (Perceivable)
- **1.1.1**: תמונות עם טקסט אלטרנטיבי
- **1.3.1**: מידע ויחסים מועברים גם ללא צבע
- **1.4.3**: ניגודיות מינימלית (4.5:1)
- **1.4.4**: אפשרות להגדיל טקסט עד 200%
- **1.4.5**: תמונות טקסט רק כשיש צורך

#### 2. ניתן להפעלה (Operable)
- **2.1.1**: כל הפונקציות נגישות במקלדת
- **2.1.2**: אין מלכודות מקלדת
- **2.4.3**: סדר מיקוד הגיוני
- **2.4.4**: מטרת קישור ברורה מהקשר
- **2.4.7**: אינדיקטור מיקוד נראה

#### 3. ניתן להבנה (Understandable)
- **3.1.1**: שפת התוכן מוגדרת
- **3.2.3**: ניווט עקבי
- **3.2.4**: רכיבים עקביים
- **3.3.1**: זיהוי שגיאות
- **3.3.2**: תוויות או הוראות

#### 4. יציב (Robust)
- **4.1.1**: פרסינג תקין
- **4.1.2**: שם, תפקיד, ערך

---

## נגישות ב-React Native - כלים ותכונות

### תכונות נגישות מובנות ב-React Native

React Native מספק תכונות נגישות מובנות המתורגמות ל-Android Accessibility ו-iOS Accessibility:

#### 1. Props בסיסיים

```javascript
// accessibilityLabel - תיאור האלמנט לקורא מסך
<Pressable
  accessibilityLabel="כפתור חזרה"
  accessibilityRole="button"
>
  <Text>חזרה</Text>
</Pressable>

// accessibilityRole - תפקיד האלמנט
// ערכים אפשריים: button, text, image, header, link, search, etc.
<View accessibilityRole="header">
  <Text>כותרת</Text>
</View>

// accessibilityHint - רמז נוסף למשתמש
<Pressable
  accessibilityLabel="שיתוף"
  accessibilityHint="לחץ כדי לשתף את התוכן"
  accessibilityRole="button"
>
  <Ionicons name="share" />
</Pressable>

// accessibilityState - מצב האלמנט
<Pressable
  accessibilityState={{ disabled: isLoading }}
  accessibilityLabel="שלח"
>
  <Text>שלח</Text>
</Pressable>

// accessibilityValue - ערך האלמנט (לסליידרים, progress bars)
<Slider
  accessibilityValue={{ text: `${value}%` }}
  accessibilityLabel="נפח"
/>
```

#### 2. Props מתקדמים

```javascript
// accessibilityLiveRegion - עדכונים דינמיים
<View accessibilityLiveRegion="polite">
  {error && <Text>{error}</Text>}
</View>

// accessibilityViewIsModal - מודאליות
<Modal accessibilityViewIsModal={true}>
  {/* תוכן מודאל */}
</Modal>

// accessibilityElementsHidden - הסתרת אלמנטים
<View accessibilityElementsHidden={true}>
  {/* אלמנטים דקורטיביים */}
</View>

// importantForAccessibility - עדיפות נגישות
<View importantForAccessibility="no-hide-descendants">
  {/* אלמנטים לא חשובים */}
</View>
```

#### 3. תכונות iOS ספציפיות

```javascript
// accessibilityTraits (iOS) - תכונות נוספות
<Pressable
  accessibilityRole="button"
  accessibilityTraits={['button', 'startsMediaSession']}
>
  <Text>נגן</Text>
</Pressable>
```

#### 4. תכונות Android ספציפיות

```javascript
// accessibilityHint (Android) - רמז נוסף
<Pressable
  accessibilityLabel="מחק"
  accessibilityHint="לחץ פעמיים כדי למחוק את הפריט"
>
  <Ionicons name="trash" />
</Pressable>
```

### כלי נגישות ב-React Native

#### 1. AccessibilityInfo API

```javascript
import { AccessibilityInfo } from 'react-native';

// בדיקה אם קורא מסך פעיל
AccessibilityInfo.isScreenReaderEnabled().then((isEnabled) => {
  console.log('קורא מסך פעיל:', isEnabled);
});

// האזנה לשינויים במצב קורא מסך
const subscription = AccessibilityInfo.addEventListener(
  'screenReaderChanged',
  (isEnabled) => {
    console.log('מצב קורא מסך השתנה:', isEnabled);
  }
);
```

#### 2. AccessibilityService (Android)

```javascript
// בדיקת הגדרות נגישות
import { AccessibilityInfo, Platform } from 'react-native';

if (Platform.OS === 'android') {
  AccessibilityInfo.isReduceMotionEnabled().then((isEnabled) => {
    // התאמת אנימציות
  });
}
```

---

## ניתוח מצב נוכחי

### מה כבר קיים באפליקציה?

#### ✅ תכונות נגישות שכבר מיושמות:

1. **accessibilityRole="button"** - מיושם בחלק גדול מהכפתורים
   - נמצא ב-137 מקומות בקוד
   - מסכים: HomeScreen, ProfileScreen, NewsScreen, ועוד רבים

2. **accessibilityLabel** - מיושם בחלק מהכפתורים
   - דוגמאות: "חזרה", "שיתוף", "מחק שיעור"
   - לא עקבי בכל המסכים

3. **תמיכה בשפות** - i18n מוגדר
   - עברית ואנגלית
   - תמיכה ב-RTL

#### ❌ מה חסר:

1. **תיאורי תמונות (Alt Text)**
   - תמונות ללא `accessibilityLabel`
   - תמונות דקורטיביות לא מסומנות

2. **accessibilityHint**
   - רמזים נוספים למשתמשים - לא קיים

3. **accessibilityState**
   - מצבי disabled/selected/checked - לא מיושם

4. **accessibilityValue**
   - ערכים לסליידרים ו-progress bars - לא קיים

5. **AccessibilityInfo**
   - בדיקת קורא מסך - לא מיושם

6. **ניגודיות צבעים**
   - לא נבדק באופן שיטתי

7. **הצהרת נגישות**
   - לא קיימת באפליקציה

8. **טפסים**
   - TextInput ללא accessibilityLabel עקבי
   - הודעות שגיאה ללא accessibilityLiveRegion

9. **כותרות היררכיות**
   - לא משתמשים ב-accessibilityRole="header" עם levels

10. **אנימציות**
    - לא בודקים אם המשתמש ביקש להפחית תנועה

---

## מדריך יישום מפורט

### 1. תמונות ותוכן ויזואלי

#### תמונות עם תוכן

```javascript
// ❌ לא נגיש
<Image source={require('./assets/book.jpg')} />

// ✅ נגיש
<Image
  source={require('./assets/book.jpg')}
  accessibilityLabel="כריכת הספר 'זריקת אמונה' מאת הרב אייל עמרמי"
  accessibilityRole="image"
/>
```

#### תמונות דקורטיביות

```javascript
// ✅ תמונה דקורטיבית
<Image
  source={require('./assets/decoration.png')}
  accessibilityElementsHidden={true}
  importantForAccessibility="no"
/>
```

#### אייקונים

```javascript
// ❌ לא נגיש
<Ionicons name="share" size={24} />

// ✅ נגיש
<Pressable
  accessibilityRole="button"
  accessibilityLabel="שיתוף התוכן"
  accessibilityHint="לחץ כדי לשתף את התוכן עם אחרים"
>
  <Ionicons name="share" size={24} color={PRIMARY_RED} />
</Pressable>
```

### 2. כפתורים ואלמנטים אינטראקטיביים

#### כפתורים בסיסיים

```javascript
// ❌ לא נגיש מספיק
<Pressable onPress={handlePress}>
  <Text>שלח</Text>
</Pressable>

// ✅ נגיש מלא
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

#### כפתורי ניווט

```javascript
// ✅ כפתור חזרה נגיש
<Pressable
  onPress={() => navigation.goBack()}
  accessibilityRole="button"
  accessibilityLabel="חזרה למסך הקודם"
  accessibilityHint="לחץ כדי לחזור למסך הקודם"
>
  <Ionicons name="arrow-back" size={24} color={PRIMARY_RED} />
</Pressable>
```

#### כפתורים עם אייקונים בלבד

```javascript
// ✅ כפתור עם אייקון בלבד
<Pressable
  onPress={handleShare}
  accessibilityRole="button"
  accessibilityLabel="שיתוף"
  accessibilityHint="לחץ כדי לשתף את התוכן"
>
  <Ionicons name="share-outline" size={24} color={PRIMARY_RED} />
</Pressable>
```

### 3. טפסים ושדות קלט

#### TextInput בסיסי

```javascript
// ❌ לא נגיש
<TextInput
  value={email}
  onChangeText={setEmail}
  placeholder="אימייל"
/>

// ✅ נגיש
<View>
  <Text
    accessibilityRole="text"
    accessibilityLabel="שדה אימייל"
    style={styles.label}
  >
    אימייל
  </Text>
  <TextInput
    value={email}
    onChangeText={setEmail}
    placeholder="הכנס אימייל"
    accessibilityLabel="שדה אימייל"
    accessibilityHint="הכנס את כתובת האימייל שלך"
    accessibilityRole="none" // TextInput כבר נגיש בעצמו
    autoCapitalize="none"
    keyboardType="email-address"
  />
  {error && (
    <Text
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={styles.error}
    >
      {error}
    </Text>
  )}
</View>
```

#### טפסים מורכבים

```javascript
// ✅ טופס נגיש מלא
const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  return (
    <ScrollView
      accessibilityLabel="טופס הרשמה"
      accessibilityRole="form"
    >
      {/* שדה אימייל */}
      <View accessibilityRole="none">
        <Text
          style={styles.label}
          accessibilityRole="text"
        >
          אימייל
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="הכנס אימייל"
          accessibilityLabel="שדה אימייל"
          accessibilityHint="הכנס את כתובת האימייל שלך"
          keyboardType="email-address"
          autoCapitalize="none"
          accessibilityState={{ invalid: !!errors.email }}
        />
        {errors.email && (
          <Text
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
            style={styles.error}
          >
            {errors.email}
          </Text>
        )}
      </View>

      {/* שדה סיסמה */}
      <View accessibilityRole="none">
        <Text
          style={styles.label}
          accessibilityRole="text"
        >
          סיסמה
        </Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="הכנס סיסמה"
          accessibilityLabel="שדה סיסמה"
          accessibilityHint="הכנס את הסיסמה שלך, לפחות 6 תווים"
          secureTextEntry
          accessibilityState={{ invalid: !!errors.password }}
        />
        {errors.password && (
          <Text
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
            style={styles.error}
          >
            {errors.password}
          </Text>
        )}
      </View>

      {/* כפתור שליחה */}
      <Pressable
        onPress={handleSubmit}
        accessibilityRole="button"
        accessibilityLabel="שלח טופס הרשמה"
        accessibilityHint="לחץ כדי להשלים את ההרשמה"
        accessibilityState={{ disabled: isLoading }}
      >
        <Text>הרשמה</Text>
      </Pressable>
    </ScrollView>
  );
};
```

### 4. רשימות ו-FlatList

```javascript
// ✅ FlatList נגיש
<FlatList
  data={items}
  renderItem={({ item, index }) => (
    <Pressable
      onPress={() => handleItemPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, פריט ${index + 1} מתוך ${items.length}`}
      accessibilityHint="לחץ כדי לפתוח את הפריט"
    >
      <View>
        <Text>{item.title}</Text>
        <Text>{item.description}</Text>
      </View>
    </Pressable>
  )}
  accessibilityLabel="רשימת שיעורים"
  accessibilityRole="list"
/>
```

### 5. כותרות ומבנה היררכי

```javascript
// ✅ כותרות עם levels
<View accessibilityRole="header" accessibilityLevel={1}>
  <Text style={styles.h1}>כותרת ראשית</Text>
</View>

<View accessibilityRole="header" accessibilityLevel={2}>
  <Text style={styles.h2}>כותרת משנית</Text>
</View>

<View accessibilityRole="header" accessibilityLevel={3}>
  <Text style={styles.h3}>כותרת שלישית</Text>
</View>
```

### 6. סליידרים ו-Progress Bars

```javascript
// ✅ Slider נגיש
import Slider from '@react-native-community/slider';

<View>
  <Text accessibilityRole="text">נפח: {volume}%</Text>
  <Slider
    value={volume}
    onValueChange={setVolume}
    minimumValue={0}
    maximumValue={100}
    accessibilityLabel="נפח שמע"
    accessibilityHint="הזז את הסליידר כדי לשנות את הנפח"
    accessibilityValue={{ text: `${Math.round(volume)}%` }}
  />
</View>
```

### 7. מודאלים ודיאלוגים

```javascript
// ✅ Modal נגיש
<Modal
  visible={showModal}
  animationType="slide"
  accessibilityViewIsModal={true}
  accessibilityLabel="חלון הודעות"
>
  <View>
    <Text
      accessibilityRole="header"
      accessibilityLevel={2}
    >
      כותרת המודאל
    </Text>
    <Text accessibilityRole="text">
      תוכן המודאל
    </Text>
    <Pressable
      onPress={() => setShowModal(false)}
      accessibilityRole="button"
      accessibilityLabel="סגור חלון"
    >
      <Text>סגור</Text>
    </Pressable>
  </View>
</Modal>
```

### 8. אנימציות והפחתת תנועה

```javascript
// ✅ כיבוי אנימציות לפי העדפת המשתמש
import { AccessibilityInfo } from 'react-native';
import { useEffect, useState } from 'react';

const MyComponent = () => {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );

    return () => subscription?.remove();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: reduceMotion ? 1 : fadeAnim,
        transform: reduceMotion ? [] : [{ translateY: translateAnim }]
      }}
    >
      {/* תוכן */}
    </Animated.View>
  );
};
```

### 9. עדכונים דינמיים (Live Regions)

```javascript
// ✅ הודעות שגיאה דינמיות
const [error, setError] = useState(null);

return (
  <View>
    {error && (
      <View
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
        importantForAccessibility="yes"
      >
        <Text style={styles.error}>{error}</Text>
      </View>
    )}
  </View>
);
```

### 10. קומפוננטה נגישה מותאמת אישית

```javascript
// ✅ קומפוננטת כפתור נגישה מותאמת אישית
import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

const AccessibleButton = ({
  onPress,
  label,
  hint,
  disabled = false,
  variant = 'primary',
  children,
  ...props
}) => {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label || t('button.defaultLabel')}
      accessibilityHint={hint}
      accessibilityState={{ disabled }}
      style={[
        styles.button,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        disabled && styles.disabled
      ]}
      {...props}
    >
      {children || <Text style={styles.text}>{label}</Text>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#DC2626',
  },
  secondary: {
    backgroundColor: '#f5f5f5',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AccessibleButton;
```

### 11. הוק נגישות מותאם אישית

```javascript
// ✅ Custom Hook לנגישות
import { useState, useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

export const useAccessibility = () => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);

  useEffect(() => {
    // בדיקה ראשונית
    AccessibilityInfo.isScreenReaderEnabled().then(setIsScreenReaderEnabled);
    AccessibilityInfo.isReduceMotionEnabled().then(setIsReduceMotionEnabled);

    // האזנה לשינויים
    const screenReaderSubscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );

    const reduceMotionSubscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setIsReduceMotionEnabled
    );

    return () => {
      screenReaderSubscription?.remove();
      reduceMotionSubscription?.remove();
    };
  }, []);

  return {
    isScreenReaderEnabled,
    isReduceMotionEnabled,
  };
};

// שימוש בהוק
const MyComponent = () => {
  const { isScreenReaderEnabled, isReduceMotionEnabled } = useAccessibility();

  return (
    <View>
      {isScreenReaderEnabled && (
        <Text>קורא מסך פעיל</Text>
      )}
      {/* התאמת אנימציות */}
    </View>
  );
};
```

### 12. תרגום נגישות (i18n)

```javascript
// ✅ הוספת מפתחות נגישות ל-locales

// locales/he.json
{
  "accessibility": {
    "back": "חזרה למסך הקודם",
    "close": "סגור",
    "share": "שיתוף",
    "delete": "מחק",
    "edit": "ערוך",
    "save": "שמור",
    "cancel": "ביטול",
    "submit": "שלח",
    "loading": "טוען...",
    "error": "שגיאה",
    "image": "תמונה",
    "video": "וידאו",
    "audio": "שמע",
    "button": "כפתור",
    "link": "קישור"
  }
}

// שימוש בתרגומים
const { t } = useTranslation();

<Pressable
  accessibilityLabel={t('accessibility.back')}
  accessibilityRole="button"
>
  <Ionicons name="arrow-back" />
</Pressable>
```

---

## רשימת בדיקה (Checklist)

### בדיקות כלליות

#### תמונות ותוכן ויזואלי
- [ ] כל תמונה עם תוכן יש לה `accessibilityLabel`
- [ ] תמונות דקורטיביות מסומנות כ-`accessibilityElementsHidden={true}`
- [ ] אייקונים בתוך כפתורים יש להם `accessibilityLabel` על הכפתור
- [ ] תמונות טקסט מוחלפות בטקסט אמיתי או יש להן תיאור מלא

#### כפתורים ואלמנטים אינטראקטיביים
- [ ] כל כפתור יש לו `accessibilityRole="button"`
- [ ] כל כפתור יש לו `accessibilityLabel` ברור
- [ ] כפתורים עם אייקונים בלבד יש להם `accessibilityLabel` מפורט
- [ ] כפתורים disabled יש להם `accessibilityState={{ disabled: true }}`
- [ ] כפתורים עם מצבים (selected, checked) יש להם `accessibilityState`

#### טפסים
- [ ] כל TextInput יש לו `accessibilityLabel`
- [ ] שדות חובה מסומנים בבירור
- [ ] הודעות שגיאה יש להן `accessibilityRole="alert"` ו-`accessibilityLiveRegion`
- [ ] הודעות שגיאה מופיעות בזמן אמת
- [ ] טפסים יש להם מבנה לוגי

#### ניווט
- [ ] כל מסך יש לו כותרת עם `accessibilityRole="header"`
- [ ] כפתורי חזרה יש להם `accessibilityLabel` ברור
- [ ] סדר הטאבים הגיוני
- [ ] אין מלכודות מקלדת

#### רשימות
- [ ] FlatList/ScrollView יש להם `accessibilityLabel`
- [ ] פריטים ברשימה יש להם `accessibilityLabel` עם הקשר (מיקום ברשימה)
- [ ] רשימות ריקות יש להן הודעה נגישה

#### מדיה
- [ ] נגני וידאו יש להם כפתורי נגינה נגישים
- [ ] נגני אודיו יש להם כפתורי נגינה נגישים
- [ ] סליידרים יש להם `accessibilityValue` עם ערך טקסטואלי

#### אנימציות
- [ ] אנימציות מכובדות כאשר המשתמש ביקש להפחית תנועה
- [ ] אין אנימציות מהבהבות שעלולות לגרום להתקפים

#### ניגודיות צבעים
- [ ] יחס ניגודיות מינימלי 4.5:1 לטקסט רגיל
- [ ] יחס ניגודיות מינימלי 3:1 לטקסט גדול
- [ ] מידע לא מועבר רק דרך צבע

#### שפה ותרגום
- [ ] שפת התוכן מוגדרת (i18n)
- [ ] כל הטקסטים מתורגמים
- [ ] תמיכה ב-RTL

### בדיקות טכניות

#### קוד
- [ ] כל קומפוננטה נבדקת עם קורא מסך
- [ ] אין אזהרות נגישות בקונסול
- [ ] כל ה-Props הנדרשים קיימים

#### בדיקות עם כלים
- [ ] בדיקה עם React Native Debugger
- [ ] בדיקה עם TalkBack (Android)
- [ ] בדיקה עם VoiceOver (iOS)
- [ ] בדיקת ניגודיות עם WebAIM Contrast Checker

### מסמכים
- [ ] הצהרת נגישות קיימת באפליקציה
- [ ] פרטי קשר לבעיות נגישות
- [ ] תאריך עדכון אחרון

---

## כלים וספריות מומלצים

### כלי בדיקה

#### 1. React Native Debugger
- בדיקת accessibility props בזמן אמת
- בדיקת מבנה הנגישות

#### 2. TalkBack (Android)
- קורא מסך מובנה של Android
- הפעלה: Settings > Accessibility > TalkBack

#### 3. VoiceOver (iOS)
- קורא מסך מובנה של iOS
- הפעלה: Settings > Accessibility > VoiceOver

#### 4. Accessibility Scanner (Android)
- אפליקציה לבדיקת נגישות
- זיהוי בעיות נגישות אוטומטיות

#### 5. axe DevTools
- כלי בדיקת נגישות
- זיהוי בעיות נגישות בקוד

### ספריות מומלצות

#### 1. react-native-accessibility
```bash
npm install react-native-accessibility
```
- כלים נוספים לנגישות
- בדיקת מצב קורא מסך

#### 2. @react-native-community/hooks (useAccessibilityInfo)
```bash
npm install @react-native-community/hooks
```
- הוקים לנגישות
- ניהול מצב נגישות

### כלי בדיקת ניגודיות

#### 1. WebAIM Contrast Checker
- https://webaim.org/resources/contrastchecker/
- בדיקת יחס ניגודיות

#### 2. Colour Contrast Analyser
- כלי שולחן עבודה
- בדיקת ניגודיות בתמונות

### כלי בדיקת קורא מסך

#### 1. NVDA (Windows)
- קורא מסך חינמי
- לבדיקות במחשב

#### 2. JAWS (Windows)
- קורא מסך מקצועי
- לבדיקות מתקדמות

---

## תוכנית עבודה מומלצת

### שלב 1: הכנה ובסיס (שבוע 1)

1. **התקנת כלים**
   - התקנת Accessibility Scanner
   - הגדרת TalkBack/VoiceOver
   - התקנת react-native-accessibility

2. **בדיקת מצב נוכחי**
   - ריצת בדיקות נגישות על כל המסכים
   - רשימת בעיות נגישות
   - עדיפויות

3. **הגדרת תשתית**
   - יצירת קומפוננטות נגישות בסיסיות
   - הוספת מפתחות נגישות ל-i18n
   - יצירת הוק useAccessibility

### שלב 2: יישום בסיסי (שבוע 2-3)

1. **כפתורים ואלמנטים אינטראקטיביים**
   - הוספת accessibilityLabel לכל הכפתורים
   - הוספת accessibilityHint לכפתורים מורכבים
   - הוספת accessibilityState למצבים

2. **תמונות ותוכן ויזואלי**
   - הוספת accessibilityLabel לכל התמונות
   - סימון תמונות דקורטיביות
   - תיאור אייקונים

3. **טפסים**
   - הוספת accessibilityLabel לשדות
   - הוספת accessibilityLiveRegion לשגיאות
   - שיפור הודעות שגיאה

### שלב 3: שיפורים מתקדמים (שבוע 4)

1. **מבנה וניווט**
   - הוספת כותרות היררכיות
   - שיפור ניווט במקלדת
   - בדיקת סדר טאבים

2. **מדיה ואינטראקטיביות**
   - נגני וידאו/אודיו נגישים
   - סליידרים עם accessibilityValue
   - מודאלים נגישים

3. **אנימציות**
   - כיבוד הפחתת תנועה
   - הסרת אנימציות מהבהבות

### שלב 4: בדיקות ואופטימיזציה (שבוע 5)

1. **בדיקות מקיפות**
   - בדיקה עם TalkBack
   - בדיקה עם VoiceOver
   - בדיקת ניגודיות
   - בדיקת ניווט במקלדת

2. **תיקון בעיות**
   - תיקון כל הבעיות שנמצאו
   - אופטימיזציה של תיאורים

3. **הצהרת נגישות**
   - כתיבת הצהרת נגישות
   - הוספת מסך הצהרת נגישות
   - פרטי קשר

### שלב 5: בדיקות משתמשים (שבוע 6)

1. **בדיקות עם משתמשים אמיתיים**
   - משתמשים עם קוראי מסך
   - משתמשים עם מוגבלויות אחרות
   - איסוף משוב

2. **שיפורים סופיים**
   - תיקון בעיות שנמצאו
   - שיפורים לפי משוב

### שלב 6: פרסום ותחזוקה (שבוע 7+)

1. **פרסום**
   - עדכון אפליקציה בחנויות
   - פרסום הצהרת נגישות

2. **תחזוקה**
   - בדיקות תקופתיות
   - עדכון לפי שינויים בחוק
   - מעקב אחר משוב משתמשים

---

## מסקנות והמלצות

### סיכום

האפליקציה כבר כוללת חלק מתכונות הנגישות הבסיסיות, אך יש עוד עבודה רבה לעשות כדי לעמוד בדרישות החוק הישראלי. הפעולות העיקריות הנדרשות:

1. **הוספת תיאורים מלאים** לכל האלמנטים האינטראקטיביים
2. **שיפור טפסים** עם תוויות והודעות שגיאה נגישות
3. **תיאור תמונות** ותוכן ויזואלי
4. **שיפור מבנה** עם כותרות היררכיות
5. **כיבוד העדפות נגישות** (הפחתת תנועה)
6. **הצהרת נגישות** באפליקציה

### המלצות

1. **התחלה מהירה**: התחילו עם הכפתורים והטפסים - אלו האלמנטים החשובים ביותר
2. **בדיקות מתמידות**: בדקו כל שינוי עם קורא מסך
3. **תיעוד**: תיעדו כל שינוי נגישות
4. **משוב משתמשים**: בקשו משוב ממשתמשים עם מוגבלויות
5. **תחזוקה שוטפת**: נגישות היא תהליך מתמשך, לא חד-פעמי

### משאבים נוספים

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Native Accessibility Docs](https://reactnative.dev/docs/accessibility)
- [Israeli Standard 5568](https://www.sii.org.il/)
- [WebAIM Resources](https://webaim.org/)

---

**תאריך יצירת הדוח**: 2024
**גרסת אפליקציה**: 1.0.0
**סטטוס**: תכנון - לא מיושם עדיין


