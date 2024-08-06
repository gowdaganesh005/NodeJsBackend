import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const connectDB=async ()=>{
    try {
        const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log("Mongo DB connected succeessfully !!! ")
    } catch (error) {
        console.error("ERROR connecting MONGODB::",error)
        throw(error)
    }

}

export default connectDB