# Android Release Signing

## 1. Create a Keystore

Run this from `frontend/android`:

```powershell
keytool -genkeypair -v -keystore release-keystore.jks -alias medalarm -keyalg RSA -keysize 2048 -validity 10000
```

## 2. Add Signing Properties

Copy [keystore.properties.example](/C:/Users/snipe/OneDrive/Documents/GitHub/medalarm/frontend/android/keystore.properties.example)
to `frontend/android/keystore.properties` and fill in the real values.

## 3. Set Version Metadata

```powershell
$env:MEDALARM_ANDROID_VERSION_CODE="1"
$env:MEDALARM_ANDROID_VERSION_NAME="1.0.0"
```

## 4. Use Java 21

Capacitor Android 8 expects a Java 21 toolchain. The simplest path is the JBR bundled with Android Studio:

```powershell
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
```

## 5. Build the Release

```powershell
cd frontend/android
.\gradlew.bat assembleRelease
```

If the Android SDK is not configured, create `frontend/android/local.properties` with:

```properties
sdk.dir=C:\\Users\\YOUR_USER\\AppData\\Local\\Android\\Sdk
```
