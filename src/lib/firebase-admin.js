import admin from 'firebase-admin'

function getFirebaseApp() {
  if (!admin.apps.length) {
    if (!process.env.FIREBASE_PROJECT_ID) {
      console.warn("Firebase Admin credentials not found. Firebase Admin is not initialized.");
      return null;
    }
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  }
  return admin.apps[0];
}

export const messaging = new Proxy({}, {
  get(target, prop) {
    const app = getFirebaseApp();
    if (!app) {
      throw new Error("Firebase Admin not initialized - missing credentials");
    }
    const instance = admin.messaging(app);
    const value = instance[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});

export const db = new Proxy({}, {
  get(target, prop) {
    const app = getFirebaseApp();
    if (!app) {
      throw new Error("Firebase Admin not initialized - missing credentials");
    }
    const instance = admin.firestore(app);
    const value = instance[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});


// import admin from 'firebase-admin'

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert({
//       projectId: process.env.FIREBASE_PROJECT_ID,
//       privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
//       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//       privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
//       clientId: process.env.FIREBASE_CLIENT_ID,
//       authUri: process.env.FIREBASE_AUTH_URI,
//       tokenUri: process.env.FIREBASE_TOKEN_URI,
//       authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
//       clientC509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL,
//     }),
//   })
// }

// export const messaging = admin.messaging()
