// public/firebase-messaging-sw.js
// Use compat libs here because service worker context uses importScripts
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyC2cD8s816pK1xC_zSI4eGG_Yjro8X_Gm4",
  authDomain: "mobiking-25fc3.firebaseapp.com",
  projectId: "mobiking-25fc3",
  storageBucket: "mobiking-25fc3.firebasestorage.app",
  messagingSenderId: "397433355252",
  appId: "1:397433355252:web:cc8c08179b3ad2c10857a1",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const title = payload.notification?.title || 'New notification';
  const options = {
    body: payload.notification?.body || '',
    // icon: '/icon.png' // optional
  };
  self.registration.showNotification(title, options);
});
