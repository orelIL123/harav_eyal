# מדריך יישום נגישות בקוד - דוגמאות מעשיות

## תוכן עניינים
1. [קומפוננטות נגישות מותאמות אישית](#קומפוננטות-נגישות-מותאמות-אישית)
2. [דוגמאות יישום למסכים קיימים](#דוגמאות-יישום-למסכים-קיימים)
3. [הוקים מותאמים אישית](#הוקים-מותאמים-אישית)
4. [עזרי נגישות](#עזרי-נגישות)

---

## קומפוננטות נגישות מותאמות אישית

### 1. AccessibleButton - כפתור נגיש מותאם אישית

**מיקום מוצע**: `native/src/components/AccessibleButton.jsx`

```jsx
import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';

/**
 * כפתור נגיש מותאם אישית
 * 
 * @param {string} label - תווית הנגישות (חובה)
 * @param {string} hint - רמז נוסף למשתמש (אופציונלי)
 * @param {boolean} disabled - האם הכפתור מושבת
 * @param {boolean} loading - האם הכפתור בטעינה
 * @param {string} variant - סוג הכפתור: 'primary' | 'secondary' | 'danger'
 * @param {function} onPress - פונקציה להפעלה
 * @param {React.ReactNode} children - תוכן הכפתור
 */
const AccessibleButton = ({
  label,
  hint,
  disabled = false,
  loading = false,
  variant = 'primary',
  onPress,
  children,
  style,
  textStyle,
  ...props
}) => {
  const { t } = useTranslation();

  const getAccessibilityLabel = () => {
    if (loading) {
      return `${label || t('accessibility.loading')} - ${t('accessibility.loading')}`;
    }
    return label || t('accessibility.button');
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityHint={hint}
      accessibilityState={{ 
        disabled: disabled || loading,
        busy: loading 
      }}
      style={[
        styles.button,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'danger' && styles.danger,
        (disabled || loading) && styles.disabled,
        style
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        children || <Text style={[styles.text, textStyle]}>{label}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // גובה מינימלי לנגישות
  },
  primary: {
    backgroundColor: '#DC2626',
  },
  secondary: {
    backgroundColor: '#f5f5f5',
  },
  danger: {
    backgroundColor: '#ef4444',
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

### 2. AccessibleImage - תמונה נגישה

**מיקום מוצע**: `native/src/components/AccessibleImage.jsx`

```jsx
import React from 'react';
import { Image, StyleSheet } from 'react-native';

/**
 * תמונה נגישה
 * 
 * @param {string} accessibilityLabel - תיאור התמונה (חובה לתמונות עם תוכן)
 * @param {boolean} decorative - האם התמונה דקורטיבית (אם כן, לא צריך label)
 * @param {object} source - מקור התמונה
 */
const AccessibleImage = ({
  accessibilityLabel,
  decorative = false,
  source,
  style,
  ...props
}) => {
  if (decorative) {
    return (
      <Image
        source={source}
        style={style}
        accessibilityElementsHidden={true}
        importantForAccessibility="no"
        {...props}
      />
    );
  }

  return (
    <Image
      source={source}
      style={style}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      {...props}
    />
  );
};

export default AccessibleImage;
```

### 3. AccessibleTextInput - שדה קלט נגיש

**מיקום מוצע**: `native/src/components/AccessibleTextInput.jsx`

```jsx
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

/**
 * שדה קלט נגיש
 * 
 * @param {string} label - תווית השדה (חובה)
 * @param {string} hint - רמז נוסף למשתמש
 * @param {string} error - הודעת שגיאה
 * @param {boolean} required - האם השדה חובה
 */
const AccessibleTextInput = ({
  label,
  hint,
  error,
  required = false,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  style,
  ...props
}) => {
  const labelText = required ? `${label} *` : label;

  return (
    <View style={styles.container} accessibilityRole="none">
      <Text
        style={styles.label}
        accessibilityRole="text"
      >
        {labelText}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        accessibilityLabel={labelText}
        accessibilityHint={hint}
        accessibilityState={{ invalid: !!error }}
        style={[
          styles.input,
          error && styles.inputError,
          style
        ]}
        {...props}
      />
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
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 44, // גובה מינימלי לנגישות
  },
  inputError: {
    borderColor: '#ef4444',
  },
  error: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
});

export default AccessibleTextInput;
```

### 4. AccessibleCard - כרטיס נגיש

**מיקום מוצע**: `native/src/components/AccessibleCard.jsx`

```jsx
import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';

/**
 * כרטיס נגיש
 * 
 * @param {string} title - כותרת הכרטיס
 * @param {string} description - תיאור הכרטיס
 * @param {function} onPress - פונקציה להפעלה
 * @param {React.ReactNode} children - תוכן הכרטיס
 */
const AccessibleCard = ({
  title,
  description,
  onPress,
  children,
  style,
  ...props
}) => {
  const accessibilityLabel = description 
    ? `${title}. ${description}` 
    : title;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="לחץ כדי לפתוח"
        style={[styles.card, styles.pressable, style]}
        {...props}
      >
        {children || (
          <View>
            <Text style={styles.title}>{title}</Text>
            {description && (
              <Text style={styles.description}>{description}</Text>
            )}
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <View
      accessibilityRole="none"
      style={[styles.card, style]}
      {...props}
    >
      {children || (
        <View>
          <Text style={styles.title}>{title}</Text>
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pressable: {
    minHeight: 44, // גובה מינימלי לנגישות
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666666',
  },
});

export default AccessibleCard;
```

---

## דוגמאות יישום למסכים קיימים

### 1. HomeScreen - שיפורים נגישות

**קובץ**: `native/src/HomeScreen.jsx`

#### לפני (לא נגיש):
```jsx
<Pressable onPress={() => navigation.navigate('DailyInsight')}>
  <Image source={require('../assets/photos/זריקת אמונה.png')} />
  <Text>{t('home.faithBoost')}</Text>
</Pressable>
```

#### אחרי (נגיש):
```jsx
<Pressable
  onPress={() => navigation.navigate('DailyInsight')}
  accessibilityRole="button"
  accessibilityLabel={`${t('home.faithBoost')} - ${t('home.faithBoostDesc')}`}
  accessibilityHint="לחץ כדי לפתוח את זריקת האמונה היומית"
>
  <Image
    source={require('../assets/photos/זריקת אמונה.png')}
    accessibilityElementsHidden={true}
    importantForAccessibility="no"
  />
  <Text>{t('home.faithBoost')}</Text>
</Pressable>
```

### 2. RegisterScreen - טופס נגיש

**קובץ**: `native/src/screens/RegisterScreen.jsx`

#### שימוש ב-AccessibleTextInput:
```jsx
import AccessibleTextInput from '../components/AccessibleTextInput';
import AccessibleButton from '../components/AccessibleButton';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  return (
    <ScrollView
      accessibilityLabel="טופס הרשמה"
      accessibilityRole="form"
      contentContainerStyle={styles.container}
    >
      <View accessibilityRole="header" accessibilityLevel={1}>
        <Text style={styles.title}>הרשמה</Text>
      </View>

      <AccessibleTextInput
        label={t('register.email')}
        hint={t('register.emailHint')}
        value={email}
        onChangeText={setEmail}
        placeholder={t('register.emailPlaceholder')}
        keyboardType="email-address"
        autoCapitalize="none"
        error={emailError}
        required
      />

      <AccessibleTextInput
        label={t('register.password')}
        hint={t('register.passwordHint')}
        value={password}
        onChangeText={setPassword}
        placeholder={t('register.passwordPlaceholder')}
        secureTextEntry
        error={passwordError}
        required
      />

      <AccessibleButton
        label={t('register.submit')}
        hint={t('register.submitHint')}
        onPress={handleRegister}
        variant="primary"
      />
    </ScrollView>
  );
};
```

### 3. NewsScreen - רשימה נגישה

**קובץ**: `native/src/screens/NewsScreen.jsx`

#### שיפור FlatList:
```jsx
<FlatList
  data={news}
  renderItem={({ item, index }) => (
    <Pressable
      onPress={() => navigation.navigate('NewsDetail', { news: item })}
      accessibilityRole="button"
      accessibilityLabel={`${t('news.article')} ${item.title}, ${t('news.articleNumber', { number: index + 1, total: news.length })}`}
      accessibilityHint={t('news.articleHint')}
    >
      <View style={styles.newsCard}>
        {item.image && (
          <Image
            source={{ uri: item.image }}
            style={styles.newsImage}
            accessibilityLabel={item.imageAlt || t('news.articleImage', { title: item.title })}
            accessibilityRole="image"
          />
        )}
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsDate}>{item.date}</Text>
      </View>
    </Pressable>
  )}
  accessibilityLabel={t('news.list')}
  accessibilityRole="list"
  ListEmptyComponent={
    <View accessibilityRole="text">
      <Text>{t('news.empty')}</Text>
    </View>
  }
/>
```

### 4. DailyInsightScreen - תוכן נגיש

**קובץ**: `native/src/screens/DailyInsightScreen.jsx`

#### שיפור תוכן עם כותרות:
```jsx
<ScrollView
  accessibilityLabel={t('dailyInsight.title')}
  contentContainerStyle={styles.container}
>
  <View accessibilityRole="header" accessibilityLevel={1}>
    <Text style={styles.title}>{t('dailyInsight.title')}</Text>
  </View>

  {quote && (
    <View style={styles.quoteContainer}>
      <View accessibilityRole="header" accessibilityLevel={2}>
        <Text style={styles.quoteTitle}>{t('dailyInsight.quote')}</Text>
      </View>
      <Text
        accessibilityRole="text"
        style={styles.quoteText}
      >
        {quote.text}
      </Text>
      <Pressable
        onPress={handleShare}
        accessibilityRole="button"
        accessibilityLabel={t('dailyInsight.share')}
        accessibilityHint={t('dailyInsight.shareHint')}
      >
        <Ionicons name="share" size={24} />
      </Pressable>
    </View>
  )}
</ScrollView>
```

---

## הוקים מותאמים אישית

### 1. useAccessibility Hook

**מיקום מוצע**: `native/src/utils/useAccessibility.js`

```jsx
import { useState, useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * הוק לניהול נגישות
 * 
 * @returns {object} מצב נגישות ופונקציות עזר
 */
export const useAccessibility = () => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);
  const [isBoldTextEnabled, setIsBoldTextEnabled] = useState(false);
  const [isReduceTransparencyEnabled, setIsReduceTransparencyEnabled] = useState(false);

  useEffect(() => {
    // בדיקה ראשונית
    const checkAccessibility = async () => {
      try {
        const [
          screenReader,
          reduceMotion,
          boldText,
          reduceTransparency
        ] = await Promise.all([
          AccessibilityInfo.isScreenReaderEnabled(),
          AccessibilityInfo.isReduceMotionEnabled(),
          AccessibilityInfo.isBoldTextEnabled(),
          AccessibilityInfo.isReduceTransparencyEnabled()
        ]);

        setIsScreenReaderEnabled(screenReader);
        setIsReduceMotionEnabled(reduceMotion);
        setIsBoldTextEnabled(boldText);
        setIsReduceTransparencyEnabled(reduceTransparency);
      } catch (error) {
        console.error('Error checking accessibility:', error);
      }
    };

    checkAccessibility();

    // האזנה לשינויים
    const subscriptions = [
      AccessibilityInfo.addEventListener('screenReaderChanged', setIsScreenReaderEnabled),
      AccessibilityInfo.addEventListener('reduceMotionChanged', setIsReduceMotionEnabled),
      AccessibilityInfo.addEventListener('boldTextChanged', setIsBoldTextEnabled),
      AccessibilityInfo.addEventListener('reduceTransparencyChanged', setIsReduceTransparencyEnabled),
    ];

    return () => {
      subscriptions.forEach(sub => sub?.remove());
    };
  }, []);

  return {
    isScreenReaderEnabled,
    isReduceMotionEnabled,
    isBoldTextEnabled,
    isReduceTransparencyEnabled,
  };
};
```

### 2. useAnimatedAccessibility Hook

**מיקום מוצע**: `native/src/utils/useAnimatedAccessibility.js`

```jsx
import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { useAccessibility } from './useAccessibility';

/**
 * הוק לאנימציות נגישות
 * מכובד הפחתת תנועה
 */
export const useAnimatedAccessibility = (config = {}) => {
  const { isReduceMotionEnabled } = useAccessibility();
  const {
    initialValue = 0,
    toValue = 1,
    duration = 300,
    delay = 0,
  } = config;

  const animValue = useRef(new Animated.Value(initialValue)).current;

  useEffect(() => {
    if (isReduceMotionEnabled) {
      // אם המשתמש ביקש להפחית תנועה, דלג על אנימציה
      animValue.setValue(toValue);
      return;
    }

    const animation = Animated.timing(animValue, {
      toValue,
      duration,
      delay,
      useNativeDriver: true,
    });

    animation.start();

    return () => animation.stop();
  }, [isReduceMotionEnabled, toValue, duration, delay]);

  return animValue;
};
```

---

## עזרי נגישות

### 1. Accessibility Utils

**מיקום מוצע**: `native/src/utils/accessibility.js`

```jsx
import { useTranslation } from 'react-i18next';

/**
 * יצירת תווית נגישות לפריט ברשימה
 * 
 * @param {string} itemTitle - כותרת הפריט
 * @param {number} index - מיקום הפריט (0-based)
 * @param {number} total - סך הכל פריטים
 * @returns {string} תווית נגישות
 */
export const getListItemLabel = (itemTitle, index, total) => {
  const { t } = useTranslation();
  return t('accessibility.listItem', {
    title: itemTitle,
    position: index + 1,
    total: total
  });
};

/**
 * יצירת תווית נגישות לכפתור עם אייקון
 * 
 * @param {string} action - פעולה (למשל: "שיתוף", "מחק")
 * @param {string} context - הקשר (למשל: "התוכן", "השיעור")
 * @returns {string} תווית נגישות
 */
export const getIconButtonLabel = (action, context = '') => {
  const { t } = useTranslation();
  if (context) {
    return t('accessibility.iconButtonWithContext', {
      action,
      context
    });
  }
  return t('accessibility.iconButton', { action });
};

/**
 * יצירת רמז נגישות לכפתור
 * 
 * @param {string} action - פעולה
 * @param {string} result - תוצאה צפויה
 * @returns {string} רמז נגישות
 */
export const getButtonHint = (action, result) => {
  const { t } = useTranslation();
  return t('accessibility.buttonHint', {
    action,
    result
  });
};
```

### 2. הוספת מפתחות נגישות ל-i18n

**קובץ**: `native/src/locales/he.json`

```json
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
    "link": "קישור",
    "listItem": "{{title}}, פריט {{position}} מתוך {{total}}",
    "iconButton": "{{action}}",
    "iconButtonWithContext": "{{action}} {{context}}",
    "buttonHint": "לחץ כדי {{action}}. {{result}}",
    "articleImage": "תמונה עבור {{title}}",
    "articleNumber": "מאמר {{number}} מתוך {{total}}"
  }
}
```

**קובץ**: `native/src/locales/en.json`

```json
{
  "accessibility": {
    "back": "Go back to previous screen",
    "close": "Close",
    "share": "Share",
    "delete": "Delete",
    "edit": "Edit",
    "save": "Save",
    "cancel": "Cancel",
    "submit": "Submit",
    "loading": "Loading...",
    "error": "Error",
    "image": "Image",
    "video": "Video",
    "audio": "Audio",
    "button": "Button",
    "link": "Link",
    "listItem": "{{title}}, item {{position}} of {{total}}",
    "iconButton": "{{action}}",
    "iconButtonWithContext": "{{action}} {{context}}",
    "buttonHint": "Press to {{action}}. {{result}}",
    "articleImage": "Image for {{title}}",
    "articleNumber": "Article {{number}} of {{total}}"
  }
}
```

---

## דוגמאות שימוש בקומפוננטות

### שימוש ב-AccessibleButton

```jsx
import AccessibleButton from '../components/AccessibleButton';

// כפתור ראשי
<AccessibleButton
  label={t('home.share')}
  hint={t('home.shareHint')}
  onPress={handleShare}
  variant="primary"
/>

// כפתור משני
<AccessibleButton
  label={t('profile.cancel')}
  onPress={handleCancel}
  variant="secondary"
/>

// כפתור מסוכן (מחיקה)
<AccessibleButton
  label={t('profile.delete')}
  hint={t('profile.deleteHint')}
  onPress={handleDelete}
  variant="danger"
/>

// כפתור בטעינה
<AccessibleButton
  label={t('register.submit')}
  onPress={handleSubmit}
  loading={isSubmitting}
/>
```

### שימוש ב-AccessibleImage

```jsx
import AccessibleImage from '../components/AccessibleImage';

// תמונה עם תוכן
<AccessibleImage
  source={require('../assets/photos/book.jpg')}
  accessibilityLabel="כריכת הספר 'זריקת אמונה' מאת הרב אייל עמרמי"
/>

// תמונה דקורטיבית
<AccessibleImage
  source={require('../assets/decoration.png')}
  decorative={true}
/>
```

### שימוש ב-AccessibleTextInput

```jsx
import AccessibleTextInput from '../components/AccessibleTextInput';

<AccessibleTextInput
  label={t('register.email')}
  hint={t('register.emailHint')}
  value={email}
  onChangeText={setEmail}
  placeholder={t('register.emailPlaceholder')}
  keyboardType="email-address"
  autoCapitalize="none"
  error={emailError}
  required
/>
```

---

## הערות חשובות

1. **תמיד בדקו עם קורא מסך**: כל שינוי נגישות צריך להיבדק עם TalkBack (Android) או VoiceOver (iOS)

2. **תוויות ברורות**: תוויות נגישות צריכות להיות ברורות ועצמאיות מהקשר

3. **רמזים מועילים**: הוסיפו רמזים רק כשהם מועילים, לא לכל כפתור

4. **מצבים**: עדכנו `accessibilityState` כשהמצב משתנה (disabled, selected, checked)

5. **עדכונים דינמיים**: השתמשו ב-`accessibilityLiveRegion` להודעות שגיאה ועדכונים חשובים

6. **גובה מינימלי**: כפתורים ואלמנטים אינטראקטיביים צריכים להיות לפחות 44x44 פיקסלים

7. **ניגודיות**: ודאו ניגודיות מספקת בין טקסט לרקע (4.5:1 לטקסט רגיל)

---

**תאריך יצירה**: 2024
**סטטוס**: דוגמאות קוד - לא מיושם עדיין


