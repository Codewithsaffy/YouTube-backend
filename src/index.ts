import dbConnection from "./db/index.js";
import env from "dotenv";

env.config({ path: ".env" });

dbConnection();
