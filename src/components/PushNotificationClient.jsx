// components/PushNotificationClient.jsx
"use client";
import { useEffect } from "react";

export default function PushNotificationClient({ userId = null }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const init = async () => {
      try {
        // lazy import firebase helpers (to avoid SSR issues)
        const firebaseHelpers = await import("@/lib/firebase");

        // ensure SW registered (helper will do it too, but registering explicitly gives better logging)
        if ("serviceWorker" in navigator) {
          try {
            const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
            console.log("Service worker registered:", reg);
          } catch (e) {
            console.warn("Service worker register failed (might be already registered):", e);
          }
        }

        const token = await firebaseHelpers.requestPermissionAndSaveToken(userId);
        console.log("FCM token (or null):", token);

        const payload = await firebaseHelpers.onMessageListener();
        if (payload) {
          console.log("Foreground message payload:", payload);
          // TODO: show custom UI/notification in-app
        }
      } catch (err) {
        console.error("Push init error:", err);
      }
    };

    init();
  }, [userId]);

  return null;
}
