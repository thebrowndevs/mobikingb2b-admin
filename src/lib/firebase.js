// lib/firebase.js
"use client";

import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  // apiKey: "AIzaSyC2cD8s816pK1xC_zSI4eGG_Yjro8X_Gm4",
  // authDomain: "mobiking-25fc3.firebaseapp.com",
  // projectId: "mobiking-25fc3",
  // storageBucket: "mobiking-25fc3.firebasestorage.app",
  // messagingSenderId: "397433355252",
  // appId: "1:397433355252:web:cc8c08179b3ad2c10857a1",
  
  // apiKey: "AIzaSyC2cD8s816pK1xC_zSI4eGG_Yjro8X_Gm4",
  // authDomain: "mobiking-25fc3.firebaseapp.com",
  // projectId: "mobiking-25fc3",
  // storageBucket: "mobiking-25fc3.firebasestorage.app",
  // messagingSenderId: "397433355252",
  // appId: "1:397433355252:web:9599c9d3971c62720857a1",
  // measurementId: "G-YCCRCKV2RS"

  apiKey: "AIzaSyC2cD8s816pK1xC_zSI4eGG_Yjro8X_Gm4",
  authDomain: "mobiking-25fc3.firebaseapp.com",
  projectId: "mobiking-25fc3",
  storageBucket: "mobiking-25fc3.firebasestorage.app",
  messagingSenderId: "397433355252",
  appId: "1:397433355252:web:cc8c08179b3ad2c10857a1",
  measurementId: "G-3VDBG6F3R8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// return messaging instance or null (waits for isSupported)
export async function getMessagingInstance() {
  if (typeof window === "undefined") return null;
  const supported = await isSupported().catch(() => false);
  if (!supported) return null;
  return getMessaging(app);
}

// Register SW helper (returns registration)
export async function ensureServiceWorkerRegistered() {
  if (typeof window === "undefined") return null;
  if (!("serviceWorker" in navigator)) return null;
  // try to get existing registration first
  let registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
  if (!registration) {
    registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  }
  return registration;
}

// Request permission, get token and save to Firestore
// export async function requestPermissionAndSaveToken(userId = null) {
//   if (typeof window === "undefined") return null;

//   if (!("Notification" in window)) {
//     console.log("Browser does not support notifications");
//     return null;
//   }

//   const permission = await Notification.requestPermission();
//   if (permission !== "granted") return null;

//   const registration = await ensureServiceWorkerRegistered();
//   const messaging = await getMessagingInstance();
//   console.log("messaging",messaging);
//   if (!messaging) return null;
  
//   const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
//   console.log("vapidKey",vapidKey);
//   if (!vapidKey) return null;

//   try {
//     console.log("Getting token");
//     const token = await getToken(messaging, {
//       vapidKey,
//       serviceWorkerRegistration: registration,
//     });

//     console.log("token",token);
//     if (!token) return null;

//     // 🔥 This triggers topic subscription
//     await fetch("/api/subscribe-topic", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ token, userId }),
//     });

//     return token;

//   } catch (err) {
//     console.error("Token error:", err);
//     return null;
//   }
// }

export async function requestPermissionAndSaveToken(userId = null) {
  if (typeof window === "undefined") return null;
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return null;
  }

  // Request browser permission
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.log("Notification permission:", permission);
    return null;
  }

  // Ensure SW is registered and messaging instance is ready
  const registration = await ensureServiceWorkerRegistered();
  const messaging = await getMessagingInstance();
  if (!messaging) {
    console.log("Firebase messaging not supported in this browser.");
    return null;
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.error("VAPID key missing: set NEXT_PUBLIC_FIREBASE_VAPID_KEY");
    return null;
  }

  try {
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    console.log("token: ",token);

    if (token) {
      // Save token to Firestore collection deviceTokens (or send to your backend)
      await addDoc(collection(db, "deviceTokens"), {
        token,
        platform: "web",
        createdAt: new Date().toISOString(),
        userId: userId || null,
      });
      console.log("Token saved to Firestore:", token);
      return token;
    } else {
      console.log("No registration token available.");
      return null;
    }
  } catch (err) {
    console.error("Error getting token:", err);
    return null;
  }
}



// Foreground messages listener wrapper
export async function onMessageListener() {
  const messaging = await getMessagingInstance();
  if (!messaging) return Promise.resolve(null);

  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
}
