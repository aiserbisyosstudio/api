import app from "../src/app.js";
import connectDB from "../src/config/database.js";
import { connectRedis } from "./config/redis.js";

let isConnected = false;
let isRedisConnected = false;

const handler = async (req, res) => {
  try {
    if (!isConnected) {
      await connectDB();
      isConnected = true;
    }

    if( !isRedisConnected ) {
      await connectRedis();
    }

    return app(req, res);
  } catch (error) {
    console.error("Server Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

export default handler;
