import dotenv from 'dotenv'
import connectDB from "./DB/index.js";
import app from './app.js';


dotenv.config({path:'./env'})


// ; (async ()=>{
//     try {
//         mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("ERROR in app :: ",error)
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
.then(()=>{
    app.listen(process.env.PORT || 8000 ,()=>{
        console.log(`Server listening on the port:: ${process.env.PORT} `)
    })

})
.catch((err)=>{
    console.log("MongoDB connection Failed !!! ",err);
})

app.on("error",(error)=>{
    console.log("ERROR in app :: ",error)
    throw(error)
})

