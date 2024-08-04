import dotenv from 'dotenv'

import express from 'express';
import connectDB from "./DB/index.js";

dotenv.config({path:'./env'})
const app=express()

// ; (async ()=>{
//     try {
//         mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("ERROR:: ",error)
//             throw(error)
//     })
//     app.listen(process.env.PORT || 8001,(req,res) =>{
//         console.log("Server Listening on PORT:",process.env.PORT)

//     })
        
//     } catch (error) {
//         console.error("ERROR::",error)
//     }
// })()

/// OR

connectDB()