import mongoose from 'mongoose';

let conn = null;

const connectDB = async () => {
  if (conn == null) {
    conn = mongoose.connect(process.env.MONGODB_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      family: 4 // Use IPv4, skip trying IPv6
    }).then(() => mongoose);
    
    // Wait for the connection to be established
    await conn;
    console.log("DB CONNECTED SUCCESSFULLY");
  }
  return conn;
};

export default connectDB;