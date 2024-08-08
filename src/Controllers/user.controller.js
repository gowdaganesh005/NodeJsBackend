import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/User.model.js"
import { uploadOnCloudinary } from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"




const generateAccessAndRefreshToken=async (userId)=>{
    try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefereshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        return  { accessToken, refreshToken}
        
    } catch (error) {
        throw new ApiError(500,"Something went wrong during token generation")
        
    }
}


const registerUser=AsyncHandler(async (req,res)=>{
    const {fullname,email,username,password}=req.body

    if([fullname,email,username,password].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"All fields are required")
    }

    const existedUser= await User.findOne({ 
        $or: [{ email },{ username }]
    })

    if(existedUser){
        throw new ApiError(409,"User with the username and email exists")
    }

    const avatarlocalPath=req.files?.avatar[0]?.path;
    // const coverImagelocalPath=req.files?.coverImage[0]?.path;
    let coverImagelocalPath
    if( req.files && Array.isArray(req.files.coverImage) && req.files.converImage.length > 0 ){
        coverImagelocalPath=req.files.converImage[0].path
    }

    if(!avatarlocalPath){
        throw new ApiError(400,"Avatar is required")
    }

    const avatar=await uploadOnCloudinary(avatarlocalPath)
    const converImage =await uploadOnCloudinary(coverImagelocalPath)


    if(!avatar) {throw new ApiError(400 ,"Avatar is required")};

    const user=await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: converImage?.url || "",
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




const loginUser= AsyncHandler(async(req,res)=>{

    const {username,email,password}=req.body
    

    if(!(username  ||    email) ){
        throw new ApiError(400,"username or email is required ")
    }

    const user=await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User not exists")
    }

    const isPasswordValid=await user.checkPassword(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalild User credentials")
    }

    const { accessToken, refreshToken}=await generateAccessAndRefreshToken(user._id)

    const loggedUser=await User.findById(user._id)
    .select("-password -refreshToken")

    const options={
        httpOnly: true,
        secure: true
    }

    const ress= res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedUser,
                accessToken:accessToken
            },
            "User logged in successfully"
    )
    
    )
    console.log(ress)
    return ress


})


const logoutUser=(async(req,res)=>{
    console.log(req)

    const options={
        httpOnly: true,
        secure: true
    }
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
           
        },
        {
            new: true
        }
        
    )

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(
            200,{},"User logged out successfully"
        )
    )

})

const refreshAccessTokens=AsyncHandler(async (req,res)=>{
    const incomingRefreshtoken=req.cookie.refreshToken || req.body.refreshToken

    if( !incomingRefreshtoken){
        throw new ApiError(401,"Unauthorized request")
    }

    try {
        const decodedToken=jwt.verify(incomingRefreshtoken,process.env.REFRESH_TOKEN_SECRET)
    
    
        const user=await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"Invalid refresh Token")
    
        }
        if(incomingRefreshtoken!==user?.refreshToken){
            throw new ApiError(401,"Refresh Token is expired")
        }
    
        const options={
            httpOnly:true,
            secure: true
        }
    
        const {accessToken,newrefreshToken}=await generateAccessAndRefreshToken(user._id)
    
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
    } catch (error) {
        throw new ApiError(500,error?.message || "Something went wrong during verification of refresh token")
        
    }
})


const changeCurrentPassword=AsyncHandler(async(req,res)=>{
    const {oldpassword ,newpassword}=req.body

    const user=await User.findById(req.user._id)
    const isPasswordcorrect=await user.checkPassword(oldpassword)

    if(!isPasswordcorrect){
        throw new ApiError(400,"Invalid old password")
        
    }

    user.password=newpassword

    await user.save({
        validateBeforeSave: false
    })
    

    return res.status(200
    .json(
        new ApiResponse(200,{},"Password changed")
    )
    )
})

const getCurrentUser=AsyncHandler(async(req,res)=>{
    return res.status(200)
    .json(
        new ApiResponse(200,req.user,"user fetched successfully")
    )
})

const updateUserDetails=AsyncHandler(async(req,res)=>{
    const {fullname,email}=req.body

    
    if(!(fullname || email)){
        throw new ApiError(400,"Fullname or password is required")
    }

    await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                fullname: fullname,
                email: email
            }
        },{
            new: true
        }
    
    ).select("-password -refreshToken")

    return res.status(200)
    .json(
        new ApiResponse(200,user,"Acccount details updated")
    )


})

const updateUserAvatar=AsyncHandler(async(req,res)=>{
    const avatarlocalPath = req.file?.path
    if( !avatarlocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }

    const avatar=uploadOnCloudinary(avatarlocalPath)

    if(!avatar){
        throw new ApiError(500,"error while uploading Avatar ")

    }

    const user=await User.findByIdAndUpdate(req.user._id,{
        $set:{
            avatar: avatar.url
        }
    },{
        new: true
    }).select("-password -refreshToken")
    return res.status(200)
    .json(
        new ApiResponse(200,user,"Avatar uploaded and updated successfully")
    )


})


const updateCoverImage=AsyncHandler(async(req,res)=>{
    
    const coverImagelocalPath = req.file?.path
    if( !coverImagelocalPath){
        throw new ApiError(400,"coverImage file is missing")
    }

    const coverImage=uploadOnCloudinary(coverImagelocalPath)

    if(!coverImage){
        throw new ApiError(500,"error while uploading Avatar ")

    }

    const user=await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            coverImage: coverImage.url
        }
    },{
        new: true
    }).select("-password -refreshToken")
    return res.status(200)
    .json(
        new ApiResponse(200,user,"CoverImage uploaded and updated successfully")
    )


})
export {
        
    registerUser, 
    loginUser,
    logoutUser,
    refreshAccessTokens,
    changeCurrentPassword,
    getCurrentUser,
    updateUserAvatar,
    updateCoverImage    
    
}