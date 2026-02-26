import { v2 as cloudinary } from "cloudinary";
import config from "../config";

cloudinary.config({
  cloud_name: config.cloudinaryName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

export const CloudinaryHelper = {
  uploadImage: async (
    fileBuffer: Buffer,
    folder: string = "zentask",
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          resolve(result?.secure_url as string);
        },
      );

      const streamifier = require("streamifier");
      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  },
  deleteImage: async (url: string): Promise<boolean> => {
    try {
      if (!url) return false;
      const parts = url.split("/");
      const filename = parts[parts.length - 1];
      const publicId = filename.split(".")[0];
      const result = await cloudinary.uploader.destroy(`zentask/${publicId}`);
      return result.result === "ok";
    } catch (error) {
      console.error("Cloudinary deletion error:", error);
      return false;
    }
  },
};
