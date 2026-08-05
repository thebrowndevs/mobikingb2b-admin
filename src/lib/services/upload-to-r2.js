// upload-to-r2.js
import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import klaw from "klaw";
import mime from "mime";
import pLimit from "p-limit";
import dotenv from "dotenv";
dotenv.config();

const ENDPOINT = "https://7c0201c6fbf7edfcdea61fd89fa0c5f8.r2.cloudflarestorage.com"; // e.g. https://7c0201c6...r2.cloudflarestorage.com
const BUCKET = "mobiking-images";
const ACCESS_KEY = "0475c2f9a2313e18462a10b7ba43aecd";
const SECRET = "6f70627b91ade22845d2d9cfe8ecafca4cb2b9b36d783f9e62b5cfd3e8e04368";
const CONCURRENT = Number(process.env.CONCURRENT_UPLOADS || 8);

if (!ENDPOINT || !BUCKET || !ACCESS_KEY || !SECRET) {
  console.error("Missing R2 environment variables. Set R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY");
  process.exit(1);
}

const client = new S3Client({
  region: "auto",
  endpoint: ENDPOINT,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET },
  forcePathStyle: true,
  maxAttempts: 5,
});

function log(...args) {
  console.log(...args);
  try { fs.appendFileSync("uploads.log", `[${new Date().toISOString()}] ${args.join(" ")}\n`); } catch {}
}

async function objectExists(key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch (err) {
    // if not found -> return false, else rethrow
    if (err?.$metadata?.httpStatusCode === 404 || (err.name && (err.name === "NotFound" || err.name === "NoSuchKey"))) {
      return false;
    }
    // Some SDKs throw different shapes; treat 4xx as not found
    if (err.statusCode === 404 || err.$metadata?.httpStatusCode === 404) return false;
    return false; // safer: treat other errors as not found but log
  }
}

async function uploadFile(localPath, key) {
  const contentType = mime.getType(localPath) || "application/octet-stream";
  const fileStream = fs.createReadStream(localPath);

  const upload = new Upload({
    client,
    params: {
      Bucket: BUCKET,
      Key: key,
      Body: fileStream,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    },
    queueSize: 4,
    partSize: 5 * 1024 * 1024,
    leavePartsOnError: false,
  });

  await upload.done();
  log("Uploaded", key);
}

async function main() {
  const folder = process.argv[2];
  const prefixArg = process.argv[3] || ""; // e.g. "uploads/2025/04"
  if (!folder) {
    console.error("Usage: node upload-to-r2.js <local-folder> [target-prefix-in-bucket]");
    process.exit(1);
  }

  // Normalize prefix - remove leading/trailing slashes
  const prefix = prefixArg ? prefixArg.replace(/^\/+|\/+$/g, "") : "";

  log("Starting upload");
  log("Local folder:", folder);
  log("Target bucket:", BUCKET, "prefix:", prefix || "(root)");

  const limit = pLimit(CONCURRENT);
  const tasks = [];
  let total = 0, skipped = 0, uploaded = 0;

  // First count files to give a progress idea (optional)
  for await (const _ of klaw(folder)) { if (_.stats?.isFile()) total++; }
  log("Total local files found:", total);

  // iterate again for real upload
  for await (const item of klaw(folder)) {
    if (!item.stats.isFile()) continue;
    const relative = path.relative(folder, item.path).replace(/\\/g, "/"); // windows fix
    // build key: if prefix present, prefix + "/" + relative, else relative
    const key = prefix ? `${prefix}/${relative}` : relative;

    tasks.push(limit(async () => {
      try {
        const exists = await objectExists(key);
        if (exists) {
          skipped++;
          log("[skip]", key);
          return;
        }
        await uploadFile(item.path, key);
        uploaded++;
      } catch (err) {
        log("[ERROR]", key, err.message || err);
        // do not throw so other files keep uploading
      }
    }));
  }

  await Promise.all(tasks);
  log("Done. uploaded:", uploaded, "skipped:", skipped, "total local:", total);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});