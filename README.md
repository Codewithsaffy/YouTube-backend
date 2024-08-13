# YouTube Backend Development Guide

## Overview

This document serves as a comprehensive guide to setting up and developing a backend for a YouTube-like platform. We'll cover everything from initializing the project to building authentication mechanisms and handling file uploads using cloud services. 

### Table of Contents

1. [Introduction to Backend and Server](#introduction-to-backend-and-server)
2. [Project Setup](#project-setup)
3. [Database Connection](#database-connection)
4. [API Response Handling](#api-response-handling)
5. [User & Video Models, JWT, and Bcrypt](#user-video-models-jwt-and-bcrypt)
6. [File Uploading Using Cloudinary and Multer](#file-uploading-using-cloudinary-and-multer)
7. [HTTP Basics](#http-basics)
8. [Controllers and Route Settings](#controllers-and-route-settings)
9. [Logic Building for User Registration and Login](#logic-building-for-user-registration-and-login)

---

## Introduction to Backend and Server

### What is a Backend?
The backend of an application is the part that handles the server-side logic, manages database interactions, and provides the data and resources to the frontend. It is responsible for the business logic, authentication, and data storage of an application.

### What is a Server?
A server is a software or hardware system that provides data, resources, or services to other systems or clients over a network. In the context of web development, a server handles HTTP requests from the client, processes them, and returns the appropriate response.

---

## Project Setup

### File Setup

1. **Initialize the Project**: Start by initializing a Node.js project and installing necessary dependencies.

   ```bash
   npm init
   npm install express dotenv mongoose
   ```

2. **Project File Structure**: Organize your project files for clarity and maintainability.

---

## Database Connection

### Setting Up MongoDB with Mongoose

1. **Create a Cluster**: Set up a cluster on MongoDB Atlas.
2. **Connecting to the Database**: There are two approaches for setting up your database connection:
   - **Inline Connection in the Main File**: Write the connection code directly in the main application file.
   - **Separate Database Connection File**: Encapsulate the connection logic in a separate file for better modularity.

### Example: Inline Connection in `index.ts`

```typescript
import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import { DB_NAME } from "./constants.js";

const app = express();
dotenv.config({ path: ".env" }); // Ensure the path is correct

(async () => {
  console.log(process.env.MONGO_URL);
  try {
    const connectionData = await mongoose.connect(
      process.env.MONGO_URL as string,
      { dbName: DB_NAME }
    );
    console.log(
      `DB connected successfully, hostname: ${connectionData.connection.host}`
    );
  } catch (error) {
    console.log("Failed to connect to MongoDB", error);
    process.exit(1); // Exit the Node.js process
  }
})();
```

---

## API Response Handling

### Importance of Structured API Responses

In production-grade applications, especially in companies, it’s crucial to structure API responses consistently. This ensures better maintainability and debugging.

### Installation of Necessary Packages

```bash
npm install cors cookie-parser
```

### Understanding the Packages

- **CORS (Cross-Origin Resource Sharing)**: A browser security feature that allows a client web application to access resources from a different origin.

- **Cookie-Parser**: A middleware to extract cookies from HTTP requests and convert them into a usable format for server-side code.

---

## User & Video Models, JWT, and Bcrypt

### Installation

```bash
npm install jsonwebtoken bcrypt
```

### JSON Web Token (JWT)

- **JWT**: A bearer token used for secure data transmission. It encodes a payload (like user ID) with a secret key and expiration time, returning a token string.

- **Usage Example**:
  
  ```typescript
  jwt.sign(
    { _id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  ```

### Bcrypt

- **Bcrypt**: A library used to hash passwords, ensuring that they are securely stored. It also provides methods to compare the hashed password with the input.

### Pre Middleware in Mongoose

- **Pre Middleware**: Runs just before a document is saved. For example, to hash a password before saving:

  ```typescript
  userSchema.pre("save", function (next) {
    if (!this.isModified("password")) return next();
    this.password = bcrypt.hashSync(this.password, 10);
    next();
  });
  ```

### Custom Methods in Mongoose

- **Creating Custom Methods**: Example of adding a method to generate a JWT:

  ```typescript
  userSchema.methods.generateToken = function () {
    return jwt.sign(
      { _id: this._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
  };
  ```

---

## File Uploading Using Cloudinary and Multer

### Cloudinary Setup

- **What is Cloudinary?**
  - A cloud-based platform for managing media (images, videos) in websites and applications.
  
- **Cloudinary Configuration**:

  ```typescript
  import { v2 as cloudinary } from "cloudinary";

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  async function fileUploader(localFilePath: string) {
    try {
      if (!localFilePath) return null;
      const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto",
      });
      console.log("File uploaded successfully", response);
      return response;
    } catch (error) {
      fs.unlinkSync(localFilePath); // Remove file if upload fails
      throw error;
    }
  }
  ```

### Multer Setup

- **What is Multer?**
  - Multer is a Node.js middleware for handling `multipart/form-data`, primarily used for file uploads.

- **Storage Configuration**:

  ```javascript
  import multer from "multer";

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./public/temp");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });

  export const upload = multer({ storage: storage });
  ```

- **Using Multer in Routes**:

  ```javascript
  app.post("/upload", upload.single("file"), (req, res) => {
    res.send("File uploaded successfully");
  });
  ```

---

## HTTP Basics

### Overview

HTTP (Hypertext Transfer Protocol) is the foundation of the web, facilitating the transfer of data between clients (browsers) and servers. 

### Key Concepts

- **HTTP vs. HTTPS**: HTTPS is the secure version of HTTP, encrypting data during transmission.
- **URI, URL, URN**:
  - **URI**: Identifies a resource.
  - **URL**: Specifies the location and access method of a resource.
  - **URN**: Identifies a resource by name.

### HTTP Headers

- **Method**: Specifies the action (e.g., GET, POST).
- **URL**: The address of the resource.
- **Host**: The domain name of the server.
- **Connection**: Controls connection behavior (keep-alive, close).
- **Cache-Control**: Manages cache behavior.
- **Accept**: Specifies acceptable content types.
- **Content-Length**: Indicates the size of the request/response body.
- **Content-Type**: Specifies the media type of the body.
- **User-Agent**: Identifies the client software.
- **Cookie**: Sends stored cookies from the client to the server.
- **Authorization**: Provides credentials for authentication.

---

## Controllers and Route Settings

### Setting Up Controllers and Routes

1. **Create a Controller**: Define the logic for handling requests.
2. **Define Routes**: Use Express routes to connect HTTP methods with controller functions.

   ```javascript
   import { Router } from "express";
   import { registerUser } from "../controllers/users.controller.js";
   import { upload } from "../middlewares/multer.middleware.js";

   const router = Router();

   router.route("/register").post(
     upload.fields([
       { name: "avatar", maxCount: 1 },
       { name: "coverImage", maxCount: 1 },
     ]),
     registerUser
   );

   export default router;
   ```

3. **Use in Application**:

   ```javascript
   import userRouter from "./routes/User.routes.js";

   app.use("/api/v1/user", userRouter);
   ```

---

## Logic Building for User Registration and Login

### Steps for Building Logic

1. **Identify Requirements**: Understand what the function should accomplish.
2. **Plan in Steps**: Write out the logic in comments before coding.
3. **Implement**: Follow the steps to write the actual code.

### Upload File Before User Creation with Multer

- **Uploading with Multer**: The file is uploaded to the server before creating a new user.

   ```javascript
   const avatar = await fileUploader(req.files.avatar[0].path);
   const coverImage = await fileUploader(req.files.coverImage[0].path);
   ```

---

This document is designed to guide both novice and experienced developers in building a robust backend for a YouTube-like platform

. Follow each section step by step to ensure a successful implementation.