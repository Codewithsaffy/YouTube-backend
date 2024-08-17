import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Cloudinary is a cloud-based media management platform that allows users to store, optimize, and deliver images and videos for websites and applications

cloudinary.config({
  cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
  api_key: process.env.CLOUDNARY_API_KEY,
  api_secret: process.env.CLOUDNARY_API_SECRET,
});

async function fileUploader(localfilepath: string) {
  try {
    if (!localfilepath) return null;

    // File upload to Cloudinary
    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
    });

    // File uploaded successfully
    // Remove the saved temporary file
    fs.unlinkSync(localfilepath);

    return response;
  } catch (error) {
    console.error("Error during file upload:", error);
  }
    // Remove the saved temporary file if the upload operation fails
}

export default fileUploader;
