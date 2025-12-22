# 📱 רשימת בדיקה לעליית האפליקציה לחנות - App Store Connect

## ✅ מה שכבר מוגדר:
- ✅ Bundle ID: `com.raveialamrami.app`
- ✅ שם האפליקציה: "הרב אייל עמרמי"
- ✅ גרסה: 1.0.0
- ✅ Build Number: 2
- ✅ Icon: קיים
- ✅ Splash Screen: קיים

---

## 📋 רשימת בדיקה מלאה - App Store Connect

### 1️⃣ **App Information** (מידע כללי על האפליקציה)

#### ✅ כבר מוגדר:
- Bundle ID: `com.raveialamrami.app`
- SKU: `EX1763576271519`
- Apple ID: `6755494288`
- Primary Language: `English (U.S.)`
- Category: `Education`

#### ❌ צריך למלא/לבדוק:
- [ ] **Secondary Category** (אופציונלי) - קטגוריה משנית
  - **המלצה:** השאר ריק או בחר "Lifestyle" / "Reference"
  
- [x] **Content Rights** - הגדרת זכויות תוכן
  - [x] ✅ **האם יש לך זכויות על כל התוכן?**
    - כן - כל התוכן שייך לרב אייל עמרמי/למוסדות
  - [ ] ❌ **האם יש שימוש במוזיקה/וידאו של צד שלישי?**
    - לא - כל התוכן מקורי (או יש לך זכויות עליו)
    - **אם יש שימוש ב-YouTube:** סמן שיש שימוש בתוכן של צד שלישי (YouTube) אבל רק לקישורים חיצוניים
  
- [ ] **License Agreement** - הסכם רישיון
  - [x] ✅ **המלצה:** השתמש ב-**Apple's Standard License Agreement**
    - או ערוך אם יש לך תנאי שימוש מיוחדים

---

### 2️⃣ **App Privacy** (פרטיות) - ⚠️ **חשוב מאוד!**

#### ❌ צריך למלא:
- [ ] **Privacy Policy URL** - קישור למדיניות פרטיות
  - צריך להיות נגיש באינטרנט
  - חייב להיות בעברית (או לפחות בעברית + אנגלית)
  - **דוגמה**: `https://yourwebsite.com/privacy-policy` או `https://github.com/yourusername/privacy-policy`
  
- [x] **Data Collection Types** - סוגי נתונים שנאספים:
  - [x] **Contact Info** (מידע אישי)
    - [x] ✅ **Email Address** - כן (הרשמה/התחברות)
    - [ ] ❌ **Phone Number** - לא (לא מופעל כרגע)
    - [x] ✅ **Name** - כן (displayName)
  - [x] **User Content** (תוכן משתמש)
    - [x] ✅ **Photos or Videos** - כן (העלאת תמונות/וידאו במסך DailyInsight ו-AdminScreen)
    - [x] ✅ **Audio Data** - כן (העלאת אודיו במסך DailyInsight)
  - [x] **Identifiers** (מזהים)
    - [x] ✅ **User ID** - כן (Firebase Auth UID)
    - [x] ✅ **Device ID** - כן (אוסף אוטומטית דרך Firebase Analytics)
  - [x] **Usage Data** (נתוני שימוש)
    - [x] ✅ **Product Interaction** - כן (Firebase Analytics - מעקב אחר שימוש באפליקציה)
    - [ ] ❌ **Advertising Data** - לא (אין פרסומות באפליקציה)
  - [x] **Diagnostics** (אבחון)
    - [x] ✅ **Crash Data** - כן (Firebase Crashlytics/Analytics)
    - [x] ✅ **Performance Data** - כן (Firebase Analytics)
  - [ ] ❌ **Location** (מיקום)
    - [ ] לא - האפליקציה לא משתמשת במיקום

