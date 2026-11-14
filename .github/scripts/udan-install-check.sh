#!/usr/bin/env bash
# Installs the Udan Coaching APK on the CI emulator, launches it and
# reports whether it is running. Used by .github/workflows/udan-android.yml.
set -u
APK="$1"
PKG=com.udancoaching.app
BT=$(ls -d "$ANDROID_HOME"/build-tools/* | sort -V | tail -1)

echo "== Signature (apksigner from $BT)"
"$BT/apksigner" verify --verbose --print-certs "$APK" | grep -E "Verifies|Verified using|Signer #1 certificate (DN|SHA-256)|WARNING|ERROR" || true

echo "== Install"
adb install -r "$APK" 2>&1 | tee /tmp/install.txt
if ! grep -q "^Success" /tmp/install.txt; then
  echo "INSTALL FAILED"
  exit 1
fi

echo "== Launch"
adb logcat -c
adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1
sleep 20
PID=$(adb shell pidof "$PKG" | tr -d '\r')
adb shell dumpsys activity activities | grep -m2 -E "topResumedActivity|mResumedActivity" || true
adb exec-out screencap -p > udan-screen.png || true

echo "== Crashes / Flutter errors"
adb logcat -d -v brief AndroidRuntime:E flutter:E '*:F' | grep -v "^---------" | tail -40 || true

if [ -z "$PID" ]; then
  echo "APP NOT RUNNING after launch"
  exit 1
fi
echo "APP RUNNING (pid $PID)"
