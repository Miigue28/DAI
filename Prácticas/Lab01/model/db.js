import mongoose from "mongoose";

const url = `mongodb://root:example@localhost:27017/DAI?authSource=admin`;

export async function connect_db() {
  try {
    await mongoose.connect(url);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  const connection = mongoose.connection;

  // Once callback
  connection.once("open", (_) => {
    console.log(`Database connected: ${url}`);
  });

  // Error callback
  connection.on("error", (err) => {
    console.error(`Connection error: ${err}`);
  });
  return;
}

export async function close_db() {
  try {
    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
  return;
}