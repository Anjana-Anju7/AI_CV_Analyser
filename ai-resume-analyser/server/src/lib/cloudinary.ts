import { v2 as cloudinary } from 'cloudinary';

const cloudinaryEnabled =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

if (cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function uploadResume(buffer: Buffer, filename: string, userId: string): Promise<string> {
  if (!cloudinaryEnabled) {
    // Return empty string when Cloudinary is not configured — analysis still works
    return '';
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `resume-analyser/${userId}`,
        resource_type: 'raw',
        public_id: `${Date.now()}-${filename}`,
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}
