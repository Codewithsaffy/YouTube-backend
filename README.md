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
