import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/User.model.js"
import { uploadOnCloudinary } from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser=AsyncHandler(async (req,res)=>{
    const {fullname,email,username,password}=req.body

    if([fullname,email,username,password].some((field)=>field.trim()==="")){
        throw new ApiError(400,"All fields are required")
    }

    const existedUser=User.findOne({ 
        $or: [{ email },{ username }]
    })

    if(existedUser){
        throw new ApiError(409,"User with the username and email exists")
    }

    const avatarlocalPath=req.files?.avatar[0]?.path;
    const coverImagelocalPath=req.files?.coverImage[0]?.path;

    if(!avatarlocalPath){
        throw new ApiError(400,"Avatar is required")
    }

    const avatar=await uploadOnCloudinary(avatarlocalPath)
    const converImage =await uploadOnCloudinary(coverImagelocalPath)

    if(!avatar) {throw new ApiError(400 ,"Avatar is required")};

    const user=await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: converImage.url || "",
        email,
        username,
        password

    })

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )


    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the User !!! ")
    }
    
    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered successfully")
    )

    


   
})


export {registerUser}