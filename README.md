# Youtube backend

### server

- jo softwere serve kare server kehlata hai
- esa system ya program jo data or resoucre provide kare dosre system ko server kehlata hai

## video one

### file setup

# Backend Project File Structure

- first you need to initialize package

```bash
npm init

npm i express dotenv mongoose
```

## video two (data base connection)

- create cluster in mongooatlas web
- connect with data base
- there are two appraches to connect data base
- first you can write all connection code in main file
- second appreoch is that you can write code in seperate file like db connection code another file
- a global object that gives information about and controls the node. js process
- process.exit() is method use exit from current nodejs process it take an integer like 0 or 1 , 0 means exit with out any reason while parameter 1 indicate that exit from nodejs process only in failiur
-

### first approch in (index.ts)

```ts
import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import { DB_NAME } from "./constant.js";

const app = express();
dotenv.config({ path: ".env" }); // Ensure the path is correct

(async () => {
  console.log(process.env.MONGO_URL);
  try {
    const connectionData = await mongoose.connect(
      process.env.MONGO_URL as string,
      { dbName: DB_NAME }, // Use DB_NAME from your constant.js file
    );
    console.log(
      `db connected successfully hostname: ${connectionData.connection.host}`,
    );
  } catch (error) {
    console.log("failed to connect mongodb", error);
    process.exit(1); // Exit from Node.js process
  }
})();
```

## video 03 (api response or api error handle)

### desC:

this video is about why we make classes of api response like error and success in production grade aap and in compnanies

#### installation packages

```bash
npm i cors
npm i cookie-parser
```

#### cors ( cross origin resourse shairing)

a browser security feature that allow to client web application to access data from from different browser

#### cookie-parses

Extracts the cookie data from the HTTP request and converts it into a usable format that can be accessed by the server-side code

## video four (user and video models and jwt & bcrypt usage)

### Installation

```bash
npm i jsonwebtoken brypt
```

#### JWT (jsonwebtoken)

- JWT is bearer token which help in secuerity purpose like it take a data , secretkey and expireytime and generate a token in string, it store data in token

- JSON Web Token (JWT) is an open standard that allows for the secure transmission of information between two parties as a JSON object. JWTs are pronounced "jot" and are often used for authentication and information exchange.

#### brypt

- brypt is a package which help us to save passaward in hash form which provide security and we can campare passward to verify this is correct or not.

### Pre Middleware

- pre middleware is a middleware which help us to perform any fn just before data save

like

```ts
userSchema.pre("save", function (next) {
  if (!this.isModified) return next();
  this.passward = bcrypt.hash(this.passward, 10);
  return next();
});
```

### create own methods

it is a method to bulid own custom methods like this

```ts
userSchema.methods.generateTocken = function () {
  jwt.sign(
    {
      _id: this._id,
    },
    process.env.key,
    {
      expirseIn: "1d",
    },
  );
};
```

## VIDEO 05 (file uploding using cloudnary service (sdk) and multer middleware)

### cloudnary

- cloudnay is a cloud base managment platform that allow to user to store, optmize and delevier videos , images for website and application

- cloudnary is sdk(Software development kit) which means a set of tools for building software for specific platforms. SDKs can include building blocks, debuggers, code libraries, and frameworks. They can also include documentation and other resources to help developers efficiently build apps.

code

```ts
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
```

### multer

#### DEFINAION

Multer is a Node.js middleware used for handling multipart/form-data, which is primarily used for uploading files. It makes it easy to manage file uploads by parsing the incoming file data and storing the files in the server's memory or on the disk.

1. **Importing Multer**:

   - The code starts by importing `multer`, a middleware used to handle file uploads in Node.js.

2. **Storage Configuration**:

   - The `storage` object is created using `multer.diskStorage`, which tells Multer how to store the uploaded files on the server's disk (hard drive).

3. **Destination**:

   - The `destination` function inside `storage` decides where to save the uploaded files. Here, it saves them in a folder called `./public/temp`. The `cb(null, "./public/temp")` means there's no error (`null`), and the file should be saved in the `./public/temp` folder.

4. **Filename**:

   - The `filename` function sets the name of the file when it’s saved. Here, it uses the original name of the file (which is stored in `file.fieldname`). The `cb(null, file.fieldname)` means there's no error (`null`), and the file should be saved with its original name.

5. **Exporting the Upload Configuration**:
   - Finally, the `upload` object is exported so it can be used in other parts of the application. This object is created by passing the `storage` configuration to `multer({ storage: storage })`.

### Usage Example:

This `upload` object can be used in a route to handle file uploads like this:

```javascript
app.post("/upload", upload.single("file"), (req, res) => {
  res.send("File uploaded successfully");
});
```

- This would allow you to upload a file through a form, and the file would be saved in the `./public/temp` folder with its original name.
