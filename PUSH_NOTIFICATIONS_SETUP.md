# Push Notifications — Pending Keys & Files

Everything listed here is **waiting on the keys keys** or Apple Developer account.
Once received, add each item in the location specified.

---

## 1. Expo Project ID

**What:** A UUID that identifies the app on Expo's servers. Required for push tokens to work in production builds.

**Where to get it:** expo.dev → log in → open Coverline project → Overview tab → copy "Project ID"

**Where to add it — 2 places:**

`apps/mobile/app.json`
```json
"extra": {
  "eas": {
    "projectId": "REPLACE_WITH_EXPO_PROJECT_ID"
  }
}
```

`apps/mobile/src/services/pushNotificationService.ts` — line 24
```ts
const EXPO_PROJECT_ID = 'REPLACE_WITH_EXPO_PROJECT_ID';
```

---

## 2. `google-services.json` — Android FCM

**What:** Firebase config file that lets the Android app receive FCM push notifications.

**Where to get it:**
1. [console.firebase.google.com](https://console.firebase.google.com) → open Coverline project
2. Project Settings → General → Your apps → Android app (`com.coverline.mobile`)
3. Click **Download google-services.json**

**Where to place it:**
```
apps/mobile/google-services.json
```

---

## 3. `GoogleService-Info.plist` — iOS APNs

**What:** Firebase config file for the iOS app.

**Where to get it:**
1. Same Firebase project as above
2. Project Settings → General → Your apps → iOS app (`com.coverline.mobile`)
3. Click **Download GoogleService-Info.plist**

**Where to place it:**
```
apps/mobile/GoogleService-Info.plist
```

---

## 4. APNs Auth Key (.p8) — iOS Push

**What:** Apple Push Notifications auth key. Must be uploaded to Firebase so it can deliver push to iOS devices.

**Where to get it:**
1. [developer.apple.com](https://developer.apple.com) → Certificates, IDs & Profiles → Keys
2. Create a new key → enable **Apple Push Notifications service (APNs)** → Download `.p8` file

**Where to upload it:**
- Firebase Console → Project Settings → Cloud Messaging → Apple app configuration → **Upload APNs Auth Key**
- You'll also need the **Key ID** and **Team ID** from the Apple Developer account

---

## 5. Expo Access Token (optional — production only)

**What:** Raises the rate limit on the Expo Push API. Not needed for development or small-scale production.

**Where to get it:** expo.dev → Account Settings → Access Tokens → Create

**Where to add it:** `backend/.env`
```env
EXPO_ACCESS_TOKEN=your_token_here
```
