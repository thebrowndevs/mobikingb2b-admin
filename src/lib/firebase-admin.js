import admin from 'firebase-admin'

if (!admin.apps.length) {
  // console.log("Project:", process.env.FIREBASE_PROJECT_ID)
  // console.log("Email:", process.env.FIREBASE_CLIENT_EMAIL)
  // console.log("Key exists:", !!process.env.FIREBASE_PRIVATE_KEY)

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

export const messaging = admin.messaging()
export const db = admin.firestore()


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
