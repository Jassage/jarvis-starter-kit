import { prisma } from "../lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadPhotoService = async (userId: string, filePath: string, isMain: boolean) => {
  const photosCount = await prisma.photo.count({ where: { userId } });
  if (photosCount >= 6) throw new Error("Maximum 6 photos autorisées");

  let url = "";
  let cloudinaryId: string | undefined;

  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== "ton_cloud_name") {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "konekte/photos",
      transformation: [{ width: 800, height: 1000, crop: "fill", gravity: "face" }],
    });
    url = result.secure_url;
    cloudinaryId = result.public_id;
    fs.unlinkSync(filePath);
  } else {
    url = `/uploads/${filePath.split(/[\\/]/).pop()}`;
  }

  if (isMain || photosCount === 0) {
    await prisma.photo.updateMany({ where: { userId }, data: { isMain: false } });
  }

  const photo = await prisma.photo.create({
    data: {
      userId,
      url,
      cloudinaryId,
      isMain: isMain || photosCount === 0,
      order: photosCount,
    },
  });

  return photo;
};

export const deletePhotoService = async (userId: string, photoId: string) => {
  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo || photo.userId !== userId) throw new Error("Photo introuvable");

  if (photo.cloudinaryId) {
    await cloudinary.uploader.destroy(photo.cloudinaryId);
  }

  await prisma.photo.delete({ where: { id: photoId } });

  if (photo.isMain) {
    const next = await prisma.photo.findFirst({ where: { userId }, orderBy: { order: "asc" } });
    if (next) await prisma.photo.update({ where: { id: next.id }, data: { isMain: true } });
  }
};

export const setMainPhotoService = async (userId: string, photoId: string) => {
  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo || photo.userId !== userId) throw new Error("Photo introuvable");

  await prisma.photo.updateMany({ where: { userId }, data: { isMain: false } });
  await prisma.photo.update({ where: { id: photoId }, data: { isMain: true } });
};
