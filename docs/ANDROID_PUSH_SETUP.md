# Android Push Setup

The Capacitor Android project and push-registration code are already configured.

1. Create the Android app `com.asitech.geekonsites` in Firebase.
2. Download `google-services.json` and place it at `android/app/google-services.json`.
3. Enable the Firebase Cloud Messaging API for the Firebase project.
4. Create a Firebase service account for the backend.
5. On Render, set `FIREBASE_ENABLED=true` and set `FIREBASE_SERVICE_ACCOUNT_JSON` to the complete service-account JSON value.
6. Build the frontend and sync Android with `npm run android:sync`.
7. Open Android Studio with `npm run android:open`, then run on a physical Android device.

Never commit `google-services.json` or the Firebase service-account JSON.
