import express from "express";
import cors from "cors";
import cookisParser from "cookie-parser";
const app = express();

// * configration

//? app.use is use to configure setting and middle

//! 1- cors

// a browser security feature that allows client web applications to access resources from a different domain

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

//! 2- allow json and limit

app.use(
  express.json({
    limit: "16kb",
  }),
);

//! 3- url encoded
// ( It parses incoming requests with URL-encoded payloads and is based on a body parser.)

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// ! 4-static
//(To serve static files such as images, CSS files, and JavaScript files, use the express.static built-in middleware function in Express.)

app.use(express.static("public"));

// ! 5- cookie parser
// ( cookie parser is use to access cookies and manage cookies)
app.use(cookisParser());

export { app };
