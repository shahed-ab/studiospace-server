import mongoose from "mongoose";

// Cache the connection promise so serverless invocations reuse it
let connectionPromise = null;

export async function connectDB() {
  if (connectionPromise) return connectionPromise;

  connectionPromise = mongoose.connect(process.env.MONGODB_URI).then((m) => {
    console.log("MongoDB connected:", m.connection.host);
    return m;
  });

  return connectionPromise;
}

