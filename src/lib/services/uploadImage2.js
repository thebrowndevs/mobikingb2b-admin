import axios from "axios";

// export async function uploadImage2(file) {
//     if (!file) throw new Error("No file provided");

//     try {
//         const formData = new FormData();
//         formData.append("image", file);

//         const res = await axios.post("/api/images2", formData, {
//             headers: { "Content-Type": "multipart/form-data" },
//         });

//         if (res.status !== 200 || !res.data?.imageURL) {
//             throw new Error("Image upload failed");
//         }

//         return res.data.imageURL;
//     } catch (err) {
//         console.error("Upload error:", err);
//         throw err;
//     }
// }

export async function uploadImage2(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "mobiking"); // cloudinary ka unsigned preset
    formData.append("folder", "mobiking");

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/dywqruohq/image/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.secure_url;
}

// lib/services/uploadImage3.js (or wherever)
export async function uploadImage3(file, onProgress) {
  // 1) request presigned PUT URL
  const resp = await fetch("/api/r2-presign-put", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data?.error || "Failed to get upload URL");

  const { uploadUrl, publicUrl } = data;

  // 2) upload with XHR to get progress (works reliably)
  await uploadWithProgress(uploadUrl, file, onProgress);

  // 3) return public URL to save in DB
  return publicUrl;
}

function uploadWithProgress(uploadUrl, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed with status ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Upload network error"));
    xhr.send(file);
  });
}

