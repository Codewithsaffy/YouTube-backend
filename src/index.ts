import { app } from "./app.js";
import dbConnection from "./db/index.js";
import env from "dotenv";

env.config({ path: ".env" });

dbConnection()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`server is running on port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Failed to connect MONGO db !!! ", err);
  });
