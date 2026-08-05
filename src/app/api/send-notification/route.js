import { messaging } from "@/lib/firebase-admin"

export async function POST(req) {
  try {
    const { title, message, image, redirect, topic = "allUsers" } = await req.json()

    if (!title || !message) {
      return Response.json(
        { error: "Missing title or message" },
        { status: 400 }
      )
    }

    const payload = {
      topic, // 🔥 Send to topic instead of tokens
      notification: {
        title,
        body: message,
        ...(image && { image }),
      },
      data: {
        ...(redirect && { redirect }),
      },
    }

    const response = await messaging.send(payload)

    return Response.json({
      success: true,
      messageId: response,
    })

  } catch (err) {
    console.error("Send notification error:", err)
    return Response.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

// // app/api/send-notification/route.js
// import admin from 'firebase-admin'
// import { messaging } from '@/lib/firebase-admin'

// const db = admin.firestore()

// export async function POST(req) {
//   try {
//     const { title, message, image, redirect } = await req.json()

//     if (!title || !message) {
//       return Response.json({ error: 'Missing title or message' }, { status: 400 })
//     }

//     // 1. Get all tokens from Firestore
//     const tokensSnapshot = await db.collection('deviceTokens').get(1000)
//     const tokens = tokensSnapshot.docs.map(doc => doc.data().token).filter(Boolean)

//     if (tokens.length === 0) {
//       return Response.json({ error: 'No tokens found' }, { status: 404 })
//     }

//     const batchSize = 500; // Firebase allows up to 500 tokens per batch
//     const loopSize = Math.ceil(tokens.length / batchSize);

//     const response = { successCount: 0, failureCount: 0 };

//     for (let i = 0; i < loopSize; i++) {
//       const start = i * batchSize;
//       const end = Math.min(start + batchSize, tokens.length);
//       const batchTokens = tokens.slice(start, end);

//       // 2. Prepare the message for this batch
//       const payload = {
//         notification: {
//           title,
//           body: message,
//           ...(image && { image })
//         },
//         data: {
//           ...(redirect && { redirect })
//         },
//         tokens: batchTokens,
//       }
//       // 3. Send notification for this batch
//       // const result = await messaging.sendEachForMulticast(payload)
//       // response.successCount += result.successCount
//       // response.failureCount += result.failureCount
//     }

//     return Response.json({ success: true, sent: response.successCount, failed: response.failureCount })
//   } catch (err) {
//     console.error(err)
//     return Response.json({ error: 'Server error' }, { status: 500 })
//   }
// }