- [x] **Data Usage** - שימוש בנתונים:
  - [x] ✅ **למה הנתונים נאספים?**
    - App Functionality (תפעול האפליקציה - התחברות, שמירת העדפות)
    - Analytics (ניתוח שימוש - Firebase Analytics)
    - Developer Communications (תקשורת עם מפתחים - התראות)
    - Product Personalization (התאמה אישית - העדפות שפה)
  - [x] ✅ **האם הנתונים משותפים עם צד שלישי?**
    - כן - **Firebase (Google)**
      - Firebase Authentication (אימות משתמשים)
      - Firebase Analytics (ניתוח שימוש)
      - Firebase Crashlytics (דיווח על קריסות)
      - Firestore Database (אחסון נתונים)
      - Firebase Storage (אחסון קבצים)
  - [ ] ❌ **האם הנתונים נמכרים?**
    - לא - הנתונים לא נמכרים
  - [ ] ❌ **האם הנתונים משמשים לפרסום?**
    - לא - אין פרסומות באפליקציה

#### 📝 **הוראות מפורטות - מה לסמן ב-App Privacy:**

**1. Contact Info → Email Address:**
- ✅ סמן: **Yes**
- **Used to track you?** → ❌ No
- **Linked to you?** → ✅ Yes
- **Used for third-party advertising?** → ❌ No
- **Purpose:** 
  - ✅ App Functionality (התחברות/הרשמה)
  - ✅ Analytics (ניתוח שימוש)
  - ✅ Developer Communications (תקשורת עם מפתחים)

**2. Contact Info → Name:**
- ✅ סמן: **Yes**
- **Used to track you?** → ❌ No
- **Linked to you?** → ✅ Yes
- **Used for third-party advertising?** → ❌ No
- **Purpose:**
  - ✅ App Functionality (הצגת שם משתמש)
  - ✅ Product Personalization (התאמה אישית)

**3. User Content → Photos or Videos:**
- ✅ סמן: **Yes**
- **Used to track you?** → ❌ No
- **Linked to you?** → ✅ Yes (אם משתמש העלה)
- **Used for third-party advertising?** → ❌ No
- **Purpose:**
  - ✅ App Functionality (העלאת תמונות/וידאו במסך DailyInsight)

**4. User Content → Audio Data:**
- ✅ סמן: **Yes**
- **Used to track you?** → ❌ No
- **Linked to you?** → ✅ Yes (אם משתמש העלה)
- **Used for third-party advertising?** → ❌ No
- **Purpose:**
  - ✅ App Functionality (העלאת אודיו במסך DailyInsight)

**5. Identifiers → User ID:**
- ✅ סמן: **Yes**
- **Used to track you?** → ❌ No
- **Linked to you?** → ✅ Yes
- **Used for third-party advertising?** → ❌ No
- **Purpose:**
  - ✅ App Functionality (זיהוי משתמש)
  - ✅ Analytics (ניתוח שימוש)

**6. Identifiers → Device ID:**
- ✅ סמן: **Yes**
- **Used to track you?** → ❌ No
- **Linked to you?** → ✅ Yes
- **Used for third-party advertising?** → ❌ No
- **Purpose:**
  - ✅ Analytics (ניתוח שימוש - Firebase Analytics)

**7. Usage Data → Product Interaction:**
- ✅ סמן: **Yes**
- **Used to track you?** → ❌ No
- **Linked to you?** → ✅ Yes
- **Used for third-party advertising?** → ❌ No
- **Purpose:**
  - ✅ Analytics (ניתוח שימוש - Firebase Analytics)

**8. Diagnostics → Crash Data:**
- ✅ סמן: **Yes**
- **Used to track you?** → ❌ No
- **Linked to you?** → ✅ Yes
- **Used for third-party advertising?** → ❌ No
- **Purpose:**
  - ✅ Analytics (דיווח על קריסות - Firebase Crashlytics)

**9. Diagnostics → Performance Data:**
- ✅ סמן: **Yes**
- **Used to track you?** → ❌ No
- **Linked to you?** → ✅ Yes
- **Used for third-party advertising?** → ❌ No
- **Purpose:**
  - ✅ Analytics (ניתוח ביצועים - Firebase Analytics)

**10. Third-Party Data Collection:**
- ✅ סמן: **Yes**
- **Provider:** Google (Firebase)
- **Data Types:** כל הנתונים שסומנו למעלה
- **Purpose:** 
  - App Functionality (Firebase Authentication, Firestore, Storage)
  - Analytics (Firebase Analytics, Crashlytics)

