const mongoose = require("mongoose");

// Reuse the connection across serverless invocations (Vercel) instead of
// reconnecting on every request, and never kill the process on failure —
// that would crash the whole serverless function.
let connectionPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (!connectionPromise) {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/new_gold_gym";
    connectionPromise = mongoose
      .connect(uri)
      .then(() => {
        console.log("[db] MongoDB connected:", uri);
        return mongoose.connection;
      })
      .catch((err) => {
        connectionPromise = null;
        console.error("[db] MongoDB connection failed:", err.message);
        throw err;
      });
  }
  return connectionPromise;
}

module.exports = connectDB;
