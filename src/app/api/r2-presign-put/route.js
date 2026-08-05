// app/api/r2-presign-put/route.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { filename, contentType } = body;
    if (!filename || !contentType) {
      return new Response(JSON.stringify({ error: "Missing filename or contentType" }), { status: 400 });
    }

    const key = `mobikingb2b/${uuidv4()}-${filename}`;

    const cmd = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    });

    const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 60 * 60 });
    const publicUrl = `${process.env.R2_PUBLIC_BASE}/${encodeURIComponent(key)}`;

    return new Response(JSON.stringify({ uploadUrl, key, publicUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Presign error:", err);
    return new Response(JSON.stringify({ error: "Presign failed" }), { status: 500 });
  }
}