---

### 3️⃣ **App Review Information** (מידע לבדיקת האפליקציה)

#### ❌ צריך למלא:
- [x] **Contact Information**
  - [x] **First Name:** [הכנס שם פרטי]
  - [x] **Last Name:** [הכנס שם משפחה]
  - [x] **Phone Number:** [הכנס מספר טלפון]
  - [x] **Email Address:** [הכנס אימייל]
  
- [x] **Demo Account** (אם יש התחברות) - ✅ **חובה!**
  - [x] **Username/Email:** [הכנס אימייל לחשבון דמו]
  - [x] **Password:** [הכנס סיסמה לחשבון דמו]
  - [x] **הוראות שימוש בחשבון הדמו:**
    ```
    זהו חשבון דמו לבדיקת האפליקציה.
    ניתן להתחבר עם האימייל והסיסמה שסופקו.
    החשבון מאפשר גישה לכל התכונות של האפליקציה.
    ```
  
- [x] **Notes** (הערות לבדיקה)
  - [x] **הסבר על תכונות מיוחדות:**
    ```
    האפליקציה מציגה תוכן דתי-חינוכי של הרב אייל עמרמי.
    תכונות עיקריות:
    - זריקת אמונה יומית (תוכן שמתעדכן מדי יום)
    - ספרייה של שיעורים וקורסים
    - חדשות ומידע על מוסדות הרב
    - אפשרות להעלות תמונות/וידאו/אודיו (למשתמשי Admin בלבד)
    ```
  - [x] **הוראות לבדיקה:**
    ```
    1. התחבר עם חשבון הדמו
    2. עיין בתוכן השיעורים והקורסים
    3. בדוק את מסך "זריקת אמונה" - תוכן יומי
    4. בדוק ניווט בין המסכים השונים
    5. בדוק את תכונות השיתוף
    ```
  - [x] **הסבר על תכונות שדורשות הרשאות מיוחדות:**
    ```
    - גישה לספריית תמונות/וידאו: רק למשתמשי Admin (להעלאת תוכן)
    - התראות: משתמשים יכולים להפעיל/לכבות התראות בהגדרות
    - אין שימוש במיקום או בקמרה ישירה
    ```

- [ ] **Attachments** (קבצים מצורפים)
  - [ ] סרטון הדגמה (אופציונלי)
  - [ ] מסמכים נוספים (אם נדרש)

---

### 4️⃣ **Pricing and Availability** (מחיר וזמינות)

#### ❌ צריך למלא:
- [x] **Price** - מחיר האפליקציה
  - [x] ✅ **Free (חינם)** - האפליקציה חינמית
  
- [x] **Availability** - זמינות
  - [x] ✅ **באילו מדינות האפליקציה תהיה זמינה?**
    - **המלצה:** בחר "All Countries" (כל המדינות) או לפחות:
      - ישראל
      - ארצות הברית
      - קנדה
      - בריטניה
      - אוסטרליה
  - [x] ✅ **האם יש הגבלות גיל?**
    - **המלצה:** 4+ (כל הגילאים) - תוכן חינוכי-דתי
    - או 12+ אם יש תוכן מורכב יותר
  
- [ ] **Pre-Order** (אם רלוונטי)
  - [ ] תאריך השקה

---

### 5️⃣ **App Store** (חנות האפליקציות)

#### ❌ צריך למלא:

##### **App Preview and Screenshots** (תצוגה מקדימה וצילומי מסך)
- [ ] **iPhone 6.7" Display** (iPhone 14 Pro Max, iPhone 13 Pro Max)
  - [ ] לפחות 3 צילומי מסך (עד 10)
  - [ ] App Preview Video (אופציונלי, עד 30 שניות)
  
- [ ] **iPhone 6.5" Display** (iPhone 11 Pro Max, iPhone XS Max)
  - [ ] לפחות 3 צילומי מסך (עד 10)
  
- [ ] **iPhone 5.5" Display** (iPhone 8 Plus)
  - [ ] לפחות 3 צילומי מסך (עד 10)
  
- [ ] **iPad Pro (12.9-inch)** (אם supportsTablet = true)
  - [ ] לפחות 3 צילומי מסך (עד 10)
  
