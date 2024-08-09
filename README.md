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
