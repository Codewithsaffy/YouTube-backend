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
    // file upload on cloudnary
    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
    });
    // file Uploaded successfull
    console.log(response);
    return response;
  } catch (error) {
    // remove the saved tempror file upload operation is failed
    fs.unlinkSync(localfilepath);
  }
}

export default fileUploader