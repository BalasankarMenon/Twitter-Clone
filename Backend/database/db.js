import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectToDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");
    }catch(err){
        console.log("MongoDB failed to connect");
        process.exit(1);
    }
}

export {connectToDB};