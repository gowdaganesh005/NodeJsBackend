import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { User } from "../models/User.model.js";




export const verifyJWT=AsyncHandler(async (req,res,next)=>{

    try {
        console.log(req)
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
    
        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }
    
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(
                401,"Invalid Access Token"
            )
        }
    
        req.user=user;
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Unauthorized request")
        
    }

})