import { messaging } from "@/lib/firebase-admin";

export async function POST(req) {
  try {
    const { token } = await req.json();
    console.log("Called: ",token);

    if (!token) {
      return Response.json({ error: "Token missing" }, { status: 400 });
    }

    await messaging.subscribeToTopic(token, "allUsers");

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}