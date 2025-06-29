import { app } from "./app.js";
import { config } from "dotenv";
import { connectDB } from "./config/dbconnect.js";

config({path:"./.env"});
// mongoDB connection
connectDB().then(()=>{
    app.on("error",(err)=>{
        console.log("ERROR : ",err);
        throw err;
    })
    const PORT=process.env.PORT||5001
    app.listen(PORT,()=>{
    console.log(`app is listening at ${PORT}`)
})
}).catch((err)=>{
    console.log("mongo db failed !",err);
})