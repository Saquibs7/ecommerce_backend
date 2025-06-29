import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
export const connectDB=async ()=>{

    try{
        const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`DB connected ! db host:${connectionInstance.connection.host}`)
    }
    catch(err)
    {
        console.log("mongo db connection failed ! ", err);
        process.exit(1);
    }
}