- [ ] **iPad Pro (11-inch)** (אם supportsTablet = true)
  - [ ] לפחות 3 צילומי מסך (עד 10)

##### **App Description** (תיאור האפליקציה)
- [ ] **Name** - שם האפליקציה (עד 30 תווים)
  - ✅ "הרב אייל עמרמי"
  
- [x] **Subtitle** - כותרת משנה (עד 30 תווים)
  - [x] ✅ **המלצה:** "שיעורים, ספרים וזריקת אמונה יומית"
  - או: "תוכן דתי-חינוכי יומי"
  
- [x] **Description** - תיאור מלא (עד 4000 תווים)
  - [x] ✅ **תיאור מומלץ:**
    ```
    אפליקציית הרב אייל עמרמי - מקור מרכזי לתוכן דתי-חינוכי יומי
    
    האפליקציה מציעה:
    • זריקת אמונה יומית - תוכן מעורר השראה שמתעדכן מדי יום
    • ספרייה עשירה של שיעורים וקורסים
    • חדשות ועדכונים ממוסדות הרב
    • גישה לספרים ופרסומים
    • סרטונים קצרים (רילסים) יומיים
    • פודקאסטים ושיעורי אודיו
    
    תכונות:
    - ממשק נוח ונוח לשימוש
    - תוכן מעודכן מדי יום
    - אפשרות לשתף תוכן עם חברים
    - התראות על תוכן חדש
    - תמיכה בעברית ואנגלית
    
    האפליקציה מתאימה לכל מי שמחפש תוכן דתי-חינוכי איכותי ומעורר השראה.
    ```
  
- [x] **Keywords** - מילות מפתח (עד 100 תווים, מופרדות בפסיקים)
  - [x] ✅ **המלצה:** "רב,יהדות,שיעורים,אמונה,ספרים,תורה,דת,חינוך,רוחניות,תפילה"
  - או באנגלית: "rabbi,judaism,lessons,faith,books,torah,religion,education,spirituality"
  
- [x] **Promotional Text** - טקסט פרסומי (עד 170 תווים, ניתן לעדכן ללא גרסה חדשה)
  - [x] ✅ **המלצה:** "תוכן דתי-חינוכי מעורר השראה שמתעדכן מדי יום. שיעורים, ספרים וזריקת אמונה יומית."
  
- [x] **Support URL** - קישור לתמיכה - ⚠️ **חובה!**
  - [x] **URL לאתר תמיכה או דף עזרה**
    - **דוגמה:** `https://yourwebsite.com/support`
    - או: `https://github.com/yourusername/support`
    - **חובה:** צריך להיות נגיש!
  
- [ ] **Marketing URL** - קישור שיווקי (אופציונלי)
  - [ ] URL לאתר או דף שיווקי
  - **אופציונלי** - לא חובה

