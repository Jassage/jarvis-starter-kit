import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string,
  options?: Record<string, unknown>
): Promise<{ url: string; publicId: string; width?: number; height?: number }> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `lakay/${folder}`,
          resource_type: 'auto',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          ...options,
        },
        (error, result) => {
          if (error || !result) return reject(error || new Error('Upload échoué'));
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
          });
        }
      )
      .end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

export default cloudinary;
