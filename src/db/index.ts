import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function dbConnection() {
  try {
    const connection = await mongoose.connect(process.env.MONGO_UrL as string, {
      dbName: "islamictube",
    });
    console.log(
      `connected successfully... \n host: ${connection.connection.host}`,
    );
  } catch (error) {
    console.log("failed to connect due to", error);
    process.exit(1);
  }
}

export default dbConnection;
