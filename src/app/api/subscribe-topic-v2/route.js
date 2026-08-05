import admin from "firebase-admin"
import { messaging } from "@/lib/firebase-admin"
import * as XLSX from "xlsx"

const db = admin.firestore()

export async function GET() {
  try {
    const topic = "allUsers"
    const batchSize = 500
    const limitSize = 45000

    let allTokens = []
    let lastDoc = null

    // 🔥 First 45K
    let firstQuery = db
      .collection("deviceTokens")
      .orderBy(admin.firestore.FieldPath.documentId())
      // .limit()

    const firstSnap = await firstQuery.get()

    firstSnap.docs.forEach((doc) => {
      const token = doc.data().token
      if (token) allTokens.push(token)
    })

    lastDoc = firstSnap.docs[firstSnap.docs.length - 1]

    // // 🔥 Next 45K
    // if (lastDoc) {
    //   let secondQuery = db
    //     .collection("deviceTokens")
    //     .orderBy(admin.firestore.FieldPath.documentId())
    //     .startAfter(lastDoc)
    //     .limit(limitSize)

    //   const secondSnap = await secondQuery.get()

    //   secondSnap.docs.forEach((doc) => {
    //     const token = doc.data().token
    //     if (token) allTokens.push(token)
    //   })
    // }

    console.log("All Tokens Length: ",allTokens?.length);
    
    if (allTokens.length === 0) {
      return new Response("No tokens found", { status: 404 })
    }

    // 🔥 Subscribe in 500 chunks
    const loops = Math.ceil(allTokens.length / batchSize)
    let totalSubscribed = 0

    for (let i = 0; i < loops; i++) {
      const start = i * batchSize
      const end = start + batchSize
      const chunk = allTokens.slice(start, end)

      const res = await messaging.subscribeToTopic(chunk, topic)
      totalSubscribed += res.successCount
    }
    
    // 🔥 Create Excel
    const worksheet = XLSX.utils.json_to_sheet(
      allTokens.map((t) => ({ token: t }))
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "DeviceTokens")

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    })

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          "attachment; filename=deviceTokens.xlsx",
      },
    })

  } catch (error) {
    console.error("Subscribe v2 error:", error)
    return new Response("Server Error", { status: 500 })
  }
}