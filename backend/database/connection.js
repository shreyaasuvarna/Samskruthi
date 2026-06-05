import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config()
const dbconnection=mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("database connected")
})
.catch((err)=>{
    console.log("database connection failed ", err)
})

export default dbconnection;