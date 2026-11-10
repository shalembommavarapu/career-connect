import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import fs from "fs";

let memoryServer = null;

const localMongodPath =
  "C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe";

const systemBinary = fs.existsSync(localMongodPath)
  ? localMongodPath
  : undefined;

if (systemBinary) {
  process.env.MONGOMS_SYSTEM_BINARY = systemBinary;
}

export const connectDB = async () => {
  if (process.env.NODE_ENV === "production" && !process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be configured in production.");
  }

  const uri =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/careerconnect";

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });

    console.log("[DB] MongoDB Connected:", conn.connection.host);
    return conn;
  } catch (primaryErr) {
    if (process.env.NODE_ENV === "production") {
      throw primaryErr;
    }

    console.warn("[DB] MongoDB connection failed. Starting memory server...");

    try {
      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: "careerconnect",
          port: 27017,
        },
        binary: systemBinary ? { systemBinary } : { version: "7.0.3" },
      });

      const memoryUri = memoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);

      console.log("[DB] Memory MongoDB started:", memoryUri);
      return conn;
    } catch (memErr) {
      console.error("[DB] Memory MongoDB failed:", memErr.message);
      throw memErr;
    }
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();

    if (memoryServer) {
      await memoryServer.stop();
    }
  } catch (err) {
    console.error("[DB] Disconnection error:", err.message);
  }
};
