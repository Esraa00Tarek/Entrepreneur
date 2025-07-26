// utils/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

// دالة لرفع ملف إلى Cloudinary (تدعم جميع الأنواع)
export const uploadToCloudinary = async (buffer, filename, mimetype, folder = 'uploads') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto', // يدعم الصور والفيديو والملفات
        folder,
        public_id: filename ? filename.split('.')[0] : undefined,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    ).end(buffer);
  });
};

// دالة لحذف ملف من Cloudinary
export const deleteFromCloudinary = async (public_id) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(public_id, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};

export default cloudinary;
