import axios from "axios"

export async function uploadImage(dataUrl) {
  try {
    const res = await axios.post('/api/images', { image: dataUrl });

    if (res.status !== 200) {
      console.error('Upload failed with status:', res.status);
      throw new Error('Image upload failed');
    }

    const imageURL = res.data?.imageURL;
    if (!imageURL) {
      console.error('No imageURL returned in response:', res.data);
      throw new Error('Image URL missing from response');
    }

    console.log('Image uploaded successfully:', imageURL);
    return imageURL;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}