##### **App Review Information** (מידע לבדיקה)
- [x] **Version Information**
  - [x] **מה חדש בגרסה זו? (What's New in This Version)**
    - [x] ✅ **תיאור מומלץ לגרסה 1.0.0:**
      ```
      גרסה ראשונה של האפליקציה!
      
      תכונות עיקריות:
      • זריקת אמונה יומית - תוכן מעורר השראה שמתעדכן מדי יום
      • ספרייה עשירה של שיעורים וקורסים
      • חדשות ועדכונים ממוסדות הרב
      • גישה לספרים ופרסומים
      • סרטונים קצרים יומיים
      • ממשק נוח ונוח לשימוש
      • תמיכה בעברית ואנגלית
      
      האפליקציה מתאימה לכל מי שמחפש תוכן דתי-חינוכי איכותי.
      ```

##### **App Icon** (אייקון)
- [ ] **1024x1024 pixels** - אייקון בגודל מלא
  - ✅ קיים ב-`./assets/icon.png` (צריך לוודא שהוא 1024x1024)

##### **Age Rating** (דירוג גיל)
- [x] **Age Rating** - דירוג גיל
  - [x] ✅ **צריך למלא שאלון על תוכן האפליקציה:**
    - **Violence:** None (אין אלימות)
    - **Sexual Content:** None (אין תוכן מיני)
    - **Profanity:** None (אין קללות)
    - **Alcohol/Drugs:** None (אין אלכוהול/סמים)
    - **Gambling:** None (אין הימורים)
    - **Horror:** None (אין תוכן מפחיד)
    - **Mature/Suggestive Themes:** None (אין תוכן בוגר)
    - **Contests:** None (אין תחרויות)
    - **Unrestricted Web Access:** None (אין גישה לא מוגבלת לאינטרנט)
    - **Gambling/Contests:** None (אין הימורים/תחרויות)
  - [x] ✅ **תוצאה צפויה:** **4+** (כל הגילאים) - תוכן חינוכי-דתי

---

### 6️⃣ **Build** (בניית האפליקציה)

#### ❌ צריך לעשות:
- [ ] **Build Production Version**
  ```bash
  eas build --platform ios --profile production
  ```
  
- [ ] **Upload Build to App Store Connect**
  - [ ] Build יועלה אוטומטית דרך EAS
  - [ ] או להעלות ידנית דרך Xcode/Transporter
  
- [ ] **Select Build for Review**
  - [ ] ב-App Store Connect → Versions → Select Build

---

### 7️⃣ **Version Information** (מידע על הגרסה)

#### ❌ צריך למלא:
- [ ] **Version Number** - מספר גרסה
  - ✅ 1.0.0
  
- [ ] **Build Number** - מספר בנייה
  - ✅ 2
  
- [ ] **What's New in This Version** - מה חדש בגרסה זו
  - [ ] תיאור של התכונות החדשות
  - [ ] תיקונים שבוצעו
  - [ ] שיפורים

---

### 8️⃣ **App Store Review** (בדיקת החנות)

#### ❌ צריך לבדוק לפני שליחה:
- [ ] **Guidelines Compliance** - עמידה בהנחיות
  - [ ] האפליקציה עומדת ב-Apple App Store Review Guidelines
  - [ ] אין תוכן אסור
  - [ ] אין הפרת זכויות יוצרים
  
- [ ] **Technical Requirements** - דרישות טכניות
  - [ ] האפליקציה עובדת על iOS 13.0 ומעלה
  - [ ] אין קריסות
  - [ ] כל התכונות עובדות
  
- [ ] **Submit for Review** - שליחה לבדיקה
  - [ ] לבדוק שכל השדות מולאו
  - [ ] לשלוח לבדיקה

---

## 📝 מסמכים שצריך להכין:

### 1. **Privacy Policy** (מדיניות פרטיות)
- [ ] מסמך מדיניות פרטיות בעברית
- [ ] להעלות לאתר (או GitHub Pages)
- [ ] להוסיף קישור ב-App Privacy

### 2. **Terms of Service** (תנאי שימוש) - אופציונלי
- [ ] תנאי שימוש (אם רלוונטי)
- [ ] להעלות לאתר

### 3. **Support Page** (דף תמיכה)
- [ ] דף תמיכה/עזרה
- [ ] FAQ (שאלות נפוצות)
- [ ] איך ליצור קשר

---

## 🎨 קבצים שצריך להכין:

### 1. **Screenshots** (צילומי מסך)
- [ ] iPhone 6.7" (1290 x 2796 pixels) - לפחות 3
- [ ] iPhone 6.5" (1242 x 2688 pixels) - לפחות 3
- [ ] iPhone 5.5" (1242 x 2208 pixels) - לפחות 3
- [ ] iPad Pro 12.9" (2048 x 2732 pixels) - אם supportsTablet
- [ ] iPad Pro 11" (1668 x 2388 pixels) - אם supportsTablet

### 2. **App Preview Video** (אופציונלי)
- [ ] סרטון הדגמה (עד 30 שניות)
- [ ] פורמט: MP4, MOV, או M4V
- [ ] ללא קול או עם קול

### 3. **App Icon**
- [ ] 1024 x 1024 pixels
- [ ] PNG format
- [ ] ללא transparency
- [ ] ללא rounded corners (Apple יוסיף)

---

## ⚠️ דברים חשובים לזכור:

1. **Privacy Policy** - **חובה!** לא ניתן לשלוח בלי זה
2. **Screenshots** - **חובה!** לפחות 3 לכל גודל מסך
3. **App Description** - **חובה!** תיאור מפורט
4. **Support URL** - **חובה!** קישור לתמיכה
5. **Build** - **חובה!** צריך build production לפני שליחה

---

## 📞 קישורים שימושיים:

- **App Store Connect**: https://appstoreconnect.apple.com
- **App Store Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Human Interface Guidelines**: https://developer.apple.com/design/human-interface-guidelines/

---

## ✅ סדר פעולות מומלץ:

1. ✅ בנה את האפליקציה ל-production
2. ✅ העלה את ה-Build ל-App Store Connect
3. ✅ מלא את כל המידע ב-App Information
4. ✅ הגדר את App Privacy (חשוב מאוד!)
5. ✅ הוסף צילומי מסך
6. ✅ כתוב תיאור מפורט
7. ✅ הוסף Privacy Policy URL
8. ✅ בדוק שהכל מולא
9. ✅ שלח לבדיקה

---

**הערה**: רשימה זו כוללת את כל הדברים הנדרשים. חלק מהם אופציונליים, אבל רוב הדברים הם חובה לפרסום בחנות.

---

## 📊 סיכום - תשובות מהירות לכל השאלות

### 🔐 App Privacy - תשובות מהירות

| סוג נתון | האם נאסף? | Linked to You? | Used for Tracking? | Third-Party Advertising? | Purpose |
|---------|-----------|----------------|-------------------|-------------------------|---------|
| **Email Address** | ✅ כן | ✅ Yes | ❌ No | ❌ No | App Functionality, Analytics, Developer Communications |
| **Name** | ✅ כן | ✅ Yes | ❌ No | ❌ No | App Functionality, Product Personalization |
| **Photos or Videos** | ✅ כן | ✅ Yes | ❌ No | ❌ No | App Functionality |
| **Audio Data** | ✅ כן | ✅ Yes | ❌ No | ❌ No | App Functionality |
| **User ID** | ✅ כן | ✅ Yes | ❌ No | ❌ No | App Functionality, Analytics |
| **Device ID** | ✅ כן | ✅ Yes | ❌ No | ❌ No | Analytics |
| **Product Interaction** | ✅ כן | ✅ Yes | ❌ No | ❌ No | Analytics |
| **Crash Data** | ✅ כן | ✅ Yes | ❌ No | ❌ No | Analytics |
| **Performance Data** | ✅ כן | ✅ Yes | ❌ No | ❌ No | Analytics |
| **Phone Number** | ❌ לא | - | - | - | - |
| **Location** | ❌ לא | - | - | - | - |
| **Advertising Data** | ❌ לא | - | - | - | - |

### 🔗 Third-Party Data Collection

**Provider:** Google (Firebase)
- ✅ **Data Collected:** כל הנתונים שסומנו למעלה
- ✅ **Purpose:** App Functionality, Analytics
- ❌ **Used for Advertising:** No
- ❌ **Data Sold:** No

### 📝 תוכן מומלץ למילוי

**Subtitle:** "שיעורים, ספרים וזריקת אמונה יומית"

**Keywords:** "רב,יהדות,שיעורים,אמונה,ספרים,תורה,דת,חינוך,רוחניות"

**Price:** Free (חינם)

**Age Rating:** 4+ (כל הגילאים)

**Availability:** כל המדינות (או לפחות: ישראל, ארה"ב, קנדה, בריטניה, אוסטרליה)

---

## ⚠️ דברים קריטיים - לא לשכוח!

1. ✅ **Privacy Policy URL** - **חובה!** לא ניתן לשלוח בלי זה
2. ✅ **Support URL** - **חובה!** לא ניתן לשלוח בלי זה
3. ✅ **Demo Account** - **חובה!** אם יש התחברות
4. ✅ **Screenshots** - **חובה!** לפחות 3 לכל גודל מסך
5. ✅ **App Description** - **חובה!** תיאור מפורט
6. ✅ **App Privacy** - **חובה!** למלא את כל הפרטים
7. ✅ **Build Production** - **חובה!** צריך build לפני שליחה

