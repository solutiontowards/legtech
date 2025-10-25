import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Database Connected:", mongoose.connection.name);
    });

    mongoose.connection.on("error", (err) => {
      console.error(`Database connection error: ${err}`);
    });

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "legtech", 
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error(`Could not connect to database: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
