import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';

let memoryServer = null;

const localMongodPath = 'C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe';
if (fs.existsSync(localMongodPath)) {
  process.env.MONGOMS_SYSTEM_BINARY = localMongodPath;
}

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careerconnect';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[DB] MongoDB Connected to host: ${conn.connection.host} (${conn.connection.name})`);
    return conn;
  } catch (primaryErr) {
    console.warn(`[DB] Primary MongoDB connection failed (${primaryErr.message}). Using local embedded Mongo instance...`);

    try {
      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'careerconnect',
          port: 27017
        },
        binary: {
          systemBinary: fs.existsSync(localMongodPath) ? localMongodPath : undefined
        }
      });
      const memoryUri = memoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[DB] Embedded MongoDB Server started successfully at: ${memoryUri}`);
      return conn;
    } catch (memErr) {
      console.error(`[DB] Fatal: Could not connect to MongoDB or fallback server:`, memErr.message);
      throw primaryErr;
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
    console.error('[DB] Error during disconnection:', err.message);
  }
};
